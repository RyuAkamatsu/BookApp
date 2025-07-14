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
import { designSystem, commonStyles } from '@/utils/designSystem';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - (designSystem.spacing.xl * 2) - designSystem.spacing.md) / 2;

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
            style={[commonStyles.card, styles.bookCard]}
            activeOpacity={0.7}
            onPress={() => openBookDetails(item)}
        >
            <View style={styles.bookCover}>
                <Image source={{ uri: item.coverUrl }} style={styles.coverImage} />
                <View style={styles.ratingOverlay}>
                    <Star size={12} color={designSystem.colors.accent} fill={designSystem.colors.accent} />
                    <Text style={styles.ratingText}>4.2</Text>
                </View>
                <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => toggleToReadStatus(item)}
                >
                    <BookmarkPlus 
                        size={16} 
                        color={item.isToRead ? designSystem.colors.accent : designSystem.colors.surface} 
                        fill={item.isToRead ? designSystem.colors.accent : 'transparent'}
                    />
                </TouchableOpacity>
            </View>
            
            <View style={styles.bookInfo}>
                <Text style={[commonStyles.subtitle, styles.bookTitle]} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={[commonStyles.caption, styles.bookAuthor]} numberOfLines={1}>
                    {item.author}
                </Text>
                
                {item.genre && (
                    <View style={styles.genreTag}>
                        <Text style={styles.genreText}>{item.genre}</Text>
                    </View>
                )}
                
                <View style={[commonStyles.spaceBetween, styles.bookFooter]}>
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
                        <MoreHorizontal size={16} color={designSystem.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={[commonStyles.header, { paddingTop: insets.top + designSystem.spacing.xl }]}>
            <View style={commonStyles.spaceBetween}>
                <View style={{ flex: 1 }}>
                    <Text style={commonStyles.headerTitle}>My Books</Text>
                    <Text style={commonStyles.headerSubtitle}>
                        {books.length} book{books.length !== 1 ? 's' : ''} in your library
                    </Text>
                </View>
                <View style={commonStyles.row}>
                    <TouchableOpacity style={[styles.headerButton, { marginRight: designSystem.spacing.md }]}>
                        <Search size={20} color={designSystem.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Filter size={20} color={designSystem.colors.textSecondary} />
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
                                ? designSystem.colors.surface 
                                : designSystem.colors.primary
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
        <View style={[commonStyles.center, styles.emptyState]}>
            <View style={styles.emptyStateIcon}>
                <Book size={48} color={designSystem.colors.textMuted} />
            </View>
            <Text style={[commonStyles.title, styles.emptyTitle]}>No Books Yet</Text>
            <Text style={[commonStyles.body, styles.emptySubtitle]}>
                Start building your digital library by scanning books or adding them manually
            </Text>
            <TouchableOpacity 
                style={[commonStyles.primaryButton, styles.emptyStateButton]}
                onPress={() => router.push('/(tabs)/index')}
            >
                <Text style={commonStyles.primaryButtonText}>Scan Your First Book</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
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
                    contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + designSystem.spacing.xl }]}
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
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: designSystem.borderRadius.full,
        backgroundColor: designSystem.colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterSection: {
        backgroundColor: designSystem.colors.surface,
        paddingVertical: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.sm,
    },
    filterList: {
        paddingHorizontal: designSystem.spacing.xl,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: designSystem.spacing.lg,
        paddingVertical: designSystem.spacing.md,
        borderRadius: designSystem.borderRadius.xl,
        backgroundColor: designSystem.colors.surfaceSecondary,
        marginRight: designSystem.spacing.md,
        borderWidth: 1,
        borderColor: designSystem.colors.border,
        gap: designSystem.spacing.xs,
    },
    activeFilterChip: {
        backgroundColor: designSystem.colors.primary,
        borderColor: designSystem.colors.primary,
    },
    filterChipText: {
        fontSize: designSystem.typography.fontSize.sm,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.primary,
    },
    activeFilterChipText: {
        color: designSystem.colors.surface,
    },
    filterChipBadge: {
        backgroundColor: designSystem.colors.border,
        paddingHorizontal: designSystem.spacing.xs,
        paddingVertical: 2,
        borderRadius: designSystem.borderRadius.sm,
        minWidth: 20,
        alignItems: 'center',
    },
    activeFilterChipBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    filterChipBadgeText: {
        fontSize: designSystem.typography.fontSize.xs,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.primary,
    },
    activeFilterChipBadgeText: {
        color: designSystem.colors.surface,
    },
    listContainer: {
        padding: designSystem.spacing.xl,
    },
    row: {
        justifyContent: 'space-between',
    },
    bookCard: {
        width: cardWidth,
        marginBottom: designSystem.spacing.xl,
        padding: 0,
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
        backgroundColor: designSystem.colors.surfaceSecondary,
    },
    ratingOverlay: {
        position: 'absolute',
        top: designSystem.spacing.sm,
        left: designSystem.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: designSystem.spacing.xs,
        paddingVertical: designSystem.spacing.xs,
        borderRadius: designSystem.borderRadius.md,
        gap: designSystem.spacing.xs,
    },
    ratingText: {
        color: designSystem.colors.surface,
        fontSize: designSystem.typography.fontSize.xs,
        fontWeight: designSystem.typography.fontWeight.semibold,
    },
    bookmarkButton: {
        position: 'absolute',
        top: designSystem.spacing.sm,
        right: designSystem.spacing.sm,
        width: 32,
        height: 32,
        borderRadius: designSystem.borderRadius.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookInfo: {
        padding: designSystem.spacing.md,
    },
    bookTitle: {
        marginBottom: designSystem.spacing.xs,
        lineHeight: designSystem.typography.lineHeight.tight * designSystem.typography.fontSize.lg,
    },
    bookAuthor: {
        marginBottom: designSystem.spacing.sm,
    },
    genreTag: {
        alignSelf: 'flex-start',
        backgroundColor: `${designSystem.colors.primary}15`,
        paddingHorizontal: designSystem.spacing.sm,
        paddingVertical: designSystem.spacing.xs,
        borderRadius: designSystem.borderRadius.md,
        marginBottom: designSystem.spacing.md,
    },
    genreText: {
        fontSize: designSystem.typography.fontSize.xs,
        color: designSystem.colors.primary,
        fontWeight: designSystem.typography.fontWeight.semibold,
    },
    bookFooter: {
        marginTop: designSystem.spacing.xs,
    },
    readStatus: {
        flex: 1,
    },
    readBadge: {
        backgroundColor: `${designSystem.colors.success}15`,
        paddingHorizontal: designSystem.spacing.sm,
        paddingVertical: designSystem.spacing.xs,
        borderRadius: designSystem.borderRadius.md,
        alignSelf: 'flex-start',
    },
    readBadgeText: {
        fontSize: designSystem.typography.fontSize.xs,
        color: designSystem.colors.success,
        fontWeight: designSystem.typography.fontWeight.semibold,
    },
    markReadButton: {
        backgroundColor: designSystem.colors.accent,
        paddingHorizontal: designSystem.spacing.sm,
        paddingVertical: designSystem.spacing.xs,
        borderRadius: designSystem.borderRadius.md,
        alignSelf: 'flex-start',
    },
    markReadText: {
        fontSize: designSystem.typography.fontSize.xs,
        color: designSystem.colors.surface,
        fontWeight: designSystem.typography.fontWeight.semibold,
    },
    moreButton: {
        width: 32,
        height: 32,
        borderRadius: designSystem.borderRadius.lg,
        backgroundColor: designSystem.colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        flex: 1,
        paddingHorizontal: designSystem.spacing['4xl'],
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: designSystem.borderRadius.full,
        backgroundColor: designSystem.colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: designSystem.spacing['2xl'],
    },
    emptyTitle: {
        textAlign: 'center',
        marginBottom: designSystem.spacing.md,
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: designSystem.spacing['4xl'],
    },
    emptyStateButton: {
        minWidth: 200,
    },
});