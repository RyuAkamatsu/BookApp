import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { Plus, BookOpen, Check } from 'lucide-react-native';

interface Library {
  id: string;
  name: string;
  bookCount: number;
}

interface LibrarySelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectLibrary: (libraryName: string) => void;
  libraries: Library[];
  onCreateLibrary: (libraryName: string) => void;
}

export default function LibrarySelectionModal({
    isVisible,
    onClose,
    onSelectLibrary,
    libraries,
    onCreateLibrary,
}: LibrarySelectionModalProps) {
    const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newLibraryName, setNewLibraryName] = useState('');

    const handleSave = () => {
        if (isCreatingNew) {
            if (newLibraryName.trim()) {
                onCreateLibrary(newLibraryName.trim());
                onSelectLibrary(newLibraryName.trim());
                resetModal();
            } else {
                Alert.alert('Error', 'Please enter a library name');
            }
        } else if (selectedLibrary) {
            onSelectLibrary(selectedLibrary);
            resetModal();
        } else {
            Alert.alert('Error', 'Please select a library');
        }
    };

    const resetModal = () => {
        setSelectedLibrary(null);
        setIsCreatingNew(false);
        setNewLibraryName('');
        onClose();
    };

    const handleCreateNew = () => {
        setIsCreatingNew(true);
        setSelectedLibrary(null);
    };

    const handleSelectExisting = (libraryName: string) => {
        setSelectedLibrary(libraryName);
        setIsCreatingNew(false);
    };

    return (
        <Modal
            isVisible={ isVisible }
            onBackdropPress={ resetModal }
            onSwipeComplete={ resetModal }
            swipeDirection="down"
            style={ styles.modal }
            backdropOpacity={ 0.5 }
            animationIn="slideInUp"
            animationOut="slideOutDown"
        >
            <View style={ styles.modalContent }>
                <View style={ styles.modalHeader }>
                    <View style={ styles.modalHandle } />
                    <Text style={ styles.modalTitle }>Save to Library</Text>
                    <Text style={ styles.modalSubtitle }>
                        Choose where to save your scanned books
                    </Text>
                </View>

                <ScrollView style={ styles.modalBody } showsVerticalScrollIndicator={ false }>
                    {/* Create New Library Option */}
                    <TouchableOpacity
                        style={ [
                            styles.libraryOption,
                            isCreatingNew && styles.selectedOption,
                        ] }
                        onPress={ handleCreateNew }
                        activeOpacity={ 0.7 }
                    >
                        <View style={ styles.libraryOptionLeft }>
                            <View style={ [styles.libraryIcon, styles.newLibraryIcon] }>
                                <Plus size={ 20 } color="#ffffff" />
                            </View>
                            <View style={ styles.libraryInfo }>
                                <Text style={ styles.libraryName }>Create New Library</Text>
                                <Text style={ styles.libraryDescription }>
                                    Start a new collection
                                </Text>
                            </View>
                        </View>
                        {isCreatingNew && (
                            <View style={ styles.checkIcon }>
                                <Check size={ 20 } color="#1e40af" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* New Library Name Input */}
                    {isCreatingNew && (
                        <View style={ styles.newLibraryInput }>
                            <TextInput
                                style={ styles.textInput }
                                placeholder="Enter library name"
                                value={ newLibraryName }
                                onChangeText={ setNewLibraryName }
                                autoFocus
                                maxLength={ 50 }
                            />
                        </View>
                    )}

                    {/* Existing Libraries */}
                    {libraries.length > 0 && (
                        <>
                            <View style={ styles.sectionDivider }>
                                <Text style={ styles.sectionTitle }>Existing Libraries</Text>
                            </View>

                            {libraries.map(library => (
                                <TouchableOpacity
                                    key={ library.id }
                                    style={ [
                                        styles.libraryOption,
                                        selectedLibrary === library.name && styles.selectedOption,
                                    ] }
                                    onPress={ () => handleSelectExisting(library.name) }
                                    activeOpacity={ 0.7 }
                                >
                                    <View style={ styles.libraryOptionLeft }>
                                        <View style={ styles.libraryIcon }>
                                            <BookOpen size={ 20 } color="#1e40af" />
                                        </View>
                                        <View style={ styles.libraryInfo }>
                                            <Text style={ styles.libraryName }>{library.name}</Text>
                                            <Text style={ styles.libraryDescription }>
                                                {library.bookCount} book{library.bookCount !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    {selectedLibrary === library.name && (
                                        <View style={ styles.checkIcon }>
                                            <Check size={ 20 } color="#1e40af" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </ScrollView>

                <View style={ styles.modalFooter }>
                    <TouchableOpacity
                        style={ styles.cancelButton }
                        onPress={ resetModal }
                        activeOpacity={ 0.7 }
                    >
                        <Text style={ styles.cancelButtonText }>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={ [
                            styles.saveButton,
                            (!selectedLibrary && !isCreatingNew) && styles.disabledButton,
                        ] }
                        onPress={ handleSave }
                        activeOpacity={ 0.7 }
                        disabled={ !selectedLibrary && !isCreatingNew }
                    >
                        <Text style={ styles.saveButtonText }>Save Books</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin        : 0,
    },
    modalContent: {
        backgroundColor     : '#ffffff',
        borderTopLeftRadius : 20,
        borderTopRightRadius: 20,
        maxHeight           : '80%',
        minHeight           : '50%',
    },
    modalHeader: {
        alignItems       : 'center',
        paddingTop       : 12,
        paddingHorizontal: 24,
        paddingBottom    : 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalHandle: {
        width          : 40,
        height         : 4,
        backgroundColor: '#d1d5db',
        borderRadius   : 2,
        marginBottom   : 16,
    },
    modalTitle: {
        fontSize    : 20,
        fontWeight  : '700',
        color       : '#1f2937',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize : 14,
        color    : '#6b7280',
        textAlign: 'center',
    },
    modalBody: {
        flex             : 1,
        paddingHorizontal: 24,
        paddingTop       : 20,
    },
    libraryOption: {
        flexDirection    : 'row',
        alignItems       : 'center',
        justifyContent   : 'space-between',
        paddingVertical  : 16,
        paddingHorizontal: 16,
        borderRadius     : 12,
        borderWidth      : 2,
        borderColor      : 'transparent',
        backgroundColor  : '#f8fafc',
        marginBottom     : 12,
    },
    selectedOption: {
        borderColor    : '#1e40af',
        backgroundColor: '#eff6ff',
    },
    libraryOptionLeft: {
        flexDirection: 'row',
        alignItems   : 'center',
        flex         : 1,
    },
    libraryIcon: {
        width          : 44,
        height         : 44,
        borderRadius   : 22,
        backgroundColor: '#e0e7ff',
        alignItems     : 'center',
        justifyContent : 'center',
        marginRight    : 16,
    },
    newLibraryIcon: { backgroundColor: '#1e40af' },
    libraryInfo   : { flex: 1 },
    libraryName   : {
        fontSize    : 16,
        fontWeight  : '600',
        color       : '#1f2937',
        marginBottom: 2,
    },
    libraryDescription: {
        fontSize: 14,
        color   : '#6b7280',
    },
    checkIcon: {
        width          : 24,
        height         : 24,
        borderRadius   : 12,
        backgroundColor: '#dbeafe',
        alignItems     : 'center',
        justifyContent : 'center',
    },
    newLibraryInput: {
        marginBottom     : 20,
        paddingHorizontal: 16,
    },
    textInput: {
        borderWidth      : 1,
        borderColor      : '#d1d5db',
        borderRadius     : 8,
        paddingHorizontal: 16,
        paddingVertical  : 12,
        fontSize         : 16,
        backgroundColor  : '#ffffff',
    },
    sectionDivider: { marginVertical: 20 },
    sectionTitle  : {
        fontSize    : 16,
        fontWeight  : '600',
        color       : '#374151',
        marginBottom: 12,
    },
    modalFooter: {
        flexDirection    : 'row',
        paddingHorizontal: 24,
        paddingVertical  : 20,
        borderTopWidth   : 1,
        borderTopColor   : '#f3f4f6',
        gap              : 12,
    },
    cancelButton: {
        flex           : 1,
        paddingVertical: 16,
        borderRadius   : 12,
        backgroundColor: '#f3f4f6',
        alignItems     : 'center',
    },
    cancelButtonText: {
        fontSize  : 16,
        fontWeight: '600',
        color     : '#374151',
    },
    saveButton: {
        flex           : 2,
        paddingVertical: 16,
        borderRadius   : 12,
        backgroundColor: '#1e40af',
        alignItems     : 'center',
    },
    disabledButton: { backgroundColor: '#9ca3af' },
    saveButtonText: {
        fontSize  : 16,
        fontWeight: '600',
        color     : '#ffffff',
    },
});
