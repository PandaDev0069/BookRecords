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

  const cards = [
    {
      id: 'stat-total',
      label: 'Total Books',
      value: stats.total,
      accent: 'from-slate-500 to-slate-700',
    },
    {
      id: 'stat-currently-reading',
      label: 'Reading',
      value: stats.currentlyReading,
      accent: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'stat-want-to-read',
      label: 'Want to Read',
      value: stats.wantToRead,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      id: 'stat-completed',
      label: 'Completed',
      value: stats.completed,
      accent: 'from-emerald-500 to-green-500',
    },
    {
      id: 'stat-completion-rate',
      label: 'Completion',
      value: `${completionRate}%`,
      accent: 'from-purple-500 to-fuchsia-500',
    },
    {
      id: 'stat-pages-read',
      label: 'Pages Read',
      value: stats.pagesRead.toLocaleString(),
      accent: 'from-sky-500 to-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.id}
          data-testid={card.id}
          className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
        >
          <div
            className={`absolute -bottom-10 -right-12 h-24 w-24 bg-gradient-to-br ${card.accent} opacity-20 blur-2xl`}
            aria-hidden="true"
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
