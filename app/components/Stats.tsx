'use client';

import { Book } from '../types/book';

interface StatsProps {
  books: Book[];
}

export default function Stats({ books }: StatsProps) {
  const stats = {
    total: books.length,
    currentlyReading: books.filter((b) => b.status === 'currently-reading').length,
    wantToRead: books.filter((b) => b.status === 'want-to-read').length,
    completed: books.filter((b) => b.status === 'completed').length,
    totalPages: books.reduce((sum, book) => sum + (book.totalPages || 0), 0),
    pagesRead: books.reduce((sum, book) => sum + (book.currentPage || 0), 0),
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow" data-testid="stat-total">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Books</div>
      </div>

      <div
        className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow"
        data-testid="stat-currently-reading"
      >
        <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
          {stats.currentlyReading}
        </div>
        <div className="text-sm text-blue-600 dark:text-blue-300">Reading</div>
      </div>

      <div
        className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg shadow"
        data-testid="stat-want-to-read"
      >
        <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
          {stats.wantToRead}
        </div>
        <div className="text-sm text-yellow-600 dark:text-yellow-300">Want to Read</div>
      </div>

      <div
        className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow"
        data-testid="stat-completed"
      >
        <div className="text-2xl font-bold text-green-800 dark:text-green-200">
          {stats.completed}
        </div>
        <div className="text-sm text-green-600 dark:text-green-300">Completed</div>
      </div>

      <div
        className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg shadow"
        data-testid="stat-completion-rate"
      >
        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
          {completionRate}%
        </div>
        <div className="text-sm text-purple-600 dark:text-purple-300">Completion</div>
      </div>

      <div
        className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg shadow"
        data-testid="stat-pages-read"
      >
        <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
          {stats.pagesRead.toLocaleString()}
        </div>
        <div className="text-sm text-indigo-600 dark:text-indigo-300">Pages Read</div>
      </div>
    </div>
  );
}
