import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { authService } from '../../services/auth/authService';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
    const { user, session, loading: authLoading } = useAuth();
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [isFullyAuthenticated, setIsFullyAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            // If no user or session, not authenticated
            if (!user || !session) {
                setIsFullyAuthenticated(false);
                setChecking(false);
                return;
            }

            try {
                // Check MFA assurance level - this is the key check
                const mfaStatus = await authService.checkMfaStatus();

                // User must be at AAL2 (completed MFA verification) to access protected routes
                // AAL1 = email/password only (partial login)
                // AAL2 = email/password + MFA verified (full login)
                if (mfaStatus.currentLevel === 'aal2') {
                    // Fully authenticated with MFA
                    setIsFullyAuthenticated(true);
                } else {
                    // Not at AAL2 - user is in middle of login flow
                    // Sign them out to clean up partial session
                    console.log('User not at AAL2, signing out partial session');
                    await authService.signOut();
                    setIsFullyAuthenticated(false);
                }

                setChecking(false);
            } catch (error) {
                console.error('Error checking authentication:', error);
                // On error, sign out to be safe
                await authService.signOut();
                setIsFullyAuthenticated(false);
                setChecking(false);
            }
        };

        if (!authLoading) {
            checkAuthentication();
        }
    }, [user, session, authLoading]);

    // Still loading initial auth state
    if (authLoading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // Not authenticated or MFA not complete - redirect to login
    if (!user || !isFullyAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Fully authenticated - render protected content
    return children;
};

export default ProtectedRoute;
