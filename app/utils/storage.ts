import { Book, DailyGoal } from '../types/book';

const STORAGE_KEY = 'book-records';

export const storageUtils = {
  getBooks: (): Book[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveBooks: (books: Book[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded! Please reduce the number of books or remove images.');
      } else {
        console.error('Error saving to localStorage:', error);
      }
      throw error; // Re-throw to notify caller
    }
  },

  addBook: (book: Book): void => {
    const books = storageUtils.getBooks();
    books.push(book);
    storageUtils.saveBooks(books);
  },

  updateBook: (id: string, updatedBook: Partial<Book>): void => {
    const books = storageUtils.getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index !== -1) {
      books[index] = { ...books[index], ...updatedBook };
      storageUtils.saveBooks(books);
    }
  },

  deleteBook: (id: string): void => {
    const books = storageUtils.getBooks();
    const filtered = books.filter((b) => b.id !== id);
    storageUtils.saveBooks(filtered);
  },
};

export const calculateDailyGoal = (book: Book): DailyGoal | null => {
  if (!book.deadline || !book.totalPages || book.currentPage === undefined) {
    return null;
  }

  // Validate deadline is a valid date
  const deadline = new Date(book.deadline);
  if (Number.isNaN(deadline.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Clamp totalPagesRemaining to non-negative value
  const totalPagesRemaining = Math.max(0, book.totalPages - book.currentPage);

  // If deadline has passed or no pages remaining, return 0 pagesPerDay
  if (daysRemaining <= 0 || totalPagesRemaining === 0) {
    return {
      pagesPerDay: 0,
      daysRemaining: Math.max(0, daysRemaining),
      totalPagesRemaining,
    };
  }

  const pagesPerDay = Math.ceil(totalPagesRemaining / daysRemaining);

  return {
    pagesPerDay,
    daysRemaining,
    totalPagesRemaining,
  };
};

export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid dateString passed to formatDate: "${dateString}"`);
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const isOverdue = (dateString: string): boolean => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid dateString passed to isOverdue: "${dateString}"`);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

export const getDaysUntil = (dateString: string): number => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid dateString passed to getDaysUntil: "${dateString}"`);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
