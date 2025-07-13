import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { X, Edit3, Check, AlertCircle, BookOpen } from 'lucide-react-native';
import { RecognisedBook, lookupBookManually, lookupBookByISBN } from '@/utils/bookRecognition';

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

interface RecognisedBooksModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (books: RecognisedBook[]) => void;
  books: RecognisedBook[];
}

export default function RecognisedBooksModal({
    isVisible,
    onClose,
    onConfirm,
    books,
}: RecognisedBooksModalProps) {
    const [editingBook, setEditingBook] = useState<RecognisedBook | null>(null);
    const [editedBooks, setEditedBooks] = useState<RecognisedBook[]>(books);
    const [isLoading, setIsLoading] = useState(false);

    const handleEditBook = (book: RecognisedBook) => {
        setEditingBook(book);
    };

    const handleSaveBook = async (book: RecognisedBook, title: string, author: string) => {
        setIsLoading(true);
        try {
            // Try to lookup the book with new title/author
            const updatedBook = await lookupBookManually(title, author);
      
            if (updatedBook) {
                const updatedBooks = editedBooks.map(b => (b.id === book.id ? updatedBook : b));
                setEditedBooks(updatedBooks);
                setEditingBook(null);
            } else {
                // If lookup fails, update with manual data
                const manualBook: RecognisedBook = {
                    ...book,
                    title,
                    author,
                    confidence: 0.5, // Medium confidence for manual entry
                    source    : 'fallback',
                };
        
                const updatedBooks = editedBooks.map(b => (b.id === book.id ? manualBook : b));
                setEditedBooks(updatedBooks);
                setEditingBook(null);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update book details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveBook = (bookId: string) => {
        const updatedBooks = editedBooks.filter(book => book.id !== bookId);
        setEditedBooks(updatedBooks);
    };

    const handleConfirm = () => {
        onConfirm(editedBooks);
        setEditedBooks(books); // Reset to original state
        setEditingBook(null);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return colors.success; // Green
        if (confidence >= 0.6) return colors.warning; // Orange
        return colors.error; // Red
    };

    const getConfidenceText = (confidence: number) => {
        if (confidence >= 0.8) return 'High';
        if (confidence >= 0.6) return 'Medium';
        return 'Low';
    };

    const renderBookItem = (book: RecognisedBook) => {
        const isEditing = editingBook?.id === book.id;
    
        return (
            <View key={ book.id } style={ styles.bookItem }>
                <View style={ styles.bookHeader }>
                    <View style={ styles.bookInfo }>
                        <Text style={ styles.bookTitle } numberOfLines={ 2 }>
                            {book.title}
                        </Text>
                        <Text style={ styles.bookAuthor } numberOfLines={ 1 }>
                            by {book.author}
                        </Text>
                        {book.genre && (
                            <Text style={ styles.bookGenre }>{book.genre}</Text>
                        )}
                    </View>
          
                    <View style={ styles.bookActions }>
                        <View style={ styles.confidenceBadge }>
                            <Text style={ [styles.confidenceText, { color: getConfidenceColor(book.confidence) }] }>
                                {getConfidenceText(book.confidence)}
                            </Text>
                        </View>
            
                        <TouchableOpacity
                            style={ styles.editButton }
                            onPress={ () => handleEditBook(book) }
                        >
                            <Edit3 size={ 16 } color="#6b7280" />
                        </TouchableOpacity>
            
                        <TouchableOpacity
                            style={ styles.removeButton }
                            onPress={ () => handleRemoveBook(book.id) }
                        >
                            <X size={ 16 } color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {isEditing && (
                    <BookEditForm
                        book={ book }
                        onSave={ handleSaveBook }
                        onCancel={ () => setEditingBook(null) }
                        isLoading={ isLoading }
                    />
                )}

                {book.description && !isEditing && (
                    <Text style={ styles.bookDescription } numberOfLines={ 2 }>
                        {book.description}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={ isVisible }
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={ styles.container }>
                <View style={ styles.header }>
                    <View style={ styles.headerContent }>
                        <BookOpen size={ 24 } color={ colors.primary } />
                        <Text style={ styles.headerTitle }>Recognised Books</Text>
                    </View>
                    <TouchableOpacity style={ styles.closeButton } onPress={ onClose }>
                        <X size={ 24 } color={ colors.textMuted } />
                    </TouchableOpacity>
                </View>

                <ScrollView style={ styles.content } showsVerticalScrollIndicator={ false }>
                    {editedBooks.length === 0 ? (
                        <View style={ styles.emptyState }>
                            <AlertCircle size={ 48 } color={ colors.textMuted } />
                            <Text style={ styles.emptyStateText }>No books recognised</Text>
                            <Text style={ styles.emptyStateSubtext }>
                                Try taking a clearer photo of your bookshelf
                            </Text>
                        </View>
                    ) : (
                        <>
                            <View style={ styles.legend }>
                                <Text style={ styles.legendTitle }>Confidence Levels:</Text>
                                <View style={ styles.legendItems }>
                                    <View style={ styles.legendItem }>
                                        <View style={ [styles.legendDot, { backgroundColor: '#10b981' }] } />
                                        <Text style={ styles.legendText }>High (80%+)</Text>
                                    </View>
                                    <View style={ styles.legendItem }>
                                        <View style={ [styles.legendDot, { backgroundColor: '#f59e0b' }] } />
                                        <Text style={ styles.legendText }>Medium (60-79%)</Text>
                                    </View>
                                    <View style={ styles.legendItem }>
                                        <View style={ [styles.legendDot, { backgroundColor: '#ef4444' }] } />
                                        <Text style={ styles.legendText }>Low (&lt;60%)</Text>
                                    </View>
                                </View>
                            </View>

                            {editedBooks.map(renderBookItem)}
                        </>
                    )}
                </ScrollView>

                {editedBooks.length > 0 && (
                    <View style={ styles.footer }>
                        <TouchableOpacity style={ styles.cancelButton } onPress={ onClose }>
                            <Text style={ styles.cancelButtonText }>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={ styles.confirmButton } onPress={ handleConfirm }>
                            <Text style={ styles.confirmButtonText }>
                                Add {editedBooks.length} Book{editedBooks.length !== 1 ? 's' : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
}

interface BookEditFormProps {
  book: RecognisedBook;
  onSave: (book: RecognisedBook, title: string, author: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function BookEditForm({ book, onSave, onCancel, isLoading }: BookEditFormProps) {
    const [title, setTitle] = useState(book.title);
    const [author, setAuthor] = useState(book.author);

    const handleSave = () => {
        if (!title.trim() || !author.trim()) {
            Alert.alert('Error', 'Please enter both title and author');
            return;
        }
        onSave(book, title.trim(), author.trim());
    };

    return (
        <View style={ styles.editForm }>
            <TextInput
                style={ styles.editInput }
                value={ title }
                onChangeText={ setTitle }
                placeholder="Book title"
                autoCapitalize="words"
            />
            <TextInput
                style={ styles.editInput }
                value={ author }
                onChangeText={ setAuthor }
                placeholder="Author name"
                autoCapitalize="words"
            />
      
            <View style={ styles.editActions }>
                <TouchableOpacity style={ styles.cancelEditButton } onPress={ onCancel }>
                    <Text style={ styles.cancelEditButtonText }>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={ [styles.saveEditButton, isLoading && styles.disabledButton] }
                    onPress={ handleSave }
                    disabled={ isLoading }
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Check size={ 16 } color="#ffffff" />
                    )}
                    <Text style={ styles.saveEditButtonText }>Save</Text>
                </TouchableOpacity>
            </View>
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
    headerContent: {
        flexDirection: 'row',
        alignItems   : 'center',
    },
    headerTitle: {
        fontSize  : 20,
        fontWeight: '700',
        color     : colors.textPrimary,
        marginLeft: 12,
    },
    closeButton: { padding: 8 },
    content    : {
        flex   : 1,
        padding: 24,
    },
    legend: {
        backgroundColor: colors.surface,
        padding        : 16,
        borderRadius   : 12,
        marginBottom   : 16,
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 2 },
        shadowOpacity  : 0.1,
        shadowRadius   : 4,
        elevation      : 4,
        borderWidth    : 1,
        borderColor    : colors.border,
    },
    legendTitle: {
        fontSize    : 14,
        fontWeight  : '600',
        color       : colors.textPrimary,
        marginBottom: 8,
    },
    legendItems: { gap: 8 },
    legendItem : {
        flexDirection: 'row',
        alignItems   : 'center',
    },
    legendDot: {
        width       : 8,
        height      : 8,
        borderRadius: 4,
        marginRight : 8,
    },
    legendText: {
        fontSize: 12,
        color   : colors.textSecondary,
    },
    bookItem: {
        backgroundColor: colors.surface,
        padding        : 16,
        borderRadius   : 12,
        marginBottom   : 12,
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 2 },
        shadowOpacity  : 0.1,
        shadowRadius   : 4,
        elevation      : 4,
        borderWidth    : 1,
        borderColor    : colors.border,
    },
    bookHeader: {
        flexDirection : 'row',
        justifyContent: 'space-between',
        alignItems    : 'flex-start',
    },
    bookInfo: {
        flex       : 1,
        marginRight: 12,
    },
    bookTitle: {
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
        fontSize  : 12,
        color     : colors.primary,
        fontWeight: '500',
    },
    bookActions: {
        alignItems: 'center',
        gap       : 8,
    },
    confidenceBadge: {
        paddingHorizontal: 8,
        paddingVertical  : 4,
        borderRadius     : 12,
        backgroundColor  : colors.surfaceSecondary,
        borderWidth      : 1,
        borderColor      : colors.border,
    },
    confidenceText: {
        fontSize  : 10,
        fontWeight: '600',
    },
    editButton     : { padding: 4 },
    removeButton   : { padding: 4 },
    bookDescription: {
        fontSize  : 12,
        color     : colors.textSecondary,
        marginTop : 8,
        lineHeight: 16,
    },
    editForm: {
        marginTop      : 12,
        padding        : 12,
        backgroundColor: colors.surfaceSecondary,
        borderRadius   : 8,
        borderWidth    : 1,
        borderColor    : colors.border,
    },
    editInput: {
        borderWidth      : 1,
        borderColor      : colors.border,
        borderRadius     : 8,
        paddingHorizontal: 12,
        paddingVertical  : 8,
        fontSize         : 14,
        backgroundColor  : colors.surface,
        marginBottom     : 8,
    },
    editActions: {
        flexDirection: 'row',
        gap          : 8,
    },
    cancelEditButton: {
        flex             : 1,
        paddingVertical  : 8,
        paddingHorizontal: 12,
        borderRadius     : 6,
        backgroundColor  : colors.surfaceSecondary,
        alignItems       : 'center',
        borderWidth      : 1,
        borderColor      : colors.border,
    },
    cancelEditButtonText: {
        fontSize  : 14,
        fontWeight: '500',
        color     : colors.textSecondary,
    },
    saveEditButton: {
        flex             : 1,
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'center',
        paddingVertical  : 8,
        paddingHorizontal: 12,
        borderRadius     : 6,
        backgroundColor  : colors.primary,
        gap              : 4,
    },
    saveEditButtonText: {
        fontSize  : 14,
        fontWeight: '500',
        color     : colors.surface,
    },
    disabledButton: { backgroundColor: colors.textMuted },
    emptyState    : {
        alignItems     : 'center',
        justifyContent : 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize    : 18,
        fontWeight  : '600',
        color       : colors.textPrimary,
        marginTop   : 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize : 14,
        color    : colors.textSecondary,
        textAlign: 'center',
    },
    footer: {
        flexDirection  : 'row',
        padding        : 24,
        backgroundColor: colors.surface,
        borderTopWidth : 1,
        borderTopColor : colors.border,
        gap            : 12,
    },
    cancelButton: {
        flex           : 1,
        paddingVertical: 16,
        borderRadius   : 12,
        backgroundColor: colors.surfaceSecondary,
        alignItems     : 'center',
        borderWidth    : 1,
        borderColor    : colors.border,
    },
    cancelButtonText: {
        fontSize  : 16,
        fontWeight: '600',
        color     : colors.textSecondary,
    },
    confirmButton: {
        flex           : 1,
        paddingVertical: 16,
        borderRadius   : 12,
        backgroundColor: colors.primary,
        alignItems     : 'center',
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 2 },
        shadowOpacity  : 0.1,
        shadowRadius   : 4,
        elevation      : 4,
    },
    confirmButtonText: {
        fontSize  : 16,
        fontWeight: '600',
        color     : colors.surface,
    },
});
