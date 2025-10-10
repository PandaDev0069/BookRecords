import { test, expect } from '@playwright/test';

test.describe('Book Records E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the main page with header and stats', async ({ page }) => {
    await page.goto('/');

    // Check header
    await expect(page.getByRole('heading', { name: /Book Records/i })).toBeVisible();
    await expect(page.getByText(/Track your reading journey/i)).toBeVisible();

    // Check stats are displayed using specific text that doesn't conflict
    await expect(page.getByText('Total Books')).toBeVisible();
    await expect(page.getByText('Pages Read')).toBeVisible();
    await expect(page.getByText('Completion')).toBeVisible();
  });

  test('should add a new book successfully', async ({ page }) => {
    await page.goto('/');

    // Click Add Book button
    await page.getByRole('button', { name: /Add Book/i }).click();

    // Wait for form to appear
    await expect(page.getByRole('heading', { name: /Add New Book/i })).toBeVisible();

    // Fill in book details
    await page.getByLabel('Title *').fill('The Pragmatic Programmer');
    await page.getByLabel('Author *').fill('David Thomas');
    await page.getByLabel('Status *').selectOption('currently-reading');
    await page.getByLabel('Source').selectOption('personal');
    await page.getByLabel('Total Pages').fill('352');
    await page.getByLabel('Current Page').fill('50');

    // Submit form using exact match to avoid ambiguity
    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    // Verify book appears in the list
    await expect(page.getByText('The Pragmatic Programmer')).toBeVisible();
    await expect(page.getByText('David Thomas')).toBeVisible();
  });

  test('should calculate daily reading goal with deadline', async ({ page }) => {
    await page.goto('/');

    // Add a book with a deadline
    await page.getByRole('button', { name: /Add Book/i }).click();

    await page.getByLabel('Title *').fill('Clean Code');
    await page.getByLabel('Author *').fill('Robert Martin');
    await page.getByLabel('Status *').selectOption('currently-reading');
    await page.getByLabel('Total Pages').fill('464');
    await page.getByLabel('Current Page').fill('100');

    // Set deadline 10 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.getByLabel('Reading Deadline').fill(dateString);

    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    // Verify daily goal is displayed
    await expect(page.getByText(/pages\/day/i)).toBeVisible();
    await expect(page.getByText(/in \d+ days/i)).toBeVisible();
  });

  test('should edit an existing book', async ({ page }) => {
    await page.goto('/');

    // Add a book first
    await page.getByRole('button', { name: /Add Book/i }).click();
    await page.getByLabel('Title *').fill('Original Title');
    await page.getByLabel('Author *').fill('Original Author');
    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    // Wait for book to appear
    await expect(page.getByText('Original Title')).toBeVisible();

    // Click edit button (using title attribute)
    await page.locator('button[title="Edit"]').first().click();

    // Wait for edit form
    await expect(page.getByRole('heading', { name: /Edit Book/i })).toBeVisible();

    // Update title
    await page.getByLabel('Title *').fill('Updated Title');
    await page.getByRole('button', { name: /Update Book/i }).click();

    // Verify updated title appears
    await expect(page.getByText('Updated Title')).toBeVisible();
    await expect(page.getByText('Original Title')).not.toBeVisible();
  });

  test('should delete a book', async ({ page }) => {
    await page.goto('/');

    // Add a book
    await page.getByRole('button', { name: /Add Book/i }).click();
    await page.getByLabel('Title *').fill('Book to Delete');
    await page.getByLabel('Author *').fill('Some Author');
    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    await expect(page.getByText('Book to Delete')).toBeVisible();

    // Set up dialog handler before clicking delete
    page.on('dialog', (dialog) => dialog.accept());

    // Click delete button
    await page.locator('button[title="Delete"]').first().click();

    // Verify book is removed
    await expect(page.getByText('Book to Delete')).not.toBeVisible();
  });

  test('should filter books by status', async ({ page }) => {
    await page.goto('/');

    // Add multiple books with different statuses
    const books = [
      { title: 'Reading Book', status: 'currently-reading' },
      { title: 'Want Book', status: 'want-to-read' },
      { title: 'Done Book', status: 'completed' },
    ];

    for (const book of books) {
      await page.getByRole('button', { name: /Add Book/i }).click();
      await page.getByLabel('Title *').fill(book.title);
      await page.getByLabel('Author *').fill('Test Author');
      await page.getByLabel('Status *').selectOption(book.status);
      await page.getByRole('button', { name: 'Add Book', exact: true }).click();
      await expect(page.getByText(book.title)).toBeVisible();
    }

    // Filter by "Currently Reading"
    await page.locator('select').filter({ hasText: 'All Books' }).selectOption('currently-reading');
    await expect(page.getByText('Reading Book')).toBeVisible();
    await expect(page.getByText('Want Book')).not.toBeVisible();
    await expect(page.getByText('Done Book')).not.toBeVisible();

    // Filter by "Completed"
    await page.locator('select').filter({ hasText: 'Currently Reading' }).selectOption('completed');
    await expect(page.getByText('Done Book')).toBeVisible();
    await expect(page.getByText('Reading Book')).not.toBeVisible();
  });

  test('should search books', async ({ page }) => {
    await page.goto('/');

    // Add books
    await page.getByRole('button', { name: /Add Book/i }).click();
    await page.getByLabel('Title *').fill('JavaScript: The Good Parts');
    await page.getByLabel('Author *').fill('Douglas Crockford');
    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    await page.getByRole('button', { name: /Add Book/i }).click();
    await page.getByLabel('Title *').fill('Python Crash Course');
    await page.getByLabel('Author *').fill('Eric Matthes');
    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    // Search for JavaScript
    await page.getByPlaceholder(/Search books/i).fill('JavaScript');
    await expect(page.getByText('JavaScript: The Good Parts')).toBeVisible();
    await expect(page.getByText('Python Crash Course')).not.toBeVisible();

    // Clear search
    await page.getByPlaceholder(/Search books/i).clear();
    await expect(page.getByText('JavaScript: The Good Parts')).toBeVisible();
    await expect(page.getByText('Python Crash Course')).toBeVisible();
  });

  test('should export and import data', async ({ page }) => {
    await page.goto('/');

    // Add a book
    await page.getByRole('button', { name: /Add Book/i }).click();
    await page.getByLabel('Title *').fill('Export Test Book');
    await page.getByLabel('Author *').fill('Test Author');
    await page.getByLabel('Status *').selectOption('completed');
    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    // Verify book is added
    await expect(page.getByText('Export Test Book')).toBeVisible();

    // Export data
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export Data/i }).click();
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toContain('book-records');
    expect(download.suggestedFilename()).toContain('.json');

    // Get the downloaded file path
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Clear storage and reload to simulate fresh state
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Verify book is gone
    await expect(page.getByText('Export Test Book')).not.toBeVisible();
    await expect(page.getByText(/No books yet/i)).toBeVisible();

    // Set up dialog handler for import confirmation
    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('Import 1 books?');
      dialog.accept();
    });

    // Import the exported data - click the label that wraps the hidden input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Import Data")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(downloadPath!);

    // Verify the imported book appears
    await expect(page.getByText('Export Test Book')).toBeVisible();
    await expect(page.getByText('Test Author')).toBeVisible();

    // Verify stats updated
    await expect(page.getByText('1').first()).toBeVisible();
  });

  test('should show empty state when no books', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/No books yet/i)).toBeVisible();
    await expect(page.getByText(/Add your first book to get started/i)).toBeVisible();
  });

  test('should track library book return date', async ({ page }) => {
    await page.goto('/');

    // Add library book with return date
    await page.getByRole('button', { name: /Add Book/i }).click();
    await page.getByLabel('Title *').fill('Library Book');
    await page.getByLabel('Author *').fill('Author Name');
    await page.getByLabel('Source').selectOption('library');

    // Set return date to 2 days from now
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 2);
    const dateString = returnDate.toISOString().split('T')[0];
    await page.getByLabel('Return Date').fill(dateString);

    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    // Verify return date is displayed
    await expect(page.getByText(/Return by:/i)).toBeVisible();
    await expect(page.getByText(/\d+ days left/i)).toBeVisible();
  });

  test('should update stats when books are added', async ({ page }) => {
    await page.goto('/');

    // Initially 0 books
    const statsSection = page.locator('.grid').first();
    await expect(statsSection.getByText('0').first()).toBeVisible();

    // Add a book
    await page.getByRole('button', { name: /Add Book/i }).click();
    await page.getByLabel('Title *').fill('Stats Test Book');
    await page.getByLabel('Author *').fill('Author');
    await page.getByLabel('Status *').selectOption('completed');
    await page.getByRole('button', { name: 'Add Book', exact: true }).click();

    // Stats should update
    await expect(statsSection.getByText('1').first()).toBeVisible();
  });

  test('should handle form cancellation', async ({ page }) => {
    await page.goto('/');

    // Open form
    await page.getByRole('button', { name: /Add Book/i }).click();
    await expect(page.getByRole('heading', { name: /Add New Book/i })).toBeVisible();

    // Cancel
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Form should close
    await expect(page.getByRole('heading', { name: /Add New Book/i })).not.toBeVisible();
  });
});
