import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, Plus, BookOpen } from 'lucide-react-native';
import { lookupBookManually, lookupBookByISBN, RecognisedBook } from '@/utils/bookRecognition';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, getCommonStyles } from '@/styling/theme';

export default function ManualBookLookupScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'title' | 'isbn'>('title');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<RecognisedBook[]>([]);
    const [selectedBooks, setSelectedBooks] = useState<RecognisedBook[]>([]);
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            Alert.alert('Error', 'Please enter a search term');
            return;
        }

        setIsLoading(true);
        try {
            let result: RecognisedBook | null = null;

            if (searchType === 'isbn') {
                result = await lookupBookByISBN(searchQuery.trim());
            } else {
                result = await lookupBookManually(searchQuery.trim());
            }

            if (result) {
                setSearchResults([result]);
            } else {
                setSearchResults([]);
                Alert.alert('No Results', 'No books found matching your search');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to search for books. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBook = (book: RecognisedBook) => {
        const isAlreadySelected = selectedBooks.some(b => b.id === book.id);
        if (isAlreadySelected) {
            Alert.alert('Book Already Added', 'This book is already in your selection');
            return;
        }

        setSelectedBooks([...selectedBooks, book]);
        Alert.alert('Book Added', `${book.title} has been added to your selection`);
    };

    const handleRemoveBook = (bookId: string) => {
        setSelectedBooks(selectedBooks.filter(book => book.id !== bookId));
    };

    const handleContinue = () => {
        if (selectedBooks.length === 0) {
            Alert.alert('No Books Selected', 'Please add at least one book to continue');
            return;
        }

        router.push({
            pathname: '/(tabs)/library',
            params: { manualBooks: JSON.stringify(selectedBooks) }
        });
    };

    const renderSearchResult = (book: RecognisedBook) => (
        <View key={book.id} style={[commonStyles.card, styles.searchResult]}>
            <View style={commonStyles.row}>
                <Image source={{ uri: book.coverUrl }} style={styles.bookCover} />
                <View style={styles.bookDetails}>
                    <Text style={[commonStyles.subtitle, styles.bookTitle]} numberOfLines={2}>
                        {book.title}
                    </Text>
                    <Text style={[commonStyles.caption, styles.bookAuthor]} numberOfLines={1}>
                        by {book.author}
                    </Text>
                    {book.genre && (
                        <Text style={styles.bookGenre}>{book.genre}</Text>
                    )}
                    {book.publishedYear && (
                        <Text style={[commonStyles.caption, styles.bookYear]}>{book.publishedYear}</Text>
                    )}
                    {book.description && (
                        <Text style={[commonStyles.caption, styles.bookDescription]} numberOfLines={2}>
                            {book.description}
                        </Text>
                    )}
                </View>
            </View>
      
            <TouchableOpacity
                style={[commonStyles.primaryButton, styles.addButton]}
                onPress={() => handleAddBook(book)}
            >
                <Plus size={16} color={theme.colors.surface} />
                <Text style={[commonStyles.primaryButtonText, { marginLeft: theme.spacing.xs }]}>Add</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSelectedBook = (book: RecognisedBook) => (
        <View key={book.id} style={[commonStyles.card, styles.selectedBook]}>
            <View style={commonStyles.row}>
                <Image source={{ uri: book.coverUrl }} style={styles.selectedBookCover} />
                <View style={styles.selectedBookDetails}>
                    <Text style={[commonStyles.body, styles.selectedBookTitle]} numberOfLines={1}>
                        {book.title}
                    </Text>
                    <Text style={[commonStyles.caption, styles.selectedBookAuthor]} numberOfLines={1}>
                        by {book.author}
                    </Text>
                </View>
            </View>
      
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveBook(book.id)}
            >
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
            <View style={[commonStyles.header, { paddingTop: insets.top + theme.spacing.xl }]}>
                <View style={commonStyles.spaceBetween}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={commonStyles.headerTitle}>Add Book Manually</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[commonStyles.section]}>
                    <Text style={[commonStyles.subtitle, styles.sectionTitle]}>Search for Books</Text>
          
                    <View style={styles.searchTypeToggle}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                searchType === 'title' && styles.activeToggleButton
                            ]}
                            onPress={() => setSearchType('title')}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                searchType === 'title' && styles.activeToggleButtonText
                            ]}>
                                Title/Author
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                searchType === 'isbn' && styles.activeToggleButton
                            ]}
                            onPress={() => setSearchType('isbn')}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                searchType === 'isbn' && styles.activeToggleButtonText
                            ]}>
                                ISBN
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={commonStyles.row}>
                        <TextInput
                            style={[styles.searchInput, { flex: 1, marginRight: theme.spacing.md }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={searchType === 'isbn' ? 'Enter ISBN' : 'Enter book title or author'}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            style={[commonStyles.primaryButton, styles.searchButton, isLoading && styles.disabledButton]}
                            onPress={handleSearch}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={theme.colors.surface} />
                            ) : (
                                <Search size={20} color={theme.colors.surface} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {searchResults.length > 0 && (
                    <View style={commonStyles.section}>
                        <Text style={[commonStyles.subtitle, styles.sectionTitle]}>Search Results</Text>
                        {searchResults.map(renderSearchResult)}
                    </View>
                )}

                {selectedBooks.length > 0 && (
                    <View style={commonStyles.section}>
                        <Text style={[commonStyles.subtitle, styles.sectionTitle]}>
                            Selected Books ({selectedBooks.length})
                        </Text>
                        {selectedBooks.map(renderSelectedBook)}
                    </View>
                )}
            </ScrollView>

            {selectedBooks.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={[commonStyles.primaryButton, styles.continueButton]} onPress={handleContinue}>
                        <BookOpen size={20} color={theme.colors.surface} />
                        <Text style={[commonStyles.primaryButtonText, { marginLeft: theme.spacing.sm }]}>
                            Continue with {selectedBooks.length} Book{selectedBooks.length !== 1 ? 's' : ''}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: theme.spacing.xl,
    },
    sectionTitle: {
        marginBottom: theme.spacing.lg,
    },
    searchTypeToggle: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center',
    },
    activeToggleButton: {
        backgroundColor: theme.colors.surface,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    toggleButtonText: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.textSecondary,
    },
    activeToggleButtonText: {
        color: theme.colors.textPrimary,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        backgroundColor: theme.colors.surface,
    },
    searchButton: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: theme.colors.textMuted,
    },
    searchResult: {
        marginBottom: theme.spacing.md,
    },
    bookCover: {
        width: 60,
        height: 80,
        borderRadius: theme.borderRadius.sm,
        marginRight: theme.spacing.md,
        backgroundColor: theme.colors.surfaceSecondary,
    },
    bookDetails: {
        flex: 1,
    },
    bookTitle: {
        marginBottom: theme.spacing.xs,
    },
    bookAuthor: {
        marginBottom: theme.spacing.xs,
    },
    bookGenre: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.medium,
        marginBottom: theme.spacing.xs,
    },
    bookYear: {
        marginBottom: theme.spacing.xs,
    },
    bookDescription: {
        lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    selectedBook: {
        marginBottom: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectedBookCover: {
        width: 40,
        height: 50,
        borderRadius: theme.borderRadius.xs,
        marginRight: theme.spacing.md,
        backgroundColor: theme.colors.surfaceSecondary,
    },
    selectedBookDetails: {
        flex: 1,
    },
    selectedBookTitle: {
        marginBottom: theme.spacing.xs,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    selectedBookAuthor: {
        // Uses default caption styles
    },
    removeButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: `${theme.colors.error}15`,
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    removeButtonText: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.error,
    },
    footer: {
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});