import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, ClipboardList, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';

const Sidebar = () => {
    const { user } = useAuth();
    const { logout } = useDashboard();
    
    // Some routes might be restricted entirely. For now, all roles can read.
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Workshops', path: '/workshops', icon: CalendarDays },
        { name: 'Participants', path: '/participants', icon: Users },
        { name: 'Registrations', path: '/registrations', icon: ClipboardList }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Workshop Manager</h2>
            </div>
            
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            end={item.path === '/'}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
                {user?.role === 'ADMIN' && (
                    <NavLink 
                        to="/users" 
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <UserCog size={18} />
                        <span>System Users</span>
                    </NavLink>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{user?.name}</span>
                        <span className="profile-role">{user?.role}</span>
                    </div>
                </div>
                
                <button onClick={logout} className="btn-sidebar-logout">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
