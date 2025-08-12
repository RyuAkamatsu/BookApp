export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBookVolume[];
}

export interface BookDetails {
  id: string;
  title: string;
  author: string;
  series?: string;
  seriesNumber?: number;
  coverUrl: string;
  genre?: string;
  publishedYear?: number;
  description?: string;
  isbn?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
}

class GoogleBooksAPI {
    private baseUrl = 'https://www.googleapis.com/books/v1';

    private apiKey = ''; // Optional: Add your API key for higher rate limits

    private async makeRequest(endpoint: string): Promise<any> {
        try {
            const url = `${this.baseUrl}${endpoint}${this.apiKey ? `&key=${this.apiKey}` : ''}`;
            const response = await fetch(url);
      
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
      
            return await response.json();
        } catch (error) {
            console.error('Google Books API request failed:', error);
            throw error;
        }
    }

    async searchBooks(query: string, maxResults: number = 5): Promise<GoogleBooksResponse> {
        const encodedQuery = encodeURIComponent(query);
        const endpoint = `/volumes?q=${encodedQuery}&maxResults=${maxResults}&printType=books`;
    
        return await this.makeRequest(endpoint);
    }

    async getBookById(bookId: string): Promise<GoogleBookVolume> {
        const endpoint = `/volumes/${bookId}`;
    
        return await this.makeRequest(endpoint);
    }

    async searchByTitleAndAuthor(title: string, author?: string): Promise<GoogleBooksResponse> {
        let query = `intitle:"${title}"`;
        if (author) {
            query += `+inauthor:"${author}"`;
        }
    
        return await this.searchBooks(query, 3);
    }

    async searchByISBN(isbn: string): Promise<GoogleBooksResponse> {
        const query = `isbn:${isbn}`;
    
        return await this.searchBooks(query, 1);
    }

    private extractSeriesInfo(title: string, description?: string): { series?: string; seriesNumber?: number } {
    // Common series patterns
        const seriesPatterns = [
            /^(.*?)\s*#(\d+)/i,
            /^(.*?)\s*\(Book\s*(\d+)\)/i,
            /^(.*?)\s*\((\d+)\)/i,
            /^(.*?)\s*Volume\s*(\d+)/i,
        ];

        for (const pattern of seriesPatterns) {
            const match = title.match(pattern);
            if (match) {
                return {
                    series      : match[1].trim(),
                    seriesNumber: parseInt(match[2], 10)
                };
            }
        }

        // Check description for series info
        if (description) {
            const seriesMatch = description.match(/series[:\s]+([^,\.]+)/i);
            if (seriesMatch) {
                return { series: seriesMatch[1].trim() };
            }
        }

        return {};
    }

    private extractPublishedYear(publishedDate?: string): number | undefined {
        if (!publishedDate) return undefined;
    
        // Extract year from various date formats
        const yearMatch = publishedDate.match(/(\d{4})/);
        return yearMatch ? parseInt(yearMatch[1], 10) : undefined;
    }

    private getBestCoverUrl(imageLinks?: { smallThumbnail?: string; thumbnail?: string }): string {
        if (imageLinks?.thumbnail) {
            return imageLinks.thumbnail;
        }
        if (imageLinks?.smallThumbnail) {
            return imageLinks.smallThumbnail;
        }
    
        // Default book cover
        return 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg';
    }

    private getISBN(industryIdentifiers?: Array<{ type: string; identifier: string }>): string | undefined {
        if (!industryIdentifiers) return undefined;
    
        // Prefer ISBN_13 over ISBN_10
        const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13');
        if (isbn13) return isbn13.identifier;
    
        const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10');
        return isbn10?.identifier;
    }

    private getGenre(categories?: string[]): string | undefined {
        if (!categories || categories.length === 0) return undefined;
    
        // Return the first category, or try to find a more specific one
        const firstCategory = categories[0];
    
        // Map common categories to genres
        const genreMap: { [key: string]: string } = {
            Fiction          : 'Fiction',
            Fantasy          : 'Fantasy',
            'Science Fiction': 'Science Fiction',
            Mystery          : 'Mystery',
            Romance          : 'Romance',
            Thriller         : 'Thriller',
            Horror           : 'Horror',
            Biography        : 'Biography',
            History          : 'History',
            'Self-Help'      : 'Self-Help',
            Business         : 'Business',
            Technology       : 'Technology',
            Philosophy       : 'Philosophy',
            Religion         : 'Religion',
            Cooking          : 'Cooking',
            Travel           : 'Travel',
            Poetry           : 'Poetry',
            Drama            : 'Drama',
            Comics           : 'Comics',
            Children         : 'Children',
        };

        for (const category of categories) {
            const genre = genreMap[category];
            if (genre) return genre;
        }

        return firstCategory;
    }

    convertToBookDetails(volume: GoogleBookVolume): BookDetails {
        const { volumeInfo } = volume;
        const seriesInfo = this.extractSeriesInfo(volumeInfo.title, volumeInfo.description);
    
        return {
            id           : volume.id,
            title        : volumeInfo.title,
            author       : volumeInfo.authors?.join(', ') || 'Unknown Author',
            series       : seriesInfo.series,
            seriesNumber : seriesInfo.seriesNumber,
            coverUrl     : this.getBestCoverUrl(volumeInfo.imageLinks),
            genre        : this.getGenre(volumeInfo.categories),
            publishedYear: this.extractPublishedYear(volumeInfo.publishedDate),
            description  : volumeInfo.description,
            isbn         : this.getISBN(volumeInfo.industryIdentifiers),
            publisher    : volumeInfo.publisher,
            pageCount    : volumeInfo.pageCount,
            language     : volumeInfo.language,
        };
    }

    async findBookDetails(title: string, author?: string): Promise<BookDetails | null> {
        try {
            // First try searching by title and author
            let response = await this.searchByTitleAndAuthor(title, author);
      
            // If no results, try just by title
            if (!response.items || response.items.length === 0) {
                response = await this.searchBooks(`intitle:"${title}"`, 3);
            }
      
            if (!response.items || response.items.length === 0) {
                return null;
            }
      
            // Convert the first (best) result
            const bestMatch = response.items[0];
            return this.convertToBookDetails(bestMatch);
      
        } catch (error) {
            console.error('Error finding book details:', error);
            return null;
        }
    }

    async findBookByISBN(isbn: string): Promise<BookDetails | null> {
        try {
            const response = await this.searchByISBN(isbn);
      
            if (!response.items || response.items.length === 0) {
                return null;
            }
      
            return this.convertToBookDetails(response.items[0]);
      
        } catch (error) {
            console.error('Error finding book by ISBN:', error);
            return null;
        }
    }
}

export const googleBooksAPI = new GoogleBooksAPI();
