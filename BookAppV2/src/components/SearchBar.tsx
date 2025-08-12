import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useContext, useState, useRef, useEffect } from "react";
import { View, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity, Dimensions, Keyboard } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { searchBooksForList, Book, SearchResponse } from "@/utils/service/bookService";

const { width: screenWidth } = Dimensions.get('window');

interface SearchBarProps {
    onBookSelect?: (book: Book) => void;
    onCameraOption?: () => void;
    style?: any;
}

export function SearchBar({ onBookSelect, onCameraOption, style }: SearchBarProps) {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Search books query
    const { data: searchResults, isLoading, error } = useQuery({
        queryKey: ['books', searchQuery],
        queryFn: () => searchBooksForList(searchQuery),
        enabled: searchQuery.length > 2 && isInputFocused,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });

    // Show modal when input is focused
    useEffect(() => {
        if (isInputFocused) {
            setIsModalVisible(true);
        } else {
            // Delay hiding modal to allow for touch interactions
            const timer = setTimeout(() => {
                setIsModalVisible(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isInputFocused]);

    // Handle keyboard events
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setIsInputFocused(false);
        });

        return () => {
            keyboardDidHideListener?.remove();
        };
    }, []);

    // Handle input focus
    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    // Handle input blur
    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    // Handle search query change
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    // Handle book selection
    const handleBookSelect = (book: Book) => {
        console.log('Selected book:', book);
        if (onBookSelect) {
            onBookSelect(book);
        }
        setIsModalVisible(false);
        setIsInputFocused(false);
        inputRef.current?.blur();
    };

    // Handle camera option
    const handleCameraOption = () => {
        console.log('Camera option selected');
        if (onCameraOption) {
            onCameraOption();
        }
        setIsModalVisible(false);
        setIsInputFocused(false);
        inputRef.current?.blur();
    };

    const renderBookItem = ({ item }: { item: Book }) => (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={() => handleBookSelect(item)}
        >
            <View style={styles.bookInfo}>
                <ThemedText style={styles.bookTitle} numberOfLines={2}>
                    {item.volumeInfo.title}
                </ThemedText>
                {item.volumeInfo.authors && (
                    <ThemedText style={styles.bookAuthor} numberOfLines={1}>
                        {item.volumeInfo.authors.join(', ')}
                    </ThemedText>
                )}
                {item.volumeInfo.publishedDate && (
                    <ThemedText style={styles.bookYear}>
                        {new Date(item.volumeInfo.publishedDate).getFullYear()}
                    </ThemedText>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={[styles.container, style]}>
            {/* Search Input */}
            <View style={[
                styles.searchContainer, 
                isInputFocused && {
                    borderColor: theme.colors.primary,
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                }
            ]}>
                <MaterialCommunityIcons 
                    name="magnify" 
                    size={20} 
                    color={theme.colors.onSurface} 
                    style={styles.searchIcon}
                />
                <TextInput
                    ref={inputRef}
                    style={[styles.searchInput, { color: theme.colors.onSurface }]}
                    placeholder="Search for a book"
                    placeholderTextColor={theme.colors.onSurface + '80'}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    returnKeyType="search"
                />
            </View>

            {/* Search Modal */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        setIsModalVisible(false);
                        setIsInputFocused(false);
                        inputRef.current?.blur();
                    }}
                >
                    <View style={styles.modalContent}>
                        {/* Search Results Section */}
                        <View style={styles.resultsSection}>
                            <ThemedText style={styles.sectionTitle}>
                                Search Results
                            </ThemedText>
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ThemedText>Searching...</ThemedText>
                                </View>
                            ) : error ? (
                                <View style={styles.errorContainer}>
                                    <ThemedText style={styles.errorText}>Error loading results</ThemedText>
                                </View>
                            ) : searchQuery.length > 2 ? (
                                searchResults?.items && searchResults.items.length > 0 ? (
                                    <FlatList
                                        data={searchResults.items}
                                        renderItem={renderBookItem}
                                        keyExtractor={(item) => item.id}
                                        showsVerticalScrollIndicator={false}
                                        style={styles.resultsList}
                                    />
                                ) : (
                                    <View style={styles.noResultsContainer}>
                                        <ThemedText>No books found</ThemedText>
                                    </View>
                                )
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <ThemedText>Start typing to search for books</ThemedText>
                                </View>
                            )}
                        </View>

                        {/* Camera Section */}
                        <View style={styles.cameraSection}>
                            <TouchableOpacity
                                style={styles.cameraOption}
                                onPress={handleCameraOption}
                            >
                                <MaterialCommunityIcons 
                                    name="camera" 
                                    size={24} 
                                    color={theme.colors.primary} 
                                />
                                <ThemedText style={styles.cameraText}>
                                    Take a picture to add books to your library
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 80, // Position below the header
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: screenWidth * 0.9,
        maxHeight: screenWidth * 0.8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    resultsSection: {
        padding: 16,
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    resultsList: {
        flexGrow: 0, // Prevent FlatList from growing
    },
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
    },
    placeholderContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 8,
        marginBottom: 4,
    },
    bookInfo: {
        marginLeft: 10,
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    bookAuthor: {
        fontSize: 14,
        color: '#666',
    },
    bookYear: {
        fontSize: 14,
        color: '#999',
    },
    cameraSection: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#f8f9fa',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    cameraOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    cameraText: {
        marginLeft: 10,
        fontSize: 16,
    },
});
