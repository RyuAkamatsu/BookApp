import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Plus, Hash, BookOpen, MessageCircle, Heart } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserBookClubs, createBookClub, joinBookClub } from '@/utils/firebase';
import { designSystem, commonStyles } from '@/utils/designSystem';
import Modal from 'react-native-modal';

interface BookClub {
  id: string;
  name: string;
  description: string;
  code: string;
  members: string[];
  recommendations: any[];
}

export default function BookClubTab() {
    const [bookClubs, setBookClubs] = useState<BookClub[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [clubName, setClubName] = useState('');
    const [clubDescription, setClubDescription] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadBookClubs();
    }, []);

    const loadBookClubs = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const result = await getUserBookClubs(user.uid);
            if (result.success) {
                setBookClubs(result.data);
            }
        } catch (error) {
            console.error('Error loading book clubs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClub = async () => {
        if (!user || !clubName.trim()) {
            Alert.alert('Error', 'Please enter a club name');
            return;
        }

        try {
            const result = await createBookClub(user.uid, clubName.trim(), clubDescription.trim());
            if (result.success) {
                Alert.alert(
                    'Club Created!', 
                    `Your book club "${clubName}" has been created with code: ${result.code}`,
                    [{ text: 'OK', onPress: () => {
                        setShowCreateModal(false);
                        setClubName('');
                        setClubDescription('');
                        loadBookClubs();
                    }}]
                );
            } else {
                Alert.alert('Error', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create book club');
        }
    };

    const handleJoinClub = async () => {
        if (!user || !joinCode.trim()) {
            Alert.alert('Error', 'Please enter a club code');
            return;
        }

        try {
            const result = await joinBookClub(user.uid, joinCode.trim());
            if (result.success) {
                Alert.alert(
                    'Joined Club!', 
                    `You've successfully joined "${result.clubName}"`,
                    [{ text: 'OK', onPress: () => {
                        setShowJoinModal(false);
                        setJoinCode('');
                        loadBookClubs();
                    }}]
                );
            } else {
                Alert.alert('Error', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to join book club');
        }
    };

    const renderBookClubCard = (club: BookClub) => (
        <TouchableOpacity key={club.id} style={[commonStyles.card, styles.clubCard]}>
            <View style={styles.clubHeader}>
                <View style={styles.clubIcon}>
                    <Users size={24} color={designSystem.colors.primary} />
                </View>
                <View style={styles.clubInfo}>
                    <Text style={[commonStyles.subtitle, styles.clubName]}>{club.name}</Text>
                    <Text style={[commonStyles.caption, styles.clubDescription]}>{club.description}</Text>
                </View>
                <View style={styles.clubCode}>
                    <Hash size={16} color={designSystem.colors.textSecondary} />
                    <Text style={styles.codeText}>{club.code}</Text>
                </View>
            </View>
            
            <View style={styles.clubStats}>
                <View style={styles.statItem}>
                    <Users size={16} color={designSystem.colors.textSecondary} />
                    <Text style={styles.statText}>{club.members.length} members</Text>
                </View>
                <View style={styles.statItem}>
                    <BookOpen size={16} color={designSystem.colors.textSecondary} />
                    <Text style={styles.statText}>{club.recommendations.length} recommendations</Text>
                </View>
            </View>
            
            {club.recommendations.length > 0 && (
                <View style={styles.recentActivity}>
                    <Text style={[commonStyles.caption, styles.activityTitle]}>Recent Activity</Text>
                    {club.recommendations.slice(0, 2).map((rec, index) => (
                        <View key={index} style={styles.activityItem}>
                            <MessageCircle size={14} color={designSystem.colors.textSecondary} />
                            <Text style={styles.activityText} numberOfLines={1}>
                                New recommendation: {rec.book.title}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={[commonStyles.center, styles.emptyState]}>
            <View style={styles.emptyStateIcon}>
                <Users size={48} color={designSystem.colors.textMuted} />
            </View>
            <Text style={[commonStyles.title, styles.emptyTitle]}>Join the Community</Text>
            <Text style={[commonStyles.body, styles.emptySubtitle]}>
                Create or join a book club to share recommendations and discuss your favorite reads with friends
            </Text>
        </View>
    );

    return (
        <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
            <View style={[commonStyles.header, { paddingTop: insets.top + designSystem.spacing.xl }]}>
                <Text style={commonStyles.headerTitle}>My Book Club</Text>
                <Text style={commonStyles.headerSubtitle}>
                    Connect with fellow readers and share recommendations
                </Text>
            </View>

            <View style={styles.quickActions}>
                <TouchableOpacity 
                    style={[commonStyles.primaryButton, styles.actionButton]}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Plus size={20} color={designSystem.colors.surface} />
                    <Text style={[commonStyles.primaryButtonText, { marginLeft: designSystem.spacing.sm }]}>
                        Create Club
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[commonStyles.secondaryButton, styles.actionButton]}
                    onPress={() => setShowJoinModal(true)}
                >
                    <Hash size={20} color={designSystem.colors.primary} />
                    <Text style={[commonStyles.secondaryButtonText, { marginLeft: designSystem.spacing.sm }]}>
                        Join Club
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {bookClubs.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <View style={styles.clubsList}>
                        <Text style={[commonStyles.subtitle, styles.sectionTitle]}>Your Book Clubs</Text>
                        {bookClubs.map(renderBookClubCard)}
                    </View>
                )}
            </ScrollView>

            {/* Create Club Modal */}
            <Modal
                isVisible={showCreateModal}
                onBackdropPress={() => setShowCreateModal(false)}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <Text style={[commonStyles.title, styles.modalTitle]}>Create Book Club</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Club Name</Text>
                        <TextInput
                            style={styles.input}
                            value={clubName}
                            onChangeText={setClubName}
                            placeholder="Enter club name"
                            maxLength={50}
                        />
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={clubDescription}
                            onChangeText={setClubDescription}
                            placeholder="Describe your book club"
                            multiline
                            numberOfLines={3}
                            maxLength={200}
                        />
                    </View>
                    
                    <View style={styles.modalActions}>
                        <TouchableOpacity 
                            style={[commonStyles.secondaryButton, styles.modalButton]}
                            onPress={() => setShowCreateModal(false)}
                        >
                            <Text style={commonStyles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[commonStyles.primaryButton, styles.modalButton]}
                            onPress={handleCreateClub}
                        >
                            <Text style={commonStyles.primaryButtonText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Join Club Modal */}
            <Modal
                isVisible={showJoinModal}
                onBackdropPress={() => setShowJoinModal(false)}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <Text style={[commonStyles.title, styles.modalTitle]}>Join Book Club</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Club Code</Text>
                        <TextInput
                            style={styles.input}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            placeholder="Enter 6-character code"
                            autoCapitalize="characters"
                            maxLength={6}
                        />
                    </View>
                    
                    <View style={styles.modalActions}>
                        <TouchableOpacity 
                            style={[commonStyles.secondaryButton, styles.modalButton]}
                            onPress={() => setShowJoinModal(false)}
                        >
                            <Text style={commonStyles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[commonStyles.primaryButton, styles.modalButton]}
                            onPress={handleJoinClub}
                        >
                            <Text style={commonStyles.primaryButtonText}>Join</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: designSystem.spacing.xl,
        paddingVertical: designSystem.spacing.lg,
        gap: designSystem.spacing.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: designSystem.spacing.xl,
    },
    clubsList: {
        paddingBottom: designSystem.spacing['4xl'],
    },
    sectionTitle: {
        marginBottom: designSystem.spacing.lg,
    },
    clubCard: {
        marginBottom: designSystem.spacing.lg,
    },
    clubHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: designSystem.spacing.md,
    },
    clubIcon: {
        width: 48,
        height: 48,
        borderRadius: designSystem.borderRadius.xl,
        backgroundColor: `${designSystem.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: designSystem.spacing.md,
    },
    clubInfo: {
        flex: 1,
    },
    clubName: {
        marginBottom: designSystem.spacing.xs,
    },
    clubDescription: {
        lineHeight: designSystem.typography.lineHeight.normal * designSystem.typography.fontSize.sm,
    },
    clubCode: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: designSystem.colors.surfaceSecondary,
        paddingHorizontal: designSystem.spacing.sm,
        paddingVertical: designSystem.spacing.xs,
        borderRadius: designSystem.borderRadius.md,
        gap: designSystem.spacing.xs,
    },
    codeText: {
        fontSize: designSystem.typography.fontSize.xs,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.textSecondary,
    },
    clubStats: {
        flexDirection: 'row',
        gap: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: designSystem.spacing.xs,
    },
    statText: {
        fontSize: designSystem.typography.fontSize.sm,
        color: designSystem.colors.textSecondary,
    },
    recentActivity: {
        borderTopWidth: 1,
        borderTopColor: designSystem.colors.borderLight,
        paddingTop: designSystem.spacing.md,
    },
    activityTitle: {
        marginBottom: designSystem.spacing.sm,
        fontWeight: designSystem.typography.fontWeight.semibold,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: designSystem.spacing.sm,
        marginBottom: designSystem.spacing.xs,
    },
    activityText: {
        fontSize: designSystem.typography.fontSize.sm,
        color: designSystem.colors.textSecondary,
        flex: 1,
    },
    emptyState: {
        flex: 1,
        paddingHorizontal: designSystem.spacing['4xl'],
        paddingVertical: designSystem.spacing['5xl'],
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: designSystem.borderRadius.full,
        backgroundColor: designSystem.colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: designSystem.spacing['2xl'],
    },
    emptyTitle: {
        textAlign: 'center',
        marginBottom: designSystem.spacing.md,
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: designSystem.spacing['4xl'],
    },
    modal: {
        justifyContent: 'center',
        margin: designSystem.spacing.xl,
    },
    modalContent: {
        backgroundColor: designSystem.colors.surface,
        borderRadius: designSystem.borderRadius.xl,
        padding: designSystem.spacing['2xl'],
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: designSystem.spacing['2xl'],
    },
    inputContainer: {
        marginBottom: designSystem.spacing.lg,
    },
    label: {
        fontSize: designSystem.typography.fontSize.sm,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.textPrimary,
        marginBottom: designSystem.spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: designSystem.colors.border,
        borderRadius: designSystem.borderRadius.md,
        paddingHorizontal: designSystem.spacing.lg,
        paddingVertical: designSystem.spacing.md,
        fontSize: designSystem.typography.fontSize.base,
        backgroundColor: designSystem.colors.surface,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        gap: designSystem.spacing.md,
        marginTop: designSystem.spacing.lg,
    },
    modalButton: {
        flex: 1,
    },
});