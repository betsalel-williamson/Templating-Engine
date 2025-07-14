# Project Documentation Index

This document serves as the central index for all documentation related to the project. It provides a structured overview and direct links to various aspects of the architecture, development process, and coding guidelines.

## Table of Contents

### Core System Configuration

- [**system-prompt.md**](system-prompt.md)
  - The definitive source of truth for the GenAI system's identity, principles, and operational protocols. All AI behavior is governed by this file.

### Core Engineering Principles

- [**core-principles.md**](core-principles.md)
  - Centralized repository of core engineering principles for the project, covering product, delivery, architectural, code, and testing principles.
- [**VERIFICATION_PROTOCOL.md**](VERIFICATION_PROTOCOL.md)
  - Defines the verification protocol for the GenAI system.

### Development Process & Operational Protocols

- [**process.md**](process.md)
  - Outlines the iterative, data-informed 7-step improvement cycle for software development, integrating AI as a core accelerator.
- [**secondary-protocols.md**](secondary-protocols.md)
  - Additional operational mandates and communication style guidelines for the GenAI system, emphasizing directness, conciseness, and minimal diffs.
- [**task-standards.md**](task-standards.md)
  - Standards for defining and managing tasks.
- [**user-story-standards.md**](user-story-standards.md)
  - Standards for writing user stories.

### General Project Practices

- [**Project Practices**](project-practices.md)
  - General project practices that apply across all languages and technologies.

### Architectural Vision

- [**Architecture Documentation**](architecture/README.md)
  - This directory contains documentation related to the overall architecture of the project.

### Language-Specific Guidelines

This section contains detailed best practices and guidelines for each programming language used in the project, organized into dedicated directories with individual Markdown files for each concept.

- [**Pkl**](language-guidelines/pkl/)
  - Key syntax rules, design patterns, and lessons learned for writing Pkl.
  - [Built-in Functions](language-guidelines/pkl/built-in-functions.md)
  - [Conditional Logic](language-guidelines/pkl/conditional-logic.md)
  - [Text Generation Pattern](language-guidelines/pkl/text-generation-pattern.md)
  - [String Formatting](language-guidelines/pkl/string-formatting.md)
  - [Reading YAML Files](language-guidelines/pkl/reading-yaml-files.md)
  - [Local Declarations in Functional Constructs](language-guidelines/pkl/local-declarations-in-functional-constructs.md)
  - [If Expression Syntax](language-guidelines/pkl/if-expression-syntax.md)
  - [Unit Testing](language-guidelines/pkl/unit-testing.md)
  - [Mapping Entry vs. Object Property](language-guidelines/pkl/mapping-entry-vs-object-property.md)
  - [When vs. If](language-guidelines/pkl/when-vs-if.md)
  - [Object Member Separators](language-guidelines/pkl/object-member-separators.md)
  - [Local Functions](language-guidelines/pkl/local-functions.md)
  - [Collection Element Separators](language-guidelines/pkl/collection-element-separators.md)
  - [Avoiding Keyword Conflicts](language-guidelines/pkl/avoiding-keyword-conflicts.md)
  - [Advanced Templating](language-guidelines/pkl/advanced-templating.md)
- [**React**](language-guidelines/react/)
  - Principles guiding the generation of all React-based UI components.
- [**Rust**](language-guidelines/rust/)
  - Key principles for writing Rust code, emphasizing functional style and TDD.
- [**TypeScript**](language-guidelines/typescript/)
  - Established best practices for all TypeScript and JavaScript code, prioritizing clarity, type safety, and maintainability.

### Other files

- [**kentbeck.md**](kentbeck.md)
  - By Kent Beck. Detailed guidance on Kent Beck's Test-Driven Development (TDD) and "Tidy First" methodologies, including Red-Green-Refactor cycles and structural vs. behavioral changes. [source](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes?open=false#§appendix-system-prompt)
- [**citypaul.md**](citypaul.md)
  - By Paul Hammond. [source](https://github.com/citypaul/.dotfiles/blob/main/claude/.claude/CLAUDE.md)
