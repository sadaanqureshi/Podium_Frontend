'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAllStudents } from '@/lib/store/features/userSlice';
import { createStudentsAPI, updateStudentsAPI, deleteStudentsAPI } from '@/lib/api/apiService';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useToast } from '@/context/ToastContext';

const StudentManagement = () => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    
    // # REDUX STATE
    const { students, loading } = useAppSelector((state) => state.users);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState("");

    useEffect(() => { 
        dispatch(fetchAllStudents({ page: 1, limit: 10 })); 
    }, [dispatch]);

    // # DYNAMIC FIELDS LOGIC
    const studentFields: FormField[] = useMemo(() => {
        const baseFields: FormField[] = [
            { name: 'firstName', label: 'First Name', type: 'text', required: true },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'text', required: true },
            { name: 'contactNumber', label: 'Phone Number', type: 'text' },
            // { name: 'isActive', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }] }
        ];

        // Agar Edit mode hai (selectedUser), toh password field add kardo
        if (selectedUser) {
            return [
                ...baseFields.slice(0, 3), 
                { name: 'password', label: 'Update Password', type: 'text', placeholder: 'Leave empty to keep current' },
                ...baseFields.slice(3)
            ];
        }
        return baseFields;
    }, [selectedUser]);

    const studentColumns = useMemo(() => [
        { header: 'Student Name', key: 'firstName' }, 
        { header: 'Email Address', key: 'email' },
        { header: 'Contact', key: 'contactNumber' },
        { 
            header: 'Status', key: 'isActive', align: 'center' as const,
            render: (item: any) => (
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    item.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}>
                    {item.isActive ? 'Active' : 'Suspended'}
                </span>
            )
        }
    ], []);

    const handleSubmit = async (formData: FormData) => {
        setModalLoading(true);
        const data = Object.fromEntries(formData);
        try {
            if (selectedUser) {
                // Agar password empty hai edit mein, toh usey payload se hata do
                if (!data.password) delete data.password;
                await updateStudentsAPI(selectedUser.id, data);
                showToast("Student data updated", "success");
            } else {
                await createStudentsAPI(data);
                showToast("New student created", "success");
            }
            setModalOpen(false);
            dispatch(fetchAllStudents({ page: 1, limit: 10 }));
        } catch (err: any) { showToast(err.message, "error"); }
        finally { setModalLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight italic">Student Registry</h1>
                <button onClick={() => { setSelectedUser(null); setModalOpen(true); }} className="px-8 py-4 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl shadow-accent-blue/20 transition-all active:scale-95">
                    <Plus size={18} strokeWidth={3} /> Register Student
                </button>
            </div>

            <div className="bg-card-bg rounded-[2.5rem] shadow-2xl border border-border-subtle overflow-hidden">
                <UserManagementTable
                    data={students.data || []}
                    loading={loading || false}
                    columnConfig={studentColumns}
                    visibleActions={['edit', 'delete']}
                    onEdit={(user) => { setSelectedUser({ ...user, isActive: String(user.isActive) }); setModalOpen(true); }}
                    onDelete={(id, name) => { setDeleteId(id); setDeleteName(name); }}
                    type="Student"
                />
            </div>

            <DeleteConfirmationModal 
                isOpen={!!deleteId} onClose={() => setDeleteId(null)} 
                onConfirm={async () => {
                    await deleteStudentsAPI(deleteId!);
                    dispatch(fetchAllStudents({ page: 1, limit: 10 }));
                    setDeleteId(null);
                }} 
                title={deleteName} 
            />

            <GenericFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedUser ? "Update Intel" : "Create Record"} fields={studentFields} onSubmit={handleSubmit} loading={modalLoading} initialData={selectedUser} />
        </div>
    );
};

export default StudentManagement;