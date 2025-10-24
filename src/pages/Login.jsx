import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { showToast, handleAuthError } from '../utils/toast';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, signUp } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const from = location.state?.from?.pathname || '/';

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (isSignUp) {
            if (!formData.fullName.trim()) {
                newErrors.fullName = 'Full name is required';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            if (isSignUp) {
                await signUp(formData.email, formData.password, {
                    full_name: formData.fullName
                });
                showToast.success('Account created successfully! Welcome aboard!');
                setMessage('Account created successfully! Please check your email to verify your account.');
                // Don't navigate yet - wait for email verification
            } else {
                await signIn(formData.email, formData.password);
                showToast.success('Welcome back! Signed in successfully.');
                navigate(from, { replace: true });
            }
        } catch (error) {
            handleAuthError(error);
            setErrors({ general: error.message });
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: ''
        });
        setErrors({});
        setMessage('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        {isSignUp ? 'Create your account' : 'Sign in to your account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        IT Support Report Management System
                    </p>
                </div>

                <Card>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {errors.general && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isSignUp && (
                            <Input
                                label="Full Name"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                error={errors.fullName}
                                placeholder="John Doe"
                                required
                            />
                        )}

                        <Input
                            label="Email address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            error={errors.email}
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            error={errors.password}
                            placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                            required
                        />

                        {isSignUp && (
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                error={errors.confirmPassword}
                                placeholder="Re-enter your password"
                                required
                            />
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={loading}
                        >
                            {isSignUp ? 'Sign up' : 'Sign in'}
                        </Button>

                        {/*<div className="text-center">*/}
                        {/*    <button*/}
                        {/*        type="button"*/}
                        {/*        onClick={toggleMode}*/}
                        {/*        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"*/}
                        {/*    >*/}
                        {/*        {isSignUp*/}
                        {/*            ? 'Already have an account? Sign in'*/}
                        {/*            : "Don't have an account? Sign up"}*/}
                        {/*    </button>*/}
                        {/*</div>*/}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Login;
