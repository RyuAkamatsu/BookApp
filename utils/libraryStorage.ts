// This file is deprecated - functionality moved to database.ts
// Keeping for backward compatibility during migration

export const getLibraries = () => {
    console.warn('getLibraries is deprecated, use database.getLibraries() instead');
    return [];
};

export const createLibrary = () => {
    console.warn('createLibrary is deprecated, use database.createLibrary() instead');
    return null;
};

export const addBooksToLibrary = () => {
    console.warn('addBooksToLibrary is deprecated, use database.addBooks() instead');
    return [];
};

export const getBooksByLibrary = () => {
    console.warn('getBooksByLibrary is deprecated, use database.getBooks() instead');
    return [];
};

export const getAllBooks = () => {
    console.warn('getAllBooks is deprecated, use database.getBooks() instead');
    return [];
};
