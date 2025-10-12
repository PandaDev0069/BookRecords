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
    <div className="bg-gradient-to-br from-white via-white to-blue-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {book.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.image} alt={book.title} className="w-24 h-32 object-cover rounded-lg" />
          ) : (
            <div className="w-24 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
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
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                {book.status.replace(/-/g, ' ')}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{book.author}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
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
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
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

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadge(book.source)}`}
            >
              {book.source}
            </span>
          </div>

          {/* Progress Bar */}
          {book.totalPages && book.currentPage !== undefined && (
            <div className="mb-4 group/progress">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                <span>
                  Progress: {book.currentPage} / {book.totalPages} pages
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
              </div>
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="h-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  {/* Striped pattern for in-progress books */}
                  {progress > 0 && progress < 100 && (
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 20px)',
                      }}
                    />
                  )}
                </div>
                {/* Glow effect on hover */}
                <div
                  className="absolute top-0 left-0 h-2.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full opacity-0 group-hover/progress:opacity-50 blur-sm transition-opacity duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Daily Goal */}
          {dailyGoal && dailyGoal.daysRemaining > 0 && (
            <div className="mb-3 p-3 rounded-lg bg-blue-50/70 dark:bg-blue-900/30 text-sm border border-blue-100 dark:border-blue-900">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                Read {dailyGoal.pagesPerDay} pages/day to finish in {dailyGoal.daysRemaining}{' '}
                {dailyGoal.daysRemaining === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}

          {/* Return Date Warning */}
          {book.returnDate && (
            <div
              className={`mb-3 p-3 rounded-lg text-sm border ${
                isOverdue(book.returnDate)
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-100 dark:border-red-900'
                  : getDaysUntil(book.returnDate) <= 3
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-100 dark:border-orange-900'
                    : 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-100 dark:border-purple-900'
              }`}
            >
              <p>
                {isOverdue(book.returnDate) ? 'Overdue return' : 'Library return by'}{' '}
                <strong>{formatDate(book.returnDate)}</strong>
                {!isOverdue(book.returnDate) && ` (${getDaysUntil(book.returnDate)} days left)`}
              </p>
            </div>
          )}

          {/* Deadline Warning */}
          {book.deadline && !book.returnDate && (
            <div
              className={`mb-3 p-3 rounded-lg text-sm border ${
                isOverdue(book.deadline)
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-100 dark:border-red-900'
                  : getDaysUntil(book.deadline) <= 5
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-100 dark:border-orange-900'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-900'
              }`}
            >
              <p>
                {isOverdue(book.deadline) ? 'Deadline passed' : 'Reading deadline'}{' '}
                <strong>{formatDate(book.deadline)}</strong>
                {!isOverdue(book.deadline) && ` (${getDaysUntil(book.deadline)} days left)`}
              </p>
            </div>
          )}

          {/* Notes */}
          {book.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
              {book.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
