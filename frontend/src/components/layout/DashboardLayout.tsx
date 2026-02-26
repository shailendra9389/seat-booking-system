import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';

export const DashboardLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen gradient-bg text-surface-200">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-4 lg:p-8 pt-16 lg:pt-8">
                    <Outlet />
                </div>
            </main>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#e2e8f0',
                        border: '1px solid rgba(148, 163, 184, 0.15)',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        fontSize: '14px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#e2e8f0' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' },
                    },
                }}
            />
        </div>
    );
};
