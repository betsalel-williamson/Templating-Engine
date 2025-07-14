#!/usr/bin/env ts-node
//
// This script is a complete utility for validating and managing user stories.
// It uses Git history to determine the true creation date of a story based on
// its title, making it resilient to file renames and deletions.

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

// --- Type Definitions ---

interface StoryInfo {
  filePath: string;
  creationTimestamp: number;
  existingFilenameId: number;
  existingContentId: number;
  existingContentTitle: string;
  newId: number;
}

interface TestInfo {
  filePath: string;
  lineNumber: number;
  storyId: number;
  description: string;
  titleOnly: string;
}

interface Options {
  json: boolean;
  fix: boolean;
  dryRun: boolean;
}

interface ValidationError {
  type: 'ID Sync' | 'Title Sync' | 'Missing Story' | 'Duplicate ID' | 'Duplicate Title';
  message: string;
  details: Record<string, any>;
}

// --- ANSI Color Codes ---
const C_GREEN = '\x1b[32m';
const C_YELLOW = '\x1b[33m';
const C_BLUE = '\x1b[34m';
const C_RED = '\x1b[31m';
const C_RESET = '\x1b[0m';

// --- Main Logic ---

async function main() {
  const options = parseArguments(process.argv);

  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch (e) {
    console.error(`${C_RED}❌ ERROR: This script must be run inside a Git repository.${C_RESET}`);
    process.exit(1);
  }

  const stories = await gatherStoryData();
  const tests = await gatherTestData();

  assignNewStoryIds(stories);

  const errors = runValidation(stories, tests);

  if (options.fix) {
    await runFixes(stories, tests, options);
  } else if (options.json) {
    console.log(generateJsonReport(stories, tests, errors));
    if (errors.length > 0) process.exit(1);
  } else {
    printHumanReadableReport(errors);
    if (errors.length > 0) process.exit(1);
  }
}

function parseArguments(argv: string[]): Options {
  return {
    json: argv.includes('--json'),
    fix: argv.includes('--fix'),
    dryRun: argv.includes('--dry-run') || argv.includes('-n'),
  };
}

// --- Data Gathering Functions ---

function getStoryCreationTimestamp(storyTitle: string): number {
  try {
    // Use `git log -S` (pickaxe) to find the first commit that introduced this exact title string.
    // This is the most reliable way to find a story's "creation date", as it is resilient
    // to file renames, copies, or deletions/recreations.
    const command = `git log --all --format=%ct -S"${storyTitle}"`;
    const stdout = execSync(command).toString().trim();
    const timestamps = stdout.split('\n');
    return parseInt(timestamps[timestamps.length - 1], 10) || 0;
  } catch (e) {
    // Fallback for stories not yet committed
    return Math.floor(Date.now() / 1000);
  }
}

async function gatherStoryData(): Promise<StoryInfo[]> {
  const storyFiles = await glob('docs/user_stories/**/[0-9]*.md');
  const stories: StoryInfo[] = [];

  for (const filePath of storyFiles) {
    const filename = path.basename(filePath);
    const fileMatch = filename.match(/^(\d+)_/);
    if (!fileMatch) continue;

    const content = await fs.readFile(filePath, 'utf-8');
    const headerMatch = content.match(/^# Story (\d+): (.*)/m);
    if (!headerMatch) continue;

    const title = headerMatch[2].trim();

    stories.push({
      filePath,
      creationTimestamp: getStoryCreationTimestamp(title),
      existingFilenameId: parseInt(fileMatch[1], 10),
      existingContentId: parseInt(headerMatch[1], 10),
      existingContentTitle: title,
      newId: -1, // Placeholder
    });
  }
  return stories;
}

async function gatherTestData(): Promise<TestInfo[]> {
  const testFiles = await glob('test/**/*.test.ts');
  const allTestInfo: TestInfo[] = [];
  for (const filePath of testFiles) {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const describeMatch = line.match(/describe\('Story (\d+): (.*)'\)/);
      if (describeMatch) {
        allTestInfo.push({
          filePath,
          lineNumber: index + 1,
          storyId: parseInt(describeMatch[1], 10),
          description: `Story ${describeMatch[1]}: ${describeMatch[2]}`,
          titleOnly: describeMatch[2],
        });
      }
    });
  }
  return allTestInfo;
}

// --- Processing and Validation ---

function assignNewStoryIds(stories: StoryInfo[]) {
  stories.sort((a, b) => a.creationTimestamp - b.creationTimestamp);
  stories.forEach((story, index) => {
    story.newId = index;
  });
}

function runValidation(stories: StoryInfo[], tests: TestInfo[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const storyMapByExistingId = new Map<number, StoryInfo[]>();
  stories.forEach((story) => {
    if (!storyMapByExistingId.has(story.existingContentId)) {
      storyMapByExistingId.set(story.existingContentId, []);
    }
    storyMapByExistingId.get(story.existingContentId)!.push(story);
  });

  for (const [id, storyList] of storyMapByExistingId.entries()) {
    if (storyList.length > 1) {
      errors.push({
        type: 'Duplicate ID',
        message: `Existing Story ID ${id} is used in multiple files. This must be fixed.`,
        details: { files: storyList.map((s) => s.filePath) },
      });
    }
  }

  const storyMapByTitle = new Map<string, StoryInfo[]>();
  stories.forEach((story) => {
    if (!storyMapByTitle.has(story.existingContentTitle)) {
      storyMapByTitle.set(story.existingContentTitle, []);
    }
    storyMapByTitle.get(story.existingContentTitle)!.push(story);
  });

  for (const [title, storyList] of storyMapByTitle.entries()) {
    if (storyList.length > 1) {
      errors.push({
        type: 'Duplicate Title',
        message: `Story title "${title}" is used in multiple files.`,
        details: { files: storyList.map((s) => s.filePath) },
      });
    }
  }

  stories.forEach((story) => {
    if (story.existingContentId !== story.newId || story.existingFilenameId !== story.newId) {
      errors.push({
        type: 'ID Sync',
        message: 'Story ID is out of sync with chronological order.',
        details: { file: story.filePath, existing: story.existingContentId, expected: story.newId },
      });
    }
  });

  tests.forEach((test) => {
    const storyWithMatchingTitle = stories.find((s) => s.existingContentTitle === test.titleOnly);

    if (!storyWithMatchingTitle) {
      errors.push({
        type: 'Missing Story',
        message: `Test references a story title that no longer exists.`,
        details: { testFile: `${test.filePath}:${test.lineNumber}`, title: test.titleOnly },
      });
    } else {
      const expectedDescription = `Story ${storyWithMatchingTitle.newId}: ${storyWithMatchingTitle.existingContentTitle}`;
      if (test.description !== expectedDescription) {
        errors.push({
          type: 'Title Sync',
          message: `Test description is out of sync for story "${test.titleOnly}".`,
          details: {
            testFile: `${test.filePath}:${test.lineNumber}`,
            testDescription: test.description,
            expectedDescription,
          },
        });
      }
    }
  });
  return errors;
}

// --- Output and Fixing ---

async function runFixes(stories: StoryInfo[], tests: TestInfo[], options: Options) {
  console.log(
    options.dryRun ? `${C_YELLOW}DRY RUN: Calculating changes...${C_RESET}` : 'Applying fixes...'
  );

  // Pass 1: Update test files to use the new canonical IDs and titles.
  const testFixesByFile = new Map<string, { lineNumber: number; newContent: string }[]>();
  tests.forEach((test) => {
    const correctStory = stories.find((s) => s.existingContentTitle === test.titleOnly);
    if (correctStory) {
      const newDescription = `describe('Story ${correctStory.newId}: ${correctStory.existingContentTitle}')`;
      const currentLine = `describe('Story ${test.storyId}: ${test.titleOnly}')`;
      if (newDescription !== currentLine) {
        if (!testFixesByFile.has(test.filePath)) testFixesByFile.set(test.filePath, []);
        testFixesByFile
          .get(test.filePath)!
          .push({ lineNumber: test.lineNumber, newContent: `  ${newDescription}` });
      }
    }
  });

  for (const [filePath, fixes] of testFixesByFile.entries()) {
    console.log(
      `🔧 ${C_BLUE}Updating test descriptions in:${C_RESET} ${C_GREEN}${filePath}${C_RESET}`
    );
    const lines = options.dryRun ? [] : (await fs.readFile(filePath, 'utf-8')).split('\n');
    fixes.forEach((fix) => {
      console.log(
        `   - ${C_YELLOW}L${fix.lineNumber}:${C_RESET} Set description to "${fix.newContent.trim()}"`
      );
      if (!options.dryRun) lines[fix.lineNumber - 1] = fix.newContent;
    });
    if (!options.dryRun) await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
  }

  // Pass 2: Update story file headers with new canonical IDs.
  for (const story of stories) {
    if (story.existingContentId === story.newId) continue;
    const newHeader = `# Story ${story.newId}: ${story.existingContentTitle}`;
    console.log(
      `🔧 ${C_BLUE}Updating header for Story ${story.existingContentId} -> ${story.newId}${C_RESET} in ${C_GREEN}${story.filePath}${C_RESET}`
    );
    if (!options.dryRun) {
      const oldContent = await fs.readFile(story.filePath, 'utf-8');
      const newContent = oldContent.replace(/^# Story \d+: .*/m, newHeader);
      await fs.writeFile(story.filePath, newContent, 'utf-8');
    }
  }

  // Pass 3: Rename story files (two-phase).
  const renames: { from: string; to: string; temp: string }[] = [];
  stories.forEach((story) => {
    const newFilename = `${String(story.newId).padStart(2, '0')}_${path.basename(story.filePath).split('_').slice(1).join('_')}`;
    const newFilepath = path.join(path.dirname(story.filePath), newFilename);
    if (story.filePath !== newFilepath) {
      renames.push({ from: story.filePath, to: newFilepath, temp: `${newFilepath}.tmp` });
    }
  });

  for (const rename of renames) {
    console.log(
      `🔧 ${C_BLUE}Preparing rename:${C_RESET} ${rename.from} -> ${C_GREEN}${rename.to}${C_RESET}`
    );
    if (!options.dryRun) {
      await fs.rename(rename.from, rename.temp);
    }
  }
  for (const rename of renames) {
    if (!options.dryRun) {
      await fs.rename(rename.temp, rename.to);
    }
  }

  console.log(
    options.dryRun
      ? `\n${C_YELLOW}DRY RUN complete. No files were changed.${C_RESET}`
      : `\n${C_GREEN}✅ All files fixed.${C_RESET}`
  );
  console.log('Run the validation script again without --fix to verify.');
}

function generateJsonReport(
  stories: StoryInfo[],
  tests: TestInfo[],
  errors: ValidationError[]
): string {
  if (errors.length > 0 && !process.argv.includes('--fix')) {
    return JSON.stringify({ status: 'error', errors }, null, 2);
  }

  const report: any = {};
  const testMap = new Map<string, TestInfo[]>();
  tests.forEach((t) => {
    if (!testMap.has(t.titleOnly)) testMap.set(t.titleOnly, []);
    testMap.get(t.titleOnly)!.push(t);
  });

  stories.forEach((story) => {
    const storyTests = testMap.get(story.existingContentTitle) || [];
    report[story.filePath] = {
      file_path: story.filePath,
      existing_id: story.existingContentId,
      new_id: story.newId,
      story_title: story.existingContentTitle,
      matching_tests: storyTests.map((t) => ({
        file_path: t.filePath,
        line_number: t.lineNumber,
        description: t.description,
      })),
    };
  });
  return JSON.stringify(report, null, 2);
}

function printHumanReadableReport(errors: ValidationError[]) {
  if (errors.length > 0) {
    console.error(`\n${C_RED}❌ Validation failed with ${errors.length} issues:${C_RESET}`);
    errors.forEach((err) => {
      console.error(`\n[${C_YELLOW}${err.type}${C_RESET}] ${err.message}`);
      for (const [key, value] of Object.entries(err.details)) {
        console.error(`  - ${key}: ${JSON.stringify(value)}`);
      }
    });
    console.error(
      `\n${C_YELLOW}Run with the "--fix" flag to attempt automatic correction.${C_RESET}`
    );
  } else {
    console.log(`${C_GREEN}✅ All user stories and test references are consistent.${C_RESET}`);
  }
}

// --- Script Entry Point ---

main().catch((err) => {
  console.error('An unexpected fatal error occurred:', err);
  process.exit(1);
});
