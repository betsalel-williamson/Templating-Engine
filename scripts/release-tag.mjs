#!/usr/bin/env node
/**
 * Interactive npm release: human picks bump type, confirms version, then tags.
 * Requires a TTY — non-interactive runs (CI, LLM agents) cannot release.
 *
 * Usage:
 *   pnpm release:tag              # interactive version + commit + tag
 *   pnpm release:tag --push       # also push main and tag to origin
 *   pnpm release:tag --dry-run    # prompts + plan only, no writes
 */
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const PACKAGES = ['template-engine-core', 'template-engine-cli'];
const NPM_NAMES = {
  'template-engine-cli': '@bwilliamson/template-engine-cli',
  'template-engine-core': '@bwilliamson/template-engine-core',
};

const push = process.argv.includes('--push');
const dryRun = process.argv.includes('--dry-run');

function run(cmd) {
  console.log(`> ${cmd}`);
  if (!dryRun) {
    execSync(cmd, { cwd: root, stdio: 'inherit' });
  }
}

function capture(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf-8' }).trim();
}

function readVersion() {
  const pkg = JSON.parse(
    readFileSync(join(root, 'packages/template-engine-cli/package.json'), 'utf-8')
  );
  return pkg.version;
}

function pendingChangesets() {
  return readdirSync(join(root, '.changeset')).filter(
    (name) => name.endsWith('.md') && name !== 'README.md' && !name.startsWith('_')
  );
}

function latestReleaseTag() {
  try {
    return capture('git describe --tags --match "v*" --abbrev=0');
  } catch {
    return null;
  }
}

function commitsSinceTag(tag) {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const log = capture(`git log ${range} --oneline --no-decorate`);
  return log ? log.split('\n') : [];
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
    base: `${match[1]}.${match[2]}.${match[3]}`,
  };
}

function bumpVersion(current, bumpType) {
  const v = parseVersion(current);

  switch (bumpType) {
    case 'major':
      return `${v.major + 1}.0.0`;
    case 'minor':
      return `${v.major}.${v.minor + 1}.0`;
    case 'patch':
      return `${v.major}.${v.minor}.${v.patch + 1}`;
    case 'build': {
      const buildMatch = v.prerelease?.match(/^build\.(\d+)$/);
      if (buildMatch) {
        return `${v.base}-build.${Number(buildMatch[1]) + 1}`;
      }
      return `${v.base}-build.1`;
    }
    default:
      throw new Error(`Unknown bump type: ${bumpType}`);
  }
}

function parseChangesetSummary(filename) {
  const content = readFileSync(join(root, '.changeset', filename), 'utf-8');
  const parts = content.split('---');
  if (parts.length < 3) {
    return null;
  }
  const summary = parts.slice(2).join('---').trim();
  return summary.length > 0 ? summary : null;
}

function collectSummaries(files) {
  return files.map(parseChangesetSummary).filter(Boolean);
}

function tagExists(tag) {
  try {
    capture(`git rev-parse ${tag}^{commit}`);
    return true;
  } catch {
    return false;
  }
}

function remoteTagExists(tag) {
  try {
    return capture(`git ls-remote --tags origin refs/tags/${tag}`).length > 0;
  } catch {
    return false;
  }
}

async function prompt(question) {
  const rl = createInterface({ input, output });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

function setVersionAllPackages(version) {
  for (const name of PACKAGES) {
    const path = join(root, 'packages', name, 'package.json');
    const json = JSON.parse(readFileSync(path, 'utf-8'));
    json.version = version;
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  }
}

function prependChangelog(version, summaries) {
  const body = summaries.join('\n\n');
  const block = `## ${version}\n\n${body}\n\n`;

  for (const name of PACKAGES) {
    const path = join(root, 'packages', name, 'CHANGELOG.md');
    let existing;
    try {
      existing = readFileSync(path, 'utf-8');
    } catch {
      existing = `# ${NPM_NAMES[name]}\n\n`;
    }
    const header = existing.startsWith('#')
      ? existing.split('\n\n')[0] + '\n\n'
      : `# ${NPM_NAMES[name]}\n\n`;
    const rest = existing.startsWith('#') ? existing.slice(header.length) : existing;
    writeFileSync(path, `${header}${block}${rest}`);
  }
}

function writeUnifiedChangeset(bumpType, summaries) {
  const summary = summaries.join('\n\n');
  const frontmatter = [
    '---',
    `"@bwilliamson/template-engine-core": ${bumpType}`,
    `"@bwilliamson/template-engine-cli": ${bumpType}`,
    '---',
    '',
    summary,
    '',
  ].join('\n');
  writeFileSync(join(root, '.changeset/_release-pending.md'), frontmatter);
}

function removePendingChangesets(files) {
  for (const file of files) {
    if (!dryRun) {
      unlinkSync(join(root, '.changeset', file));
    }
  }
}

function applyVersionBump(bumpType, pending, summaries) {
  if (bumpType === 'build') {
    const next = bumpVersion(readVersion(), bumpType);
    if (!dryRun) {
      setVersionAllPackages(next);
      prependChangelog(next, summaries.length > 0 ? summaries : ['Build release.']);
      removePendingChangesets(pending);
    }
    return next;
  }

  if (!dryRun) {
    removePendingChangesets(pending);
    writeUnifiedChangeset(bumpType, summaries.length > 0 ? summaries : ['Release.']);
    execSync('pnpm exec changeset version', { cwd: root, stdio: 'inherit' });
    try {
      unlinkSync(join(root, '.changeset/_release-pending.md'));
    } catch {
      // consumed by changeset version
    }
  }

  return dryRun ? bumpVersion(readVersion(), bumpType) : readVersion();
}

const BUMP_MENU = [
  { key: '1', type: 'patch', label: 'patch — bug fixes, no API change' },
  { key: '2', type: 'minor', label: 'minor — new features, backward compatible' },
  { key: '3', type: 'major', label: 'major — breaking changes' },
  { key: '4', type: 'build', label: 'build — same API, republish (build.N prerelease)' },
];

async function main() {
  if (!dryRun && !process.stdin.isTTY) {
    console.error(
      'release:tag requires an interactive terminal (TTY).\n' +
        'Version bumps must be confirmed by a human — CI and agents cannot run this script.'
    );
    process.exit(1);
  }

  const branch = capture('git rev-parse --abbrev-ref HEAD');
  if (branch !== 'main') {
    console.error(`release:tag must run on main (current: ${branch})`);
    process.exit(1);
  }

  const dirty = capture('git status --porcelain');
  if (dirty) {
    console.error('Working tree is not clean. Commit or stash changes first.');
    process.exit(1);
  }

  const pending = pendingChangesets();
  const current = readVersion();
  const summaries = collectSummaries(pending);
  const sinceTag = latestReleaseTag();
  const recentCommits = commitsSinceTag(sinceTag);

  console.log('\n=== mdcp release (human confirmation required) ===\n');
  console.log(`Current version: ${current}`);
  if (sinceTag) {
    console.log(`Last release tag: ${sinceTag}`);
  }
  if (pending.length === 0) {
    console.log('\nNo pending changesets.');
    if (recentCommits.length > 0) {
      console.log(`Commits on main since ${sinceTag ?? 'repo start'} (${recentCommits.length}):`);
      for (const line of recentCommits.slice(0, 10)) {
        console.log(`  • ${line}`);
      }
      if (recentCommits.length > 10) {
        console.log(`  … and ${recentCommits.length - 10} more`);
      }
    } else {
      console.log('No commits since the last release tag.');
    }
    console.log(
      '\nProceeding without changesets — changelog will use a generic entry.\n' +
        'Add one with `pnpm changeset` first if you want a descriptive release note.'
    );
  } else {
    console.log(`Pending changesets (${pending.length}):`);
    for (const file of pending) {
      const summary = parseChangesetSummary(file);
      console.log(`  • ${file}${summary ? `: ${summary.split('\n')[0]}` : ' (empty)'}`);
    }
  }
  console.log('');

  for (const item of BUMP_MENU) {
    const preview = bumpVersion(current, item.type);
    console.log(`  ${item.key}) ${item.label} → ${preview}`);
  }
  console.log('');

  let bumpType = null;
  while (!bumpType) {
    // --dry-run defaults to minor (2) for predictable non-interactive output.
    const choice = dryRun ? '2' : await prompt('Select bump type (1-4): ');
    const selected = BUMP_MENU.find((item) => item.key === choice);
    if (selected) {
      bumpType = selected.type;
    } else {
      console.log('Invalid choice. Enter 1, 2, 3, or 4.');
    }
  }

  const nextVersion = bumpVersion(current, bumpType);
  const tag = `v${nextVersion}`;

  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log(`│  Release ${tag} to npm`);
  console.log(`│  Bump:   ${bumpType}`);
  console.log(`│  Push:   ${push ? 'yes (--push)' : 'no (local tag only)'}`);
  console.log('│');
  console.log('│  Pushing the tag triggers CI to publish all @bwilliamson/mdcp-*');
  console.log('│  packages to the npm registry.');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('');

  const expectedConfirm = tag;
  const typed = dryRun
    ? expectedConfirm
    : await prompt(`Type ${expectedConfirm} to confirm release: `);

  if (typed !== expectedConfirm) {
    console.error(`\nAborted. Expected "${expectedConfirm}", got "${typed}".`);
    process.exit(1);
  }

  const really = dryRun ? 'yes' : await prompt('Do you really want to do this? (yes/no): ');
  if (really.toLowerCase() !== 'yes') {
    console.error('\nAborted.');
    process.exit(1);
  }

  if (tagExists(tag)) {
    console.error(`Tag ${tag} already exists locally.`);
    process.exit(1);
  }

  if (remoteTagExists(tag)) {
    console.error(`Tag ${tag} already exists on origin.`);
    process.exit(1);
  }

  console.log(`\nApplying ${bumpType} bump → ${nextVersion}`);
  const appliedVersion = applyVersionBump(bumpType, pending, summaries);

  if (!dryRun && appliedVersion !== nextVersion) {
    console.error(`Version mismatch: planned ${nextVersion}, got ${appliedVersion}. Aborting.`);
    process.exit(1);
  }

  const finalTag = `v${appliedVersion}`;

  if (dryRun) {
    console.log(`> git add -A`);
    console.log(`> git commit -m "chore: release ${finalTag}"`);
    console.log(`> git tag -a ${finalTag} -m "Release ${finalTag}"`);
    if (push) {
      console.log('> git push origin main');
      console.log(`> git push origin ${finalTag}`);
    }
    console.log('\nDry run complete — no changes made.');
    return;
  }

  run('git add -A');
  run(`git commit -m "chore: release ${finalTag}"`);
  run(`git tag -a ${finalTag} -m "Release ${finalTag}"`);

  if (push) {
    run('git push origin main');
    run(`git push origin ${finalTag}`);
    console.log(`\nReleased ${finalTag} — CI will publish to npm when the tag push completes.`);
  } else {
    console.log(`\nTagged ${finalTag} locally.`);
    console.log(`Push to publish: git push origin main && git push origin ${finalTag}`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
