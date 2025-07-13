import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { Book, CircleCheck as CheckCircle, Circle, BookmarkMinus } from 'lucide-react-native';
import { router } from 'expo-router';
import { database, BookRecord } from '@/utils/database';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2;

export default function ToReadTab() {
    const [books, setBooks] = useState<BookRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadToReadBooks();
    }, []);

    const loadToReadBooks = async () => {
        try {
            const toReadBooks = await database.getToReadBooks();
            setBooks(toReadBooks);
        } catch (error) {
            console.error('Error loading to-read books:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadToReadBooks();
        setRefreshing(false);
    };

    const toggleReadStatus = async (book: BookRecord) => {
        try {
            await database.updateBookReadStatus(book.id, !book.isRead);
            await loadToReadBooks(); // Refresh the list
        } catch (error) {
            console.error('Error updating read status:', error);
        }
    };

    const removeFromToRead = async (book: BookRecord) => {
        try {
            await database.updateBookToReadStatus(book.id, false);
            await loadToReadBooks(); // Refresh the list
        } catch (error) {
            console.error('Error removing from to-read:', error);
        }
    };

    const openBookDetails = (book: BookRecord) => {
        router.push({
            pathname: '/book-details',
            params  : { bookId: book.id }
        });
    };

    const renderBookCard = ({ item }: { item: BookRecord }) => (
        <TouchableOpacity
            style={ styles.bookCard }
            activeOpacity={ 0.7 }
            onPress={ () => openBookDetails(item) }
        >
            <View style={ styles.bookCover }>
                <Image source={{ uri: item.coverUrl }} style={ styles.coverImage } />
                <View style={ styles.coverOverlay }>
                    <Book size={ 20 } color="#ffffff" />
                </View>
                <View style={ styles.statusOverlay }>
                    <TouchableOpacity
                        style={ styles.statusButton }
                        onPress={ () => toggleReadStatus(item) }
                    >
                        {item.isRead ? (
                            <CheckCircle size={ 20 } color="#10b981" />
                        ) : (
                            <Circle size={ 20 } color="#ffffff" />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={ styles.statusButton }
                        onPress={ () => removeFromToRead(item) }
                    >
                        <BookmarkMinus size={ 20 } color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={ styles.bookInfo }>
                <Text style={ styles.bookTitle } numberOfLines={ 2 }>
                    {item.title}
                </Text>
                <Text style={ styles.bookAuthor } numberOfLines={ 1 }>
                    {item.author}
                </Text>
                {item.series && (
                    <Text style={ styles.bookSeries } numberOfLines={ 1 }>
                        {item.series}
                    </Text>
                )}
                <View style={ styles.bookMetadata }>
                    {item.genre && (
                        <View style={ styles.genreTag }>
                            <Text style={ styles.genreText }>{item.genre}</Text>
                        </View>
                    )}
                    {item.publishedYear && (
                        <Text style={ styles.yearText }>{item.publishedYear}</Text>
                    )}
                </View>
                {item.isRead && (
                    <View style={ styles.readBadge }>
                        <CheckCircle size={ 12 } color="#10b981" />
                        <Text style={ styles.readBadgeText }>Read</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={ styles.emptyState }>
            <Book size={ 64 } color="#d1d5db" />
            <Text style={ styles.emptyTitle }>No Books to Read</Text>
            <Text style={ styles.emptySubtitle }>
                Add books to your reading list from your library or when viewing book details
            </Text>
        </View>
    );

    return (
        <View style={ styles.container }>
            <View style={ styles.header }>
                <View style={ styles.headerContent }>
                    <Text style={ styles.headerTitle }>To Read</Text>
                    <Text style={ styles.headerSubtitle }>
                        {books.length} book{books.length !== 1 ? 's' : ''} in your reading list
                    </Text>
                </View>
            </View>
      
            {books.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={ books }
                    renderItem={ renderBookCard }
                    keyExtractor={ item => item.id }
                    numColumns={ 2 }
                    contentContainerStyle={ styles.listContainer }
                    columnWrapperStyle={ styles.row }
                    showsVerticalScrollIndicator={ false }
                    refreshControl={
                        <RefreshControl refreshing={ refreshing } onRefresh={ onRefresh } />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex           : 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'space-between',
        paddingTop       : 60,
        paddingHorizontal: 24,
        paddingBottom    : 24,
        backgroundColor  : '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerContent: { flex: 1 },
    headerTitle  : {
        fontSize    : 28,
        fontWeight  : '700',
        color       : '#1f2937',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color   : '#6b7280',
    },
    listContainer: { padding: 24 },
    row          : { justifyContent: 'space-between' },
    bookCard     : {
        width          : cardWidth,
        backgroundColor: '#ffffff',
        borderRadius   : 16,
        marginBottom   : 24,
        shadowColor    : '#000000',
        shadowOffset   : {
            width : 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius : 8,
        elevation    : 4,
        overflow     : 'hidden',
    },
    bookCover: {
        width   : '100%',
        height  : cardWidth * 1.2,
        position: 'relative',
    },
    coverImage: {
        width          : '100%',
        height         : '100%',
        backgroundColor: '#f3f4f6',
    },
    coverOverlay: {
        position       : 'absolute',
        top            : 12,
        right          : 12,
        width          : 32,
        height         : 32,
        borderRadius   : 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems     : 'center',
        justifyContent : 'center',
    },
    statusOverlay: {
        position     : 'absolute',
        top          : 12,
        left         : 12,
        flexDirection: 'column',
        gap          : 8,
    },
    statusButton: {
        width          : 32,
        height         : 32,
        borderRadius   : 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems     : 'center',
        justifyContent : 'center',
    },
    bookInfo : { padding: 16 },
    bookTitle: {
        fontSize    : 16,
        fontWeight  : '700',
        color       : '#1f2937',
        marginBottom: 4,
        lineHeight  : 22,
    },
    bookAuthor: {
        fontSize    : 14,
        color       : '#6b7280',
        marginBottom: 6,
    },
    bookSeries: {
        fontSize    : 12,
        color       : '#1e40af',
        fontWeight  : '600',
        marginBottom: 8,
    },
    bookMetadata: {
        flexDirection : 'row',
        alignItems    : 'center',
        justifyContent: 'space-between',
        marginBottom  : 8,
    },
    genreTag: {
        backgroundColor  : '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical  : 4,
        borderRadius     : 6,
        flex             : 1,
        marginRight      : 8,
    },
    genreText: {
        fontSize  : 10,
        color     : '#1e40af',
        fontWeight: '600',
        textAlign : 'center',
    },
    yearText: {
        fontSize  : 12,
        color     : '#9ca3af',
        fontWeight: '500',
    },
    readBadge: {
        flexDirection    : 'row',
        alignItems       : 'center',
        backgroundColor  : '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical  : 4,
        borderRadius     : 6,
        alignSelf        : 'flex-start',
    },
    readBadgeText: {
        fontSize  : 10,
        color     : '#10b981',
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyState: {
        flex             : 1,
        alignItems       : 'center',
        justifyContent   : 'center',
        paddingHorizontal: 48,
    },
    emptyTitle: {
        fontSize    : 24,
        fontWeight  : '700',
        color       : '#1f2937',
        marginTop   : 24,
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize  : 16,
        color     : '#6b7280',
        textAlign : 'center',
        lineHeight: 24,
    },
});
