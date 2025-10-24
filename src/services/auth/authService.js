import { supabase } from '../database/supabaseClient.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.initializeAuthListener();
    }

    // Initialize auth state listener
    initializeAuthListener() {
        supabase.auth.onAuthStateChange((event, session) => {

            this.currentUser = session?.user || null;
        });
    }

    // Sign up new user
    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });

            if (error) {
                throw error;
            }

            return { user: data.user, session: data.session };
        } catch (error) {
            console.error('Error signing up:', error);
            throw new Error(error.message || 'Failed to sign up');
        }
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            this.currentUser = data.user;
            return { user: data.user, session: data.session };
        } catch (error) {
            console.error('Error signing in:', error);
            throw new Error(error.message || 'Failed to sign in');
        }
    }

    // Sign out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            this.currentUser = null;
            return true;
        } catch (error) {
            console.error('Error signing out:', error);
            throw new Error(error.message || 'Failed to sign out');
        }
    }

    // Get current session
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                throw error;
            }

            return data.session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                throw error;
            }

            this.currentUser = data.user;
            return data.user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw new Error(error.message || 'Failed to reset password');
        }
    }

    // Update password
    async updatePassword(newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error updating password:', error);
            throw new Error(error.message || 'Failed to update password');
        }
    }

    // Update user metadata
    async updateUserMetadata(metadata) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: metadata
            });

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error updating user metadata:', error);
            throw new Error(error.message || 'Failed to update user metadata');
        }
    }

    // Check if user is authenticated
    async isAuthenticated() {
        const session = await this.getSession();
        return !!session;
    }
}

export const authService = new AuthService();
