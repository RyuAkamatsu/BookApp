import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { BookOpen, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  visible: boolean;
  message?: string;
}

export default function LoadingScreen({ visible, message = 'Loading your library...' }: LoadingScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Start animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

            // Continuous rotation
            const rotateAnimation = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                })
            );

            // Pulse animation
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );

            rotateAnimation.start();
            pulseAnimation.start();

            return () => {
                rotateAnimation.stop();
                pulseAnimation.stop();
            };
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View 
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                }
            ]}
        >
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Animated.View
                        style={[
                            styles.bookIcon,
                            {
                                transform: [
                                    { rotate: spin },
                                    { scale: pulseAnim }
                                ],
                            }
                        ]}
                    >
                        <BookOpen size={48} color="#00635D" />
                    </Animated.View>
                    
                    <View style={styles.starsContainer}>
                        {[...Array(5)].map((_, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.star,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{
                                            scale: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 1],
                                                extrapolate: 'clamp',
                                            })
                                        }]
                                    }
                                ]}
                            >
                                <Star size={16} color="#F4B942" fill="#F4B942" />
                            </Animated.View>
                        ))}
                    </View>
                </View>

                <Text style={styles.appName}>BookShelf</Text>
                <Text style={styles.tagline}>Your Digital Reading Companion</Text>
                
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingBar}>
                        <Animated.View
                            style={[
                                styles.loadingProgress,
                                {
                                    transform: [{
                                        translateX: rotateAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-200, 200],
                                        })
                                    }]
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.loadingText}>{message}</Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#F9F7F4',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    bookIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    star: {
        opacity: 0.8,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#382110',
        marginBottom: 8,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 16,
        color: '#8B7355',
        marginBottom: 48,
        textAlign: 'center',
    },
    loadingContainer: {
        width: '100%',
        alignItems: 'center',
    },
    loadingBar: {
        width: 200,
        height: 4,
        backgroundColor: '#E8E2D5',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 16,
    },
    loadingProgress: {
        width: 60,
        height: '100%',
        backgroundColor: '#00635D',
        borderRadius: 2,
    },
    loadingText: {
        fontSize: 14,
        color: '#8B7355',
        textAlign: 'center',
    },
});