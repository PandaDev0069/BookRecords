import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookForm from '../BookForm';
import { storageUtils } from '../../utils/storage';
import { generateUniqueId } from '../../utils/uuid';

// Mock the uuid module
jest.mock('../../utils/uuid', () => ({
  generateUniqueId: jest.fn(),
}));

// Mock storage utilities
jest.mock('../../utils/storage', () => ({
  storageUtils: {
    addBook: jest.fn(),
    updateBook: jest.fn(),
  },
  convertImageToBase64: jest.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
}));

describe('BookForm - UUID Integration', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockGenerateUniqueId = generateUniqueId as jest.MockedFunction<typeof generateUniqueId>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set a default return value for UUID generation
    mockGenerateUniqueId.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');
  });

  describe('ID generation for new books', () => {
    it('should use generateUniqueId for new books', async () => {
      const mockUUID = '550e8400-e29b-41d4-a716-446655440000';
      mockGenerateUniqueId.mockReturnValue(mockUUID);

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} />);

      // Fill in required fields - get inputs by position since they lack proper labels
      const textboxes = screen.getAllByRole('textbox');
      const titleInput = textboxes[0]; // First textbox is title
      const authorInput = textboxes[1]; // Second textbox is author

      fireEvent.change(titleInput, {
        target: { value: 'Test Book' },
      });
      fireEvent.change(authorInput, {
        target: { value: 'Test Author' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /add book/i }));

      await waitFor(() => {
        expect(mockGenerateUniqueId).toHaveBeenCalled();
        expect(storageUtils.addBook).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockUUID,
            title: 'Test Book',
            author: 'Test Author',
          })
        );
      });
    });

    it('should generate unique IDs for multiple new books', async () => {
      let callCount = 0;
      mockGenerateUniqueId.mockImplementation(() => {
        callCount++;
        return `uuid-${callCount}`;
      });

      const { unmount } = render(<BookForm onClose={mockOnClose} onSave={mockOnSave} />);

      // Fill and submit first book
      let textboxes = screen.getAllByRole('textbox');
      fireEvent.change(textboxes[0], {
        target: { value: 'Book 1' },
      });
      fireEvent.change(textboxes[1], {
        target: { value: 'Author 1' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add book/i }));

      await waitFor(() => {
        expect(mockGenerateUniqueId).toHaveBeenCalledTimes(1);
      });

      const firstCallId = (storageUtils.addBook as jest.Mock).mock.calls[0][0].id;

      // Unmount and create new instance for second book
      unmount();
      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} />);

      // Fill and submit second book
      textboxes = screen.getAllByRole('textbox');
      fireEvent.change(textboxes[0], {
        target: { value: 'Book 2' },
      });
      fireEvent.change(textboxes[1], {
        target: { value: 'Author 2' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add book/i }));

      await waitFor(() => {
        expect(mockGenerateUniqueId).toHaveBeenCalledTimes(2);
      });

      const secondCallId = (storageUtils.addBook as jest.Mock).mock.calls[1][0].id;

      // IDs should be different
      expect(firstCallId).not.toBe(secondCallId);
    });

    it('should not use Date.now() for ID generation', async () => {
      const dateNowSpy = jest.spyOn(Date, 'now');

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} />);

      const textboxes = screen.getAllByRole('textbox');
      fireEvent.change(textboxes[0], {
        target: { value: 'Test Book' },
      });
      fireEvent.change(textboxes[1], {
        target: { value: 'Test Author' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add book/i }));

      await waitFor(() => {
        expect(storageUtils.addBook).toHaveBeenCalled();
      });

      const savedBook = (storageUtils.addBook as jest.Mock).mock.calls[0][0];

      // ID should not be a timestamp string
      expect(savedBook.id).not.toMatch(/^\d+$/);

      // ID should be a UUID v4 format
      expect(savedBook.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      dateNowSpy.mockRestore();
    });
  });

  describe('ID preservation when editing books', () => {
    it('should preserve existing book ID when editing', async () => {
      const existingBook = {
        id: 'existing-uuid-12345',
        title: 'Existing Book',
        author: 'Existing Author',
        status: 'currently-reading' as const,
        source: 'personal' as const,
        currentPage: 50,
        addedDate: '2025-01-01T00:00:00.000Z',
      };

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} editBook={existingBook} />);

      // Modify the book
      const textboxes = screen.getAllByRole('textbox');
      fireEvent.change(textboxes[0], {
        target: { value: 'Updated Title' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /update book/i }));

      await waitFor(() => {
        expect(storageUtils.updateBook).toHaveBeenCalledWith(
          'existing-uuid-12345',
          expect.objectContaining({
            id: 'existing-uuid-12345',
            title: 'Updated Title',
          })
        );
      });

      // generateUniqueId should NOT be called when editing
      expect(mockGenerateUniqueId).not.toHaveBeenCalled();
    });

    it('should not generate new ID for edited book even with custom ID format', async () => {
      const customIdBook = {
        id: 'custom-id-format-999',
        title: 'Custom ID Book',
        author: 'Author',
        status: 'want-to-read' as const,
        source: 'library' as const,
        currentPage: 0,
        addedDate: '2025-01-01T00:00:00.000Z',
      };

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} editBook={customIdBook} />);

      const textboxes = screen.getAllByRole('textbox');
      fireEvent.change(textboxes[1], {
        target: { value: 'Updated Author' },
      });
      fireEvent.click(screen.getByRole('button', { name: /update book/i }));

      await waitFor(() => {
        expect(storageUtils.updateBook).toHaveBeenCalledWith(
          'custom-id-format-999',
          expect.objectContaining({
            id: 'custom-id-format-999',
          })
        );
      });
    });
  });

  describe('UUID format validation', () => {
    it('should generate valid UUID v4 format for new books', async () => {
      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} />);

      const textboxes = screen.getAllByRole('textbox');
      fireEvent.change(textboxes[0], {
        target: { value: 'Test Book' },
      });
      fireEvent.change(textboxes[1], {
        target: { value: 'Test Author' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add book/i }));

      await waitFor(() => {
        expect(storageUtils.addBook).toHaveBeenCalled();
      });

      const savedBook = (storageUtils.addBook as jest.Mock).mock.calls[0][0];
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(savedBook.id).toMatch(uuidV4Regex);
    });
  });

  describe('rapid book creation (collision prevention)', () => {
    it('should handle rapid form submissions without ID collisions', async () => {
      const ids = new Set<string>();
      let counter = 0;

      mockGenerateUniqueId.mockImplementation(() => {
        counter++;
        return `uuid-rapid-${counter}`;
      });

      // Simulate creating multiple books rapidly
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<BookForm onClose={mockOnClose} onSave={mockOnSave} />);

        const textboxes = screen.getAllByRole('textbox');
        fireEvent.change(textboxes[0], {
          target: { value: `Book ${i}` },
        });
        fireEvent.change(textboxes[1], {
          target: { value: `Author ${i}` },
        });
        fireEvent.click(screen.getByRole('button', { name: /add book/i }));

        await waitFor(() => {
          expect(storageUtils.addBook).toHaveBeenCalled();
        });

        const calls = (storageUtils.addBook as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        ids.add(lastCall[0].id);

        unmount();
      }

      // All IDs should be unique
      expect(ids.size).toBe(10);
    });
  });

  describe('completedDate management', () => {
    beforeEach(() => {
      // Mock current date to a fixed value for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set completedDate when marking a new book as completed', async () => {
      mockGenerateUniqueId.mockReturnValue('new-book-id');

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} />);

      const textboxes = screen.getAllByRole('textbox');
      const titleInput = textboxes[0];
      const authorInput = textboxes[1];

      fireEvent.change(titleInput, { target: { value: 'New Completed Book' } });
      fireEvent.change(authorInput, { target: { value: 'Author Name' } });

      // Change status to completed
      const statusSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(statusSelect, { target: { value: 'completed' } });

      const submitButton = screen.getByRole('button', { name: /Add Book/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(storageUtils.addBook).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Completed Book',
            status: 'completed',
            completedDate: '2025-10-15T12:00:00.000Z',
          })
        );
      });
    });

    it('should preserve existing completedDate when editing a completed book', async () => {
      const existingCompletedDate = '2025-09-01T10:00:00.000Z';
      const editBook = {
        id: 'existing-id',
        title: 'Completed Book',
        author: 'Author',
        status: 'completed' as const,
        source: 'personal' as const,
        addedDate: '2025-08-01',
        completedDate: existingCompletedDate,
      };

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} editBook={editBook} />);

      const textboxes = screen.getAllByRole('textbox');
      const titleInput = textboxes[0];

      // Make a minor edit to the title
      fireEvent.change(titleInput, { target: { value: 'Completed Book - Updated' } });

      const submitButton = screen.getByRole('button', { name: /Update Book/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(storageUtils.updateBook).toHaveBeenCalledWith(
          'existing-id',
          expect.objectContaining({
            status: 'completed',
            completedDate: existingCompletedDate, // Should preserve original date
          })
        );
      });
    });

    it('should clear completedDate when changing status from completed to currently-reading', async () => {
      const existingCompletedDate = '2025-09-01T10:00:00.000Z';
      const editBook = {
        id: 'existing-id',
        title: 'Previously Completed Book',
        author: 'Author',
        status: 'completed' as const,
        source: 'personal' as const,
        addedDate: '2025-08-01',
        completedDate: existingCompletedDate,
      };

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} editBook={editBook} />);

      // Change status from completed to currently-reading
      const statusSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(statusSelect, { target: { value: 'currently-reading' } });

      const submitButton = screen.getByRole('button', { name: /Update Book/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(storageUtils.updateBook).toHaveBeenCalledWith(
          'existing-id',
          expect.objectContaining({
            status: 'currently-reading',
            completedDate: undefined, // Should be cleared
          })
        );
      });
    });

    it('should clear completedDate when changing status from completed to want-to-read', async () => {
      const existingCompletedDate = '2025-09-01T10:00:00.000Z';
      const editBook = {
        id: 'existing-id',
        title: 'Previously Completed Book',
        author: 'Author',
        status: 'completed' as const,
        source: 'personal' as const,
        addedDate: '2025-08-01',
        completedDate: existingCompletedDate,
      };

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} editBook={editBook} />);

      // Change status from completed to want-to-read
      const statusSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(statusSelect, { target: { value: 'want-to-read' } });

      const submitButton = screen.getByRole('button', { name: /Update Book/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(storageUtils.updateBook).toHaveBeenCalledWith(
          'existing-id',
          expect.objectContaining({
            status: 'want-to-read',
            completedDate: undefined, // Should be cleared
          })
        );
      });
    });

    it('should set completedDate when changing status to completed for first time', async () => {
      const editBook = {
        id: 'existing-id',
        title: 'Currently Reading Book',
        author: 'Author',
        status: 'currently-reading' as const,
        source: 'personal' as const,
        addedDate: '2025-08-01',
        // No completedDate
      };

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} editBook={editBook} />);

      // Change status to completed
      const statusSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(statusSelect, { target: { value: 'completed' } });

      const submitButton = screen.getByRole('button', { name: /Update Book/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(storageUtils.updateBook).toHaveBeenCalledWith(
          'existing-id',
          expect.objectContaining({
            status: 'completed',
            completedDate: '2025-10-15T12:00:00.000Z', // New timestamp
          })
        );
      });
    });

    it('should not have completedDate for new books with non-completed status', async () => {
      mockGenerateUniqueId.mockReturnValue('new-book-id');

      render(<BookForm onClose={mockOnClose} onSave={mockOnSave} />);

      const textboxes = screen.getAllByRole('textbox');
      const titleInput = textboxes[0];
      const authorInput = textboxes[1];

      fireEvent.change(titleInput, { target: { value: 'New Reading Book' } });
      fireEvent.change(authorInput, { target: { value: 'Author Name' } });

      // Status defaults to 'want-to-read'
      const submitButton = screen.getByRole('button', { name: /Add Book/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(storageUtils.addBook).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Reading Book',
            status: 'want-to-read',
            completedDate: undefined,
          })
        );
      });
    });
  });
});
