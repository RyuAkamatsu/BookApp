import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, getUserFromStorage, saveUserToStorage } from '@/utils/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    // Check for stored user on app start
        const checkStoredUser = async () => {
            try {
                const storedUser = await getUserFromStorage();
                if (storedUser) {
                    setUser(storedUser);
                }
            } catch (error) {
                console.error('Error checking stored user:', error);
            } finally {
                setLoading(false);
            }
        };

        checkStoredUser();

        // Listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged(async currentUser => {
            if (currentUser) {
                setUser(currentUser);
                await saveUserToStorage(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        loading,
        setUser,
    };

    return (
        <AuthContext.Provider value={ value }>
            {children}
        </AuthContext.Provider>
    );
};
