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
import { Book, Search, Filter, Library, Star, BookmarkPlus, MoveHorizontal as MoreHorizontal, Camera } from 'lucide-react-native';
import { database, BookRecord } from '@/utils/database';
import { useTheme, getCommonStyles } from '@/styling/theme';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - (getCommonStyles(useTheme()).spacing.xl * 2) - getCommonStyles(useTheme()).spacing.md) / 2;

interface LibraryInfo {
  id: string;
  name: string;
  bookCount: number;
}

export default function LibraryTab() {
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);
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

    const handleScanPress = () => {
        router.push('/(tabs)/index');
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
                    <Star size={12} color={theme.colors.accent} fill={theme.colors.accent} />
                    <Text style={styles.ratingText}>4.2</Text>
                </View>
                <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => toggleToReadStatus(item)}
                >
                    <BookmarkPlus 
                        size={16} 
                        color={item.isToRead ? theme.colors.accent : theme.colors.surface} 
                        fill={item.isToRead ? theme.colors.accent : 'transparent'}
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
                        <MoreHorizontal size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={[commonStyles.header, { paddingTop: insets.top + getCommonStyles(theme).spacing.xl }]}>
            <View style={commonStyles.spaceBetween}>
                <View style={{ flex: 1 }}>
                    <Text style={commonStyles.headerTitle}>My Books</Text>
                    <Text style={commonStyles.headerSubtitle}>
                        {books.length} book{books.length !== 1 ? 's' : ''} in your library
                    </Text>
                </View>
                <View style={commonStyles.row}>
                    <TouchableOpacity 
                        style={[styles.headerButton, { marginRight: getCommonStyles(theme).spacing.md }]}
                        onPress={handleScanPress}
                    >
                        <Camera size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerButton, { marginRight: getCommonStyles(theme).spacing.md }]}>
                        <Search size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Filter size={20} color={theme.colors.textSecondary} />
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
                                ? theme.colors.surface 
                                : theme.colors.primary
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
                <Book size={48} color={theme.colors.textMuted} />
            </View>
            <Text style={[commonStyles.title, styles.emptyTitle]}>No Books Yet</Text>
            <Text style={[commonStyles.body, styles.emptySubtitle]}>
                Start building your digital library by scanning books or adding them manually
            </Text>
            <TouchableOpacity 
                style={[commonStyles.primaryButton, styles.emptyStateButton]}
                onPress={handleScanPress}
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
                    contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + getCommonStyles(theme).spacing.xl }]}
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
        borderRadius: getCommonStyles(useTheme()).borderRadius.full,
        backgroundColor: getCommonStyles(useTheme()).colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterSection: {
        backgroundColor: getCommonStyles(useTheme()).colors.surface,
        paddingVertical: getCommonStyles(useTheme()).spacing.lg,
        marginBottom: getCommonStyles(useTheme()).spacing.sm,
    },
    filterList: {
        paddingHorizontal: getCommonStyles(useTheme()).spacing.xl,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getCommonStyles(useTheme()).spacing.lg,
        paddingVertical: getCommonStyles(useTheme()).spacing.md,
        borderRadius: getCommonStyles(useTheme()).borderRadius.xl,
        backgroundColor: getCommonStyles(useTheme()).colors.surfaceSecondary,
        marginRight: getCommonStyles(useTheme()).spacing.md,
        borderWidth: 1,
        borderColor: getCommonStyles(useTheme()).colors.border,
        gap: getCommonStyles(useTheme()).spacing.xs,
    },
    activeFilterChip: {
        backgroundColor: getCommonStyles(useTheme()).colors.primary,
        borderColor: getCommonStyles(useTheme()).colors.primary,
    },
    filterChipText: {
        fontSize: getCommonStyles(useTheme()).typography.fontSize.sm,
        fontWeight: getCommonStyles(useTheme()).typography.fontWeight.semibold,
        color: getCommonStyles(useTheme()).colors.primary,
    },
    activeFilterChipText: {
        color: getCommonStyles(useTheme()).colors.surface,
    },
    filterChipBadge: {
        backgroundColor: getCommonStyles(useTheme()).colors.border,
        paddingHorizontal: getCommonStyles(useTheme()).spacing.xs,
        paddingVertical: 2,
        borderRadius: getCommonStyles(useTheme()).borderRadius.sm,
        minWidth: 20,
        alignItems: 'center',
    },
    activeFilterChipBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    filterChipBadgeText: {
        fontSize: getCommonStyles(useTheme()).typography.fontSize.xs,
        fontWeight: getCommonStyles(useTheme()).typography.fontWeight.semibold,
        color: getCommonStyles(useTheme()).colors.primary,
    },
    activeFilterChipBadgeText: {
        color: getCommonStyles(useTheme()).colors.surface,
    },
    listContainer: {
        padding: getCommonStyles(useTheme()).spacing.xl,
    },
    row: {
        justifyContent: 'space-between',
    },
    bookCard: {
        width: cardWidth,
        marginBottom: getCommonStyles(useTheme()).spacing.xl,
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
        backgroundColor: getCommonStyles(useTheme()).colors.surfaceSecondary,
    },
    ratingOverlay: {
        position: 'absolute',
        top: getCommonStyles(useTheme()).spacing.sm,
        left: getCommonStyles(useTheme()).spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: getCommonStyles(useTheme()).spacing.xs,
        paddingVertical: getCommonStyles(useTheme()).spacing.xs,
        borderRadius: getCommonStyles(useTheme()).borderRadius.md,
        gap: getCommonStyles(useTheme()).spacing.xs,
    },
    ratingText: {
        color: getCommonStyles(useTheme()).colors.surface,
        fontSize: getCommonStyles(useTheme()).typography.fontSize.xs,
        fontWeight: getCommonStyles(useTheme()).typography.fontWeight.semibold,
    },
    bookmarkButton: {
        position: 'absolute',
        top: getCommonStyles(useTheme()).spacing.sm,
        right: getCommonStyles(useTheme()).spacing.sm,
        width: 32,
        height: 32,
        borderRadius: getCommonStyles(useTheme()).borderRadius.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookInfo: {
        padding: getCommonStyles(useTheme()).spacing.md,
    },
    bookTitle: {
        marginBottom: getCommonStyles(useTheme()).spacing.xs,
        lineHeight: getCommonStyles(useTheme()).typography.lineHeight.tight * getCommonStyles(useTheme()).typography.fontSize.lg,
    },
    bookAuthor: {
        marginBottom: getCommonStyles(useTheme()).spacing.sm,
    },
    genreTag: {
        alignSelf: 'flex-start',
        backgroundColor: `${getCommonStyles(useTheme()).colors.primary}15`,
        paddingHorizontal: getCommonStyles(useTheme()).spacing.sm,
        paddingVertical: getCommonStyles(useTheme()).spacing.xs,
        borderRadius: getCommonStyles(useTheme()).borderRadius.md,
        marginBottom: getCommonStyles(useTheme()).spacing.md,
    },
    genreText: {
        fontSize: getCommonStyles(useTheme()).typography.fontSize.xs,
        color: getCommonStyles(useTheme()).colors.primary,
        fontWeight: getCommonStyles(useTheme()).typography.fontWeight.semibold,
    },
    bookFooter: {
        marginTop: getCommonStyles(useTheme()).spacing.xs,
    },
    readStatus: {
        flex: 1,
    },
    readBadge: {
        backgroundColor: `${getCommonStyles(useTheme()).colors.success}15`,
        paddingHorizontal: getCommonStyles(useTheme()).spacing.sm,
        paddingVertical: getCommonStyles(useTheme()).spacing.xs,
        borderRadius: getCommonStyles(useTheme()).borderRadius.md,
        alignSelf: 'flex-start',
    },
    readBadgeText: {
        fontSize: getCommonStyles(useTheme()).typography.fontSize.xs,
        color: getCommonStyles(useTheme()).colors.success,
        fontWeight: getCommonStyles(useTheme()).typography.fontWeight.semibold,
    },
    markReadButton: {
        backgroundColor: getCommonStyles(useTheme()).colors.accent,
        paddingHorizontal: getCommonStyles(useTheme()).spacing.sm,
        paddingVertical: getCommonStyles(useTheme()).spacing.xs,
        borderRadius: getCommonStyles(useTheme()).borderRadius.md,
        alignSelf: 'flex-start',
    },
    markReadText: {
        fontSize: getCommonStyles(useTheme()).typography.fontSize.xs,
        color: getCommonStyles(useTheme()).colors.surface,
        fontWeight: getCommonStyles(useTheme()).typography.fontWeight.semibold,
    },
    moreButton: {
        width: 32,
        height: 32,
        borderRadius: getCommonStyles(useTheme()).borderRadius.lg,
        backgroundColor: getCommonStyles(useTheme()).colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        flex: 1,
        paddingHorizontal: getCommonStyles(useTheme()).spacing['4xl'],
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: getCommonStyles(useTheme()).borderRadius.full,
        backgroundColor: getCommonStyles(useTheme()).colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: getCommonStyles(useTheme()).spacing['2xl'],
    },
    emptyTitle: {
        textAlign: 'center',
        marginBottom: getCommonStyles(useTheme()).spacing.md,
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: getCommonStyles(useTheme()).spacing['4xl'],
    },
    emptyStateButton: {
        minWidth: 200,
    },
});