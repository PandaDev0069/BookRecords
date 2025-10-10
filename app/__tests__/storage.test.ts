import { calculateDailyGoal, formatDate, isOverdue, getDaysUntil } from '../utils/storage';
import { Book } from '../types/book';

describe('Storage Utils', () => {
  // Note: Storage utils use localStorage which is mocked globally
  // We're primarily testing the calculation and date utilities here

  it('should exist', () => {
    expect(calculateDailyGoal).toBeDefined();
    expect(formatDate).toBeDefined();
    expect(isOverdue).toBeDefined();
    expect(getDaysUntil).toBeDefined();
  });
});

describe('calculateDailyGoal', () => {
  beforeEach(() => {
    // Mock current date as October 10, 2025
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-10'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return null if no deadline', () => {
    const book: Book = {
      id: '1',
      title: 'Test',
      author: 'Author',
      status: 'currently-reading',
      source: 'personal',
      totalPages: 300,
      currentPage: 100,
      addedDate: '2025-10-01',
    };

    expect(calculateDailyGoal(book)).toBeNull();
  });

  it('should return null if no total pages', () => {
    const book: Book = {
      id: '1',
      title: 'Test',
      author: 'Author',
      status: 'currently-reading',
      source: 'personal',
      currentPage: 100,
      deadline: '2025-10-20',
      addedDate: '2025-10-01',
    };

    expect(calculateDailyGoal(book)).toBeNull();
  });

  it('should calculate daily goal correctly', () => {
    const book: Book = {
      id: '1',
      title: 'Test',
      author: 'Author',
      status: 'currently-reading',
      source: 'personal',
      totalPages: 300,
      currentPage: 100,
      deadline: '2025-10-20', // 10 days from now
      addedDate: '2025-10-01',
    };

    const result = calculateDailyGoal(book);
    expect(result).toEqual({
      pagesPerDay: 20, // 200 pages / 10 days = 20 pages/day
      daysRemaining: 10,
      totalPagesRemaining: 200,
    });
  });

  it('should handle overdue deadline', () => {
    const book: Book = {
      id: '1',
      title: 'Test',
      author: 'Author',
      status: 'currently-reading',
      source: 'personal',
      totalPages: 300,
      currentPage: 100,
      deadline: '2025-10-05', // 5 days ago
      addedDate: '2025-10-01',
    };

    const result = calculateDailyGoal(book);
    expect(result).toEqual({
      pagesPerDay: 0,
      daysRemaining: 0,
      totalPagesRemaining: 200,
    });
  });

  it('should round up pages per day', () => {
    const book: Book = {
      id: '1',
      title: 'Test',
      author: 'Author',
      status: 'currently-reading',
      source: 'personal',
      totalPages: 305,
      currentPage: 100,
      deadline: '2025-10-20', // 10 days
      addedDate: '2025-10-01',
    };

    const result = calculateDailyGoal(book);
    expect(result?.pagesPerDay).toBe(21); // ceil(205/10) = 21
  });

  it('should return null for invalid deadline string', () => {
    const book: Book = {
      id: '1',
      title: 'Test',
      author: 'Author',
      status: 'currently-reading',
      source: 'personal',
      totalPages: 300,
      currentPage: 100,
      deadline: 'invalid-date',
      addedDate: '2025-10-01',
    };

    expect(calculateDailyGoal(book)).toBeNull();
  });

  it('should handle currentPage > totalPages (clamp to 0)', () => {
    const book: Book = {
      id: '1',
      title: 'Test',
      author: 'Author',
      status: 'currently-reading',
      source: 'personal',
      totalPages: 300,
      currentPage: 350, // More than total pages
      deadline: '2025-10-20',
      addedDate: '2025-10-01',
    };

    const result = calculateDailyGoal(book);
    expect(result).toEqual({
      pagesPerDay: 0,
      daysRemaining: 10,
      totalPagesRemaining: 0, // Clamped to 0
    });
  });

  it('should handle currentPage === totalPages (book finished)', () => {
    const book: Book = {
      id: '1',
      title: 'Test',
      author: 'Author',
      status: 'currently-reading',
      source: 'personal',
      totalPages: 300,
      currentPage: 300, // Book is finished
      deadline: '2025-10-20',
      addedDate: '2025-10-01',
    };

    const result = calculateDailyGoal(book);
    expect(result).toEqual({
      pagesPerDay: 0,
      daysRemaining: 10,
      totalPagesRemaining: 0,
    });
  });
});

describe('Date Utilities', () => {
  describe('isOverdue', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-10'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for past dates', () => {
      expect(isOverdue('2025-10-09')).toBe(true);
      expect(isOverdue('2025-10-01')).toBe(true);
    });

    it('should return false for today', () => {
      expect(isOverdue('2025-10-10')).toBe(false);
    });

    it('should return false for future dates', () => {
      expect(isOverdue('2025-10-11')).toBe(false);
      expect(isOverdue('2025-12-31')).toBe(false);
    });

    it('should throw error for invalid date strings', () => {
      expect(() => isOverdue('invalid-date')).toThrow(
        'Invalid dateString passed to isOverdue: "invalid-date"'
      );
      expect(() => isOverdue('')).toThrow('Invalid dateString passed to isOverdue: ""');
      expect(() => isOverdue('not-a-date')).toThrow('Invalid dateString passed to isOverdue');
    });
  });

  describe('getDaysUntil', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-10'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return 0 for today', () => {
      expect(getDaysUntil('2025-10-10')).toBe(0);
    });

    it('should return positive days for future dates', () => {
      expect(getDaysUntil('2025-10-11')).toBe(1);
      expect(getDaysUntil('2025-10-20')).toBe(10);
    });

    it('should return negative days for past dates', () => {
      expect(getDaysUntil('2025-10-09')).toBe(-1);
      expect(getDaysUntil('2025-10-05')).toBe(-5);
    });

    it('should throw error for invalid date strings', () => {
      expect(() => getDaysUntil('invalid-date')).toThrow(
        'Invalid dateString passed to getDaysUntil: "invalid-date"'
      );
      expect(() => getDaysUntil('')).toThrow('Invalid dateString passed to getDaysUntil: ""');
      expect(() => getDaysUntil('not-a-date')).toThrow('Invalid dateString passed to getDaysUntil');
    });
  });

  describe('formatDate', () => {
    it('should format valid dates correctly', () => {
      expect(formatDate('2025-10-10')).toBe('Oct 10, 2025');
      expect(formatDate('2025-12-31')).toBe('Dec 31, 2025');
      expect(formatDate('2025-01-01')).toBe('Jan 1, 2025');
    });

    it('should throw error for invalid date strings', () => {
      expect(() => formatDate('invalid-date')).toThrow(
        'Invalid dateString passed to formatDate: "invalid-date"'
      );
      expect(() => formatDate('')).toThrow('Invalid dateString passed to formatDate: ""');
      expect(() => formatDate('not-a-date')).toThrow('Invalid dateString passed to formatDate');
    });
  });
});
