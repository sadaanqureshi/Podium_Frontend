'use client';
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getAllStudentsAPI, createStudentsAPI, updateStudentsAPI, deleteStudentsAPI } from '@/lib/api/apiService';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';

const StudentManagement = () => {
  const [Students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null); // Editing fix

  const feesColumns = [
    {
      header: 'Student Info',
      key: 'firstName',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
            {item.firstName?.[0]}
          </div>
          <div>
            <p className="font-bold text-sm text-[#0F172A]">{item.firstName} {item.lastName}</p>
            <p className="text-[10px] text-gray-400">{item.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      key: 'contactNumber',
      render: (item: any) => (
        <span className="text-sm font-semibold text-gray-600">
          {item.contactNumber || 'N/A'}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'isActive',
      align: 'center' as const,
      render: (item: any) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Joined At',
      key: 'createdAt',
      align: 'right' as const,
      render: (item: any) => (
        <span className="text-gray-400 font-bold">
          {new Date(item.createdAt).toLocaleDateString('en-GB')}
        </span>
      )
    }
  ];
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getAllStudentsAPI();
      setStudents(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  // Password field sirf "Create" mode mein required hai
  const StudentFields: FormField[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'text', required: !selectedUser, placeholder: selectedUser ? 'Leave blank to keep current' : 'Enter secure password' },
    { name: 'contactNumber', label: 'Contact Number', type: 'text' },
    { name: 'isActive', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }] }
  ];

  const handleSubmit = async (formData: FormData) => {
    setModalLoading(true);
    const data = Object.fromEntries(formData);
    try {
      if (selectedUser) {
        await updateStudentsAPI(selectedUser.id, data);
      } else {
        await createStudentsAPI(data);
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) { alert(err); }
    finally { setModalLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure?")) {
      await deleteStudentsAPI(id);
      fetchStudents();
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Student Management</h1>
          <p className="text-gray-500 text-sm font-medium">Add, update or remove faculty members.</p>
        </div>
        <button
          onClick={() => { setSelectedUser(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Add New Student
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <UserManagementTable
          data={Students}
          loading={loading}
          columnConfig={feesColumns}
          visibleActions={['edit', 'delete']} // Dono buttons dikhenge
          onEdit={(user) => { setSelectedUser(user); setModalOpen(true); }}
          onDelete={handleDelete}
          type="Student"
        />
      </div>

      <GenericFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedUser ? "Update Student Profile" : "Register New Student"}
        submitText={selectedUser ? "Save Updates" : "Create Account"}
        fields={StudentFields}
        onSubmit={handleSubmit}
        loading={modalLoading}
        initialData={selectedUser}
      />
    </div>
  );
};

export default StudentManagement;