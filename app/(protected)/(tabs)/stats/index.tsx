import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChartBar as BarChart3, BookOpen, Calendar, Target, TrendingUp, Award } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/utils/firebase/firebase';
import { useTheme, getCommonStyles } from '@/styling/theme';

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
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);

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
                    <Target size={24} color={theme.colors.primary} />
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
        const chartWidth = screenWidth - (theme.spacing.xl * 4);
        const barWidth = chartWidth / monthlyData.length - theme.spacing.md;

        return (
            <View style={[commonStyles.card, styles.chartCard]}>
                <View style={styles.chartHeader}>
                    <BarChart3 size={24} color={theme.colors.primary} />
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
                                            ? theme.colors.primary 
                                            : theme.colors.surfaceSecondary
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
            <View style={[commonStyles.header, { paddingTop: insets.top + theme.spacing.xl }]}>
                <Text style={commonStyles.headerTitle}>Reading Stats</Text>
                <Text style={commonStyles.headerSubtitle}>
                    Track your reading progress and achievements
                </Text>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: theme.spacing['4xl'] }}
            >
                {renderProgressCard()}
                
                <View style={styles.statsGrid}>
                    {renderStatCard(
                        'Books Read',
                        stats.totalBooks,
                        'All time',
                        BookOpen,
                        theme.colors.primary
                    )}
                    {renderStatCard(
                        'This Month',
                        stats.booksThisMonth,
                        'Books completed',
                        Calendar,
                        theme.colors.accent
                    )}
                    {renderStatCard(
                        'Pages Read',
                        stats.totalPages.toLocaleString(),
                        'All time',
                        TrendingUp,
                        theme.colors.success
                    )}
                    {renderStatCard(
                        'Current Streak',
                        `${stats.currentStreak} days`,
                        'Keep it up!',
                        Award,
                        theme.colors.warning
                    )}
                </View>

                {renderMonthlyChart()}

                <View style={[commonStyles.card, styles.achievementsCard]}>
                    <Text style={[commonStyles.subtitle, styles.achievementsTitle]}>Achievements</Text>
                    <View style={styles.achievementsList}>
                        <View style={styles.achievementItem}>
                            <View style={[styles.achievementIcon, { backgroundColor: `${theme.colors.success}15` }]}>
                                <Award size={20} color={theme.colors.success} />
                            </View>
                            <View style={styles.achievementInfo}>
                                <Text style={[commonStyles.body, styles.achievementName]}>First Book</Text>
                                <Text style={[commonStyles.caption, styles.achievementDesc]}>Read your first book</Text>
                            </View>
                        </View>
                        
                        <View style={styles.achievementItem}>
                            <View style={[styles.achievementIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                                <BookOpen size={20} color={theme.colors.primary} />
                            </View>
                            <View style={styles.achievementInfo}>
                                <Text style={[commonStyles.body, styles.achievementName]}>Bookworm</Text>
                                <Text style={[commonStyles.caption, styles.achievementDesc]}>Read 10 books</Text>
                            </View>
                        </View>
                        
                        <View style={styles.achievementItem}>
                            <View style={[styles.achievementIcon, { backgroundColor: `${theme.colors.accent}15` }]}>
                                <TrendingUp size={20} color={theme.colors.accent} />
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
        paddingHorizontal: theme.spacing.xl,
    },
    progressCard: {
        marginBottom: theme.spacing.xl,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    progressIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: `${theme.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    progressInfo: {
        flex: 1,
    },
    progressTitle: {
        marginBottom: theme.spacing.xs,
    },
    progressSubtitle: {
        // Uses default caption styles
    },
    progressPercentage: {
        color: theme.colors.primary,
    },
    progressBarContainer: {
        marginBottom: theme.spacing.md,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.sm,
    },
    progressNote: {
        textAlign: 'center',
        fontWeight: theme.typography.fontWeight.semibold,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    statCard: {
        width: (screenWidth - (theme.spacing.xl * 2) - theme.spacing.md) / 2,
        alignItems: 'center',
        paddingVertical: theme.spacing['2xl'],
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    statValue: {
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    statTitle: {
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    statSubtitle: {
        textAlign: 'center',
    },
    chartCard: {
        marginBottom: theme.spacing.xl,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    chartTitle: {
        // Uses default subtitle styles
    },
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 120,
        paddingHorizontal: theme.spacing.md,
    },
    chartBar: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        borderRadius: theme.borderRadius.xs,
        marginBottom: theme.spacing.sm,
    },
    barValue: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    barLabel: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    achievementsCard: {
        // Uses default card styles
    },
    achievementsTitle: {
        marginBottom: theme.spacing.lg,
    },
    achievementsList: {
        gap: theme.spacing.lg,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementIcon: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementName: {
        marginBottom: theme.spacing.xs,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    achievementDesc: {
        // Uses default caption styles
    },
});