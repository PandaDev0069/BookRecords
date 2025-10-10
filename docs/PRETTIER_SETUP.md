# Prettier Setup

This project uses Prettier for automatic code formatting.

## Configuration Files

- **`.prettierrc.json`**: Prettier configuration
- **`.prettierignore`**: Files/folders to ignore
- **`.vscode/settings.json`**: VS Code auto-format on save settings

## NPM Scripts

### Format All Files

```bash
npm run format
```

Formats all TypeScript, JavaScript, JSON, CSS, and Markdown files.

### Format Only Markdown

```bash
npm run format:md
```

Formats only Markdown (`.md`) files.

### Check Formatting

```bash
npm run format:check
```

Checks if files are formatted correctly without modifying them.

## VS Code Integration

If you're using VS Code with the Prettier extension installed:

1. **Install Extension**: `esbenp.prettier-vscode`
2. **Auto-format on save**: Already configured in `.vscode/settings.json`
3. Files will be automatically formatted when you save them

## Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Markdown-Specific Settings

- **`proseWrap: "preserve"`**: Preserves line breaks in Markdown
- **`printWidth: 100`**: Maximum line width for Markdown

## Pre-commit Workflow

Before committing code:

```bash
npm run format      # Format all files
npm run lint        # Check for ESLint errors
npm run test:ci     # Run all tests
```

Or use this one-liner:

```bash
npm run format && npm run lint && npm run test:ci
```

## Common Issues

### Markdown Linting Errors

If you see Markdown linting errors (MD0XX), run:

```bash
npm run format:md
```

This will fix most formatting issues in Markdown files.

### Format Conflicts

If Prettier and ESLint conflict:

- Prettier is configured to work with ESLint via `eslint-config-prettier`
- Prettier formatting rules take precedence over ESLint formatting rules
- ESLint handles code quality rules, Prettier handles formatting

## Files Formatted

- **TypeScript/JavaScript**: `*.ts`, `*.tsx`, `*.js`, `*.jsx`
- **Styles**: `*.css`, `*.scss`
- **Data**: `*.json`
- **Documentation**: `*.md`

## Files Ignored

See `.prettierignore` for the complete list. Key exclusions:

- `node_modules/`
- `.next/`
- `coverage/`
- `test-results/`
- Lock files
