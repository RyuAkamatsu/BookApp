import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LOAD_KEY = 'thebooknook_first_load';

export const checkFirstLoad = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(FIRST_LOAD_KEY);
        return value === null;
    } catch (error) {
        console.error('Error checking first load:', error);
        return true; // Default to first load if there's an error
    }
};

export const markFirstLoadComplete = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(FIRST_LOAD_KEY, 'false');
    } catch (error) {
        console.error('Error marking first load complete:', error);
    }
}; 