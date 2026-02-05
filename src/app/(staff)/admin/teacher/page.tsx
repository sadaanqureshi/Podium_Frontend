'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAllTeachers } from '@/lib/store/features/userSlice';
import { createTeachersAPI, updateTeachersAPI, deleteTeachersAPI } from '@/lib/api/apiService';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

const TeacherManagement = () => {
    const dispatch = useAppDispatch();
    const { teachers = { data: [] }, loading = false } = useAppSelector((state) => state.users || {});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // # DELETE STATES
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => { dispatch(fetchAllTeachers({ page: 1, limit: 10 })); }, [dispatch]);

    // # COLUMNS CONFIG: Updated for Theme consistency
    const teacherColumns = useMemo(() => [
        { header: 'Faculty Name', key: 'firstName' },
        { header: 'Official Email', key: 'email' },
        { header: 'Phone', key: 'contactNumber' },
        { 
            header: 'Status', key: 'isActive', align: 'center' as const,
            render: (item: any) => (
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                    item.isActive 
                    ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' 
                    : 'bg-app-bg text-text-muted border-border-subtle'
                }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ], []);

    const teacherFields: FormField[] = [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'text', required: !selectedUser },
        { name: 'contactNumber', label: 'Contact Number', type: 'text' },
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
            await deleteTeachersAPI(deleteId);
            dispatch(fetchAllTeachers({ page: 1, limit: 10 }));
            setDeleteId(null);
        } catch (err) { console.error(err); }
        finally { setDeleteLoading(false); }
    };

    const handleSubmit = async (formData: FormData) => {
        setModalLoading(true);
        const data = Object.fromEntries(formData);
        try {
            if (selectedUser) await updateTeachersAPI(selectedUser.id, data);
            else await createTeachersAPI(data);
            setModalOpen(false);
            dispatch(fetchAllTeachers({ page: 1, limit: 10 }));
        } catch (err) { console.error(err); }
        finally { setModalLoading(false); }
    };

    return (
        // Wrapper uses bg-app-bg and text-text-main for automatic theme switching
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main transition-colors duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic text-text-main">Faculty Terminal</h1>
                <button 
                    onClick={() => { setSelectedUser(null); setModalOpen(true); }} 
                    className="px-8 py-4 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl shadow-accent-blue/20 hover:opacity-90 active:scale-95 transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> Register Faculty
                </button>
            </div>

            {/* Table Container using card-bg and border-border-subtle */}
            <div className="bg-card-bg rounded-[2.5rem] shadow-2xl border border-border-subtle overflow-hidden">
                <UserManagementTable
                    data={teachers.data || []}
                    loading={loading}
                    columnConfig={teacherColumns}
                    visibleActions={['edit', 'delete']}
                    onEdit={(user) => { setSelectedUser({ ...user, isActive: String(user.isActive) }); setModalOpen(true); }}
                    onDelete={(id, name) => handleDeleteClick(id, name)}
                    type="Teacher"
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
                title={selectedUser ? "Modify Faculty Intel" : "Initialize Faculty Record"} 
                fields={teacherFields} 
                onSubmit={handleSubmit} 
                loading={modalLoading} 
                initialData={selectedUser} 
            />
        </div>
    );
};

export default TeacherManagement;