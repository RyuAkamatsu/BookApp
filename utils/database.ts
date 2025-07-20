import * as SQLite from 'expo-sqlite';

export interface BookRecord {
  id: string;
  title: string;
  author: string;
  series?: string;
  seriesNumber?: number;
  coverUrl: string;
  genre?: string;
  publishedYear?: number;
  libraryName: string;
  isRead: boolean;
  isToRead: boolean;
  scannedAt: string;
  description?: string;
  isbn?: string;
}

export interface Library {
  id: string;
  name: string;
  bookCount: number;
  createdAt: string;
}

class DatabaseManager {
    private db: SQLite.SQLiteDatabase | null = null;

    async init() {
        if (this.db) return;
    
        this.db = await SQLite.openDatabaseAsync('bookshelf.db');
    
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS libraries (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                bookCount INTEGER DEFAULT 0,
                createdAt TEXT NOT NULL
            );
        `);

        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS books (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                series TEXT,
                seriesNumber INTEGER,
                coverUrl TEXT NOT NULL,
                genre TEXT,
                publishedYear INTEGER,
                libraryName TEXT NOT NULL,
                isRead INTEGER DEFAULT 0,
                isToRead INTEGER DEFAULT 0,
                scannedAt TEXT NOT NULL,
                description TEXT,
                isbn TEXT,
                UNIQUE(title, author, libraryName)
            );
        `);

        // Insert default libraries
        await this.insertDefaultLibraries();
    }

    private async insertDefaultLibraries() {
        if (!this.db) return;

        const existingLibraries = await this.db.getAllAsync('SELECT COUNT(*) as count FROM libraries');
        if ((existingLibraries[0] as any)?.count > 0) return;

        const defaultLibraries = [
            { id: '1', name: 'Fantasy Collection', createdAt: new Date('2024-01-15').toISOString() },
            { id: '2', name: 'Science Fiction', createdAt: new Date('2024-01-20').toISOString() },
        ];

        for (const library of defaultLibraries) {
            await this.db.runAsync(
                'INSERT OR IGNORE INTO libraries (id, name, createdAt) VALUES (?, ?, ?)',
                [library.id, library.name, library.createdAt]
            );
        }
    }

    async getLibraries(): Promise<Library[]> {
        if (!this.db) await this.init();
    
        const libraries = await this.db!.getAllAsync(`
            SELECT l.*, COUNT(b.id) as bookCount 
            FROM libraries l 
            LEFT JOIN books b ON l.name = b.libraryName 
            GROUP BY l.id 
            ORDER BY l.createdAt DESC
        `) as Library[];
    
        return libraries;
    }

    async createLibrary(name: string): Promise<Library> {
        if (!this.db) await this.init();
    
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
    
        await this.db!.runAsync(
            'INSERT INTO libraries (id, name, createdAt) VALUES (?, ?, ?)',
            [id, name, createdAt]
        );
    
        return { id, name, bookCount: 0, createdAt };
    }

    async addBooks(books: Omit<BookRecord, 'isRead' | 'isToRead' | 'scannedAt'>[]): Promise<BookRecord[]> {
        if (!this.db) await this.init();
    
        const addedBooks: BookRecord[] = [];
        const scannedAt = new Date().toISOString();
    
        for (const book of books) {
            try {
                // Check if book already exists (same title and author)
                const existing = await this.db!.getFirstAsync(
                    'SELECT * FROM books WHERE title = ? AND author = ?',
                    [book.title, book.author]
                );
        
                if (!existing) {
                    const bookRecord: BookRecord = {
                        ...book,
                        isRead  : false,
                        isToRead: false,
                        scannedAt,
                    };
          
                    await this.db!.runAsync(`
            INSERT INTO books (
              id, title, author, series, seriesNumber, coverUrl, genre, 
              publishedYear, libraryName, isRead, isToRead, scannedAt, description, isbn
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
                        bookRecord.id, bookRecord.title, bookRecord.author, bookRecord.series || null,
                        bookRecord.seriesNumber || null, bookRecord.coverUrl, bookRecord.genre || null,
                        bookRecord.publishedYear || null, bookRecord.libraryName, 0, 0,
                        bookRecord.scannedAt, bookRecord.description || null, bookRecord.isbn || null
                    ]);
          
                    addedBooks.push(bookRecord);
                }
            } catch (error) {
                console.error('Error adding book:', error);
            }
        }
    
        return addedBooks;
    }

    async getBooks(libraryName?: string): Promise<BookRecord[]> {
        if (!this.db) await this.init();
    
        let query = 'SELECT * FROM books ORDER BY scannedAt DESC';
        let params: any[] = [];
    
        if (libraryName) {
            query = 'SELECT * FROM books WHERE libraryName = ? ORDER BY scannedAt DESC';
            params = [libraryName];
        }
    
        const books = await this.db!.getAllAsync(query, params) as any[];
        return books.map(book => ({
            ...book,
            isRead  : Boolean(book.isRead),
            isToRead: Boolean(book.isToRead),
        }));
    }

    async getToReadBooks(): Promise<BookRecord[]> {
        if (!this.db) await this.init();
    
        const books = await this.db!.getAllAsync(
            'SELECT * FROM books WHERE isToRead = 1 ORDER BY scannedAt DESC'
        ) as any[];
    
        return books.map(book => ({
            ...book,
            isRead  : Boolean(book.isRead),
            isToRead: Boolean(book.isToRead),
        }));
    }

    async updateBookReadStatus(bookId: string, isRead: boolean): Promise<void> {
        if (!this.db) await this.init();
    
        await this.db!.runAsync(
            'UPDATE books SET isRead = ? WHERE id = ?',
            [isRead ? 1 : 0, bookId]
        );
    }

    async updateBookToReadStatus(bookId: string, isToRead: boolean): Promise<void> {
        if (!this.db) await this.init();
    
        await this.db!.runAsync(
            'UPDATE books SET isToRead = ? WHERE id = ?',
            [isToRead ? 1 : 0, bookId]
        );
    }

    async getBookById(bookId: string): Promise<BookRecord | null> {
        if (!this.db) await this.init();
    
        const book = await this.db!.getFirstAsync(
            'SELECT * FROM books WHERE id = ?',
            [bookId]
        ) as any;
    
        if (!book) return null;
    
        return {
            ...book,
            isRead  : Boolean(book.isRead),
            isToRead: Boolean(book.isToRead),
        };
    }

    async getSimilarBooks(genre?: string, author?: string, excludeIds: string[] = []): Promise<BookRecord[]> {
        if (!this.db) await this.init();
    
        let query = `
      SELECT * FROM books 
      WHERE id NOT IN (${excludeIds.map(() => '?').join(',')})
    `;
        const params = [...excludeIds];
    
        if (genre && author) {
            query += ' AND (genre = ? OR author = ?)';
            params.push(genre, author);
        } else if (genre) {
            query += ' AND genre = ?';
            params.push(genre);
        } else if (author) {
            query += ' AND author = ?';
            params.push(author);
        }
    
        query += ' ORDER BY scannedAt DESC LIMIT 5';
    
        const books = await this.db!.getAllAsync(query, params) as any[];
        return books.map(book => ({
            ...book,
            isRead  : Boolean(book.isRead),
            isToRead: Boolean(book.isToRead),
        }));
    }

    async getNextInSeries(series: string, seriesNumber?: number, excludeId?: string): Promise<BookRecord | null> {
        if (!this.db) await this.init();
    
        let query = 'SELECT * FROM books WHERE series = ?';
        const params: any[] = [series];
    
        if (seriesNumber) {
            query += ' AND seriesNumber > ?';
            params.push(seriesNumber);
        }
    
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
    
        query += ' ORDER BY seriesNumber ASC LIMIT 1';
    
        const book = await this.db!.getFirstAsync(query, params) as any;
    
        if (!book) return null;
    
        return {
            ...book,
            isRead  : Boolean(book.isRead),
            isToRead: Boolean(book.isToRead),
        };
    }

    async clearAllBooks(): Promise<void> {
        if (!this.db) await this.init();
    
        await this.db!.runAsync('DELETE FROM books');
    }
}

export default DatabaseManager;

export const database = new DatabaseManager();
