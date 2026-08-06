import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    
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
            </nav>

            <div className="sidebar-footer">
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
        </aside>
    );
};

export default Sidebar;
