import { useLocalSearchParams } from 'expo-router';
import { ThemedText, ThemedView } from '@/components/ThemedText';

export default function BookDetailScreen() {
    const { bookId } = useLocalSearchParams();
    
    return (
        <ThemedView>
            <ThemedText>Book ID: {bookId}</ThemedText>
        </ThemedView>
    );
}