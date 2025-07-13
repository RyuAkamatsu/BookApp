import { BookDetails, googleBooksAPI } from './googleBooksApi';

export interface RecognisedBook {
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
  confidence: number; // 0-1 confidence score
  source: 'google_books' | 'fallback';
}

// Simulated OCR results - in a real app, this would come from OCR processing
const simulateOCRTextExtraction = (imageUri: string): string[] => {
    // Simulate extracting text from different parts of the image
    const possibleTexts = [
        'The Name of the Wind - Patrick Rothfuss',
        'Neuromancer by William Gibson',
        "The Handmaid's Tale Margaret Atwood",
        'Sapiens: A Brief History of Humankind - Yuval Noah Harari',
        'The Hobbit J.R.R. Tolkien',
        "The Wise Man's Fear Patrick Rothfuss",
        'Dune Frank Herbert',
        '1984 George Orwell',
        'The Great Gatsby F. Scott Fitzgerald',
        'To Kill a Mockingbird Harper Lee',
        'Pride and Prejudice Jane Austen',
        'The Catcher in the Rye J.D. Salinger',
        'Lord of the Flies William Golding',
        'Animal Farm George Orwell',
        'The Alchemist Paulo Coelho',
        'The Little Prince Antoine de Saint-Exupéry',
        'The Book Thief Markus Zusak',
        'The Kite Runner Khaled Hosseini',
        'Life of Pi Yann Martel',
        'The Curious Incident of the Dog in the Night-Time Mark Haddon',
    ];

    // Randomly select 2-4 text extracts to simulate OCR finding multiple books
    const numberOfBooks = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...possibleTexts].sort(() => 0.5 - Math.random());
  
    return shuffled.slice(0, numberOfBooks);
};

const parseBookText = (text: string): { title: string; author: string } => {
    // Common patterns for book titles and authors
    const patterns = [
    // "Title - Author"
        /^(.+?)\s*[-–]\s*(.+)$/,
        // "Title by Author"
        /^(.+?)\s+by\s+(.+)$/,
        // "Title Author" (simple space separation)
        /^(.+?)\s+(.+)$/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return {
                title : match[1].trim(),
                author: match[2].trim(),
            };
        }
    }

    // Fallback: treat the whole text as title
    return {
        title : text.trim(),
        author: 'Unknown Author',
    };
};

const calculateConfidence = (originalText: string, googleResult: BookDetails | null): number => {
    if (!googleResult) return 0.3; // Low confidence for fallback

    // Simple confidence calculation based on title similarity
    const originalTitle = originalText.toLowerCase();
    const googleTitle = googleResult.title.toLowerCase();
  
    // Check if Google result contains the original title or vice versa
    if (originalTitle.includes(googleTitle) || googleTitle.includes(originalTitle)) {
        return 0.9;
    }
  
    // Check for partial matches
    const originalWords = originalTitle.split(/\s+/);
    const googleWords = googleTitle.split(/\s+/);
    const commonWords = originalWords.filter(word => googleWords.includes(word));
  
    if (commonWords.length >= Math.min(originalWords.length, googleWords.length) * 0.7) {
        return 0.7;
    }
  
    return 0.5; // Medium confidence for partial matches
};

export const recogniseBooksFromImage = async (imageUri: string): Promise<RecognisedBook[]> => {
    try {
    // Simulate OCR processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
    
        // Extract text from image (simulated)
        const extractedTexts = simulateOCRTextExtraction(imageUri);
    
        // Process each extracted text
        const recognisedBooks = await Promise.all(
            extractedTexts.map(async (text, index) => {
                const { title, author } = parseBookText(text);
        
                try {
                    // Try to find book details from Google Books API
                    const googleDetails = await googleBooksAPI.findBookDetails(title, author);
          
                    if (googleDetails) {
                        const confidence = calculateConfidence(text, googleDetails);
            
                        return {
                            id           : `recognised_${Date.now()}_${index}`,
                            title        : googleDetails.title,
                            author       : googleDetails.author,
                            series       : googleDetails.series,
                            seriesNumber : googleDetails.seriesNumber,
                            coverUrl     : googleDetails.coverUrl,
                            genre        : googleDetails.genre,
                            publishedYear: googleDetails.publishedYear,
                            description  : googleDetails.description,
                            isbn         : googleDetails.isbn,
                            confidence,
                            source       : 'google_books' as const,
                        };
                    }
                } catch (error) {
                    console.error(`Error looking up book "${title}":`, error);
                }
        
                // Fallback: use parsed text with default values
                const fallbackBook: RecognisedBook = {
                    id        : `fallback_${Date.now()}_${index}`,
                    title,
                    author,
                    coverUrl  : 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
                    confidence: 0.3,
                    source    : 'fallback',
                };
        
                return fallbackBook;
            })
        );
    
        // Sort by confidence and return top results
        return recognisedBooks
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5); // Return top 5 most confident results
      
    } catch (error) {
        console.error('Error recognizing books from image:', error);
        throw new Error('Failed to recognise books from image');
    }
};

// Alternative function for manual book lookup
export const lookupBookManually = async (title: string, author?: string): Promise<RecognisedBook | null> => {
    try {
        const googleDetails = await googleBooksAPI.findBookDetails(title, author);
    
        if (googleDetails) {
            return {
                id           : `manual_${Date.now()}`,
                title        : googleDetails.title,
                author       : googleDetails.author,
                series       : googleDetails.series,
                seriesNumber : googleDetails.seriesNumber,
                coverUrl     : googleDetails.coverUrl,
                genre        : googleDetails.genre,
                publishedYear: googleDetails.publishedYear,
                description  : googleDetails.description,
                isbn         : googleDetails.isbn,
                confidence   : 0.9,
                source       : 'google_books',
            };
        }
    
        return null;
    } catch (error) {
        console.error('Error looking up book manually:', error);
        return null;
    }
};

// Function to lookup book by ISBN
export const lookupBookByISBN = async (isbn: string): Promise<RecognisedBook | null> => {
    try {
        const googleDetails = await googleBooksAPI.findBookByISBN(isbn);
    
        if (googleDetails) {
            return {
                id           : `isbn_${Date.now()}`,
                title        : googleDetails.title,
                author       : googleDetails.author,
                series       : googleDetails.series,
                seriesNumber : googleDetails.seriesNumber,
                coverUrl     : googleDetails.coverUrl,
                genre        : googleDetails.genre,
                publishedYear: googleDetails.publishedYear,
                description  : googleDetails.description,
                isbn         : googleDetails.isbn,
                confidence   : 0.95, // High confidence for ISBN lookup
                source       : 'google_books',
            };
        }
    
        return null;
    } catch (error) {
        console.error('Error looking up book by ISBN:', error);
        return null;
    }
};
