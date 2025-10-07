'use strict';

/**
 * Simple Library Management Program
 * - Stores books in memory as objects: { title, author, year, status }
 * - Supports add, borrow, return, and search operations
 * - Generates reports using array methods (map, filter, find)
 * - Simulates async save/load via a fake storage using Promises/async-await
 */

// ---------------------------
// Error Classes
// ---------------------------
class LibraryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LibraryError';
  }
}

class ValidationError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DuplicateBookError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = 'DuplicateBookError';
  }
}

class BookNotFoundError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = 'BookNotFoundError';
  }
}

class BookNotAvailableError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = 'BookNotAvailableError';
  }
}

// ---------------------------
// Helpers
// ---------------------------
function normalizeString(value) {
  return String(value || '').trim().toLowerCase();
}

function validateBookInput(bookInput) {
  const { title, author, year, status } = bookInput || {};

  const normalizedTitle = normalizeString(title);
  const normalizedAuthor = normalizeString(author);
  const parsedYear = Number(year);
  const normalizedStatus = normalizeString(status || 'available');

  if (!normalizedTitle) {
    throw new ValidationError('Book title is required.');
  }
  if (!normalizedAuthor) {
    throw new ValidationError('Book author is required.');
  }
  if (!Number.isFinite(parsedYear)) {
    throw new ValidationError('Book year must be a finite number.');
  }
  if (parsedYear < 0) {
    throw new ValidationError('Book year must be a non-negative number.');
  }
  if (!['available', 'borrowed'].includes(normalizedStatus)) {
    throw new ValidationError("Book status must be either 'available' or 'borrowed'.");
  }

  return {
    title: title.toString().trim(),
    author: author.toString().trim(),
    year: parsedYear,
    status: normalizedStatus,
  };
}

// ---------------------------
// Fake Async Storage
// ---------------------------
class FakeStorage {
  constructor(options = {}) {
    const { initialBooks = [], latencyMs = 200 } = options;
    // Store a deep copy to avoid accidental shared references
    this._booksSerialized = JSON.stringify(initialBooks);
    this._latencyMs = latencyMs;
  }

  async loadBooks() {
    await delay(this._latencyMs);
    const books = JSON.parse(this._booksSerialized || '[]');
    // Return deep copy
    return JSON.parse(JSON.stringify(books));
  }

  async saveBooks(books) {
    await delay(this._latencyMs);
    this._booksSerialized = JSON.stringify(books || []);
    return { ok: true, savedAt: new Date().toISOString() };
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------
// Library Class
// ---------------------------
class Library {
  constructor(storage = new FakeStorage()) {
    this._storage = storage;
    this._books = [];
  }

  // --- Persistence ---
  async load() {
    this._books = await this._storage.loadBooks();
    return this._books.length;
  }

  async save() {
    return this._storage.saveBooks(this._books);
  }

  // --- Core operations ---
  addBook(bookInput) {
    const valid = validateBookInput(bookInput);
    const existing = this._books.find((b) => normalizeString(b.title) === normalizeString(valid.title));
    if (existing) {
      throw new DuplicateBookError(`A book with title '${valid.title}' already exists.`);
    }
    const book = { ...valid };
    this._books.push(book);
    return book;
  }

  borrowBook(title) {
    const normalizedTitle = normalizeString(title);
    const book = this._books.find((b) => normalizeString(b.title) === normalizedTitle);
    if (!book) {
      throw new BookNotFoundError(`Book titled '${title}' was not found.`);
    }
    if (book.status !== 'available') {
      throw new BookNotAvailableError(`Book titled '${book.title}' is not available.`);
    }
    book.status = 'borrowed';
    return book;
  }

  returnBook(title) {
    const normalizedTitle = normalizeString(title);
    const book = this._books.find((b) => normalizeString(b.title) === normalizedTitle);
    if (!book) {
      throw new BookNotFoundError(`Book titled '${title}' was not found.`);
    }
    if (book.status === 'available') {
      // Returning an available book is considered invalid
      throw new ValidationError(`Book titled '${book.title}' is not currently borrowed.`);
    }
    book.status = 'available';
    return book;
  }

  searchBooks(query = {}) {
    const {
      title,
      author,
      year,
      status,
    } = query;

    const normalizedTitle = title != null ? normalizeString(title) : null;
    const normalizedAuthor = author != null ? normalizeString(author) : null;
    const normalizedStatus = status != null ? normalizeString(status) : null;
    const numericYear = year != null && year !== '' ? Number(year) : null;

    return this._books.filter((book) => {
      if (normalizedTitle && !normalizeString(book.title).includes(normalizedTitle)) {
        return false;
      }
      if (normalizedAuthor && !normalizeString(book.author).includes(normalizedAuthor)) {
        return false;
      }
      if (numericYear !== null && book.year !== numericYear) {
        return false;
      }
      if (normalizedStatus && normalizeString(book.status) !== normalizedStatus) {
        return false;
      }
      return true;
    });
  }

  // --- Reports using map/filter/find ---
  getBorrowedBooks() {
    return this._books.filter((b) => b.status === 'borrowed');
  }

  getAvailableBooks() {
    return this._books.filter((b) => b.status === 'available');
  }

  listAuthors() {
    const authors = this._books.map((b) => b.author);
    return Array.from(new Set(authors)).sort((a, b) => a.localeCompare(b));
  }

  generateSummary() {
    const totalBooks = this._books.length;
    const borrowed = this.getBorrowedBooks();
    const available = this.getAvailableBooks();

    const byAuthor = this._books.reduce((acc, book) => {
      const key = book.author;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBooks,
      borrowedCount: borrowed.length,
      availableCount: available.length,
      authors: this.listAuthors(),
      byAuthor,
    };
  }
}

// ESM exports for use in React Native and modern bundlers
export const errors = {
  LibraryError,
  ValidationError,
  DuplicateBookError,
  BookNotFoundError,
  BookNotAvailableError,
};

export {
  Library,
  FakeStorage,
  LibraryError,
  ValidationError,
  DuplicateBookError,
  BookNotFoundError,
  BookNotAvailableError,
};
