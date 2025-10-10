export type BookStatus = 'currently-reading' | 'want-to-read' | 'completed';

export type BookSource = 'library' | 'personal' | 'borrowed' | 'digital' | 'other';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  source: BookSource;
  totalPages?: number;
  currentPage?: number;
  image?: string; // base64 encoded image
  returnDate?: string; // ISO date string for library books
  deadline?: string; // ISO date string for reading deadline
  notes?: string;
  addedDate: string; // ISO date string
  completedDate?: string; // ISO date string
}

export interface DailyGoal {
  pagesPerDay: number;
  daysRemaining: number;
  totalPagesRemaining: number;
}
