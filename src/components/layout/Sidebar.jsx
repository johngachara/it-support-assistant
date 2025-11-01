import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { authService } from '../../services/auth/authService';
import { useState } from 'react';
import { showToast } from '../../utils/toast';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [signingOut, setSigningOut] = useState(false);

    // Get user role from user metadata
    const userRole = user?.user_metadata?.role;

    const navigation = [
        {
            name: 'Dashboard',
            href: '/',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
                </svg>
            )
        },
        {
            name: 'Create Report',
            href: '/create-report',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            name: 'All Reports',
            href: '/reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'New Chat',
            href: '/chat',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            )
        },
        {
            name: 'Chat History',
            href: '/chat/history',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    // Admin navigation item
    const adminNavigation = {
        name: 'User Management',
        href: '/admin/users',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    };

    // Secondary navigation (System section)
    const secondaryNavigation = [
        {
            name: 'Settings',
            href: '/settings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            name: 'Help',
            href: '/help',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    IT Support
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Assistant</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <div className="space-y-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => onClose()}
                                    className={({ isActive }) =>
                                        `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.name}</span>
                                </NavLink>
                            ))}
                        </div>

                        {/* Admin Section */}
                        {userRole === 'admin' && (
                            <div className="pt-6">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Administration
                                </div>
                                <div className="space-y-1 mt-2">
                                    <NavLink
                                        to={adminNavigation.href}
                                        onClick={() => onClose()}
                                        className={({ isActive }) =>
                                            `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                            }`
                                        }
                                    >
                                        {adminNavigation.icon}
                                        <span className="ml-3">{adminNavigation.name}</span>
                                    </NavLink>
                                </div>
                            </div>
                        )}

                        <div className="pt-6">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                System
                            </div>
                            <div className="space-y-1 mt-2">
                                {secondaryNavigation.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => onClose()}
                                        className={({ isActive }) =>
                                            `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                            }`
                                        }
                                    >
                                        {item.icon}
                                        <span className="ml-3">{item.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email}
                                </p>
                                {userRole === 'admin' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={async () => {
                                setSigningOut(true);
                                try {
                                    // Sign out from Supabase (this clears the session including MFA)
                                    await authService.signOut();
                                    showToast.success('Signed out successfully');
                                    // Navigate to login and replace history to prevent back navigation
                                    navigate('/login', { replace: true });
                                } catch (error) {
                                    console.error('Sign out error:', error);
                                    showToast.error('Failed to sign out. Please try again.');
                                    setSigningOut(false);
                                }
                            }}
                            disabled={signingOut}
                            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {signingOut ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing out...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
