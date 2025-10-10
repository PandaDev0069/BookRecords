'use client';

import { Book } from '../types/book';
import { calculateDailyGoal, formatDate, isOverdue, getDaysUntil } from '../utils/storage';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

export default function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  const dailyGoal = calculateDailyGoal(book);

  // Calculate progress with bounds checking
  const progress = (() => {
    // Ensure totalPages is a positive number
    if (!book.totalPages || book.totalPages <= 0) {
      return 0;
    }

    // Treat undefined currentPage as 0
    const current = book.currentPage ?? 0;

    // Clamp currentPage to [0, totalPages]
    const clampedCurrent = Math.max(0, Math.min(current, book.totalPages));

    // Calculate progress and clamp to [0, 100]
    const calculatedProgress = Math.round((clampedCurrent / book.totalPages) * 100);
    return Math.max(0, Math.min(calculatedProgress, 100));
  })();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'currently-reading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'want-to-read':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      library: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      personal: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      borrowed: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      digital: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      other: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    return colors[source as keyof typeof colors] || colors.other;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {book.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.image} alt={book.title} className="w-24 h-32 object-cover rounded" />
          ) : (
            <div className="w-24 h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
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
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {book.title}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                title="Edit"
                aria-label={`Edit ${book.title || 'book'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onDelete(book.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400"
                title="Delete"
                aria-label={`Delete ${book.title || 'book'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">by {book.author}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(book.status)}`}
            >
              {book.status.replace(/-/g, ' ')}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadge(book.source)}`}
            >
              {book.source}
            </span>
          </div>

          {/* Progress Bar */}
          {book.totalPages && book.currentPage !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>
                  Progress: {book.currentPage} / {book.totalPages} pages
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Daily Goal */}
          {dailyGoal && dailyGoal.daysRemaining > 0 && (
            <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
              <p className="text-blue-800 dark:text-blue-200">
                📚 Read <strong>{dailyGoal.pagesPerDay} pages/day</strong> to finish in{' '}
                {dailyGoal.daysRemaining} days
              </p>
            </div>
          )}

          {/* Return Date Warning */}
          {book.returnDate && (
            <div
              className={`mb-2 p-2 rounded text-sm ${
                isOverdue(book.returnDate)
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  : getDaysUntil(book.returnDate) <= 3
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200'
                    : 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
              }`}
            >
              <p>
                {isOverdue(book.returnDate) ? '⚠️ OVERDUE' : '📅'} Return by:{' '}
                {formatDate(book.returnDate)}
                {!isOverdue(book.returnDate) && ` (${getDaysUntil(book.returnDate)} days left)`}
              </p>
            </div>
          )}

          {/* Deadline Warning */}
          {book.deadline && !book.returnDate && (
            <div
              className={`mb-2 p-2 rounded text-sm ${
                isOverdue(book.deadline)
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  : getDaysUntil(book.deadline) <= 5
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
              }`}
            >
              <p>
                {isOverdue(book.deadline) ? '⚠️ OVERDUE' : '🎯'} Deadline:{' '}
                {formatDate(book.deadline)}
                {!isOverdue(book.deadline) && ` (${getDaysUntil(book.deadline)} days left)`}
              </p>
            </div>
          )}

          {/* Notes */}
          {book.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">
              &ldquo;{book.notes}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
