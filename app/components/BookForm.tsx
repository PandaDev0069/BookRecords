'use client';

import { useState } from 'react';
import { Book, BookStatus, BookSource } from '../types/book';
import { storageUtils, convertImageToBase64 } from '../utils/storage';
import { generateUniqueId } from '../utils/uuid';

interface BookFormProps {
  onClose: () => void;
  onSave: () => void;
  editBook?: Book;
}

export default function BookForm({ onClose, onSave, editBook }: BookFormProps) {
  const [formData, setFormData] = useState<Partial<Book>>(
    editBook || {
      title: '',
      author: '',
      status: 'want-to-read',
      source: 'personal',
      totalPages: undefined,
      currentPage: 0,
      notes: '',
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate page numbers
      if (
        formData.totalPages &&
        formData.currentPage &&
        formData.currentPage > formData.totalPages
      ) {
        alert('Current page cannot be greater than total pages.');
        return;
      }

      let imageBase64 = formData.image;
      if (imageFile) {
        imageBase64 = await convertImageToBase64(imageFile);
      }

      const bookData: Book = {
        id: editBook?.id || generateUniqueId(),
        title: formData.title || '',
        author: formData.author || '',
        status: formData.status || 'want-to-read',
        source: formData.source || 'personal',
        totalPages: formData.totalPages,
        currentPage: formData.currentPage || 0,
        image: imageBase64,
        returnDate: formData.returnDate,
        deadline: formData.deadline,
        notes: formData.notes,
        addedDate: editBook?.addedDate || new Date().toISOString(),
        completedDate:
          formData.status === 'completed'
            ? editBook?.completedDate || new Date().toISOString()
            : undefined, // Clear completedDate if status is not 'completed'
      };

      if (editBook) {
        storageUtils.updateBook(editBook.id, bookData);
      } else {
        storageUtils.addBook(bookData);
      }

      onSave();
      onClose();
    } catch (error) {
      alert('Failed to save book. Please try again or reduce image size.');
      console.error('Error saving book:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500000) {
        // 500KB limit
        alert('Image size should be less than 500KB');
        return;
      }
      setImageFile(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {editBook ? 'Edit Book' : 'Add New Book'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="book-title"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Title *
              </label>
              <input
                id="book-title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="book-author"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Author *
              </label>
              <input
                id="book-author"
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="book-status"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Status *
                </label>
                <select
                  id="book-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as BookStatus })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="want-to-read">Want to Read</option>
                  <option value="currently-reading">Currently Reading</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="book-source"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Source
                </label>
                <select
                  id="book-source"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value as BookSource })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="library">Library</option>
                  <option value="personal">Personal</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="digital">Digital</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="book-total-pages"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Total Pages
                </label>
                <input
                  id="book-total-pages"
                  type="number"
                  min="0"
                  value={formData.totalPages || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalPages: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="book-current-page"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Current Page
                </label>
                <input
                  id="book-current-page"
                  type="number"
                  min="0"
                  value={formData.currentPage || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPage: e.target.value ? parseInt(e.target.value) : 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {formData.source === 'library' && (
              <div>
                <label
                  htmlFor="book-return-date"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Return Date
                </label>
                <input
                  id="book-return-date"
                  type="date"
                  value={formData.returnDate || ''}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {(formData.status === 'currently-reading' || formData.status === 'want-to-read') && (
              <div>
                <label
                  htmlFor="book-deadline"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Reading Deadline
                </label>
                <input
                  id="book-deadline"
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="book-image"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Cover Image (max 500KB)
              </label>
              <input
                id="book-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {(imageFile || formData.image) && (
                <p className="text-sm text-green-600 mt-1">Image ready</p>
              )}
            </div>

            <div>
              <label
                htmlFor="book-notes"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Notes
              </label>
              <textarea
                id="book-notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editBook ? 'Update Book' : 'Add Book'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
