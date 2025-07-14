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
import { useLocalSearchParams, router } from 'expo-router';
import { Book, Search, Filter, Library, Star, BookmarkPlus, MoreHorizontal } from 'lucide-react-native';
import { database, BookRecord } from '@/utils/database';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 60) / 2; // Account for padding and gap

interface LibraryInfo {
  id: string;
  name: string;
  bookCount: number;
}

export default function LibraryTab() {
    const [books, setBooks] = useState<BookRecord[]>([]);
    const [libraries, setLibraries] = useState<LibraryInfo[]>([]);
    const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { newBooks, selectedLibrary: paramLibrary } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (newBooks) {
            try {
                const parsedBooks = JSON.parse(newBooks as string);
                loadData();
            } catch (error) {
                console.error('Error parsing new books:', error);
            }
        }
    }, [newBooks]);

    useEffect(() => {
        if (paramLibrary) {
            setSelectedLibrary(paramLibrary as string);
        }
    }, [paramLibrary]);

    const loadData = async () => {
        try {
            const allLibraries = await database.getLibraries();
            setLibraries(allLibraries);
      
            const allBooks = await database.getBooks(selectedLibrary || undefined);
            setBooks(allBooks);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleLibraryFilter = async (libraryName: string | null) => {
        setSelectedLibrary(libraryName);
        try {
            const filteredBooks = await database.getBooks(libraryName || undefined);
            setBooks(filteredBooks);
        } catch (error) {
            console.error('Error filtering books:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const toggleReadStatus = async (book: BookRecord) => {
        try {
            await database.updateBookReadStatus(book.id, !book.isRead);
            await loadData();
        } catch (error) {
            console.error('Error updating read status:', error);
        }
    };

    const toggleToReadStatus = async (book: BookRecord) => {
        try {
            await database.updateBookToReadStatus(book.id, !book.isToRead);
            await loadData();
        } catch (error) {
            console.error('Error updating to-read status:', error);
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
                    style={styles.bookmarkButton}
                    onPress={() => toggleToReadStatus(item)}
                >
                    <BookmarkPlus 
                        size={16} 
                        color={item.isToRead ? '#F4B942' : '#FFFFFF'} 
                        fill={item.isToRead ? '#F4B942' : 'transparent'}
                    />
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

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <View style={styles.headerTop}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>My Books</Text>
                    <Text style={styles.headerSubtitle}>
                        {books.length} book{books.length !== 1 ? 's' : ''} in your library
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
    );

    const renderLibraryFilter = () => (
        <View style={styles.filterSection}>
            <FlatList
                horizontal
                data={[{ id: 'all', name: 'All Books', bookCount: books.length }, ...libraries]}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            (item.id === 'all' ? !selectedLibrary : selectedLibrary === item.name) && styles.activeFilterChip,
                        ]}
                        onPress={() => handleLibraryFilter(item.id === 'all' ? null : item.name)}
                    >
                        <Library size={16} color={
                            (item.id === 'all' ? !selectedLibrary : selectedLibrary === item.name) 
                                ? '#FFFFFF' 
                                : '#00635D'
                        } />
                        <Text style={[
                            styles.filterChipText,
                            (item.id === 'all' ? !selectedLibrary : selectedLibrary === item.name) && styles.activeFilterChipText,
                        ]}>
                            {item.name}
                        </Text>
                        <View style={[
                            styles.filterChipBadge,
                            (item.id === 'all' ? !selectedLibrary : selectedLibrary === item.name) && styles.activeFilterChipBadge,
                        ]}>
                            <Text style={[
                                styles.filterChipBadgeText,
                                (item.id === 'all' ? !selectedLibrary : selectedLibrary === item.name) && styles.activeFilterChipBadgeText,
                            ]}>
                                {item.bookCount}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterList}
            />
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
                <Book size={48} color="#C0C0C0" />
            </View>
            <Text style={styles.emptyTitle}>No Books Yet</Text>
            <Text style={styles.emptySubtitle}>
                Start building your digital library by scanning books or adding them manually
            </Text>
            <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/index')}
            >
                <Text style={styles.emptyStateButtonText}>Scan Your First Book</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            {renderHeader()}
            {libraries.length > 0 && renderLibraryFilter()}
      
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
    filterSection: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        marginBottom: 8,
    },
    filterList: {
        paddingHorizontal: 20,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F0F9F8',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E0F2F1',
        gap: 6,
    },
    activeFilterChip: {
        backgroundColor: '#00635D',
        borderColor: '#00635D',
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00635D',
    },
    activeFilterChipText: {
        color: '#FFFFFF',
    },
    filterChipBadge: {
        backgroundColor: '#E0F2F1',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    activeFilterChipBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    filterChipBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#00635D',
    },
    activeFilterChipBadgeText: {
        color: '#FFFFFF',
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
    bookmarkButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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