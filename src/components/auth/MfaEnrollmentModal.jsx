import React, {  useEffect, useCallback, useReducer } from 'react';
import { showToast } from '../../utils/toast';
import Button from '../ui/Button';
import { authService } from '../../services/auth/authService';
import LoadingSpinner from '../ui/LoadingSpinner';

// Reducer for managing complex state transitions
const initialState = {
    factorId: null,
    qrCode: null,
    secret: null,
    verifyCode: '',
    loading: true,
    enrolling: false,
    isResetting: false,
    error: null
};

function enrollmentReducer(state, action) {
    switch (action.type) {
        case 'ENROLLMENT_START':
            return {
                ...state,
                loading: true,
                error: null,
                factorId: null,
                qrCode: null,
                secret: null
            };
        case 'ENROLLMENT_SUCCESS':
            return {
                ...state,
                factorId: action.payload.factorId,
                qrCode: action.payload.qrCode,
                secret: action.payload.secret,
                loading: false,
                error: null
            };
        case 'ENROLLMENT_ERROR':
            return {
                ...state,
                loading: false,
                enrolling: false,
                error: action.payload
            };
        case 'VERIFY_START':
            return {
                ...state,
                enrolling: true,
                error: null
            };
        case 'VERIFY_ERROR':
            return {
                ...state,
                enrolling: false,
                error: action.payload,
                verifyCode: ''
            };
        case 'UPDATE_CODE':
            return {
                ...state,
                verifyCode: action.payload
            };
        case 'RESET_START':
            return {
                ...state,
                isResetting: true,
                error: null
            };
        case 'RESET_END':
            return {
                ...state,
                isResetting: false
            };
        case 'RESET_STATE':
            return initialState;
        default:
            return state;
    }
}

function MfaEnrollmentModal({ isOpen, onClose, onSuccess }) {
    const [state, dispatch] = useReducer(enrollmentReducer, initialState);

    // Start enrollment process
    const startEnrollment = useCallback(async () => {
        try {
            dispatch({ type: 'ENROLLMENT_START' });

            const { data, error } = await authService.enrollMfa();
            if (error) throw error;

            if (!data?.id) {
                throw new Error('Invalid enrollment data received');
            }

            dispatch({
                type: 'ENROLLMENT_SUCCESS',
                payload: {
                    factorId: data.id,
                    qrCode: data.totp?.qr_code,
                    secret: data.totp?.secret
                }
            });
        } catch (err) {
            console.error('Enrollment error:', err);
            dispatch({ type: 'ENROLLMENT_ERROR', payload: err.message || 'Failed to start MFA enrollment' });
            showToast.error(err.message || 'Failed to start MFA enrollment');
        }
    }, []);

    // Handle verification
    const handleVerify = useCallback(async () => {
        if (!state.verifyCode || state.verifyCode.length !== 6 || !state.factorId) {
            return;
        }

        try {
            dispatch({ type: 'VERIFY_START' });

            const challenge = await authService.challengeMfa(state.factorId);
            if (challenge.error) throw challenge.error;

            const verify = await authService.verifyMfa(
                state.factorId,
                challenge.data.id,
                state.verifyCode
            );

            if (verify.error) {
                throw verify.error;
            }

            showToast.success('MFA setup successful!');
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Verification error:', err);
            dispatch({ type: 'VERIFY_ERROR', payload: err.message || 'Invalid verification code' });
            showToast.error(err.message || 'Invalid verification code');
        }
    }, [state.verifyCode, state.factorId, onClose, onSuccess]);

    // Handle reset
    const handleReset = useCallback(async () => {
        try {
            dispatch({ type: 'RESET_START' });
            await authService.resetMfa();
            await startEnrollment();
        } catch (err) {
            console.error('Reset error:', err);
            dispatch({ type: 'ENROLLMENT_ERROR', payload: err.message || 'Failed to reset MFA' });
            showToast.error(err.message || 'Failed to reset MFA');
        } finally {
            dispatch({ type: 'RESET_END' });
        }
    }, [startEnrollment]);

    // Handle code input change
    const handleCodeChange = useCallback((e) => {
        const newCode = e.target.value.replace(/\D/g, '').slice(0, 6);
        dispatch({ type: 'UPDATE_CODE', payload: newCode });
    }, []);

    // Handle Enter key press
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && state.verifyCode.length === 6 && !state.enrolling) {
            handleVerify();
        }
    }, [state.verifyCode, state.enrolling, handleVerify]);

    // Initialize enrollment when modal opens
    useEffect(() => {
        if (isOpen) {
            startEnrollment();
        }
        return () => {
            dispatch({ type: 'RESET_STATE' });
        };
    }, [isOpen, startEnrollment]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Set Up Two-Factor Authentication
                                    </h3>
                                    {!state.loading && !state.isResetting && (
                                        <Button
                                            onClick={handleReset}
                                            variant="secondary"
                                            size="sm"
                                            disabled={state.isResetting}
                                        >
                                            Reset MFA
                                        </Button>
                                    )}
                                </div>

                                {/* Loading State */}
                                {(state.loading || state.isResetting) ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <LoadingSpinner size="lg" />
                                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                                            {state.isResetting ? 'Resetting MFA...' : 'Setting up MFA...'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* QR Code Display */}
                                        {state.qrCode && (
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                                    <img
                                                        src={state.qrCode}
                                                        alt="MFA QR Code"
                                                        className="w-48 h-48"
                                                    />
                                                </div>
                                                {state.secret && (
                                                    <div className="w-full">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                            Can't scan? Enter this code manually:
                                                        </p>
                                                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm break-all">
                                                            {state.secret}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Verification Code Input */}
                                        <div>
                                            <label
                                                htmlFor="verify-code"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Enter the 6-digit code from your authenticator app
                                            </label>
                                            <input
                                                id="verify-code"
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={state.verifyCode}
                                                onChange={handleCodeChange}
                                                onKeyPress={handleKeyPress}
                                                disabled={state.enrolling}
                                                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                                                placeholder="000000"
                                                maxLength={6}
                                                autoComplete="off"
                                                autoFocus
                                            />
                                        </div>

                                        {/* Error Display */}
                                        {state.error && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                                <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
                                            </div>
                                        )}

                                        {/* Instructions */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                                Instructions:
                                            </h4>
                                            <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                                                <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
                                                <li>Scan the QR code or enter the code manually</li>
                                                <li>Enter the 6-digit code shown in your app</li>
                                                <li>Click "Verify and Enable" to complete setup</li>
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!state.loading && !state.isResetting && (
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <Button
                                onClick={handleVerify}
                                disabled={state.enrolling || !state.verifyCode || state.verifyCode.length !== 6}
                                className="w-full sm:w-auto sm:ml-3"
                                loading={state.enrolling}
                            >
                                {state.enrolling ? 'Verifying...' : 'Verify and Enable'}
                            </Button>
                            {onClose && (
                                <Button
                                    onClick={onClose}
                                    variant="secondary"
                                    className="w-full sm:w-auto mt-3 sm:mt-0"
                                    disabled={state.enrolling}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MfaEnrollmentModal;
