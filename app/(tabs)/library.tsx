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
import { Book, Search, Filter, Library, CircleCheck as CheckCircle, Circle, BookmarkPlus } from 'lucide-react-native';
import { database, BookRecord } from '@/utils/database';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2;

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
                loadData(); // Reload all data to get updated counts
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
            await loadData(); // Refresh the list
        } catch (error) {
            console.error('Error updating read status:', error);
        }
    };

    const toggleToReadStatus = async (book: BookRecord) => {
        try {
            await database.updateBookToReadStatus(book.id, !book.isToRead);
            await loadData(); // Refresh the list
        } catch (error) {
            console.error('Error updating to-read status:', error);
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
                        onPress={ () => toggleToReadStatus(item) }
                    >
                        <BookmarkPlus size={ 20 } color={ item.isToRead ? '#f59e0b' : '#ffffff' } />
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
                <View style={ styles.libraryTag }>
                    <Library size={ 12 } color="#1e40af" />
                    <Text style={ styles.libraryTagText }>{item.libraryName}</Text>
                </View>
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
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <View style={ styles.headerContent }>
                <Text style={ styles.headerTitle }>
                    {selectedLibrary || 'All Libraries'}
                </Text>
                <Text style={ styles.headerSubtitle }>
                    {books.length} book{books.length !== 1 ? 's' : ''} recognised
                </Text>
            </View>
            <View style={ styles.headerActions }>
                <TouchableOpacity style={ styles.headerButton }>
                    <Search size={ 20 } color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity style={ styles.headerButton }>
                    <Filter size={ 20 } color="#6b7280" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderLibraryFilter = () => (
        <View style={ styles.filterSection }>
            <FlatList
                horizontal
                data={ [{ id: 'all', name: 'All Libraries', bookCount: books.length }, ...libraries] }
                renderItem={ ({ item }) => (
                    <TouchableOpacity
                        style={ [
                            styles.filterChip,
                            (item.id === 'all' ? !selectedLibrary : selectedLibrary === item.name) && styles.activeFilterChip,
                        ] }
                        onPress={ () => handleLibraryFilter(item.id === 'all' ? null : item.name) }
                    >
                        <Text style={ [
                            styles.filterChipText,
                            (item.id === 'all' ? !selectedLibrary : selectedLibrary === item.name) && styles.activeFilterChipText,
                        ] }
                        >
                            {item.name} ({item.bookCount})
                        </Text>
                    </TouchableOpacity>
                ) }
                keyExtractor={ item => item.id }
                showsHorizontalScrollIndicator={ false }
                contentContainerStyle={ styles.filterList }
            />
        </View>
    );

    const renderEmptyState = () => (
        <View style={ styles.emptyState }>
            <Book size={ 64 } color="#d1d5db" />
            <Text style={ styles.emptyTitle }>No Books Yet</Text>
            <Text style={ styles.emptySubtitle }>
                Take a photo of your bookshelf to start building your digital library
            </Text>
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
                    data={ books }
                    renderItem={ renderBookCard }
                    keyExtractor={ item => item.id }
                    numColumns={ 2 }
                    contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
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
    headerActions: {
        flexDirection: 'row',
        alignItems   : 'center',
        gap          : 12,
    },
    headerButton: {
        width          : 40,
        height         : 40,
        borderRadius   : 20,
        backgroundColor: '#f3f4f6',
        alignItems     : 'center',
        justifyContent : 'center',
    },
    filterSection: {
        backgroundColor  : '#ffffff',
        paddingVertical  : 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    filterList: { paddingHorizontal: 24 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical  : 8,
        borderRadius     : 20,
        backgroundColor  : '#f3f4f6',
        marginRight      : 12,
    },
    activeFilterChip: { backgroundColor: '#1e40af' },
    filterChipText  : {
        fontSize  : 14,
        fontWeight: '600',
        color     : '#6b7280',
    },
    activeFilterChipText: { color: '#ffffff' },
    listContainer       : { padding: 24 },
    row                 : { justifyContent: 'space-between' },
    bookCard            : {
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
    libraryTag: {
        flexDirection    : 'row',
        alignItems       : 'center',
        backgroundColor  : '#f0f9ff',
        paddingHorizontal: 8,
        paddingVertical  : 4,
        borderRadius     : 6,
        alignSelf        : 'flex-start',
        marginBottom     : 12,
    },
    libraryTagText: {
        fontSize  : 10,
        color     : '#1e40af',
        fontWeight: '600',
        marginLeft: 4,
    },
    bookMetadata: {
        flexDirection : 'row',
        alignItems    : 'center',
        justifyContent: 'space-between',
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
