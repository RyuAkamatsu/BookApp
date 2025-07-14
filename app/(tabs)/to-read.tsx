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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Book, Star, BookmarkMinus, MoveHorizontal as MoreHorizontal, Filter, Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { database, BookRecord } from '@/utils/database';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 60) / 2;

export default function ToReadTab() {
    const [books, setBooks] = useState<BookRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

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
            await loadToReadBooks();
        } catch (error) {
            console.error('Error updating read status:', error);
        }
    };

    const removeFromToRead = async (book: BookRecord) => {
        try {
            await database.updateBookToReadStatus(book.id, false);
            await loadToReadBooks();
        } catch (error) {
            console.error('Error removing from to-read:', error);
        }
    };

    const openBookDetails = (book: BookRecord) => {
        router.push({
            pathname: '/book-details',
            params: { bookId: book.id }
        });
    };

    const renderBookCard = ({ item }: { item: BookRecord }) => (
        <TouchableOpacity
            style={styles.bookCard}
            activeOpacity={0.7}
            onPress={() => openBookDetails(item)}
        >
            <View style={styles.bookCover}>
                <Image source={{ uri: item.coverUrl }} style={styles.coverImage} />
                <View style={styles.ratingOverlay}>
                    <Star size={12} color="#F4B942" fill="#F4B942" />
                    <Text style={styles.ratingText}>4.2</Text>
                </View>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromToRead(item)}
                >
                    <BookmarkMinus size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                    {item.author}
                </Text>
                
                {item.genre && (
                    <View style={styles.genreTag}>
                        <Text style={styles.genreText}>{item.genre}</Text>
                    </View>
                )}
                
                <View style={styles.bookFooter}>
                    <View style={styles.readStatus}>
                        {item.isRead ? (
                            <View style={styles.readBadge}>
                                <Text style={styles.readBadgeText}>Read</Text>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.markReadButton}
                                onPress={() => toggleReadStatus(item)}
                            >
                                <Text style={styles.markReadText}>Mark as Read</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <TouchableOpacity style={styles.moreButton}>
                        <MoreHorizontal size={16} color="#8B7355" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
                <BookmarkMinus size={48} color="#C0C0C0" />
            </View>
            <Text style={styles.emptyTitle}>No Books to Read</Text>
            <Text style={styles.emptySubtitle}>
                Books you want to read will appear here. Add books to your reading list from your library.
            </Text>
            <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/library')}
            >
                <Text style={styles.emptyStateButtonText}>Browse My Books</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerTop}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Want to Read</Text>
                        <Text style={styles.headerSubtitle}>
                            {books.length} book{books.length !== 1 ? 's' : ''} in your reading list
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerButton}>
                            <Search size={20} color="#8B7355" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton}>
                            <Filter size={20} color="#8B7355" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
      
            {books.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={books}
                    renderItem={renderBookCard}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F7F4',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#382110',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#8B7355',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F9F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        padding: 20,
    },
    row: {
        justifyContent: 'space-between',
    },
    bookCard: {
        width: cardWidth,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    bookCover: {
        width: '100%',
        height: cardWidth * 1.4,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F0F0',
    },
    ratingOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(220, 53, 69, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookInfo: {
        padding: 12,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#382110',
        marginBottom: 4,
        lineHeight: 20,
    },
    bookAuthor: {
        fontSize: 14,
        color: '#8B7355',
        marginBottom: 8,
    },
    genreTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#F0F9F8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    genreText: {
        fontSize: 12,
        color: '#00635D',
        fontWeight: '600',
    },
    bookFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    readStatus: {
        flex: 1,
    },
    readBadge: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    readBadgeText: {
        fontSize: 12,
        color: '#2E7D32',
        fontWeight: '600',
    },
    markReadButton: {
        backgroundColor: '#F4B942',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    markReadText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    moreButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9F7F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#382110',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#8B7355',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    emptyStateButton: {
        backgroundColor: '#00635D',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#00635D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyStateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});