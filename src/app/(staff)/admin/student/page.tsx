'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAllStudents } from '@/lib/store/features/userSlice';
import { createStudentsAPI, updateStudentsAPI, deleteStudentsAPI } from '@/lib/api/apiService';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

const StudentManagement = () => {
    const dispatch = useAppDispatch();
    const { students = { data: [] }, loading = false } = useAppSelector((state) => state.users || {});
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => { dispatch(fetchAllStudents({ page: 1, limit: 10 })); }, [dispatch]);

    // # COLUMNS CONFIG: Updated with Theme-Aware Badges
    const studentColumns = useMemo(() => [
        { header: 'Student Name', key: 'firstName' }, 
        { header: 'Email Address', key: 'email' },
        { header: 'Contact', key: 'contactNumber' },
        { 
            header: 'Status', key: 'isActive', align: 'center' as const,
            render: (item: any) => (
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                    item.isActive 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}>
                    {item.isActive ? 'Active' : 'Suspended'}
                </span>
            )
        }
    ], []);

    const studentFields: FormField[] = [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'text', required: true },
        { name: 'password', label: 'Access Password', type: 'text', required: !selectedUser, placeholder: 'Enter secure password' },
        { name: 'contactNumber', label: 'Phone Number', type: 'text' },
        { name: 'isActive', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }] }
    ];

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteId(id);
        setDeleteName(name);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await deleteStudentsAPI(deleteId);
            dispatch(fetchAllStudents({ page: 1, limit: 10 }));
            setDeleteId(null);
        } catch (err) { console.error(err); }
        finally { setDeleteLoading(false); }
    };

    const handleSubmit = async (formData: FormData) => {
        setModalLoading(true);
        const data = Object.fromEntries(formData);
        try {
            if (selectedUser) await updateStudentsAPI(selectedUser.id, data);
            else await createStudentsAPI(data);
            setModalOpen(false);
            dispatch(fetchAllStudents({ page: 1, limit: 10 }));
        } catch (err) { console.error(err); }
        finally { setModalLoading(false); }
    };

    return (
        // bg-app-bg aur text-text-main central tokens use ho rahe hain
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main transition-colors duration-300">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-text-main italic">Student Terminal</h1>
                <button 
                    onClick={() => { setSelectedUser(null); setModalOpen(true); }} 
                    className="px-8 py-4 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl shadow-accent-blue/20 hover:opacity-90 active:scale-95 transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> Register Student
                </button>
            </div>

            {/* Table Container: card-bg aur border-border-subtle automatic dark mode handling */}
            <div className="bg-card-bg rounded-[2.5rem] shadow-2xl border border-border-subtle overflow-hidden">
                <UserManagementTable
                    data={students.data || []}
                    loading={loading}
                    columnConfig={studentColumns}
                    visibleActions={['edit', 'delete']}
                    onEdit={(user) => { setSelectedUser({ ...user, isActive: String(user.isActive) }); setModalOpen(true); }}
                    onDelete={(id, name) => handleDeleteClick(id, name)}
                    type="Student"
                />
            </div>

            <DeleteConfirmationModal 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={handleConfirmDelete} 
                title={deleteName} 
                loading={deleteLoading} 
            />

            <GenericFormModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title={selectedUser ? "Update Intel" : "Create Record"} 
                fields={studentFields} 
                onSubmit={handleSubmit} 
                loading={modalLoading} 
                initialData={selectedUser} 
            />
        </div>
    );
};

export default StudentManagement;