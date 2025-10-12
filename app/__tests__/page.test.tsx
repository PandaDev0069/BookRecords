import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { storageUtils } from '../utils/storage';

// Mock storage utils
jest.mock('../utils/storage', () => ({
  storageUtils: {
    getBooks: jest.fn(() => []),
    saveBooks: jest.fn(),
    deleteBook: jest.fn(),
  },
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock window.confirm and window.alert
global.confirm = jest.fn(() => true);
global.alert = jest.fn();

describe('Home Page - Import Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.error mock if needed
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore?.();
  });

  it('should reject import when books array contains invalid id (missing)', async () => {
    render(<Home />);

    const invalidData = [
      {
        // id missing
        title: 'Test Book',
        author: 'Test Author',
        status: 'currently-reading',
        source: 'library',
        addedDate: '2025-10-01',
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('invalid book(s)'));
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('id missing or invalid type'));
    });

    expect(storageUtils.saveBooks).not.toHaveBeenCalled();
  });

  it('should reject import when id is empty string', async () => {
    render(<Home />);

    const invalidData = [
      {
        id: '   ', // Empty/whitespace string
        title: 'Test Book',
        author: 'Test Author',
        status: 'currently-reading',
        source: 'library',
        addedDate: '2025-10-01',
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('id is empty string'));
    });
  });

  it('should reject import when title is empty', async () => {
    render(<Home />);

    const invalidData = [
      {
        id: '1',
        title: '   ', // Empty/whitespace
        author: 'Test Author',
        status: 'currently-reading',
        source: 'library',
        addedDate: '2025-10-01',
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('title missing or empty'));
    });
  });

  it('should reject import when author is empty', async () => {
    render(<Home />);

    const invalidData = [
      {
        id: '1',
        title: 'Test Book',
        author: '', // Empty
        status: 'currently-reading',
        source: 'library',
        addedDate: '2025-10-01',
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('author missing or empty'));
    });
  });

  it('should reject import when addedDate is missing', async () => {
    render(<Home />);

    const invalidData = [
      {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        status: 'currently-reading',
        source: 'library',
        // addedDate missing
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        expect.stringContaining('addedDate missing or not a string')
      );
    });
  });

  it('should reject import when addedDate is invalid', async () => {
    render(<Home />);

    const invalidData = [
      {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        status: 'currently-reading',
        source: 'library',
        addedDate: 'not-a-valid-date',
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('addedDate is not a valid date'));
    });
  });

  it('should reject import when status is invalid', async () => {
    render(<Home />);

    const invalidData = [
      {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        status: 'invalid-status',
        source: 'library',
        addedDate: '2025-10-01',
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('status invalid or missing'));
    });
  });

  it('should accept valid books with string id', async () => {
    render(<Home />);

    const validData = [
      {
        id: 'uuid-123',
        title: 'Test Book',
        author: 'Test Author',
        status: 'currently-reading',
        source: 'library',
        addedDate: '2025-10-01',
      },
    ];

    const fileContent = JSON.stringify(validData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Import 1 books?'));
      expect(storageUtils.saveBooks).toHaveBeenCalledWith(validData);
    });
  });

  it('should accept valid books with numeric id', async () => {
    render(<Home />);

    const validData = [
      {
        id: 12345,
        title: 'Test Book',
        author: 'Test Author',
        status: 'want-to-read',
        source: 'personal',
        addedDate: '2025-10-01',
      },
    ];

    const fileContent = JSON.stringify(validData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(storageUtils.saveBooks).toHaveBeenCalledWith([
        {
          ...validData[0],
          id: '12345', // Numeric IDs are normalized to strings
        },
      ]);
    });
  });

  it('should show detailed error for multiple invalid books', async () => {
    render(<Home />);

    const invalidData = [
      {
        id: '1',
        title: '', // Invalid
        author: 'Author 1',
        status: 'currently-reading',
        source: 'library',
        addedDate: '2025-10-01',
      },
      {
        id: '2',
        title: 'Book 2',
        author: '', // Invalid
        status: 'want-to-read',
        source: 'library',
        addedDate: '2025-10-01',
      },
      {
        id: '3',
        title: 'Book 3',
        author: 'Author 3',
        status: 'completed',
        source: 'library',
        addedDate: 'bad-date', // Invalid
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Found 3 invalid book(s)'));
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Book 1'));
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Book 2'));
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Book 3'));
    });

    expect(storageUtils.saveBooks).not.toHaveBeenCalled();
  });

  it('should log validation errors to console', async () => {
    render(<Home />);

    const invalidData = [
      {
        id: '',
        title: 'Test',
        author: 'Author',
        status: 'currently-reading',
        source: 'library',
        addedDate: '2025-10-01',
      },
    ];

    const fileContent = JSON.stringify(invalidData);
    const file = new File([fileContent], 'books.json', { type: 'application/json' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Import validation errors:', expect.any(Array));
    });
  });
});
