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
import { getUserBookClubs, createBookClub, joinBookClub } from '@/utils/firebase/firebase';
import { useTheme, getCommonStyles } from '@/styling/theme';
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
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);

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
                    <Users size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.clubInfo}>
                    <Text style={[commonStyles.subtitle, styles.clubName]}>{club.name}</Text>
                    <Text style={[commonStyles.caption, styles.clubDescription]}>{club.description}</Text>
                </View>
                <View style={styles.clubCode}>
                    <Hash size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.codeText}>{club.code}</Text>
                </View>
            </View>
            
            <View style={styles.clubStats}>
                <View style={styles.statItem}>
                    <Users size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.statText}>{club.members.length} members</Text>
                </View>
                <View style={styles.statItem}>
                    <BookOpen size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.statText}>{club.recommendations.length} recommendations</Text>
                </View>
            </View>
            
            {club.recommendations.length > 0 && (
                <View style={styles.recentActivity}>
                    <Text style={[commonStyles.caption, styles.activityTitle]}>Recent Activity</Text>
                    {club.recommendations.slice(0, 2).map((rec, index) => (
                        <View key={index} style={styles.activityItem}>
                            <MessageCircle size={14} color={theme.colors.textSecondary} />
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
                <Users size={48} color={theme.colors.textMuted} />
            </View>
            <Text style={[commonStyles.title, styles.emptyTitle]}>Join the Community</Text>
            <Text style={[commonStyles.body, styles.emptySubtitle]}>
                Create or join a book club to share recommendations and discuss your favorite reads with friends
            </Text>
        </View>
    );

    return (
        <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
            <View style={[commonStyles.header, { paddingTop: insets.top + theme.spacing.xl }]}>
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
                    <Plus size={20} color={theme.colors.surface} />
                    <Text style={[commonStyles.primaryButtonText, { marginLeft: theme.spacing.sm }]}>
                        Create Club
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[commonStyles.secondaryButton, styles.actionButton]}
                    onPress={() => setShowJoinModal(true)}
                >
                    <Hash size={20} color={theme.colors.primary} />
                    <Text style={[commonStyles.secondaryButtonText, { marginLeft: theme.spacing.sm }]}>
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
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
    },
    clubsList: {
        paddingBottom: theme.spacing['4xl'],
    },
    sectionTitle: {
        marginBottom: theme.spacing.lg,
    },
    clubCard: {
        marginBottom: theme.spacing.lg,
    },
    clubHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.md,
    },
    clubIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: `${theme.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    clubInfo: {
        flex: 1,
    },
    clubName: {
        marginBottom: theme.spacing.xs,
    },
    clubDescription: {
        lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    },
    clubCode: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSecondary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.xs,
    },
    codeText: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    clubStats: {
        flexDirection: 'row',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    statText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    recentActivity: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingTop: theme.spacing.md,
    },
    activityTitle: {
        marginBottom: theme.spacing.sm,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    activityText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    emptyState: {
        flex: 1,
        paddingHorizontal: theme.spacing['4xl'],
        paddingVertical: theme.spacing['5xl'],
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing['2xl'],
    },
    emptyTitle: {
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: theme.spacing['4xl'],
    },
    modal: {
        justifyContent: 'center',
        margin: theme.spacing.xl,
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing['2xl'],
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: theme.spacing['2xl'],
    },
    inputContainer: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        backgroundColor: theme.colors.surface,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    modalButton: {
        flex: 1,
    },
});