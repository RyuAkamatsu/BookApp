import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
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
import { useTheme, getCommonStyles } from '@/styling/theme';

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
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);

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
            <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
                <View style={[commonStyles.header, { paddingTop: insets.top + theme.spacing.xl }]}>
                    <Text style={commonStyles.headerTitle}>Scan Books</Text>
                    <Text style={commonStyles.headerSubtitle}>Discover and organize your library</Text>
                </View>
                
                <View style={styles.permissionContainer}>
                    <View style={[commonStyles.card, styles.permissionCard]}>
                        <View style={styles.permissionIconContainer}>
                            <Camera size={48} color={theme.colors.primary} />
                        </View>
                        <Text style={[commonStyles.title, styles.permissionTitle]}>Camera Access Required</Text>
                        <Text style={[commonStyles.body, styles.permissionMessage]}>
                            We need camera access to scan your bookshelves and automatically identify books in your collection.
                        </Text>
                        <TouchableOpacity style={[commonStyles.primaryButton, styles.permissionButton]} onPress={requestPermission}>
                            <Text style={commonStyles.primaryButtonText}>Enable Camera</Text>
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
        <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
            <LoadingScreen visible={isProcessing} message="Analyzing your books..." />
            
            <View style={[commonStyles.header, { paddingTop: insets.top + theme.spacing.xl }]}>
                <Text style={commonStyles.headerTitle}>Scan Books</Text>
                <Text style={commonStyles.headerSubtitle}>Point your camera at books to add them</Text>
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
                            <Scan size={24} color={theme.colors.surface} />
                            <Text style={styles.scanText}>Position books within the frame</Text>
                        </View>
                    </View>
                </CameraView>
            </View>

            <View style={styles.controlsContainer}>
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[commonStyles.secondaryButton, styles.controlButton]}
                        onPress={pickImage}
                        disabled={isProcessing}
                    >
                        <Image size={20} color={isProcessing ? theme.colors.textMuted : theme.colors.primary} />
                        <Text style={[commonStyles.secondaryButtonText, styles.controlButtonText, isProcessing && styles.disabledText]}>
                            Gallery
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.captureButton, isProcessing && styles.disabledButton]}
                        onPress={takePicture}
                        disabled={isProcessing}
                    >
                        <View style={styles.captureButtonInner}>
                            <Camera size={28} color={theme.colors.surface} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[commonStyles.secondaryButton, styles.controlButton]}
                        onPress={toggleCameraFacing}
                        disabled={isProcessing}
                    >
                        <RefreshCw size={20} color={isProcessing ? theme.colors.textMuted : theme.colors.primary} />
                        <Text style={[commonStyles.secondaryButtonText, styles.controlButtonText, isProcessing && styles.disabledText]}>
                            Flip
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[commonStyles.secondaryButton, styles.manualAddButton]}
                    onPress={() => router.push('/manual-book-lookup' as any)}
                >
                    <BookOpen size={20} color={theme.colors.primary} />
                    <Text style={[commonStyles.secondaryButtonText, { marginLeft: theme.spacing.sm }]}>Add Book Manually</Text>
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
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing['2xl'],
    },
    permissionCard: {
        alignItems: 'center',
        paddingVertical: theme.spacing['4xl'],
    },
    permissionIconContainer: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.full,
        backgroundColor: `${theme.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing['2xl'],
    },
    permissionTitle: {
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    permissionMessage: {
        textAlign: 'center',
        marginBottom: theme.spacing['4xl'],
    },
    permissionButton: {
        minWidth: 160,
    },
    cameraContainer: {
        flex: 1,
        margin: theme.spacing.xl,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        backgroundColor: theme.colors.textPrimary,
        ...theme.shadows.lg,
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
        borderColor: theme.colors.accent,
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
        marginTop: theme.spacing['4xl'],
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.xl,
    },
    scanText: {
        color: theme.colors.surface,
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        marginTop: theme.spacing.sm,
        textAlign: 'center',
    },
    controlsContainer: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.borderRadius['2xl'],
        borderTopRightRadius: theme.borderRadius['2xl'],
        paddingTop: theme.spacing['2xl'],
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
        ...theme.shadows.lg,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
    },
    controlButton: {
        minWidth: 80,
        alignItems: 'center',
    },
    controlButtonText: {
        fontSize: theme.typography.fontSize.sm,
        marginTop: theme.spacing.xs,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.lg,
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: theme.colors.surface,
    },
    disabledButton: {
        backgroundColor: theme.colors.textMuted,
        ...theme.shadows.sm,
    },
    disabledText: {
        color: theme.colors.textMuted,
    },
    manualAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.lg,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
});