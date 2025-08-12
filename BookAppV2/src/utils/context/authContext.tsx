import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useEffect } from "react";
import { loginUser, logoutUser, LoginCredentials } from "../service/authService";

SplashScreen.preventAutoHideAsync();

type AuthState = {
    isLoggedIn: boolean;
    isReady: boolean;
    logIn: (credentials: LoginCredentials) => void;
    logOut: () => void;
    isLoggingIn: boolean;
    isLoggingOut: boolean;
    loginError: Error | null;
};

const authStorageKey = "auth-key";

export const AuthContext = createContext<AuthState>({
    isLoggedIn: false,
    isReady: false,
    logIn: () => {},
    logOut: () => {},
    isLoggingIn: false,
    isLoggingOut: false,
    loginError: null,
});

export function AuthProvider({ children }: PropsWithChildren) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Query to check authentication status from storage
    const { data: authData, isSuccess } = useQuery({
        queryKey: ['auth'],
        queryFn: async () => {
            // Add a small delay to simulate network request
            await new Promise((res) => setTimeout(() => res(null), 1000));

            try {
                const value = await AsyncStorage.getItem(authStorageKey);
                if (value !== null) {
                    return JSON.parse(value);
                }
                return { isLoggedIn: false };
            } catch (error) {
                console.log("Error fetching from storage", error);
                return { isLoggedIn: false };
            }
        }
    });

    // Login mutation
    const { mutate: loginMutate, isPending: isLoggingIn, error: loginError } = useMutation({
        mutationFn: loginUser,
        onSuccess: async (data) => {
            if (data.success) {
                const authState = {
                    isLoggedIn: true,
                    token: data.token,
                    user: data.user
                };

                // Store auth state in AsyncStorage
                try {
                    await AsyncStorage.setItem(authStorageKey, JSON.stringify(authState));
                } catch (error) {
                    console.log("Error saving auth state", error);
                }

                // Invalidate and refetch auth query
                queryClient.invalidateQueries({ queryKey: ['auth'] });

                // Navigate to home
                router.replace("/");
            }
        }
    });

    // Logout mutation
    const { mutate: logoutMutate, isPending: isLoggingOut } = useMutation({
        mutationFn: logoutUser,
        onSuccess: async () => {
            // Clear auth state in AsyncStorage
            try {
                await AsyncStorage.setItem(authStorageKey, JSON.stringify({ isLoggedIn: false }));
            } catch (error) {
                console.log("Error clearing auth state", error);
            }

            // Invalidate and refetch auth query
            queryClient.invalidateQueries({ queryKey: ['auth'] });

            // Navigate to login
            router.replace("/login");
        }
    });

    // Login function that calls the mutation
    const logIn = (credentials: LoginCredentials) => {
        loginMutate(credentials);
    };

    // Logout function that calls the mutation
    const logOut = () => {
        logoutMutate();
    };

    // Hide splash screen when auth check is complete
    useEffect(() => {
        if (isSuccess) {
            SplashScreen.hideAsync();
        }
    }, [isSuccess]);

    const isReady = isSuccess;
    const isLoggedIn = authData?.isLoggedIn || false;

    return (
        <AuthContext.Provider
            value={{
                isReady,
                isLoggedIn,
                logIn,
                logOut,
                isLoggingIn,
                isLoggingOut,
                loginError: loginError as Error | null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
