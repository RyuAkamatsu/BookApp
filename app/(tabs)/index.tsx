import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image, RefreshCw, CircleCheck as CheckCircle, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { recogniseBooksFromImage, RecognisedBook } from '@/utils/bookRecognition';
import LibrarySelectionModal from '@/components/LibrarySelectionModal';
import RecognisedBooksModal from '@/components/RecognisedBooksModal';
import { database } from '@/utils/database';
import { theme, bookCornerStyles } from '@/utils/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CameraTab() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [recognisedBooks, setRecognisedBooks] = useState<RecognisedBook[]>([]);
    const [libraries, setLibraries] = useState<any[]>([]);
    const [showRecognisedBooksModal, setShowRecognisedBooksModal] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadLibraries();
    }, []);

    const loadLibraries = async () => {
        try {
            const libs = await database.getLibraries();
            setLibraries(libs);
        } catch (error) {
            console.error('Error loading libraries:', error);
        }
    };

    if (!permission) {
        return <View style={ styles.container } />;
    }

    if (!permission.granted) {
        return (
            <View style={ styles.permissionContainer }>
                <View style={ styles.permissionIconContainer }>
                    <Camera size={ 64 } color={ theme.colors.primary } />
                </View>
                <Text style={ styles.permissionTitle }>Camera Access Needed</Text>
                <Text style={ styles.permissionMessage }>
                    We need access to your camera to scan bookshelves and recognise books.
                </Text>
                <TouchableOpacity style={ styles.permissionButton } onPress={ requestPermission }>
                    <Text style={ styles.permissionButtonText }>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current && !isProcessing) {
            setIsProcessing(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        
                if (photo) {
                    await processImage(photo.uri);
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to take picture. Please try again.');
                setIsProcessing(false);
            }
        }
    };

    const pickImage = async () => {
        if (isProcessing) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes   : ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect       : [4, 3],
            quality      : 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setIsProcessing(true);
            await processImage(result.assets[0].uri);
        }
    };

    const processImage = async (imageUri: string) => {
        try {
            const books = await recogniseBooksFromImage(imageUri);
            setRecognisedBooks(books);
            setIsProcessing(false);
      
            // Show recognised books modal first
            setShowRecognisedBooksModal(true);
      
        } catch (error) {
            Alert.alert('Error', 'Failed to process image. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleRecognisedBooksConfirm = (books: RecognisedBook[]) => {
        setRecognisedBooks(books);
        setShowRecognisedBooksModal(false);
        setShowLibraryModal(true);
    };

    const handleLibrarySelection = (libraryName: string) => {
        saveBooksToLibrary(libraryName);
    };

    const saveBooksToLibrary = async (libraryName: string) => {
        try {
            // Add books to database with library name
            const booksToAdd = recognisedBooks.map(book => ({
                id           : book.id,
                title        : book.title,
                author       : book.author,
                series       : book.series,
                seriesNumber : book.seriesNumber,
                coverUrl     : book.coverUrl,
                genre        : book.genre,
                publishedYear: book.publishedYear,
                description  : book.description,
                isbn         : book.isbn,
                libraryName,
            }));
      
            const savedBooks = await database.addBooks(booksToAdd);
      
            // Update libraries state
            await loadLibraries();
      
            // Navigate to library with the new books
            router.push({
                pathname: '/library',
                params  : {
                    newBooks       : JSON.stringify(savedBooks),
                    selectedLibrary: libraryName
                }
            });
      
            // Reset state
            setRecognisedBooks([]);
            setShowLibraryModal(false);
        } catch (error) {
            console.error('Error saving books:', error);
            Alert.alert('Error', 'Failed to save books. Please try again.');
        }
    };

    const handleCreateLibrary = async (libraryName: string) => {
        try {
            await database.createLibrary(libraryName);
            await loadLibraries();
        } catch (error) {
            console.error('Error creating library:', error);
            Alert.alert('Error', 'Failed to create library. Please try again.');
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={ styles.headerTitle }>Bookshelf Scanner</Text>
                <Text style={ styles.headerSubtitle }>
                    Point your camera at a bookshelf to identify books
                </Text>
            </View>

            <View style={ styles.cameraContainer }>
                <CameraView
                    ref={ cameraRef }
                    style={ styles.camera }
                    facing={ facing }
                >
                    <View style={ styles.cameraOverlay }>
                        <View style={ styles.guidanceFrame } />
                        <Text style={ styles.guidanceText }>
                            Frame your bookshelf within the guide
                        </Text>
                    </View>
                </CameraView>
            </View>

            {isProcessing && (
                <View style={ styles.processingOverlay }>
                    <View style={ styles.processingCard }>
                        <ActivityIndicator size="large" color="#8B4513" />
                        <Text style={ styles.processingText }>Analyzing books...</Text>
                        <Text style={ styles.processingSubtext }>
                            This may take a few moments
                        </Text>
                    </View>
                </View>
            )}

            <View style={[styles.controls, { marginBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    style={ styles.secondaryButton }
                    onPress={ pickImage }
                    disabled={ isProcessing }
                >
                    <Image size={ 24 } color={ isProcessing ? '#9ca3af' : '#374151' } />
                    <Text style={ [styles.secondaryButtonText, isProcessing && styles.disabledText] }>
                        Gallery
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={ [styles.captureButton, isProcessing && styles.disabledButton] }
                    onPress={ takePicture }
                    disabled={ isProcessing }
                >
                    <Camera size={ 32 } color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={ styles.secondaryButton }
                    onPress={ toggleCameraFacing }
                    disabled={ isProcessing }
                >
                    <RefreshCw size={ 24 } color={ isProcessing ? '#9ca3af' : '#374151' } />
                    <Text style={ [styles.secondaryButtonText, isProcessing && styles.disabledText] }>
                        Flip
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.manualAddSection, { marginBottom: insets.bottom + 10 }]}>
                <TouchableOpacity
                    style={ styles.manualAddButton }
                    onPress={ () => router.push('/manual-book-lookup' as any) }
                >
                    <BookOpen size={ 20 } color="#1e40af" />
                    <Text style={ styles.manualAddButtonText }>Add Book Manually</Text>
                </TouchableOpacity>
            </View>

            <RecognisedBooksModal
                isVisible={ showRecognisedBooksModal }
                onClose={ () => {
                    setShowRecognisedBooksModal(false);
                    setRecognisedBooks([]);
                } }
                onConfirm={ handleRecognisedBooksConfirm }
                books={ recognisedBooks }
            />

            <LibrarySelectionModal
                isVisible={ showLibraryModal }
                onClose={ () => {
                    setShowLibraryModal(false);
                    setRecognisedBooks([]);
                } }
                onSelectLibrary={ handleLibrarySelection }
                libraries={ libraries }
                onCreateLibrary={ handleCreateLibrary }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex           : 1,
        backgroundColor: theme.colors.background,
    },
    permissionContainer: {
        flex           : 1,
        alignItems     : 'center',
        justifyContent : 'center',
        backgroundColor: theme.colors.background,
        padding        : theme.spacing.xl,
    },
    permissionIconContainer: {
        width          : 120,
        height         : 120,
        borderRadius   : 60,
        backgroundColor: '#F5F1EB',
        alignItems     : 'center',
        justifyContent : 'center',
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 2 },
        shadowOpacity  : 0.15,
        shadowRadius   : 4,
        elevation      : 4,
        borderWidth    : 2,
        borderColor    : '#D7CCC8',
    },
    permissionTitle: {
        fontSize    : 24,
        fontWeight  : '700',
        color       : '#2D1810',
        marginTop   : 24,
        marginBottom: 16,
        textAlign   : 'center',
    },
    permissionMessage: {
        fontSize    : 16,
        color       : '#5D4037',
        textAlign   : 'center',
        lineHeight  : 24,
        marginBottom: 32,
    },
    permissionButton: {
        backgroundColor  : '#8B4513',
        paddingHorizontal: 32,
        paddingVertical  : 16,
        borderRadius     : 12,
        shadowColor      : '#2D1810',
        shadowOffset     : { width: 0, height: 1 },
        shadowOpacity    : 0.1,
        shadowRadius     : 2,
        elevation        : 2,
    },
    permissionButtonText: {
        color     : '#FFFFFF',
        fontSize  : 16,
        fontWeight: '600',
    },
    header: {
        paddingTop       : 60,
        paddingHorizontal: 24,
        paddingBottom    : 24,
        backgroundColor  : '#FDF8F3',
        borderBottomWidth: 1,
        borderBottomColor: '#D7CCC8',
    },
    headerTitle: {
        fontSize    : 28,
        fontWeight  : '700',
        color       : '#2D1810',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize  : 16,
        color     : '#5D4037',
        lineHeight: 22,
    },
    cameraContainer: {
        flex           : 1,
        margin         : 24,
        borderRadius   : 16,
        overflow       : 'hidden',
        backgroundColor: '#000000',
        shadowColor    : '#2D1810',
        shadowOffset   : { width: 0, height: 4 },
        shadowOpacity  : 0.2,
        shadowRadius   : 8,
        elevation      : 8,
    },
    camera       : { flex: 1 },
    cameraOverlay: {
        flex          : 1,
        justifyContent: 'center',
        alignItems    : 'center',
    },
    guidanceFrame: {
        width       : screenWidth * 0.7,
        height      : screenHeight * 0.3,
        borderWidth : 3,
        borderColor : '#DAA520',
        borderStyle : 'dashed',
        borderRadius: 12,
        marginBottom: 24,
    },
    guidanceText: {
        color            : '#FFFFFF',
        fontSize         : 16,
        fontWeight       : '600',
        textAlign        : 'center',
        backgroundColor  : 'rgba(139, 69, 19, 0.8)',
        paddingHorizontal: 16,
        paddingVertical  : 8,
        borderRadius     : 8,
    },
    controls: {
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'space-between',
        paddingHorizontal: 24,
        paddingVertical  : 32,
        backgroundColor  : '#FDF8F3',
        borderTopWidth   : 1,
        borderTopColor   : '#D7CCC8',
    },
    captureButton: {
        width          : 80,
        height         : 80,
        borderRadius   : 40,
        backgroundColor: '#8B4513',
        alignItems     : 'center',
        justifyContent : 'center',
        shadowColor    : '#2D1810',
        shadowOffset   : {
            width : 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius : 8,
        elevation    : 8,
    },
    disabledButton: {
        backgroundColor: '#A1887F',
        shadowOpacity  : 0.1,
    },
    secondaryButton: {
        alignItems       : 'center',
        justifyContent   : 'center',
        paddingVertical  : 12,
        paddingHorizontal: 16,
        borderRadius     : 12,
        backgroundColor  : '#F5F1EB',
        borderWidth      : 1,
        borderColor      : '#D7CCC8',
    },
    secondaryButtonText: {
        fontSize  : 12,
        fontWeight: '600',
        color     : '#5D4037',
        marginTop : 4,
    },
    disabledText     : { color: '#A1887F' },
    processingOverlay: {
        position       : 'absolute',
        top            : 0,
        left           : 0,
        right          : 0,
        bottom         : 0,
        backgroundColor: 'rgba(45, 24, 16, 0.8)',
        alignItems     : 'center',
        justifyContent : 'center',
        zIndex         : 1000,
    },
    processingCard: {
        backgroundColor : '#FDF8F3',
        padding         : 32,
        borderRadius    : 16,
        alignItems      : 'center',
        maxWidth        : 280,
        marginHorizontal: 24,
        shadowColor     : '#2D1810',
        shadowOffset    : { width: 0, height: 4 },
        shadowOpacity   : 0.2,
        shadowRadius    : 8,
        elevation       : 8,
        borderWidth     : 2,
        borderColor     : '#DAA520',
    },
    processingText: {
        fontSize    : 18,
        fontWeight  : '600',
        color       : '#2D1810',
        marginTop   : 16,
        marginBottom: 8,
    },
    processingSubtext: {
        fontSize : 14,
        color    : '#5D4037',
        textAlign: 'center',
    },
    manualAddSection: {
        paddingHorizontal: 24,
        paddingBottom    : 24,
        backgroundColor  : '#FDF8F3',
        borderTopWidth   : 1,
        borderTopColor   : '#D7CCC8',
    },
    manualAddButton: {
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'center',
        paddingVertical  : 16,
        paddingHorizontal: 24,
        borderRadius     : 12,
        backgroundColor  : '#F5F1EB',
        gap              : 8,
        borderWidth      : 2,
        borderColor      : '#DAA520',
        shadowColor      : '#2D1810',
        shadowOffset     : { width: 0, height: 2 },
        shadowOpacity    : 0.1,
        shadowRadius     : 4,
        elevation        : 4,
    },
    manualAddButtonText: {
        fontSize  : 16,
        fontWeight: '600',
        color     : '#8B4513',
    },
});
