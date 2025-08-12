import { getUserProfile, updateUserBooks } from '@/utils/firebase/firebase';
import DatabaseManager from '@/utils/database';

export interface SyncResult {
  success: boolean;
  message: string;
  booksSynced?: number;
}

export const syncDatabaseWithFirebase = async (userId: string): Promise<SyncResult> => {
    try {
        const dbManager = new DatabaseManager();
        await dbManager.init();

        // Get user's books from Firebase
        const firebaseResult = await getUserProfile(userId);
        if (!firebaseResult.success) {
            return {
                success: false,
                message: 'Failed to fetch user data from Firebase'
            };
        }

        const firebaseBooks = firebaseResult.data?.books || [];
        const localBooks = await dbManager.getBooks();

        // If Firebase has books and local doesn't, sync from Firebase to local
        if (firebaseBooks.length > 0 && localBooks.length === 0) {
            // Convert Firebase books to local format and add them
            const booksToAdd = firebaseBooks.map((book: any) => ({
                id           : book.id,
                title        : book.title,
                author       : book.author,
                series       : book.series,
                seriesNumber : book.seriesNumber,
                coverUrl     : book.coverUrl,
                genre        : book.genre,
                publishedYear: book.publishedYear,
                libraryName  : book.libraryName || 'Default Library',
                description  : book.description,
                isbn         : book.isbn,
            }));

            await dbManager.addBooks(booksToAdd);

            return {
                success    : true,
                message    : `Synced ${firebaseBooks.length} books from cloud to local`,
                booksSynced: firebaseBooks.length
            };
        }

        // If local has books and Firebase doesn't, sync from local to Firebase
        if (localBooks.length > 0 && firebaseBooks.length === 0) {
            const firebaseResult = await updateUserBooks(userId, localBooks);
            if (firebaseResult.success) {
                return {
                    success    : true,
                    message    : `Synced ${localBooks.length} books from local to cloud`,
                    booksSynced: localBooks.length
                };
            }
            return {
                success: false,
                message: 'Failed to sync books to Firebase'
            };
      
        }

        // If both have books, merge them (Firebase takes precedence for conflicts)
        if (localBooks.length > 0 && firebaseBooks.length > 0) {
            const mergedBooks = [...firebaseBooks];
      
            // Add local books that don't exist in Firebase
            for (const localBook of localBooks) {
                const exists = firebaseBooks.some((fb: any) => fb.id === localBook.id);
                if (!exists) {
                    mergedBooks.push(localBook);
                }
            }

            // Update Firebase with merged books
            const updateResult = await updateUserBooks(userId, mergedBooks);
            if (updateResult.success) {
                // Clear local database and re-add merged books
                await dbManager.clearAllBooks();
                const booksToAdd = mergedBooks.map((book: any) => ({
                    id           : book.id,
                    title        : book.title,
                    author       : book.author,
                    series       : book.series,
                    seriesNumber : book.seriesNumber,
                    coverUrl     : book.coverUrl,
                    genre        : book.genre,
                    publishedYear: book.publishedYear,
                    libraryName  : book.libraryName || 'Default Library',
                    description  : book.description,
                    isbn         : book.isbn,
                }));
                await dbManager.addBooks(booksToAdd);

                return {
                    success    : true,
                    message    : `Merged and synced ${mergedBooks.length} books`,
                    booksSynced: mergedBooks.length
                };
            }
            return {
                success: false,
                message: 'Failed to merge books'
            };
      
        }

        return {
            success    : true,
            message    : 'No books to sync',
            booksSynced: 0
        };

    } catch (error) {
        console.error('Database sync error:', error);
        return {
            success: false,
            message: 'An error occurred during sync'
        };
    }
};

export const uploadLocalBooksToFirebase = async (userId: string): Promise<SyncResult> => {
    try {
        const dbManager = new DatabaseManager();
        await dbManager.init();

        const localBooks = await dbManager.getBooks();
    
        if (localBooks.length === 0) {
            return {
                success    : true,
                message    : 'No local books to upload',
                booksSynced: 0
            };
        }

        const result = await updateUserBooks(userId, localBooks);
        if (result.success) {
            return {
                success    : true,
                message    : `Uploaded ${localBooks.length} books to cloud`,
                booksSynced: localBooks.length
            };
        }
        return {
            success: false,
            message: 'Failed to upload books to Firebase'
        };
    
    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            message: 'An error occurred during upload'
        };
    }
};
