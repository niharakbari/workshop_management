import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../hooks/useUsers';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
    const { user } = useAuth();
    const { users, isLoading, fetchUsers, updateRole } = useUsers();
    
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    
    // Modal states
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers({ search, role: roleFilter });
        }, 500);
        return () => clearTimeout(debounce);
    }, [search, roleFilter, fetchUsers]);

    const handleRoleChangeRequest = (targetUser, newRole) => {
        if (targetUser.id === user.id) {
            toast.error("You cannot change your own role.");
            return;
        }
        if (targetUser.role === newRole) return;
        
        setSelectedUser(targetUser);
        setSelectedRole(newRole);
        setIsConfirmOpen(true);
    };

    const confirmRoleChange = async () => {
        if (!selectedUser || !selectedRole) return;
        
        const success = await updateRole(selectedUser.id, selectedRole);
        if (success) {
            setIsConfirmOpen(false);
            setSelectedUser(null);
            setSelectedRole('');
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return <Badge type="danger">ADMIN</Badge>;
            case 'STAFF': return <Badge type="primary">STAFF</Badge>;
            default: return <Badge type="neutral">{role}</Badge>;
        }
    };

    const columns = [
        { 
            header: 'Name', 
            accessor: 'name',
            render: (row) => <div style={{ fontWeight: 500 }}>{row.name}</div>
        },
        { 
            header: 'Email', 
            accessor: 'email',
            render: (row) => <div style={{ color: 'var(--text-muted)' }}>{row.email}</div>
        },
        { 
            header: 'Current Role', 
            accessor: 'role',
            render: (row) => getRoleBadge(row.role)
        },
        { 
            header: 'Created At', 
            render: (row) => new Date(row.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            render: (row) => {
                if (row.id === user.id) {
                    return <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Current User (You)</span>;
                }
                
                return (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                            className="form-input" 
                            style={{ padding: '0.25rem 0.5rem', height: '32px', width: '120px', fontSize: '0.875rem' }}
                            value={row.role}
                            onChange={(e) => handleRoleChangeRequest(row, e.target.value)}
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="STAFF">Staff</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </div>
                );
            }
        }
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">User Management</h2>
                    <div className="page-subtitle">Manage system users and their access roles.</div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="input-wrapper search-input">
                    <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Search by name or email..." 
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="input-wrapper">
                    <Filter size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <select 
                        className="form-input" 
                        style={{ paddingLeft: '2.5rem' }}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="STAFF">Staff</option>
                        <option value="VIEWER">Viewer</option>
                    </select>
                </div>
            </div>

            {isLoading && users.length === 0 ? (
                <Spinner />
            ) : (
                <Table 
                    columns={columns} 
                    data={users} 
                    emptyMessage="No users found matching your criteria."
                />
            )}

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Confirm Role Change"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmRoleChange} isLoading={isLoading}>
                            Confirm Change
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', padding: '1rem 0' }}>
                    <ShieldAlert size={48} style={{ color: 'var(--warning-color, #F59E0B)' }} />
                    <p style={{ margin: 0 }}>
                        Are you sure you want to change <strong>{selectedUser?.name}</strong>'s role to <strong>{selectedRole}</strong>?
                    </p>
                    {selectedRole === 'ADMIN' && (
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            They will have full access to manage workshops, participants, and other users.
                        </p>
                    )}
                    {selectedUser?.role === 'ADMIN' && selectedRole !== 'ADMIN' && (
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--danger)' }}>
                            Warning: You are demoting an Admin. This action will be blocked if they are the last Admin.
                        </p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Users;
