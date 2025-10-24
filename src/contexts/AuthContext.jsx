import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth/authService.js';
import { supabase } from '../services/database/supabaseClient.js';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session on mount
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user || null);
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user || null);
                setLoading(false);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
        try {
            const { user, session } = await authService.signIn(email, password);
            setUser(user);
            setSession(session);
            return { user, session };
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (email, password, metadata) => {
        try {
            const { user, session } = await authService.signUp(email, password, metadata);
            setUser(user);
            setSession(session);
            return { user, session };
        } catch (error) {
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await authService.signOut();
            setUser(null);
            setSession(null);
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            return await authService.resetPassword(email);
        } catch (error) {
            throw error;
        }
    };

    const updatePassword = async (newPassword) => {
        try {
            return await authService.updatePassword(newPassword);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        isAuthenticated: !!session
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
