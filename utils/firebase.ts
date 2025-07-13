import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey           : 'your-api-key',
    authDomain       : 'your-auth-domain',
    projectId        : 'your-project-id',
    storageBucket    : 'your-storage-bucket',
    messagingSenderId: 'your-messaging-sender-id',
    appId            : 'your-app-id'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication functions
export const registerUser = async (email: string, password: string, username: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;
    
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username,
            email,
            createdAt: new Date(),
            books    : []
        });
    
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        await AsyncStorage.removeItem('user');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// User data functions
export const getUserProfile = async (userId: string) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        }
        return { success: false, error: 'User not found' };
    
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const updateUserBooks = async (userId: string, books: any[]) => {
    try {
        await setDoc(doc(db, 'users', userId), { books }, { merge: true });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Local storage functions
export const saveUserToStorage = async (user: User) => {
    try {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getUserFromStorage = async () => {
    try {
        const userString = await AsyncStorage.getItem('user');
        return userString ? JSON.parse(userString) : null;
    } catch (error) {
        return null;
    }
};
