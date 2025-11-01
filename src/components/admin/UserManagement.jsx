import { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast.js';
import { supabase } from "../../services/database/supabaseClient.js";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [createForm, setCreateForm] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'user'
    });

    const [editForm, setEditForm] = useState({
        full_name: '',
        role: 'user',
        email: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    // Helper function to call the edge function
    const callUserManagementFunction = async (action, params = {}) => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('No active session');
        }

        const response = await fetch(
            `${supabase.supabaseUrl}/functions/v1/user-management`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ action, ...params })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Request failed');
        }

        return result;
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const result = await callUserManagementFunction('list');
            setUsers(result.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast.error(error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            await callUserManagementFunction('create', {
                email: createForm.email,
                password: createForm.password,
                full_name: createForm.full_name,
                role: createForm.role
            });

            showToast.success('User created successfully');
            setShowCreateModal(false);
            setCreateForm({ email: '', password: '', full_name: '', role: 'user' });
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            showToast.error(error.message || 'Failed to create user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            await callUserManagementFunction('update', {
                userId: selectedUser.id,
                email: editForm.email,
                full_name: editForm.full_name,
                role: editForm.role
            });

            showToast.success('User updated successfully');
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            showToast.error(error.message || 'Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            await callUserManagementFunction('reset-password', {
                email: selectedUser.email,
                redirectUrl: `${window.location.origin}/reset-password`
            });

            showToast.success('Password reset email sent successfully');
            setShowResetPasswordModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error resetting password:', error);
            showToast.error(error.message || 'Failed to send reset email');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setActionLoading(true);

        try {
            await callUserManagementFunction('delete', {
                userId: selectedUser.id
            });

            showToast.success('User deleted successfully');
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast.error(error.message || 'Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditForm({
            full_name: user.user_metadata?.full_name || '',
            role: user.user_metadata?.role || 'user',
            email: user.email || ''
        });
        setShowEditModal(true);
    };

    const openResetPasswordModal = (user) => {
        setSelectedUser(user);
        setShowResetPasswordModal(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.user_metadata?.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
            case 'user':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        User Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage user accounts, roles, and permissions
                    </p>
                </div>

                {/* Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Role Filter */}
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>

                        {/* Create User Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Create User
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm || selectedRole !== 'all' ? 'Try adjusting your filters' : 'Get started by creating a new user'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Last Sign In
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                            <span className="text-white font-medium text-sm">
                                                                {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase()}
                                                            </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.user_metadata?.full_name || 'No name'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.user_metadata?.role)}`}>
                                                    {user.user_metadata?.role}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openResetPasswordModal(user)}
                                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                                >
                                                    Reset Password
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(user)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Create New User
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.full_name}
                                        onChange={(e) => setCreateForm({...createForm, full_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={createForm.role}
                                        onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Edit User
                                </h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.full_name}
                                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Updating...' : 'Update User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Reset Password
                                </h3>
                                <button
                                    onClick={() => setShowResetPasswordModal(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Send a password reset email to {selectedUser.email}?
                            </p>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowResetPasswordModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {actionLoading ? 'Sending...' : 'Send Reset Email'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Delete User
                                </h3>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Are you sure you want to delete {selectedUser.user_metadata?.full_name || selectedUser.email}? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {actionLoading ? 'Deleting...' : 'Delete User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;