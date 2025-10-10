'use client';

import { useState, useEffect, useMemo } from 'react';
import { Book, BookStatus } from './types/book';
import { storageUtils } from './utils/storage';
import BookCard from './components/BookCard';
import BookForm from './components/BookForm';
import Stats from './components/Stats';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  // Use useMemo to prevent unnecessary recalculations
  const filteredBooks = useMemo(() => {
    let filtered = [...books];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((book) => book.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.notes?.toLowerCase().includes(query)
      );
    }

    // Sort: Currently reading first, then by added date
    filtered.sort((a, b) => {
      if (a.status === 'currently-reading' && b.status !== 'currently-reading') return -1;
      if (a.status !== 'currently-reading' && b.status === 'currently-reading') return 1;
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    });

    return filtered;
  }, [books, filterStatus, searchQuery]);

  const loadBooks = () => {
    const loadedBooks = storageUtils.getBooks();
    setBooks(loadedBooks);
  };

  const handleAddBook = () => {
    setEditingBook(undefined);
    setIsFormOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      storageUtils.deleteBook(id);
      loadBooks();
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(books, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `book-records-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    // Clean up the object URL to prevent memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedBooks = JSON.parse(event.target?.result as string);

        // Validate imported data structure
        if (!Array.isArray(importedBooks)) {
          alert('Invalid file format. Expected an array of books.');
          return;
        }

        // Validate each book object with detailed checks
        const validatedBooks: Book[] = [];
        const invalidBooks: Array<{ index: number; reason: string }> = [];

        importedBooks.forEach((book, index) => {
          const errors: string[] = [];

          // Check if book is an object
          if (!book || typeof book !== 'object') {
            errors.push('not an object');
          } else {
            // Validate id (must be string or number, non-empty if string)
            if (typeof book.id === 'string') {
              if (book.id.trim() === '') {
                errors.push('id is empty string');
              }
            } else if (typeof book.id === 'number') {
              // Numbers are acceptable
            } else {
              errors.push('id missing or invalid type');
            }

            // Validate title (non-empty string)
            if (typeof book.title !== 'string' || book.title.trim() === '') {
              errors.push('title missing or empty');
            }

            // Validate author (non-empty string)
            if (typeof book.author !== 'string' || book.author.trim() === '') {
              errors.push('author missing or empty');
            }

            // Validate status (must be in whitelist)
            if (!['currently-reading', 'want-to-read', 'completed'].includes(book.status)) {
              errors.push('status invalid or missing');
            }

            // Validate addedDate (must be parseable to finite timestamp)
            if (typeof book.addedDate === 'string') {
              const timestamp = new Date(book.addedDate).getTime();
              if (!Number.isFinite(timestamp)) {
                errors.push('addedDate is not a valid date');
              }
            } else {
              errors.push('addedDate missing or not a string');
            }
          }

          if (errors.length > 0) {
            invalidBooks.push({ index, reason: errors.join(', ') });
          } else {
            validatedBooks.push(book as Book);
          }
        });

        // Report validation results
        if (invalidBooks.length > 0) {
          const errorMsg = invalidBooks
            .slice(0, 5) // Show first 5 errors
            .map((err) => `  Book ${err.index + 1}: ${err.reason}`)
            .join('\n');

          const remaining =
            invalidBooks.length > 5 ? `\n  ...and ${invalidBooks.length - 5} more` : '';

          console.error('Import validation errors:', invalidBooks);

          alert(
            `Found ${invalidBooks.length} invalid book(s):\n\n${errorMsg}${remaining}\n\n` +
              `Valid books: ${validatedBooks.length}/${importedBooks.length}\n\n` +
              'Please fix the data and try again.'
          );
          return;
        }

        if (validatedBooks.length === 0) {
          alert('No valid books found in the import file.');
          return;
        }

        if (confirm(`Import ${validatedBooks.length} books? This will replace existing data.`)) {
          storageUtils.saveBooks(validatedBooks);
          loadBooks();
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">📚 Book Records</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your reading journey, manage deadlines, and achieve your reading goals
          </p>
        </div>

        {/* Stats */}
        <Stats books={books} />

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search books by title, author, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search books"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BookStatus | 'all')}
              aria-label="Filter books by status"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Books</option>
              <option value="currently-reading">Currently Reading</option>
              <option value="want-to-read">Want to Read</option>
              <option value="completed">Completed</option>
            </select>

            {/* Add Book Button */}
            <button
              onClick={handleAddBook}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + Add Book
            </button>
          </div>

          {/* Import/Export */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleExportData}
              className="px-4 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              📥 Export Data
            </button>
            <label className="px-4 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              📤 Import Data
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>
        </div>

        {/* Book List */}
        <div className="space-y-4">
          {filteredBooks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {searchQuery || filterStatus !== 'all'
                  ? 'No books found matching your criteria'
                  : 'No books yet. Add your first book to get started!'}
              </p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
              />
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <BookForm onClose={() => setIsFormOpen(false)} onSave={loadBooks} editBook={editingBook} />
      )}
    </main>
  );
}
