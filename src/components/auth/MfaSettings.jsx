import React, { useState, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { authService } from '../../services/auth/authService';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';

export default function MfaSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Check MFA status on mount
  useEffect(() => {
    const checkMfaStatus = async () => {
      setLoading(true);
      const hasEnrolled = await authService.hasMfaEnrolled();
      setMfaEnabled(hasEnrolled);
      setLoading(false);
    };

    if (user) {
      checkMfaStatus();
    }
  }, [user]);

  const resetMfaSetup = useCallback(async () => {
    if (!window.confirm('Are you sure you want to reset MFA? You will be logged out and need to set it up again on your next login.')) {
      return;
    }

    try {
      setResetting(true);
      const { error } = await authService.resetMfa();

      if (error) throw error;

      showToast.success('MFA has been reset. You will be logged out in 2 seconds...');

      // Wait 2 seconds then sign out
      setTimeout(async () => {
        await authService.signOut();
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Reset MFA error:', error);
      showToast.error(error.message || 'Failed to reset MFA');
      setResetting(false);
    }
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Two-Factor Authentication Settings
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">MFA Status</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mfaEnabled ? 'Enabled and active' : 'Not configured'}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full ${
            mfaEnabled
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {mfaEnabled ? 'Active' : 'Required'}
          </div>
        </div>

        {mfaEnabled && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              If you need to reconfigure your MFA settings (e.g., lost your device or authenticator app),
              you can reset them below. You will be logged out and need to set up MFA again on your next login.
            </p>
            <Button
              onClick={resetMfaSetup}
              variant="destructive"
              disabled={resetting}
              loading={resetting}
            >
              {resetting ? 'Resetting...' : 'Reset MFA Settings'}
            </Button>
          </div>
        )}

        {!mfaEnabled && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Two-factor authentication is required for your account.
                  You will be prompted to set it up on your next login or when accessing protected features.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
