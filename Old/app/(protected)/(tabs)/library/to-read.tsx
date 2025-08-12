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
import { useTheme, getCommonStyles } from '@/styling/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function ToReadTab() {
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);
    const styles = getStyles(theme);
    const cardWidth = (screenWidth - (theme.spacing.xl * 2) - theme.spacing.md) / 2;
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
            pathname: '/(protected)/[bookId]',
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
                    <Star size={12} color={theme.colors.accent} fill={theme.colors.accent} />
                    <Text style={styles.ratingText}>4.2</Text>
                </View>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromToRead(item)}
                >
                    <BookmarkMinus size={16} color={theme.colors.surface} />
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

    const renderEmptyState = () => (
        <View style={[commonStyles.center, styles.emptyState]}>
            <View style={styles.emptyStateIcon}>
                <BookmarkMinus size={48} color={theme.colors.textMuted} />
            </View>
            <Text style={[commonStyles.title, styles.emptyTitle]}>No Books to Read</Text>
            <Text style={[commonStyles.body, styles.emptySubtitle]}>
                Books you want to read will appear here. Add books to your reading list from your library.
            </Text>
            <TouchableOpacity 
                style={[commonStyles.primaryButton, styles.emptyStateButton]}
                onPress={() => router.push('/(tabs)/library')}
            >
                <Text style={commonStyles.primaryButtonText}>Browse My Books</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
            <View style={[commonStyles.header, { paddingTop: insets.top + getCommonStyles(theme).spacing.xl }]}>
                <View style={commonStyles.spaceBetween}>
                    <View style={{ flex: 1 }}>
                        <Text style={commonStyles.headerTitle}>Want to Read</Text>
                        <Text style={commonStyles.headerSubtitle}>
                            {books.length} book{books.length !== 1 ? 's' : ''} in your reading list
                        </Text>
                    </View>
                    <View style={commonStyles.row}>
                        <TouchableOpacity style={[styles.headerButton, { marginRight: getCommonStyles(theme).spacing.md }]}>
                            <Search size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton}>
                            <Filter size={20} color={theme.colors.textSecondary} />
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

const getStyles = (theme: any) => StyleSheet.create({
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: getCommonStyles(useTheme()).borderRadius.full,
        backgroundColor: getCommonStyles(useTheme()).colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
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
    removeButton: {
        position: 'absolute',
        top: getCommonStyles(useTheme()).spacing.sm,
        right: getCommonStyles(useTheme()).spacing.sm,
        width: 32,
        height: 32,
        borderRadius: getCommonStyles(useTheme()).borderRadius.lg,
        backgroundColor: 'rgba(244, 67, 54, 0.9)',
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