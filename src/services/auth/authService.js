import { supabase } from '../database/supabaseClient.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.enrollmentLock = null;
        this.initializeAuthListener();
    }

    // Initialize auth state listener
    initializeAuthListener() {
        supabase.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
        });
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
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
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // Sign out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            this.currentUser = null;
            return { error: null };
        } catch (error) {
            return { error };
        }
    }

    // Get current session
    async getSession() {
        return await supabase.auth.getSession();
    }

    // Get current user
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    // Update user metadata
    async updateUserMetadata(metadata) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: metadata
            });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // Check MFA status - simplified and optimized
    async checkMfaStatus() {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            if (!session) {
                return {
                    requiresMfaEnrollment: false,
                    requiresMfaChallenge: false,
                    currentLevel: null,
                    nextLevel: null,
                    factorId: null,
                    factors: [],
                    error: null
                };
            }

            const { data: { currentLevel, nextLevel } } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            // Get all enrolled factors
            const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

            if (factorsError) {
                console.error('Error listing factors:', factorsError);
            }

            // Get all TOTP factors
            const allFactors = factorsData?.totp || [];

            // Find verified factor
            const verifiedFactor = allFactors.find(f => f.status === 'verified');
            const unverifiedFactors = allFactors.filter(f => f.status === 'unverified');

            // User needs to enroll if they have no verified factors
            const needsEnrollment = !verifiedFactor;

            // User needs challenge if they have a verified factor but current level is not aal2
            const needsChallenge = !!verifiedFactor && currentLevel !== 'aal2';

            return {
                requiresMfaEnrollment: needsEnrollment,
                requiresMfaChallenge: needsChallenge,
                currentLevel,
                nextLevel,
                factorId: verifiedFactor?.id || null,
                factors: allFactors,
                unverifiedFactors,
                error: null
            };
        } catch (error) {
            console.error('Error in checkMfaStatus:', error);
            return {
                requiresMfaEnrollment: false,
                requiresMfaChallenge: false,
                currentLevel: null,
                nextLevel: null,
                factorId: null,
                factors: [],
                unverifiedFactors: [],
                error
            };
        }
    }

    // Enroll in MFA - simplified with proper locking
    async enrollMfa() {
        try {
            // Use promise-based lock to prevent concurrent enrollments
            if (this.enrollmentLock) {
                return this.enrollmentLock;
            }

            this.enrollmentLock = (async () => {
                try {
                    // Clean up any unverified factors first
                    await this._cleanupUnverifiedFactors();

                    // Small delay to ensure cleanup is complete
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const { data, error } = await supabase.auth.mfa.enroll({
                        factorType: 'totp',
                        issuer: 'IT Analyst',
                        friendlyName: `Authenticator-${Date.now().toString(36)}`
                    });

                    if (error) throw error;
                    return { data, error: null };
                } catch (error) {
                    console.error('Enrollment error:', error);
                    return { data: null, error };
                } finally {
                    // Release lock after a delay
                    setTimeout(() => {
                        this.enrollmentLock = null;
                    }, 1000);
                }
            })();

            return this.enrollmentLock;
        } catch (error) {
            this.enrollmentLock = null;
            return { data: null, error };
        }
    }

    // Private method to clean up unverified factors
    async _cleanupUnverifiedFactors() {
        try {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const unverifiedFactors = factors?.totp?.filter(f => f.status === 'unverified') || [];

            if (unverifiedFactors.length > 0) {
                for (const factor of unverifiedFactors) {
                    await supabase.auth.mfa.unenroll({ factorId: factor.id });
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        } catch (error) {
            console.error('Error cleaning up unverified factors:', error);
        }
    }

    // Challenge MFA
    async challengeMfa(factorId) {
        try {
            const { data, error } = await supabase.auth.mfa.challenge({ factorId });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // Verify MFA during enrollment
    async verifyMfa(factorId, challengeId, code) {
        try {
            const verify = await supabase.auth.mfa.verify({
                factorId,
                challengeId,
                code
            });
            if (verify.error) throw verify.error;

            // Update user metadata after successful MFA enrollment
            const { error: updateError } = await supabase.auth.updateUser({
                data: { isMfaEnabled: true }
            });
            if (updateError) {
                console.error('Error updating user metadata:', updateError);
            }

            return { data: verify.data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // Verify MFA challenge (for login)
    async verifyMfaChallenge(factorId, challengeId, code) {
        try {
            const { data, error } = await supabase.auth.mfa.verify({
                factorId,
                challengeId,
                code
            });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // Unenroll from MFA (single factor)
    async unenrollMfa(factorId) {
        try {
            const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
            if (error) throw error;

            // Check if there are any remaining verified factors
            const { factors } = await this.checkMfaStatus();
            const hasVerifiedFactors = factors.some(f => f.status === 'verified');

            // Only update metadata if no verified factors remain
            if (!hasVerifiedFactors) {
                await supabase.auth.updateUser({
                    data: { isMfaEnabled: false }
                });
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // Reset all MFA factors
    async resetMfa() {
        try {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const allFactors = factors?.all || [];

            if (allFactors.length > 0) {
                for (const factor of allFactors) {
                    await supabase.auth.mfa.unenroll({ factorId: factor.id });
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                // Update user metadata
                await supabase.auth.updateUser({
                    data: { isMfaEnabled: false }
                });

                // Wait after cleanup
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            return { error: null };
        } catch (error) {
            console.error('Error resetting MFA:', error);
            return { error };
        }
    }

    // Check if user has MFA enrolled (not just metadata)
    async hasMfaEnrolled() {
        try {
            // First check if we have a session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return false;
            }

            const { data: factors, error } = await supabase.auth.mfa.listFactors();
            if (error) {
                console.error('Error listing factors:', error);
                return false;
            }

            const verifiedFactor = factors?.totp?.find(f => f.status === 'verified');
            return !!verifiedFactor;
        } catch (error) {
            console.error('Error checking MFA enrollment:', error);
            return false;
        }
    }
}

export const authService = new AuthService();
