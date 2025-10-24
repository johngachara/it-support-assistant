import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleMenuToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
                <Header onMenuToggle={handleMenuToggle} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;