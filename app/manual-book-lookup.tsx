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

// Cozy Book Corner Colors
const colors = {
    primary         : '#8B4513',
    background      : '#FDF8F3',
    surface         : '#FFFFFF',
    surfaceSecondary: '#F5F1EB',
    textPrimary     : '#2D1810',
    textSecondary   : '#5D4037',
    textMuted       : '#8D6E63',
    border          : '#D7CCC8',
    borderLight     : '#EFEBE9',
    bookGold        : '#DAA520',
    bookRed         : '#8B0000',
    bookPurple      : '#4A148C',
    success         : '#2E7D32',
    warning         : '#F57C00',
    error           : '#D32F2F',
};

export default function ManualBookLookupScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'title' | 'isbn'>('title');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<RecognisedBook[]>([]);
    const [selectedBooks, setSelectedBooks] = useState<RecognisedBook[]>([]);

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

        // Navigate to library selection with the selected books
        router.push({
            pathname: '/(tabs)/library',
            params  : { manualBooks: JSON.stringify(selectedBooks) }
        });
    };

    const renderSearchResult = (book: RecognisedBook) => (
        <View key={ book.id } style={ styles.searchResult }>
            <View style={ styles.bookInfo }>
                <Image source={{ uri: book.coverUrl }} style={ styles.bookCover } />
                <View style={ styles.bookDetails }>
                    <Text style={ styles.bookTitle } numberOfLines={ 2 }>
                        {book.title}
                    </Text>
                    <Text style={ styles.bookAuthor } numberOfLines={ 1 }>
                        by {book.author}
                    </Text>
                    {book.genre && (
                        <Text style={ styles.bookGenre }>{book.genre}</Text>
                    )}
                    {book.publishedYear && (
                        <Text style={ styles.bookYear }>{book.publishedYear}</Text>
                    )}
                    {book.description && (
                        <Text style={ styles.bookDescription } numberOfLines={ 2 }>
                            {book.description}
                        </Text>
                    )}
                </View>
            </View>
      
            <TouchableOpacity
                style={ styles.addButton }
                onPress={ () => handleAddBook(book) }
            >
                <Plus size={ 20 } color="#ffffff" />
                <Text style={ styles.addButtonText }>Add</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSelectedBook = (book: RecognisedBook) => (
        <View key={ book.id } style={ styles.selectedBook }>
            <View style={ styles.selectedBookInfo }>
                <Image source={{ uri: book.coverUrl }} style={ styles.selectedBookCover } />
                <View style={ styles.selectedBookDetails }>
                    <Text style={ styles.selectedBookTitle } numberOfLines={ 1 }>
                        {book.title}
                    </Text>
                    <Text style={ styles.selectedBookAuthor } numberOfLines={ 1 }>
                        by {book.author}
                    </Text>
                </View>
            </View>
      
            <TouchableOpacity
                style={ styles.removeButton }
                onPress={ () => handleRemoveBook(book.id) }
            >
                <Text style={ styles.removeButtonText }>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={ styles.container }>
            <View style={ styles.header }>
                <TouchableOpacity style={ styles.backButton } onPress={ () => router.back() }>
                    <ArrowLeft size={ 24 } color="#1f2937" />
                </TouchableOpacity>
                <Text style={ styles.headerTitle }>Add Book Manually</Text>
                <View style={ styles.placeholder } />
            </View>

            <ScrollView style={ styles.content } showsVerticalScrollIndicator={ false }>
                <View style={ styles.searchSection }>
                    <Text style={ styles.sectionTitle }>Search for Books</Text>
          
                    <View style={ styles.searchTypeToggle }>
                        <TouchableOpacity
                            style={ [
                                styles.toggleButton,
                                searchType === 'title' && styles.activeToggleButton
                            ] }
                            onPress={ () => setSearchType('title') }
                        >
                            <Text style={ [
                                styles.toggleButtonText,
                                searchType === 'title' && styles.activeToggleButtonText
                            ] }
                            >
                                Title/Author
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={ [
                                styles.toggleButton,
                                searchType === 'isbn' && styles.activeToggleButton
                            ] }
                            onPress={ () => setSearchType('isbn') }
                        >
                            <Text style={ [
                                styles.toggleButtonText,
                                searchType === 'isbn' && styles.activeToggleButtonText
                            ] }
                            >
                                ISBN
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={ styles.searchInputContainer }>
                        <TextInput
                            style={ styles.searchInput }
                            value={ searchQuery }
                            onChangeText={ setSearchQuery }
                            placeholder={ searchType === 'isbn' ? 'Enter ISBN' : 'Enter book title or author' }
                            autoCapitalize="words"
                            autoCorrect={ false }
                        />
                        <TouchableOpacity
                            style={ [styles.searchButton, isLoading && styles.disabledButton] }
                            onPress={ handleSearch }
                            disabled={ isLoading }
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Search size={ 20 } color="#ffffff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {searchResults.length > 0 && (
                    <View style={ styles.resultsSection }>
                        <Text style={ styles.sectionTitle }>Search Results</Text>
                        {searchResults.map(renderSearchResult)}
                    </View>
                )}

                {selectedBooks.length > 0 && (
                    <View style={ styles.selectedSection }>
                        <Text style={ styles.sectionTitle }>
                            Selected Books ({selectedBooks.length})
                        </Text>
                        {selectedBooks.map(renderSelectedBook)}
                    </View>
                )}
            </ScrollView>

            {selectedBooks.length > 0 && (
                <View style={ styles.footer }>
                    <TouchableOpacity style={ styles.continueButton } onPress={ handleContinue }>
                        <BookOpen size={ 20 } color="#ffffff" />
                        <Text style={ styles.continueButtonText }>
                            Continue with {selectedBooks.length} Book{selectedBooks.length !== 1 ? 's' : ''}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex           : 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'space-between',
        paddingTop       : 60,
        paddingHorizontal: 24,
        paddingBottom    : 16,
        backgroundColor  : colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton : { padding: 8 },
    headerTitle: {
        fontSize  : 18,
        fontWeight: '600',
        color     : colors.textPrimary,
    },
    placeholder: { width: 40 },
    content    : {
        flex   : 1,
        padding: 24,
    },
    searchSection: { marginBottom: 32 },
    sectionTitle : {
        fontSize    : 18,
        fontWeight  : '600',
        color       : colors.textPrimary,
        marginBottom: 16,
    },
    searchTypeToggle: {
        flexDirection  : 'row',
        backgroundColor: colors.surfaceSecondary,
        borderRadius   : 8,
        padding        : 4,
        marginBottom   : 16,
        borderWidth    : 1,
        borderColor    : colors.border,
    },
    toggleButton: {
        flex             : 1,
        paddingVertical  : 8,
        paddingHorizontal: 16,
        borderRadius     : 6,
        alignItems       : 'center',
    },
    activeToggleButton: {
        backgroundColor: colors.surface,
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 1 },
        shadowOpacity  : 0.1,
        shadowRadius   : 2,
        elevation      : 2,
        borderWidth    : 1,
        borderColor    : colors.border,
    },
    toggleButtonText: {
        fontSize  : 14,
        fontWeight: '500',
        color     : colors.textSecondary,
    },
    activeToggleButtonText: { color: colors.textPrimary },
    searchInputContainer  : {
        flexDirection: 'row',
        gap          : 12,
    },
    searchInput: {
        flex             : 1,
        borderWidth      : 1,
        borderColor      : colors.border,
        borderRadius     : 12,
        paddingHorizontal: 16,
        paddingVertical  : 12,
        fontSize         : 16,
        backgroundColor  : colors.surface,
    },
    searchButton: {
        width          : 48,
        height         : 48,
        borderRadius   : 12,
        backgroundColor: colors.primary,
        alignItems     : 'center',
        justifyContent : 'center',
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 2 },
        shadowOpacity  : 0.1,
        shadowRadius   : 4,
        elevation      : 4,
    },
    disabledButton: { backgroundColor: colors.textMuted },
    resultsSection: { marginBottom: 32 },
    searchResult  : {
        backgroundColor: colors.surface,
        padding        : 16,
        borderRadius   : 12,
        marginBottom   : 12,
        flexDirection  : 'row',
        alignItems     : 'center',
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 2 },
        shadowOpacity  : 0.1,
        shadowRadius   : 4,
        elevation      : 4,
        borderWidth    : 1,
        borderColor    : colors.border,
    },
    bookInfo: {
        flex         : 1,
        flexDirection: 'row',
        marginRight  : 12,
    },
    bookCover: {
        width       : 60,
        height      : 80,
        borderRadius: 6,
        marginRight : 12,
    },
    bookDetails: { flex: 1 },
    bookTitle  : {
        fontSize    : 16,
        fontWeight  : '600',
        color       : colors.textPrimary,
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize    : 14,
        color       : colors.textSecondary,
        marginBottom: 4,
    },
    bookGenre: {
        fontSize    : 12,
        color       : colors.primary,
        fontWeight  : '500',
        marginBottom: 2,
    },
    bookYear: {
        fontSize    : 12,
        color       : colors.textSecondary,
        marginBottom: 4,
    },
    bookDescription: {
        fontSize  : 12,
        color     : colors.textSecondary,
        lineHeight: 16,
    },
    addButton: {
        flexDirection    : 'row',
        alignItems       : 'center',
        backgroundColor  : colors.success,
        paddingHorizontal: 12,
        paddingVertical  : 8,
        borderRadius     : 8,
        gap              : 4,
        shadowColor      : '#2D1810',
        shadowOffset     : { width: 0, height: 1 },
        shadowOpacity    : 0.1,
        shadowRadius     : 2,
        elevation        : 2,
    },
    addButtonText: {
        fontSize  : 14,
        fontWeight: '500',
        color     : '#ffffff',
    },
    selectedSection: { marginBottom: 32 },
    selectedBook   : {
        backgroundColor: colors.surface,
        padding        : 12,
        borderRadius   : 12,
        marginBottom   : 8,
        flexDirection  : 'row',
        alignItems     : 'center',
        justifyContent : 'space-between',
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 1 },
        shadowOpacity  : 0.1,
        shadowRadius   : 2,
        elevation      : 2,
        borderWidth    : 1,
        borderColor    : colors.border,
    },
    selectedBookInfo: {
        flexDirection: 'row',
        alignItems   : 'center',
        flex         : 1,
    },
    selectedBookCover: {
        width       : 40,
        height      : 50,
        borderRadius: 4,
        marginRight : 12,
    },
    selectedBookDetails: { flex: 1 },
    selectedBookTitle  : {
        fontSize    : 14,
        fontWeight  : '600',
        color       : colors.textPrimary,
        marginBottom: 2,
    },
    selectedBookAuthor: {
        fontSize: 12,
        color   : colors.textSecondary,
    },
    removeButton: {
        paddingHorizontal: 12,
        paddingVertical  : 6,
        borderRadius     : 6,
        backgroundColor  : '#fef2f2',
        borderWidth      : 1,
        borderColor      : colors.error,
    },
    removeButtonText: {
        fontSize  : 12,
        fontWeight: '500',
        color     : colors.error,
    },
    footer: {
        padding        : 24,
        backgroundColor: colors.surface,
        borderTopWidth : 1,
        borderTopColor : colors.border,
    },
    continueButton: {
        flexDirection  : 'row',
        alignItems     : 'center',
        justifyContent : 'center',
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius   : 12,
        gap            : 8,
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 2 },
        shadowOpacity  : 0.1,
        shadowRadius   : 4,
        elevation      : 4,
    },
    continueButtonText: {
        fontSize  : 16,
        fontWeight: '600',
        color     : colors.surface,
    },
});
