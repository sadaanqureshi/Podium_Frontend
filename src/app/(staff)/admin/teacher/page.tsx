'use client';
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getAllTeachersAPI, createTeachersAPI, updateTeachersAPI, deleteTeachersAPI } from '@/lib/api/apiService';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Table Columns config
  const feesColumns = [
    {
      header: 'Teacher Info',
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
      render: (item: any) => <span className="text-sm font-semibold text-gray-600">{item.contactNumber || 'N/A'}</span>
    },
    {
      header: 'Status',
      key: 'isActive',
      align: 'center' as const,
      render: (item: any) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Joined At',
      key: 'createdAt',
      align: 'right' as const,
      render: (item: any) => <span className="text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
    }
  ];

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await getAllTeachersAPI();
      setTeachers(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTeachers(); }, []);

  // --- FORM FIELDS SETUP WITH SELECT DROPDOWN ---
  const teacherFields: FormField[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'text', required: !selectedUser, placeholder: selectedUser ? 'Leave blank to keep current' : 'Enter secure password' },
    { name: 'contactNumber', label: 'Contact Number', type: 'text' },
    // Status Dropdown Logic
    { 
        name: 'isActive', 
        label: 'Account Status', 
        type: 'select', 
        options: [
            { label: 'Active (Working)', value: 'true' }, 
            { label: 'Inactive (Suspended)', value: 'false' }
        ],
        required: true 
    }
  ];

  const handleSubmit = async (formData: FormData) => {
    setModalLoading(true);
    const rawData = Object.fromEntries(formData);
    
    // --- DATA FORMATTING (String to Boolean) ---
    // Backend ko bool chahiye, UI se string milti hai
    const payload: any = {
      ...rawData,
      isActive: rawData.isActive === 'true' // Logical conversion
    };

    // Password safety check
    if (selectedUser && !payload.password) {
        delete payload.password;
    }

    try {
      if (selectedUser) {
        // Nayi API call path parameter ke saath: /admin/users/{userId}
        await updateTeachersAPI(selectedUser.id, payload);
        alert("Teacher updated!");
      } else {
        await createTeachersAPI(payload);
        alert("New teacher registered!");
      }
      setModalOpen(false);
      fetchTeachers(); // Table refresh
    } catch (err: any) { 
        alert(err.message || "Failed to save data"); 
    } finally { 
        setModalLoading(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Kiya aap waqayi is teacher ko delete karna chahte hain?")) {
      try {
        await deleteTeachersAPI(id);
        fetchTeachers();
      } catch (err) { alert("Delete failed"); }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Teacher Management</h1>
          <p className="text-gray-500 text-sm font-medium">Manage your faculty and staff members.</p>
        </div>
        <button
          onClick={() => { setSelectedUser(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Add New Teacher
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <UserManagementTable
          data={teachers}
          loading={loading}
          columnConfig={feesColumns}
          visibleActions={['edit', 'delete']}
          onEdit={(user) => { 
              // Convert boolean to string for dropdown initial value matching
              setSelectedUser({
                  ...user,
                  isActive: String(user.isActive)
              }); 
              setModalOpen(true); 
          }}
          onDelete={handleDelete}
          type="teacher"
        />
      </div>

      <GenericFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedUser ? "Update Profile" : "Register Teacher"}
        submitText={selectedUser ? "Save Updates" : "Create Account"}
        fields={teacherFields}
        onSubmit={handleSubmit}
        loading={modalLoading}
        initialData={selectedUser}
      />
    </div>
  );
};

export default TeacherManagement;