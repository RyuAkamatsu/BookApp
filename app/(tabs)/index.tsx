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
import { Camera, Image, RefreshCw, BookOpen, Scan } from 'lucide-react-native';
import { router } from 'expo-router';
import { recogniseBooksFromImage, RecognisedBook } from '@/utils/bookRecognition';
import LibrarySelectionModal from '@/components/LibrarySelectionModal';
import RecognisedBooksModal from '@/components/RecognisedBooksModal';
import LoadingScreen from '@/components/LoadingScreen';
import { database } from '@/utils/database';

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
        return <LoadingScreen visible={true} message="Initializing camera..." />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <Text style={styles.headerTitle}>Scan Books</Text>
                    <Text style={styles.headerSubtitle}>Discover and organize your library</Text>
                </View>
                
                <View style={styles.permissionContainer}>
                    <View style={styles.permissionCard}>
                        <View style={styles.permissionIconContainer}>
                            <Camera size={48} color="#00635D" />
                        </View>
                        <Text style={styles.permissionTitle}>Camera Access Required</Text>
                        <Text style={styles.permissionMessage}>
                            We need camera access to scan your bookshelves and automatically identify books in your collection.
                        </Text>
                        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                            <Text style={styles.permissionButtonText}>Enable Camera</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
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
            const booksToAdd = recognisedBooks.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                series: book.series,
                seriesNumber: book.seriesNumber,
                coverUrl: book.coverUrl,
                genre: book.genre,
                publishedYear: book.publishedYear,
                description: book.description,
                isbn: book.isbn,
                libraryName,
            }));
      
            const savedBooks = await database.addBooks(booksToAdd);
      
            await loadLibraries();
      
            router.push({
                pathname: '/library',
                params: {
                    newBooks: JSON.stringify(savedBooks),
                    selectedLibrary: libraryName
                }
            });
      
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
            <LoadingScreen visible={isProcessing} message="Analyzing your books..." />
            
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.headerTitle}>Scan Books</Text>
                <Text style={styles.headerSubtitle}>Point your camera at books to add them</Text>
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={facing}
                >
                    <View style={styles.cameraOverlay}>
                        <View style={styles.scanFrame}>
                            <View style={styles.scanCorner} />
                            <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
                            <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
                            <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
                        </View>
                        <View style={styles.scanInstructions}>
                            <Scan size={24} color="#FFFFFF" />
                            <Text style={styles.scanText}>Position books within the frame</Text>
                        </View>
                    </View>
                </CameraView>
            </View>

            <View style={styles.controlsContainer}>
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={pickImage}
                        disabled={isProcessing}
                    >
                        <Image size={24} color={isProcessing ? '#999' : '#00635D'} />
                        <Text style={[styles.secondaryButtonText, isProcessing && styles.disabledText]}>
                            Gallery
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.captureButton, isProcessing && styles.disabledButton]}
                        onPress={takePicture}
                        disabled={isProcessing}
                    >
                        <View style={styles.captureButtonInner}>
                            <Camera size={28} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={toggleCameraFacing}
                        disabled={isProcessing}
                    >
                        <RefreshCw size={24} color={isProcessing ? '#999' : '#00635D'} />
                        <Text style={[styles.secondaryButtonText, isProcessing && styles.disabledText]}>
                            Flip
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.manualAddButton}
                    onPress={() => router.push('/manual-book-lookup' as any)}
                >
                    <BookOpen size={20} color="#00635D" />
                    <Text style={styles.manualAddButtonText}>Add Book Manually</Text>
                </TouchableOpacity>
            </View>

            <RecognisedBooksModal
                isVisible={showRecognisedBooksModal}
                onClose={() => {
                    setShowRecognisedBooksModal(false);
                    setRecognisedBooks([]);
                }}
                onConfirm={handleRecognisedBooksConfirm}
                books={recognisedBooks}
            />

            <LibrarySelectionModal
                isVisible={showLibraryModal}
                onClose={() => {
                    setShowLibraryModal(false);
                    setRecognisedBooks([]);
                }}
                onSelectLibrary={handleLibrarySelection}
                libraries={libraries}
                onCreateLibrary={handleCreateLibrary}
            />
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
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#382110',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#8B7355',
        lineHeight: 22,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    permissionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    permissionIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F9F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#382110',
        marginBottom: 12,
        textAlign: 'center',
    },
    permissionMessage: {
        fontSize: 16,
        color: '#8B7355',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    permissionButton: {
        backgroundColor: '#00635D',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#00635D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cameraContainer: {
        flex: 1,
        margin: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: screenWidth * 0.7,
        height: screenHeight * 0.3,
        position: 'relative',
    },
    scanCorner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#F4B942',
        borderWidth: 3,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        top: 0,
        left: 0,
    },
    scanCornerTopRight: {
        top: 0,
        right: 0,
        left: 'auto',
        transform: [{ rotate: '90deg' }],
    },
    scanCornerBottomLeft: {
        bottom: 0,
        left: 0,
        top: 'auto',
        transform: [{ rotate: '-90deg' }],
    },
    scanCornerBottomRight: {
        bottom: 0,
        right: 0,
        top: 'auto',
        left: 'auto',
        transform: [{ rotate: '180deg' }],
    },
    scanInstructions: {
        alignItems: 'center',
        marginTop: 32,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
    },
    scanText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    controlsContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#00635D',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00635D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#00635D',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    disabledButton: {
        backgroundColor: '#B0B0B0',
        shadowOpacity: 0.1,
    },
    secondaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: '#F0F9F8',
        borderWidth: 1,
        borderColor: '#E0F2F1',
        minWidth: 80,
    },
    secondaryButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#00635D',
        marginTop: 4,
    },
    disabledText: {
        color: '#999',
    },
    manualAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: '#F0F9F8',
        borderWidth: 2,
        borderColor: '#00635D',
        gap: 8,
    },
    manualAddButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00635D',
    },
});