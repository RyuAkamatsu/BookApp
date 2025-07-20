import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    User,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    addDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
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

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');
facebookProvider.addScope('email');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Authentication functions
export const registerUser = async (username: string, email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;
    
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username,
            email,
            createdAt: new Date(),
            books: [],
            bookClubs: [],
            stats: {
                totalBooks: 0,
                totalPages: 0,
                booksThisMonth: 0,
                pagesThisMonth: 0,
                readingGoal: 12, // Default goal of 12 books per year
                currentStreak: 0,
                longestStreak: 0
            }
        });
    
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const loginUserByEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const loginUser = async (username: string, password: string) => {
    try {
        // First, find the user by username
        const usersQuery = query(
            collection(db, 'users'),
            where('username', '==', username)
        );
        
        const userSnapshot = await getDocs(usersQuery);
        
        if (userSnapshot.empty) {
            return { success: false, error: 'Username not found' };
        }
        
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        
        // Now sign in with the email
        const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Dev bypass function - only for development
export const createMockUser = async () => {
    try {
        const mockEmail = `dev-user-${Date.now()}@bookapp.dev`;
        const mockPassword = 'DevPassword123!';
        const mockUsername = `DevUser${Date.now()}`;
        
        const userCredential = await createUserWithEmailAndPassword(auth, mockEmail, mockPassword);
        const { user } = userCredential;
        
        // Create mock user profile
        await setDoc(doc(db, 'users', user.uid), {
            username: mockUsername,
            email: mockEmail,
            createdAt: new Date(),
            books: [
                {
                    id: 'mock-book-1',
                    title: 'The Great Gatsby',
                    author: 'F. Scott Fitzgerald',
                    coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
                    genre: 'Classic Literature',
                    publishedYear: 1925,
                    libraryName: 'My Classics',
                    isRead: true,
                    isToRead: false,
                    scannedAt: new Date().toISOString(),
                    description: 'A classic American novel set in the Jazz Age.'
                },
                {
                    id: 'mock-book-2',
                    title: 'To Kill a Mockingbird',
                    author: 'Harper Lee',
                    coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
                    genre: 'Fiction',
                    publishedYear: 1960,
                    libraryName: 'My Classics',
                    isRead: false,
                    isToRead: true,
                    scannedAt: new Date().toISOString(),
                    description: 'A gripping tale of racial injustice and childhood innocence.'
                }
            ],
            bookClubs: [],
            stats: {
                totalBooks: 15,
                totalPages: 4200,
                booksThisMonth: 3,
                pagesThisMonth: 890,
                readingGoal: 24,
                currentStreak: 7,
                longestStreak: 21
            }
        });
        
        return { success: true, user, username: mockUsername };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user profile exists, create if not
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                username: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                createdAt: new Date(),
                books: [],
                bookClubs: [],
                stats: {
                    totalBooks: 0,
                    totalPages: 0,
                    booksThisMonth: 0,
                    pagesThisMonth: 0,
                    readingGoal: 12,
                    currentStreak: 0,
                    longestStreak: 0
                }
            });
        }
        
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const signInWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;
        
        // Check if user profile exists, create if not
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                username: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                createdAt: new Date(),
                books: [],
                bookClubs: [],
                stats: {
                    totalBooks: 0,
                    totalPages: 0,
                    booksThisMonth: 0,
                    pagesThisMonth: 0,
                    readingGoal: 12,
                    currentStreak: 0,
                    longestStreak: 0
                }
            });
        }
        
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const signInWithApple = async () => {
    try {
        const result = await signInWithPopup(auth, appleProvider);
        const user = result.user;
        
        // Check if user profile exists, create if not
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                username: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                createdAt: new Date(),
                books: [],
                bookClubs: [],
                stats: {
                    totalBooks: 0,
                    totalPages: 0,
                    booksThisMonth: 0,
                    pagesThisMonth: 0,
                    readingGoal: 12,
                    currentStreak: 0,
                    longestStreak: 0
                }
            });
        }
        
        return { success: true, user };
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
        await updateDoc(doc(db, 'users', userId), { books });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const updateUserStats = async (userId: string, stats: any) => {
    try {
        await updateDoc(doc(db, 'users', userId), { stats });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Book Club functions
export const createBookClub = async (userId: string, clubName: string, description: string) => {
    try {
        const clubCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const clubRef = await addDoc(collection(db, 'bookClubs'), {
            name: clubName,
            description,
            code: clubCode,
            createdBy: userId,
            createdAt: new Date(),
            members: [userId],
            books: [],
            recommendations: []
        });
        
        // Add club to user's bookClubs array
        await updateDoc(doc(db, 'users', userId), {
            bookClubs: arrayUnion(clubRef.id)
        });
        
        return { success: true, clubId: clubRef.id, code: clubCode };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const joinBookClub = async (userId: string, clubCode: string) => {
    try {
        const clubsQuery = query(
            collection(db, 'bookClubs'),
            where('code', '==', clubCode.toUpperCase())
        );
        
        const clubSnapshot = await getDocs(clubsQuery);
        
        if (clubSnapshot.empty) {
            return { success: false, error: 'Book club not found' };
        }
        
        const clubDoc = clubSnapshot.docs[0];
        const clubData = clubDoc.data();
        
        if (clubData.members.includes(userId)) {
            return { success: false, error: 'You are already a member of this book club' };
        }
        
        // Add user to club members
        await updateDoc(doc(db, 'bookClubs', clubDoc.id), {
            members: arrayUnion(userId)
        });
        
        // Add club to user's bookClubs array
        await updateDoc(doc(db, 'users', userId), {
            bookClubs: arrayUnion(clubDoc.id)
        });
        
        return { success: true, clubId: clubDoc.id, clubName: clubData.name };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getUserBookClubs = async (userId: string) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return { success: false, error: 'User not found' };
        }
        
        const userData = userDoc.data();
        const bookClubIds = userData.bookClubs || [];
        
        if (bookClubIds.length === 0) {
            return { success: true, data: [] };
        }
        
        const bookClubs = [];
        for (const clubId of bookClubIds) {
            const clubDoc = await getDoc(doc(db, 'bookClubs', clubId));
            if (clubDoc.exists()) {
                bookClubs.push({ id: clubDoc.id, ...clubDoc.data() });
            }
        }
        
        return { success: true, data: bookClubs };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const addBookRecommendation = async (clubId: string, userId: string, bookData: any, recommendation: string) => {
    try {
        const recommendationData = {
            id: Date.now().toString(),
            book: bookData,
            recommendedBy: userId,
            recommendation,
            createdAt: new Date(),
            likes: [],
            comments: []
        };
        
        await updateDoc(doc(db, 'bookClubs', clubId), {
            recommendations: arrayUnion(recommendationData)
        });
        
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