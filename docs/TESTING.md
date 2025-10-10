# Testing Guide

This document provides comprehensive information about testing the Book Records application.

## Test Suite Overview

The application includes three types of tests:

1. **Unit Tests** - Test individual functions and utilities
2. **Component Tests** - Test React components in isolation
3. **E2E Tests** - Test complete user workflows

## Running Tests

### Run All Unit & Component Tests

```bash
npm test
```

### Run Tests in CI Mode (with coverage)

```bash
npm run test:ci
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run E2E Tests with UI

```bash
npm run test:e2e:ui
```

### Run E2E Tests in Debug Mode

```bash
npm run test:e2e:debug
```

### Run All Tests

```bash
npm run test:all
```

## Test Coverage

Current test coverage (Unit + Component tests):

- **Overall**: ~65% statement coverage
- **Utils**: 65% - Testing core business logic
- **Components**: 45% - Testing UI components
  - Stats: 100% coverage
  - BookCard: 92% coverage
  - BookForm: Covered via E2E tests

## Unit Tests

Location: `app/__tests__/storage.test.ts`

### Scope of Tests

#### `calculateDailyGoal()`

- ✅ Returns null when deadline is missing
- ✅ Returns null when total pages is missing
- ✅ Calculates daily pages correctly
- ✅ Handles overdue deadlines
- ✅ Rounds up pages per day

#### `formatDate()`

- ✅ Formats dates correctly (e.g., "Oct 10, 2025")
- ✅ Handles different date formats

#### `isOverdue()`

- ✅ Returns true for past dates
- ✅ Returns false for today
- ✅ Returns false for future dates

#### `getDaysUntil()`

- ✅ Returns 0 for today
- ✅ Returns positive days for future dates
- ✅ Returns negative days for past dates

### Example

```bash
npm run test:ci

PASS  app/__tests__/storage.test.ts
  calculateDailyGoal
    ✓ should return null if no deadline
    ✓ should calculate daily goal correctly
    ✓ should handle overdue deadline
```

## Component Tests

### Stats Component (`app/__tests__/Stats.test.tsx`)

Tests for the statistics dashboard:

- ✅ Renders all stat cards
- ✅ Displays zero stats for empty book list
- ✅ Calculates statistics correctly
- ✅ Handles books without page numbers
- ✅ Displays 100% completion correctly

### BookCard Component (`app/__tests__/BookCard.test.tsx`)

Tests for individual book cards:

- ✅ Renders book information
- ✅ Displays progress bar with correct percentage
- ✅ Calculates and displays daily reading goal
- ✅ Shows return date warnings for library books
- ✅ Shows overdue warnings
- ✅ Displays book notes
- ✅ Calls onEdit when edit button clicked
- ✅ Calls onDelete when delete button clicked
- ✅ Shows placeholder when no cover image
- ✅ Handles books without total pages

### Running Component Tests

```bash
# Run only component tests
npm test -- BookCard.test.tsx
npm test -- Stats.test.tsx
```

## E2E Tests

Location: `e2e/app.spec.ts`

### Key Scenarios

#### Core Functionality

- Display main page with header and stats
- Add a new book successfully
- Calculate daily reading goal with deadline
- Edit an existing book
- Delete a book
- Filter books by status
- Search books
- Export and import data
- Track library book return date
- Update stats when books are added
- Handle form cancellation
- Show empty state when no books

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode for debugging
npm run test:e2e:ui

# Run in debug mode (step through)
npm run test:e2e:debug
```

### E2E Test Reports

After running E2E tests, a detailed HTML report is generated:

- Location: `playwright-report/index.html`
- Open automatically after test run
- Includes screenshots and traces for failures

## Debugging Tests

### VS Code Debugging

The project includes debug configurations in `.vscode/launch.json`:

1. **Jest: Run All Tests** - Run all unit/component tests with debugger
2. **Jest: Debug Current Test File** - Debug the currently open test file
3. **Playwright: Debug E2E Tests** - Debug Playwright E2E tests

### Using the Debugger

1. Open a test file
2. Set breakpoints
3. Press F5 or use Run & Debug panel
4. Select appropriate debug configuration

### Manual Debugging

```bash
# Run specific test file
npm test -- storage.test.ts

# Run tests in watch mode
npm test

# Run with verbose output
npm test -- --verbose

# Run E2E tests headed (see browser)
npx playwright test --headed

# Run single E2E test
npx playwright test --grep "should add a new book"
```

## CI/CD Integration

### GitHub Actions

The project includes a comprehensive CI workflow (`.github/workflows/ci.yml`) that runs on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### CI Jobs

1. **Lint and Type Check**
   - ESLint validation
   - TypeScript type checking

2. **Unit Tests**
   - Runs all Jest tests
   - Generates coverage reports
   - Uploads to Codecov

3. **E2E Tests**
   - Installs Playwright browsers
   - Runs all E2E tests
   - Uploads test reports as artifacts

4. **Build**
   - Builds production bundle
   - Uploads build artifacts

### Viewing CI Results

- Check the "Actions" tab in GitHub
- View test results and coverage
- Download test artifacts
- Review E2E test reports

## Writing New Tests

### Adding a Unit Test

1. Create test file: `app/__tests__/yourFeature.test.ts`
2. Write test:

```typescript
import { yourFunction } from '../utils/yourUtil';

describe('yourFunction', () => {
  it('should do something', () => {
    const result = yourFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Adding a Component Test

```typescript
import { render, screen } from '@testing-library/react'
import YourComponent from '../components/YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent prop="value" />)
    expect(screen.getByText('Expected Text')).toBeTruthy()
  })
})
```

### Adding an E2E Test

```typescript
test('should perform user action', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Click Me/i }).click();
  await expect(page.getByText('Result')).toBeVisible();
});
```

## Best Practices

### Unit Test Best Practices

- Test one thing per test
- Use descriptive test names
- Mock external dependencies
- Test edge cases

### Component Test Best Practices

- Test user interactions
- Verify rendered output
- Test accessibility
- Use Testing Library best practices

### E2E Test Best Practices

- Test real user workflows
- Keep tests independent
- Use semantic selectors (role, label, text)
- Clean up test data

## Troubleshooting

### Tests Failing Locally

1. Clear Jest cache:

   ```bash
   npm test -- --clearCache
   ```

2. Reinstall dependencies:

   ```bash
   rm -rf node_modules
   npm install
   ```

### E2E Tests Timing Out

1. Increase timeout in test:

   ```typescript
   test.setTimeout(60000);
   ```

2. Check if dev server is running:

   ```bash
   npm run dev
   ```

### Coverage Issues

View detailed coverage report:

```bash
npm run test:ci
open coverage/lcov-report/index.html
```

## Continuous Improvement

- Aim for 80%+ code coverage
- Add tests for new features
- Update tests when refactoring
- Review failed tests in CI
- Keep tests fast and reliable

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
