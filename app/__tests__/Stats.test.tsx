import React from 'react';
import { render, screen } from '@testing-library/react';
import Stats from '../components/Stats';
import { Book } from '../types/book';

describe('Stats Component', () => {
  it('should render all stat cards', () => {
    const books: Book[] = [];
    render(<Stats books={books} />);

    expect(screen.getByText('Total Books')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Want to Read')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Completion')).toBeInTheDocument();
    expect(screen.getByText('Pages Read')).toBeInTheDocument();
  });

  it('should display zero stats for empty book list', () => {
    const books: Book[] = [];
    render(<Stats books={books} />);

    const statValues = screen.getAllByText('0');
    expect(statValues.length).toBeGreaterThan(0);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should calculate stats correctly', () => {
    const books: Book[] = [
      {
        id: '1',
        title: 'Book 1',
        author: 'Author 1',
        status: 'currently-reading',
        source: 'library',
        totalPages: 300,
        currentPage: 150,
        addedDate: '2025-10-01',
      },
      {
        id: '2',
        title: 'Book 2',
        author: 'Author 2',
        status: 'want-to-read',
        source: 'personal',
        totalPages: 200,
        currentPage: 0,
        addedDate: '2025-10-05',
      },
      {
        id: '3',
        title: 'Book 3',
        author: 'Author 3',
        status: 'completed',
        source: 'digital',
        totalPages: 250,
        currentPage: 250,
        addedDate: '2025-09-15',
      },
      {
        id: '4',
        title: 'Book 4',
        author: 'Author 4',
        status: 'completed',
        source: 'personal',
        totalPages: 180,
        currentPage: 180,
        addedDate: '2025-09-20',
      },
    ];

    render(<Stats books={books} />);

    expect(screen.getByTestId('stat-total')).toBeInTheDocument();
    expect(screen.getByTestId('stat-total')).toHaveTextContent('4');

    expect(screen.getByTestId('stat-currently-reading')).toBeInTheDocument();
    expect(screen.getByTestId('stat-currently-reading')).toHaveTextContent('1');

    expect(screen.getByTestId('stat-want-to-read')).toBeInTheDocument();
    expect(screen.getByTestId('stat-want-to-read')).toHaveTextContent('1');

    expect(screen.getByTestId('stat-completed')).toBeInTheDocument();
    expect(screen.getByTestId('stat-completed')).toHaveTextContent('2');

    expect(screen.getByTestId('stat-completion-rate')).toBeInTheDocument();
    expect(screen.getByTestId('stat-completion-rate')).toHaveTextContent('50%');

    expect(screen.getByTestId('stat-pages-read')).toBeInTheDocument();
    expect(screen.getByTestId('stat-pages-read')).toHaveTextContent('580');
  });

  it('should handle books without page numbers', () => {
    const books: Book[] = [
      {
        id: '1',
        title: 'Book Without Pages',
        author: 'Author',
        status: 'want-to-read',
        source: 'library',
        addedDate: '2025-10-01',
      },
    ];

    render(<Stats books={books} />);

    const totalBooksElements = screen.getAllByText('1');
    expect(totalBooksElements.length).toBeGreaterThan(0); // Total books and Want to Read both show 1
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0); // Multiple zeros appear in stats
  });

  it('should display 100% completion when all books are completed', () => {
    const books: Book[] = [
      {
        id: '1',
        title: 'Book 1',
        author: 'Author',
        status: 'completed',
        source: 'personal',
        addedDate: '2025-10-01',
      },
      {
        id: '2',
        title: 'Book 2',
        author: 'Author',
        status: 'completed',
        source: 'library',
        addedDate: '2025-10-05',
      },
    ];

    render(<Stats books={books} />);

    expect(screen.getByText('100%')).toBeTruthy();
  });
});
