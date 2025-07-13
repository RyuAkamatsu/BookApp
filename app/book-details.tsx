import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Share,
    Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, CircleCheck as CheckCircle, Circle, BookmarkPlus, BookmarkMinus, Share2, Book, Calendar, Tag, User } from 'lucide-react-native';
import { database, BookRecord } from '@/utils/database';

const { width: screenWidth } = Dimensions.get('window');

export default function BookDetailsScreen() {
    const { bookId } = useLocalSearchParams();
    const [book, setBook] = useState<BookRecord | null>(null);
    const [nextInSeries, setNextInSeries] = useState<BookRecord | null>(null);
    const [similarBooks, setSimilarBooks] = useState<BookRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (bookId) {
            loadBookDetails();
        }
    }, [bookId]);

    const loadBookDetails = async () => {
        try {
            setLoading(true);
            const bookData = await database.getBookById(bookId as string);
      
            if (bookData) {
                setBook(bookData);
        
                // Load next in series if applicable
                if (bookData.series && bookData.seriesNumber) {
                    const nextBook = await database.getNextInSeries(
                        bookData.series,
                        bookData.seriesNumber,
                        bookData.id
                    );
                    setNextInSeries(nextBook);
                }
        
                // Load similar books
                const similar = await database.getSimilarBooks(
                    bookData.genre,
                    bookData.author,
                    [bookData.id]
                );
                setSimilarBooks(similar);
            }
        } catch (error) {
            console.error('Error loading book details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleReadStatus = async () => {
        if (!book) return;
    
        try {
            await database.updateBookReadStatus(book.id, !book.isRead);
            setBook({ ...book, isRead: !book.isRead });
        } catch (error) {
            console.error('Error updating read status:', error);
        }
    };

    const toggleToReadStatus = async () => {
        if (!book) return;
    
        try {
            await database.updateBookToReadStatus(book.id, !book.isToRead);
            setBook({ ...book, isToRead: !book.isToRead });
        } catch (error) {
            console.error('Error updating to-read status:', error);
        }
    };

    const shareBook = async () => {
        if (!book) return;
    
        try {
            const message = `Check out "${book.title}" by ${book.author}${book.series ? ` (${book.series})` : ''}. I found it in my digital library!`;
      
            await Share.share({
                message,
                title: book.title,
            });
        } catch (error) {
            console.error('Error sharing book:', error);
        }
    };

    const openBookDetails = (selectedBook: BookRecord) => {
        router.push({
            pathname: '/book-details',
            params  : { bookId: selectedBook.id }
        });
    };

    if (loading || !book) {
        return (
            <View style={ styles.loadingContainer }>
                <Text style={ styles.loadingText }>Loading book details...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={ styles.container } showsVerticalScrollIndicator={ false }>
            {/* Header */}
            <View style={ styles.header }>
                <TouchableOpacity style={ styles.backButton } onPress={ () => router.back() }>
                    <ArrowLeft size={ 24 } color="#1f2937" />
                </TouchableOpacity>
                <TouchableOpacity style={ styles.shareButton } onPress={ shareBook }>
                    <Share2 size={ 24 } color="#1f2937" />
                </TouchableOpacity>
            </View>

            {/* Book Cover and Basic Info */}
            <View style={ styles.bookSection }>
                <View style={ styles.coverContainer }>
                    <Image source={{ uri: book.coverUrl }} style={ styles.coverImage } />
                </View>
        
                <View style={ styles.bookInfo }>
                    <Text style={ styles.title }>{book.title}</Text>
                    <Text style={ styles.author }>by {book.author}</Text>
          
                    {book.series && (
                        <Text style={ styles.series }>{book.series}</Text>
                    )}
          
                    <View style={ styles.metadata }>
                        {book.genre && (
                            <View style={ styles.metadataItem }>
                                <Tag size={ 16 } color="#6b7280" />
                                <Text style={ styles.metadataText }>{book.genre}</Text>
                            </View>
                        )}
            
                        {book.publishedYear && (
                            <View style={ styles.metadataItem }>
                                <Calendar size={ 16 } color="#6b7280" />
                                <Text style={ styles.metadataText }>{book.publishedYear}</Text>
                            </View>
                        )}
                    </View>

                    {book.description && (
                        <Text style={ styles.description }>{book.description}</Text>
                    )}
                </View>
            </View>

            {/* Action Buttons */}
            <View style={ styles.actionButtons }>
                <TouchableOpacity
                    style={ [styles.actionButton, book.isRead && styles.readButton] }
                    onPress={ toggleReadStatus }
                >
                    {book.isRead ? (
                        <CheckCircle size={ 20 } color="#ffffff" />
                    ) : (
                        <Circle size={ 20 } color="#ffffff" />
                    )}
                    <Text style={ styles.actionButtonText }>
                        {book.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={ [styles.actionButton, styles.toReadButton, book.isToRead && styles.activeToReadButton] }
                    onPress={ toggleToReadStatus }
                >
                    {book.isToRead ? (
                        <BookmarkMinus size={ 20 } color="#ffffff" />
                    ) : (
                        <BookmarkPlus size={ 20 } color="#ffffff" />
                    )}
                    <Text style={ styles.actionButtonText }>
                        {book.isToRead ? 'Remove from To Read' : 'Add to To Read'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Next in Series */}
            {nextInSeries && (
                <View style={ styles.section }>
                    <Text style={ styles.sectionTitle }>Next in Series</Text>
                    <TouchableOpacity
                        style={ styles.recommendationCard }
                        onPress={ () => openBookDetails(nextInSeries) }
                    >
                        <Image source={{ uri: nextInSeries.coverUrl }} style={ styles.recommendationCover } />
                        <View style={ styles.recommendationInfo }>
                            <Text style={ styles.recommendationTitle }>{nextInSeries.title}</Text>
                            <Text style={ styles.recommendationAuthor }>{nextInSeries.author}</Text>
                            {nextInSeries.series && (
                                <Text style={ styles.recommendationSeries }>{nextInSeries.series}</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Similar Books */}
            {similarBooks.length > 0 && (
                <View style={ styles.section }>
                    <Text style={ styles.sectionTitle }>You Might Also Like</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={ false }>
                        {similarBooks.map(similarBook => (
                            <TouchableOpacity
                                key={ similarBook.id }
                                style={ styles.similarBookCard }
                                onPress={ () => openBookDetails(similarBook) }
                            >
                                <Image source={{ uri: similarBook.coverUrl }} style={ styles.similarBookCover } />
                                <Text style={ styles.similarBookTitle } numberOfLines={ 2 }>
                                    {similarBook.title}
                                </Text>
                                <Text style={ styles.similarBookAuthor } numberOfLines={ 1 }>
                                    {similarBook.author}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Library Info */}
            <View style={ styles.section }>
                <Text style={ styles.sectionTitle }>Library Information</Text>
                <View style={ styles.libraryInfo }>
                    <View style={ styles.libraryItem }>
                        <User size={ 16 } color="#6b7280" />
                        <Text style={ styles.libraryText }>Library: {book.libraryName}</Text>
                    </View>
                    <View style={ styles.libraryItem }>
                        <Calendar size={ 16 } color="#6b7280" />
                        <Text style={ styles.libraryText }>
                            Scanned: {new Date(book.scannedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    {book.isbn && (
                        <View style={ styles.libraryItem }>
                            <Book size={ 16 } color="#6b7280" />
                            <Text style={ styles.libraryText }>ISBN: {book.isbn}</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex           : 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex           : 1,
        alignItems     : 'center',
        justifyContent : 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        fontSize: 16,
        color   : '#6b7280',
    },
    header: {
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'space-between',
        paddingTop       : 60,
        paddingHorizontal: 24,
        paddingBottom    : 16,
        backgroundColor  : '#ffffff',
    },
    backButton: {
        width          : 40,
        height         : 40,
        borderRadius   : 20,
        backgroundColor: '#f3f4f6',
        alignItems     : 'center',
        justifyContent : 'center',
    },
    shareButton: {
        width          : 40,
        height         : 40,
        borderRadius   : 20,
        backgroundColor: '#f3f4f6',
        alignItems     : 'center',
        justifyContent : 'center',
    },
    bookSection: {
        backgroundColor: '#ffffff',
        padding        : 24,
        marginBottom   : 16,
    },
    coverContainer: {
        alignItems  : 'center',
        marginBottom: 24,
    },
    coverImage: {
        width          : 200,
        height         : 300,
        borderRadius   : 12,
        backgroundColor: '#f3f4f6',
    },
    bookInfo: { alignItems: 'center' },
    title   : {
        fontSize    : 24,
        fontWeight  : '700',
        color       : '#1f2937',
        textAlign   : 'center',
        marginBottom: 8,
        lineHeight  : 32,
    },
    author: {
        fontSize    : 18,
        color       : '#6b7280',
        marginBottom: 8,
    },
    series: {
        fontSize    : 16,
        color       : '#1e40af',
        fontWeight  : '600',
        marginBottom: 16,
    },
    metadata: {
        flexDirection: 'row',
        alignItems   : 'center',
        gap          : 16,
        marginBottom : 16,
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems   : 'center',
        gap          : 4,
    },
    metadataText: {
        fontSize: 14,
        color   : '#6b7280',
    },
    description: {
        fontSize  : 16,
        color     : '#374151',
        lineHeight: 24,
        textAlign : 'center',
    },
    actionButtons: {
        flexDirection    : 'row',
        paddingHorizontal: 24,
        gap              : 12,
        marginBottom     : 16,
    },
    actionButton: {
        flex           : 1,
        flexDirection  : 'row',
        alignItems     : 'center',
        justifyContent : 'center',
        paddingVertical: 16,
        borderRadius   : 12,
        backgroundColor: '#6b7280',
        gap            : 8,
    },
    readButton        : { backgroundColor: '#10b981' },
    toReadButton      : { backgroundColor: '#f59e0b' },
    activeToReadButton: { backgroundColor: '#ef4444' },
    actionButtonText  : {
        fontSize  : 16,
        fontWeight: '600',
        color     : '#ffffff',
    },
    section: {
        backgroundColor: '#ffffff',
        padding        : 24,
        marginBottom   : 16,
    },
    sectionTitle: {
        fontSize    : 20,
        fontWeight  : '700',
        color       : '#1f2937',
        marginBottom: 16,
    },
    recommendationCard: {
        flexDirection  : 'row',
        backgroundColor: '#f8fafc',
        borderRadius   : 12,
        padding        : 16,
        alignItems     : 'center',
    },
    recommendationCover: {
        width          : 60,
        height         : 90,
        borderRadius   : 8,
        backgroundColor: '#f3f4f6',
        marginRight    : 16,
    },
    recommendationInfo : { flex: 1 },
    recommendationTitle: {
        fontSize    : 16,
        fontWeight  : '600',
        color       : '#1f2937',
        marginBottom: 4,
    },
    recommendationAuthor: {
        fontSize    : 14,
        color       : '#6b7280',
        marginBottom: 4,
    },
    recommendationSeries: {
        fontSize  : 12,
        color     : '#1e40af',
        fontWeight: '600',
    },
    similarBookCard: {
        width      : 120,
        marginRight: 16,
    },
    similarBookCover: {
        width          : 120,
        height         : 180,
        borderRadius   : 8,
        backgroundColor: '#f3f4f6',
        marginBottom   : 8,
    },
    similarBookTitle: {
        fontSize    : 14,
        fontWeight  : '600',
        color       : '#1f2937',
        marginBottom: 4,
        lineHeight  : 18,
    },
    similarBookAuthor: {
        fontSize: 12,
        color   : '#6b7280',
    },
    libraryInfo: { gap: 12 },
    libraryItem: {
        flexDirection: 'row',
        alignItems   : 'center',
        gap          : 8,
    },
    libraryText: {
        fontSize: 14,
        color   : '#374151',
    },
});
