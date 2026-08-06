'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAllTeachers } from '@/lib/store/features/userSlice';
import { createTeachersAPI, updateTeachersAPI, deleteTeachersAPI } from '@/lib/api/apiService';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useToast } from '@/context/ToastContext';

const TeacherManagement = () => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    
    // # REDUX STATE
    const { teachers, loading } = useAppSelector((state) => state.users);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState("");

    useEffect(() => { 
        dispatch(fetchAllTeachers({ page: 1, limit: 10 })); 
    }, [dispatch]);

    // # DYNAMIC FIELDS LOGIC
    const teacherFields: FormField[] = useMemo(() => {
        const baseFields: FormField[] = [
            { name: 'firstName', label: 'First Name', type: 'text', required: true },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'text', required: true },
            { name: 'contactNumber', label: 'Contact Number', type: 'text' },
            // { name: 'isActive', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }] }
        ];

        // Edit mode mein password field dalo
        if (selectedUser) {
            return [
                ...baseFields.slice(0, 3),
                { name: 'password', label: 'Reset Password', type: 'text', placeholder: 'Enter new password or leave blank' },
                ...baseFields.slice(3)
            ];
        }
        return baseFields;
    }, [selectedUser]);

    const teacherColumns = useMemo(() => [
        { header: 'Faculty Name', key: 'firstName' },
        { header: 'Official Email', key: 'email' },
        { header: 'Phone', key: 'contactNumber' },
        { 
            header: 'Status', key: 'isActive', align: 'center' as const,
            render: (item: any) => (
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                    item.isActive ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' : 'bg-app-bg text-text-muted border-border-subtle'
                }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ], []);

    const handleSubmit = async (formData: FormData) => {
        setModalLoading(true);
        const data = Object.fromEntries(formData);
        try {
            if (selectedUser) {
                if (!data.password) delete data.password;
                await updateTeachersAPI(selectedUser.id, data);
                showToast("Teacher Information updated", "success");
            } else {
                await createTeachersAPI(data);
                showToast("Teacher registered", "success");
            }
            setModalOpen(false);
            dispatch(fetchAllTeachers({ page: 1, limit: 10 }));
        } catch (err: any) { showToast(err.message, "error"); }
        finally { setModalLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic text-text-main">Teacher List</h1>
                <button onClick={() => { setSelectedUser(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">
                    <Plus size={18} strokeWidth={3} /> Register Teacher
                </button>
            </div>

            <div className="bg-card-bg rounded-[1rem] shadow-2xl border border-border-subtle overflow-hidden">
                <UserManagementTable
                    data={teachers.data || []}
                    loading={loading || false}
                    columnConfig={teacherColumns}
                    visibleActions={['edit', 'delete']}
                    onEdit={(user) => { setSelectedUser({ ...user, isActive: String(user.isActive) }); setModalOpen(true); }}
                    onDelete={(id, name) => { setDeleteId(id); setDeleteName(name); }}
                    type="Teacher"
                />
            </div>

            <DeleteConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { await deleteTeachersAPI(deleteId!); dispatch(fetchAllTeachers({ page: 1, limit: 10 })); setDeleteId(null); }} title={deleteName} />
            <GenericFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedUser ? "Edit Teacher Information" : "Add New Teacher"} fields={teacherFields} onSubmit={handleSubmit} loading={modalLoading} initialData={selectedUser} />
        </div>
    );
};

export default TeacherManagement;