// Google Books API service
// Documentation: https://developers.google.com/books/docs/v1/using

// Types
export interface Book {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        publishedDate?: string;
        description?: string;
        pageCount?: number;
        categories?: string[];
        averageRating?: number;
        ratingsCount?: number;
        language?: string;
        publisher?: string;
        isbn?: string[];
    };
    saleInfo?: {
        listPrice?: {
            amount: number;
            currencyCode: string;
        };
        retailPrice?: {
            amount: number;
            currencyCode: string;
        };
        isEbook: boolean;
    };
}

export interface SearchResponse {
    items?: Book[];
    totalItems: number;
    kind: string;
}

export interface SearchParams {
    query: string;
    maxResults?: number;
    startIndex?: number;
    orderBy?: 'relevance' | 'newest';
    printType?: 'all' | 'books' | 'magazines';
    filter?: 'partial' | 'full' | 'free-ebooks' | 'paid-ebooks' | 'ebooks';
    langRestrict?: string;
    fields?: string;
}

/**
 * Search for books using Google Books API
 * @param query Search query string
 * @param options Optional search parameters
 * @returns Promise with search results
 */
export const searchBooks = async (
    query: string, 
    options: Partial<SearchParams> = {}
): Promise<SearchResponse> => {
    if (!query.trim()) {
        return { 
            items: [], 
            totalItems: 0, 
            kind: 'books#volumes' 
        };
    }

    // Build query parameters
    const params = new URLSearchParams({
        q: query.trim(),
        maxResults: (options.maxResults || 10).toString(),
        startIndex: (options.startIndex || 0).toString(),
        ...(options.orderBy && { orderBy: options.orderBy }),
        ...(options.printType && { printType: options.printType }),
        ...(options.filter && { filter: options.filter }),
        ...(options.langRestrict && { langRestrict: options.langRestrict }),
        ...(options.fields && { fields: options.fields })
    });

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching books:', error);
        throw new Error('Failed to fetch books from Google Books API');
    }
};

/**
 * Get book details by ID
 * @param bookId Google Books volume ID
 * @returns Promise with book details
 */
export const getBookById = async (bookId: string): Promise<Book> => {
    if (!bookId.trim()) {
        throw new Error('Book ID is required');
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const book = await response.json();
        return book;
    } catch (error) {
        console.error('Error fetching book details:', error);
        throw new Error('Failed to fetch book details from Google Books API');
    }
};

/**
 * Search books with default fields for list display
 * @param query Search query string
 * @param maxResults Maximum number of results to return
 * @returns Promise with search results optimized for list display
 */
export const searchBooksForList = async (
    query: string, 
    maxResults: number = 10
): Promise<SearchResponse> => {
    return searchBooks(query, {
        maxResults,
        fields: 'items(id,volumeInfo(title,authors,imageLinks,publishedDate,description)),totalItems,kind'
    });
};

/**
 * Search books with full details
 * @param query Search query string
 * @param maxResults Maximum number of results to return
 * @returns Promise with search results including full book details
 */
export const searchBooksWithFullDetails = async (
    query: string, 
    maxResults: number = 10
): Promise<SearchResponse> => {
    return searchBooks(query, {
        maxResults,
        fields: 'items(id,volumeInfo(title,authors,imageLinks,publishedDate,description,pageCount,categories,averageRating,ratingsCount,language,publisher,isbn),saleInfo),totalItems,kind'
    });
};
