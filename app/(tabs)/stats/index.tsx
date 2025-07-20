import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, BookOpen, Calendar, Target, TrendingUp, Award } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/utils/firebase';
import { designSystem, commonStyles } from '@/utils/designSystem';

const { width: screenWidth } = Dimensions.get('window');

interface UserStats {
  totalBooks: number;
  totalPages: number;
  booksThisMonth: number;
  pagesThisMonth: number;
  readingGoal: number;
  currentStreak: number;
  longestStreak: number;
}

export default function StatsTab() {
    const [stats, setStats] = useState<UserStats>({
        totalBooks: 0,
        totalPages: 0,
        booksThisMonth: 0,
        pagesThisMonth: 0,
        readingGoal: 12,
        currentStreak: 0,
        longestStreak: 0,
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const result = await getUserProfile(user.uid);
            if (result.success && result.data.stats) {
                setStats(result.data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const progressPercentage = Math.min((stats.totalBooks / stats.readingGoal) * 100, 100);

    const renderStatCard = (title: string, value: string | number, subtitle: string, icon: any, color: string) => (
        <View style={[commonStyles.card, styles.statCard]}>
            <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
                {React.createElement(icon, { size: 24, color })}
            </View>
            <Text style={[commonStyles.title, styles.statValue]}>{value}</Text>
            <Text style={[commonStyles.subtitle, styles.statTitle]}>{title}</Text>
            <Text style={[commonStyles.caption, styles.statSubtitle]}>{subtitle}</Text>
        </View>
    );

    const renderProgressCard = () => (
        <View style={[commonStyles.card, styles.progressCard]}>
            <View style={styles.progressHeader}>
                <View style={styles.progressIcon}>
                    <Target size={24} color={designSystem.colors.primary} />
                </View>
                <View style={styles.progressInfo}>
                    <Text style={[commonStyles.subtitle, styles.progressTitle]}>Reading Goal</Text>
                    <Text style={[commonStyles.caption, styles.progressSubtitle]}>
                        {stats.totalBooks} of {stats.readingGoal} books this year
                    </Text>
                </View>
                <Text style={[commonStyles.title, styles.progressPercentage]}>
                    {Math.round(progressPercentage)}%
                </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                    <View 
                        style={[
                            styles.progressBarFill, 
                            { width: `${progressPercentage}%` }
                        ]} 
                    />
                </View>
            </View>
            
            <Text style={[commonStyles.caption, styles.progressNote]}>
                {stats.readingGoal - stats.totalBooks > 0 
                    ? `${stats.readingGoal - stats.totalBooks} books to go!`
                    : 'Goal achieved! 🎉'
                }
            </Text>
        </View>
    );

    const renderMonthlyChart = () => {
        // Simulated monthly data - in a real app, this would come from the database
        const monthlyData = [
            { month: 'Jan', books: 2, pages: 480 },
            { month: 'Feb', books: 1, pages: 320 },
            { month: 'Mar', books: 3, pages: 720 },
            { month: 'Apr', books: 2, pages: 560 },
            { month: 'May', books: 4, pages: 880 },
            { month: 'Jun', books: stats.booksThisMonth, pages: stats.pagesThisMonth },
        ];

        const maxBooks = Math.max(...monthlyData.map(d => d.books));
        const chartWidth = screenWidth - (designSystem.spacing.xl * 4);
        const barWidth = chartWidth / monthlyData.length - designSystem.spacing.md;

        return (
            <View style={[commonStyles.card, styles.chartCard]}>
                <View style={styles.chartHeader}>
                    <BarChart3 size={24} color={designSystem.colors.primary} />
                    <Text style={[commonStyles.subtitle, styles.chartTitle]}>Monthly Progress</Text>
                </View>
                
                <View style={styles.chart}>
                    {monthlyData.map((data, index) => (
                        <View key={data.month} style={styles.chartBar}>
                            <View 
                                style={[
                                    styles.bar, 
                                    { 
                                        height: (data.books / maxBooks) * 80,
                                        width: barWidth,
                                        backgroundColor: index === monthlyData.length - 1 
                                            ? designSystem.colors.primary 
                                            : designSystem.colors.surfaceSecondary
                                    }
                                ]} 
                            />
                            <Text style={styles.barValue}>{data.books}</Text>
                            <Text style={styles.barLabel}>{data.month}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={[commonStyles.container, { paddingBottom: insets.bottom }]}>
            <View style={[commonStyles.header, { paddingTop: insets.top + designSystem.spacing.xl }]}>
                <Text style={commonStyles.headerTitle}>Reading Stats</Text>
                <Text style={commonStyles.headerSubtitle}>
                    Track your reading progress and achievements
                </Text>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: designSystem.spacing['4xl'] }}
            >
                {renderProgressCard()}
                
                <View style={styles.statsGrid}>
                    {renderStatCard(
                        'Books Read',
                        stats.totalBooks,
                        'All time',
                        BookOpen,
                        designSystem.colors.primary
                    )}
                    {renderStatCard(
                        'This Month',
                        stats.booksThisMonth,
                        'Books completed',
                        Calendar,
                        designSystem.colors.accent
                    )}
                    {renderStatCard(
                        'Pages Read',
                        stats.totalPages.toLocaleString(),
                        'All time',
                        TrendingUp,
                        designSystem.colors.success
                    )}
                    {renderStatCard(
                        'Current Streak',
                        `${stats.currentStreak} days`,
                        'Keep it up!',
                        Award,
                        designSystem.colors.warning
                    )}
                </View>

                {renderMonthlyChart()}

                <View style={[commonStyles.card, styles.achievementsCard]}>
                    <Text style={[commonStyles.subtitle, styles.achievementsTitle]}>Achievements</Text>
                    <View style={styles.achievementsList}>
                        <View style={styles.achievementItem}>
                            <View style={[styles.achievementIcon, { backgroundColor: `${designSystem.colors.success}15` }]}>
                                <Award size={20} color={designSystem.colors.success} />
                            </View>
                            <View style={styles.achievementInfo}>
                                <Text style={[commonStyles.body, styles.achievementName]}>First Book</Text>
                                <Text style={[commonStyles.caption, styles.achievementDesc]}>Read your first book</Text>
                            </View>
                        </View>
                        
                        <View style={styles.achievementItem}>
                            <View style={[styles.achievementIcon, { backgroundColor: `${designSystem.colors.primary}15` }]}>
                                <BookOpen size={20} color={designSystem.colors.primary} />
                            </View>
                            <View style={styles.achievementInfo}>
                                <Text style={[commonStyles.body, styles.achievementName]}>Bookworm</Text>
                                <Text style={[commonStyles.caption, styles.achievementDesc]}>Read 10 books</Text>
                            </View>
                        </View>
                        
                        <View style={styles.achievementItem}>
                            <View style={[styles.achievementIcon, { backgroundColor: `${designSystem.colors.accent}15` }]}>
                                <TrendingUp size={20} color={designSystem.colors.accent} />
                            </View>
                            <View style={styles.achievementInfo}>
                                <Text style={[commonStyles.body, styles.achievementName]}>Consistent Reader</Text>
                                <Text style={[commonStyles.caption, styles.achievementDesc]}>7-day reading streak</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: designSystem.spacing.xl,
    },
    progressCard: {
        marginBottom: designSystem.spacing.xl,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: designSystem.spacing.lg,
    },
    progressIcon: {
        width: 48,
        height: 48,
        borderRadius: designSystem.borderRadius.xl,
        backgroundColor: `${designSystem.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: designSystem.spacing.md,
    },
    progressInfo: {
        flex: 1,
    },
    progressTitle: {
        marginBottom: designSystem.spacing.xs,
    },
    progressSubtitle: {
        // Uses default caption styles
    },
    progressPercentage: {
        color: designSystem.colors.primary,
    },
    progressBarContainer: {
        marginBottom: designSystem.spacing.md,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: designSystem.colors.surfaceSecondary,
        borderRadius: designSystem.borderRadius.sm,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: designSystem.colors.primary,
        borderRadius: designSystem.borderRadius.sm,
    },
    progressNote: {
        textAlign: 'center',
        fontWeight: designSystem.typography.fontWeight.semibold,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: designSystem.spacing.md,
        marginBottom: designSystem.spacing.xl,
    },
    statCard: {
        width: (screenWidth - (designSystem.spacing.xl * 2) - designSystem.spacing.md) / 2,
        alignItems: 'center',
        paddingVertical: designSystem.spacing['2xl'],
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: designSystem.borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: designSystem.spacing.md,
    },
    statValue: {
        marginBottom: designSystem.spacing.xs,
        textAlign: 'center',
    },
    statTitle: {
        marginBottom: designSystem.spacing.xs,
        textAlign: 'center',
    },
    statSubtitle: {
        textAlign: 'center',
    },
    chartCard: {
        marginBottom: designSystem.spacing.xl,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: designSystem.spacing.lg,
        gap: designSystem.spacing.md,
    },
    chartTitle: {
        // Uses default subtitle styles
    },
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 120,
        paddingHorizontal: designSystem.spacing.md,
    },
    chartBar: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        borderRadius: designSystem.borderRadius.xs,
        marginBottom: designSystem.spacing.sm,
    },
    barValue: {
        fontSize: designSystem.typography.fontSize.xs,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.textPrimary,
        marginBottom: designSystem.spacing.xs,
    },
    barLabel: {
        fontSize: designSystem.typography.fontSize.xs,
        color: designSystem.colors.textSecondary,
    },
    achievementsCard: {
        // Uses default card styles
    },
    achievementsTitle: {
        marginBottom: designSystem.spacing.lg,
    },
    achievementsList: {
        gap: designSystem.spacing.lg,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementIcon: {
        width: 40,
        height: 40,
        borderRadius: designSystem.borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: designSystem.spacing.md,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementName: {
        marginBottom: designSystem.spacing.xs,
        fontWeight: designSystem.typography.fontWeight.semibold,
    },
    achievementDesc: {
        // Uses default caption styles
    },
});