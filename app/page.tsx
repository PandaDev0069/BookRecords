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
            // Validate id (must resolve to non-empty string)
            if (typeof book.id === 'number') {
              book.id = String(book.id);
            }

            if (typeof book.id === 'string') {
              book.id = book.id.trim();
              if (book.id === '') {
                errors.push('id is empty string');
              }
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-2">
            📚 Book Records
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your reading journey, manage deadlines, and achieve your reading goals
          </p>
        </div>

        {/* Stats */}
        <Stats books={books} />

        {/* Controls */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg backdrop-blur-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search books by title, author, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search books"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BookStatus | 'all')}
              aria-label="Filter books by status"
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900"
            >
              <option value="all">All Books</option>
              <option value="currently-reading">Currently Reading</option>
              <option value="want-to-read">Want to Read</option>
              <option value="completed">Completed</option>
            </select>

            {/* Add Book Button */}
            <button
              onClick={handleAddBook}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              + Add Book
            </button>
          </div>

          {/* Import/Export */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleExportData}
              className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              📥 Export Data
            </button>
            <label className="inline-flex items-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-700/60 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors cursor-pointer">
              📤 Import Data
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>
        </div>

        {/* Book List */}
        <div className="space-y-4">
          {filteredBooks.length === 0 ? (
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-12 text-center relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

              <div className="relative z-10">
                {/* Animated book icon */}
                <div className="inline-block animate-float">
                  <svg
                    className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-500 mb-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>

                {searchQuery || filterStatus !== 'all' ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                      No Books Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-md mx-auto">
                      We couldn&apos;t find any books matching your search criteria. Try adjusting
                      your filters or search terms.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('all');
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                      Start Your Reading Journey
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-md mx-auto">
                      Your library is empty. Add your first book and begin tracking your reading
                      adventures!
                    </p>
                    <button
                      onClick={handleAddBook}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Your First Book
                    </button>
                  </>
                )}
              </div>
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
