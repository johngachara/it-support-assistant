// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ToasterProvider from './components/ToasterProvider';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CreateReport from './pages/CreateReport';
import ReportsList from './components/report/ReportsList.jsx';
import ChatPage from './pages/ChatPage';
import HelpPage from './pages/HelpPage';
import Login from './pages/Login';
import './styles/global.css'
import EditReportForm from "./components/forms/EditReportForm.jsx";
import ViewReportModal from "./components/report/ViewReportModal.jsx";


function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <ErrorBoundary>
                        <ToasterProvider />
                        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
                        <Routes>
                            {/* Public route */}
                            <Route path="/login" element={<Login />} />

                            {/* Protected routes */}
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<Dashboard />} />
                                <Route path="create-report" element={<CreateReport />} />
                                <Route path="reports" element={<ReportsList />} />
                                <Route path="reports/:id/edit" element={<EditReportForm />} />
                                <Route path="reports/:id" element={<ViewReportModal />} />
                                <Route path="chat" element={<ChatPage />} />
                                <Route path="chat/:view" element={<ChatPage />} />
                                <Route path="chat/continue/:chatId" element={<ChatPage />} />
                                <Route path="help" element={<HelpPage />} />
                                {/* Redirect any unknown routes to dashboard */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Route>
                        </Routes>
                        </div>
                    </ErrorBoundary>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;