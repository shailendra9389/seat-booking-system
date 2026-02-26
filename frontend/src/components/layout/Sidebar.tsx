import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
    LayoutDashboard,
    Grid3X3,
    Calendar,
    BookOpen,
    BarChart3,
    CalendarOff,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/seats', label: 'Seat Layout', icon: Grid3X3 },
    { path: '/calendar', label: 'Weekly Calendar', icon: Calendar },
    { path: '/my-bookings', label: 'My Bookings', icon: BookOpen },
];

const adminItems = [
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/holidays', label: 'Holidays', icon: CalendarOff },
];

export const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b border-surface-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Grid3X3 className="text-white" size={20} />
                    </div>
                    {!isCollapsed && (
                        <div className="fade-in">
                            <h1 className="font-bold text-white text-lg leading-tight">SeatBook</h1>
                            <p className="text-[11px] text-surface-400 uppercase tracking-wider">Office Manager</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                <div className="mb-3">
                    {!isCollapsed && (
                        <span className="px-3 text-[10px] font-semibold text-surface-500 uppercase tracking-widest">
                            Main Menu
                        </span>
                    )}
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-primary-500/15 text-primary-400 shadow-sm'
                                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                            }`
                        }
                    >
                        <item.icon size={20} className="shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                        {!isCollapsed && (
                            <ChevronRight
                                size={14}
                                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        )}
                    </NavLink>
                ))}

                {user?.role === 'admin' && (
                    <>
                        <div className="mt-6 mb-3">
                            {!isCollapsed && (
                                <span className="px-3 text-[10px] font-semibold text-surface-500 uppercase tracking-widest">
                                    Admin
                                </span>
                            )}
                        </div>
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-primary-500/15 text-primary-400 shadow-sm'
                                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                                    }`
                                }
                            >
                                <item.icon size={20} className="shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-surface-700/50 space-y-3">
                {!isCollapsed && user && (
                    <div className="flex items-center gap-3 px-2 fade-in">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-surface-200 truncate">{user.name}</p>
                            <p className="text-[11px] text-surface-500">
                                Squad {user.squadId} · Batch {user.batchId}
                            </p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:text-danger hover:bg-danger/10 transition-all duration-200"
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-surface-800/90 backdrop-blur-sm border border-surface-700/50 text-surface-300 hover:text-white shadow-xl"
            >
                <Menu size={20} />
            </button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-out
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-surface-900/95 backdrop-blur-xl border-r border-surface-700/30 shadow-2xl
        `}
            >
                {/* Desktop collapse toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-7 z-10 w-6 h-6 rounded-full bg-surface-700 border border-surface-600 items-center justify-center text-surface-400 hover:text-white hover:bg-primary-600 transition-all shadow-lg"
                >
                    <ChevronRight
                        size={12}
                        className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
                    />
                </button>

                {/* Mobile close */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden absolute top-4 right-4 text-surface-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                {sidebarContent}
            </aside>
        </>
    );
};
