import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookCard from '../components/BookCard';
import { Book } from '../types/book';

describe('BookCard Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-10'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const baseBook: Book = {
    id: '1',
    title: 'Clean Code',
    author: 'Robert Martin',
    status: 'currently-reading',
    source: 'library',
    totalPages: 464,
    currentPage: 100,
    addedDate: '2025-10-01',
  };

  it('should render book information', () => {
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Clean Code')).toBeTruthy();
    expect(screen.getByText(/Robert Martin/i)).toBeTruthy();
  });

  it('should display progress bar with correct percentage', () => {
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // 100/464 ≈ 22%
    expect(screen.getByText(/22%/)).toBeTruthy();
    expect(screen.getByText(/100 \/ 464 pages/)).toBeTruthy();
  });

  it('should calculate and display daily reading goal', () => {
    const bookWithDeadline: Book = {
      ...baseBook,
      deadline: '2025-10-20', // 10 days from now
    };

    render(<BookCard book={bookWithDeadline} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // (464 - 100) / 10 = 36.4 → 37 pages per day
    expect(screen.getByText(/37 pages\/day/i)).toBeTruthy();
    // Check for the daily goal message which contains "10 days"
    expect(screen.getByText(/to finish in 10 days/i)).toBeTruthy();
  });

  it('should display return date warning for library books', () => {
    const libraryBook: Book = {
      ...baseBook,
      returnDate: '2025-10-12', // 2 days away
    };

    render(<BookCard book={libraryBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText(/Return by:/i)).toBeTruthy();
    expect(screen.getByText(/2 days left/i)).toBeTruthy();
  });

  it('should show overdue warning for past return date', () => {
    const overdueBook: Book = {
      ...baseBook,
      returnDate: '2025-10-05', // 5 days ago
    };

    render(<BookCard book={overdueBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText(/OVERDUE/i)).toBeTruthy();
  });

  it('should display book notes', () => {
    const bookWithNotes: Book = {
      ...baseBook,
      notes: 'Great book about software craftsmanship',
    };

    render(<BookCard book={bookWithNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText(/Great book about software craftsmanship/i)).toBeTruthy();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByTitle('Edit');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(baseBook);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTitle('Delete');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should display status badge', () => {
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText(/currently reading/i)).toBeTruthy();
  });

  it('should display source badge', () => {
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('library')).toBeTruthy();
  });

  it('should show placeholder when no cover image', () => {
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // SVG placeholder should be present
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should handle book without total pages', () => {
    const bookWithoutPages: Book = {
      ...baseBook,
      totalPages: undefined,
      currentPage: undefined,
    };

    render(<BookCard book={bookWithoutPages} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Clean Code')).toBeTruthy();
    // Should not show progress bar
    expect(screen.queryByText(/Progress:/)).toBeFalsy();
  });

  it('should handle currentPage exceeding totalPages (clamp to 100%)', () => {
    const bookWithExcessPages: Book = {
      ...baseBook,
      totalPages: 300,
      currentPage: 500, // More than total pages
    };

    render(<BookCard book={bookWithExcessPages} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Should show 100% and clamped values
    expect(screen.getByText(/100%/)).toBeTruthy();
    expect(screen.getByText(/500 \/ 300 pages/)).toBeTruthy();
  });

  it('should handle negative currentPage (clamp to 0%)', () => {
    const bookWithNegativePages: Book = {
      ...baseBook,
      totalPages: 300,
      currentPage: -50,
    };

    render(<BookCard book={bookWithNegativePages} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Should show 0%
    expect(screen.getByText(/0%/)).toBeTruthy();
  });

  it('should handle zero totalPages (no division by zero)', () => {
    const bookWithZeroPages: Book = {
      ...baseBook,
      totalPages: 0,
      currentPage: 50,
    };

    render(<BookCard book={bookWithZeroPages} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Clean Code')).toBeTruthy();
    // Should not crash or show progress bar
    expect(screen.queryByText(/Progress:/)).toBeFalsy();
  });

  it('should treat undefined currentPage as 0', () => {
    const bookWithUndefinedCurrent: Book = {
      ...baseBook,
      totalPages: 300,
      currentPage: undefined,
    };

    render(
      <BookCard book={bookWithUndefinedCurrent} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Progress bar should not be displayed when currentPage is undefined
    expect(screen.queryByText(/Progress:/)).toBeFalsy();
    expect(screen.queryByText(/0%/)).toBeFalsy();
  });

  it('should handle currentPage of 0 correctly', () => {
    const bookWithZeroCurrent: Book = {
      ...baseBook,
      totalPages: 300,
      currentPage: 0,
    };

    render(<BookCard book={bookWithZeroCurrent} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Should show 0% when currentPage is explicitly 0
    expect(screen.getByText(/0%/)).toBeTruthy();
    expect(screen.getByText(/0 \/ 300 pages/)).toBeTruthy();
  });

  it('should replace all hyphens in status labels', () => {
    const statuses: Array<{ status: Book['status']; expected: string }> = [
      { status: 'currently-reading', expected: 'currently reading' },
      { status: 'want-to-read', expected: 'want to read' },
      { status: 'completed', expected: 'completed' },
    ];

    statuses.forEach(({ status, expected }) => {
      const bookWithStatus: Book = {
        ...baseBook,
        status,
      };

      const { unmount } = render(
        <BookCard book={bookWithStatus} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('should have type="button" on edit and delete buttons', () => {
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByRole('button', { name: /Edit Clean Code/i });
    const deleteButton = screen.getByRole('button', { name: /Delete Clean Code/i });

    expect(editButton).toHaveAttribute('type', 'button');
    expect(deleteButton).toHaveAttribute('type', 'button');
  });

  it('should have descriptive aria-labels on edit and delete buttons', () => {
    render(<BookCard book={baseBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByRole('button', { name: 'Edit Clean Code' });
    const deleteButton = screen.getByRole('button', { name: 'Delete Clean Code' });

    expect(editButton).toHaveAttribute('aria-label', 'Edit Clean Code');
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete Clean Code');
  });

  it('should use fallback "book" in aria-label when title is empty', () => {
    const bookWithoutTitle: Book = {
      ...baseBook,
      title: '',
    };

    render(<BookCard book={bookWithoutTitle} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByRole('button', { name: 'Edit book' });
    const deleteButton = screen.getByRole('button', { name: 'Delete book' });

    expect(editButton).toHaveAttribute('aria-label', 'Edit book');
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete book');
  });
});
