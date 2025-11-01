import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth/authService';
import { showToast } from '../utils/toast';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MfaEnrollmentModal from '../components/auth/MfaEnrollmentModal';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Flow control: 'login' | 'enroll' | 'verify'
    const [step, setStep] = useState('login');

    // MFA enrollment state
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    // MFA verification state
    const [mfaCode, setMfaCode] = useState('');
    const [factorId, setFactorId] = useState('');
    const [challengeId, setChallengeId] = useState('');


    // Step 1: Email/Password Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sign in with credentials
            const { data, error } = await authService.signIn(email, password);
            if (error) throw error;
            if (!data?.user) throw new Error('No user returned');

            // Check if MFA is enrolled
            const hasEnrolled = await authService.hasMfaEnrolled();

            if (!hasEnrolled) {
                // Need to enroll
                setStep('enroll');
                setShowEnrollModal(true);
                setLoading(false);
                return;
            }

            // Has MFA - create challenge
            const mfaStatus = await authService.checkMfaStatus();
            if (!mfaStatus.factorId) throw new Error('No MFA factor found');

            const challenge = await authService.challengeMfa(mfaStatus.factorId);
            if (challenge.error) throw challenge.error;
            if (!challenge.data?.id) throw new Error('No challenge ID');

            // Move to verification step
            setFactorId(mfaStatus.factorId);
            setChallengeId(challenge.data.id);
            setStep('verify');
            setLoading(false);
            showToast.success('Enter your 6-digit code');
        } catch (error) {
            console.error('Login error:', error);
            showToast.error(error.message || 'Login failed');
            setLoading(false);
        }
    };

    // Step 2: MFA Enrollment Complete
    const handleEnrollComplete = async () => {
        try {
            setShowEnrollModal(false);
            showToast.success('MFA enrolled! Now verify to continue.');

            // Wait a bit for session to update after enrollment
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Refresh session to ensure we have latest MFA factors
            await authService.getSession();

            // After enrollment, create challenge
            const mfaStatus = await authService.checkMfaStatus();
            if (!mfaStatus.factorId) {
                console.error('MFA status:', mfaStatus);
                throw new Error('No MFA factor after enrollment');
            }

            const challenge = await authService.challengeMfa(mfaStatus.factorId);
            if (challenge.error) throw challenge.error;
            if (!challenge.data?.id) throw new Error('No challenge ID');

            setFactorId(mfaStatus.factorId);
            setChallengeId(challenge.data.id);
            setStep('verify');
        } catch (error) {
            console.error('Post-enrollment error:', error);
            showToast.error('MFA enrolled successfully! Please login again to verify.');
            // Give user time to read the message
            setTimeout(() => {
                resetToLogin();
            }, 2000);
        }
    };

    // Step 3: MFA Verification
    const handleVerify = async (e) => {
        e.preventDefault();

        if (mfaCode.length !== 6) {
            showToast.error('Enter a 6-digit code');
            return;
        }

        setLoading(true);

        try {
            const { error } = await authService.verifyMfaChallenge(factorId, challengeId, mfaCode);
            if (error) throw error;

            showToast.success('Login successful!');

            // Navigate after short delay to let auth state update
            setTimeout(() => {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }, 300);
        } catch (error) {
            console.error('Verification error:', error);
            showToast.error('Invalid code. Try again.');
            setMfaCode('');
            setLoading(false);
        }
    };

    // Reset to login screen
    const resetToLogin = () => {
        setStep('login');
        setShowEnrollModal(false);
        setEmail('');
        setPassword('');
        setMfaCode('');
        setFactorId('');
        setChallengeId('');
        setLoading(false);
        authService.signOut();
    };

    // Render: MFA Verification Step
    if (step === 'verify') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Two-Factor Authentication
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Enter the 6-digit code from your authenticator app
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            autoFocus
                            required
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-full px-3 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <Button type="submit" variant="primary" className="w-full" disabled={loading || mfaCode.length !== 6}>
                            {loading ? <LoadingSpinner /> : 'Verify'}
                        </Button>

                        <button
                            type="button"
                            onClick={resetToLogin}
                            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Back to login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Render: Login Step (with optional enrollment modal)
    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            IT Support Report Management System
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                                {loading ? <LoadingSpinner /> : 'Sign in'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* MFA Enrollment Modal */}
            <MfaEnrollmentModal
                isOpen={showEnrollModal}
                onClose={resetToLogin}
                onSuccess={handleEnrollComplete}
            />
        </>
    );
}
