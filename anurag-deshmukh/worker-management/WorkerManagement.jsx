/**
 * ==============================================================================
 * JANMITRA - Civic Issue Reporting & Management System
 * File: src/pages/admin/WorkerManagement.jsx (also via src/admin/WorkerManagement.jsx)
 * Developer: Faizan Rayeen (Admin & Worker Management Lead)
 * Description: City-wide and Department-specific Field Worker Management table.
 *              Includes search, multi-filter bar, active tasks count, status toggle,
 *              edit modal, and new worker registration.
 * ==============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import WorkerRegistrationForm from '../../components/WorkerRegistrationForm';

export const WorkerManagement = ({ officerDepartment = null }) => {
  const { user } = useAuth();

  // If logged-in user is a Dept Officer, automatically lock to their department
  const isOfficer = user?.role === 'dept_officer' || user?.role === 'officer' || Boolean(officerDepartment);
  const activeDepartment = officerDepartment || (isOfficer ? user?.department : null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(activeDepartment || 'All');
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Workers Data & Pagination
  const [workers, setWorkers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkerForEdit, setSelectedWorkerForEdit] = useState(null);

  /**
   * Fetch workers from API:
   * GET /api/v1/admin/workers/?search=X&department=Y&ward=Z&status=S&page=P
   */
  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: 20
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedWard !== 'All') params.ward = selectedWard;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const response = await api.get('/api/v1/admin/workers/', { params });
      const data = response.data;

      let list = [];
      let count = 0;

      if (Array.isArray(data)) {
        list = data;
        count = data.length;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
        count = data.count || data.results.length;
      }

      setWorkers(list);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / 20) || 1);
    } catch (err) {
      console.warn('[WorkerManagement] Using sample workers in offline/mock mode:', err);
      // Fallback seed data for local preview
      const mockList = [
        {
          id: 'w1',
          employee_id: 'MC-PWD-1021',
          name: 'Suresh Meshram',
          department: 'PWD',
          ward: 'Ward 1',
          designation: 'Pothole Repair Technician',
          active_tasks: 3,
          status: 'Active',
          mobile: '9822345671'
        },
        {
          id: 'w2',
          employee_id: 'MC-SWM-2044',
          name: 'Ashok Gaikwad',
          department: 'Solid Waste Management',
          ward: 'Ward 2',
          designation: 'Sanitation Supervisor',
          active_tasks: 1,
          status: 'Active',
          mobile: '9822345672'
        },
        {
          id: 'w3',
          employee_id: 'MC-PHE-3012',
          name: 'Vinod Thakre',
          department: 'Public Health Engineering',
          ward: 'Ward 3',
          designation: 'Drainage Pipe Fitter',
          active_tasks: 0,
          status: 'On Leave',
          mobile: '9822345673'
        },
        {
          id: 'w4',
          employee_id: 'MC-ELE-4089',
          name: 'Pravin Wankhede',
          department: 'Electrical',
          ward: 'Ward 4',
          designation: 'Street Light Lineman',
          active_tasks: 4,
          status: 'Active',
          mobile: '9822345674'
        },
        {
          id: 'w5',
          employee_id: 'MC-PWD-1090',
          name: 'Nitin Bawankar',
          department: 'PWD',
          ward: 'Ward 2',
          designation: 'Road Quality Inspector',
          active_tasks: 0,
          status: 'Inactive',
          mobile: '9822345675'
        }
      ];

      // Filter locally in fallback mode
      let filtered = mockList;
      if (activeDepartment) filtered = filtered.filter((w) => w.department === activeDepartment);
      if (selectedDept !== 'All') filtered = filtered.filter((w) => w.department === selectedDept);
      if (selectedWard !== 'All') filtered = filtered.filter((w) => w.ward === selectedWard);
      if (selectedStatus !== 'All') filtered = filtered.filter((w) => w.status === selectedStatus);
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (w) => w.name.toLowerCase().includes(q) || w.employee_id.toLowerCase().includes(q)
        );
      }

      setWorkers(filtered);
      setTotalCount(filtered.length);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedDept, selectedWard, selectedStatus, activeDepartment]);

  useEffect(() => {
    fetchWorkers();
    // Support ?action=new deep-link from Admin Dashboard Quick Actions
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setSelectedWorkerForEdit(null);
      setIsModalOpen(true);
    }
  }, [fetchWorkers]);

  /**
   * Toggle worker active/inactive status
   * PATCH /api/v1/admin/workers/:id/
   */
  const handleToggleStatus = async (worker) => {
    const newStatus = worker.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/api/v1/admin/workers/${worker.id}/`, { status: newStatus });
    } catch {
      // Optimistic update
    }

    setWorkers((prev) =>
      prev.map((w) => (w.id === worker.id ? { ...w, status: newStatus } : w))
    );

    setToastMsg(`Worker ${worker.name} marked as ${newStatus}.`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleEditClick = (worker) => {
    setSelectedWorkerForEdit(worker);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedWorkerForEdit(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setToastMsg('Worker record updated successfully.');
    setTimeout(() => setToastMsg(''), 4000);
    fetchWorkers();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-3.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xl animate-slideInRight flex items-center gap-2">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= PAGE TITLE & ADD BUTTON ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Worker Management</span>
            {isOfficer && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1A56DB]">
                {activeDepartment}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOfficer
              ? `Manage and assign field personnel for ${activeDepartment}.`
              : 'Oversee field workforce, departmental distribution, and task loads across all 4 Municipal wards.'}
          </p>
        </div>

        {/* 'Add New Worker' button (top right, blue) */}
        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A56DB] hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <span className="text-base font-black leading-none">+</span>
          <span>Add New Worker</span>
        </button>
      </div>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by worker name or Employee ID (e.g. MC-PWD-1021)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#0d2a53] focus:ring-1 focus:ring-blue-100 outline-none"
          />
        </div>

        {/* Filter Bar: Department | Ward | Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Department Filter (Locked if officer) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              disabled={Boolean(activeDepartment)}
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className={`w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white ${
                activeDepartment ? 'bg-slate-100 text-slate-500 font-bold' : ''
              } outline-none`}
            >
              <option value="All">All Departments</option>
              <option value="PWD">PWD (Roads & Infra)</option>
              <option value="Solid Waste Management">Solid Waste Management (SWM)</option>
              <option value="Public Health Engineering">Public Health Eng. (PHE)</option>
              <option value="Electrical">Electrical</option>
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Ward
            </label>
            <select
              value={selectedWard}
              onChange={(e) => {
                setSelectedWard(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white outline-none"
            >
              <option value="All">All Wards</option>
              <option value="Ward 1">Ward 1 (Dharampeth)</option>
              <option value="Ward 2">Ward 2 (Dhantoli)</option>
              <option value="Ward 3">Ward 3 (Nehru Nagar)</option>
              <option value="Ward 4">Ward 4 (Mangalwari)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active (Available)</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= WORKER TABLE ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Dept.</th>
                <th className="py-3.5 px-4">Ward</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4 text-center">Active Tasks</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                /* Loading skeletons */
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="p-4 text-center"><div className="h-4 w-6 bg-slate-200 rounded mx-auto" /></td>
                    <td className="p-4"><div className="h-4 w-14 bg-slate-200 rounded" /></td>
                    <td className="p-4 text-right"><div className="h-4 w-12 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : workers.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                    <div className="text-3xl">👷‍♂️</div>
                    <div className="text-sm font-bold text-slate-700">No workers found</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click <span className="font-semibold text-[#1A56DB]">Add New Worker</span> to register personnel for your ward.
                    </p>
                    <button
                      onClick={handleAddClick}
                      className="mt-2 inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#1A56DB] text-white font-bold rounded-xl text-xs"
                    >
                      + Add New Worker
                    </button>
                  </td>
                </tr>
              ) : (
                /* Workers Rows */
                workers.map((worker) => {
                  const isActive = worker.status === 'Active';
                  return (
                    <tr
                      key={worker.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Employee ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {worker.employee_id || worker.username}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{worker.name || worker.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{worker.mobile}</div>
                      </td>

                      {/* Dept */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {worker.department}
                        </span>
                      </td>

                      {/* Ward */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          📍 {worker.ward}
                        </span>
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {worker.designation || 'Field Worker'}
                      </td>

                      {/* Active Tasks */}
                      <td className="py-3 px-4 text-center font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                            (worker.active_tasks || 0) > 0
                              ? 'bg-amber-100 text-amber-800 font-black'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {worker.active_tasks ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            worker.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : worker.status === 'On Leave'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              worker.status === 'Active'
                                ? 'bg-emerald-600'
                                : worker.status === 'On Leave'
                                ? 'bg-amber-600'
                                : 'bg-rose-600'
                            }`}
                          />
                          {worker.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit (Pencil) */}
                          <button
                            type="button"
                            onClick={() => handleEditClick(worker)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Worker Profile"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          {/* Toggle Active / Inactive */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(worker)}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${
                              isActive
                                ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                            }`}
                            title={isActive ? 'Deactivate Worker' : 'Activate Worker'}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        {totalCount > 20 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {workers.length} of {totalCount} workers (20 per page)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg disabled:opacity-50 font-bold"
              >
                &larr; Prev
              </button>
              <span className="px-2 py-1 font-bold text-slate-800">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg disabled:opacity-50 font-bold"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= WORKER REGISTRATION / EDIT MODAL ================= */}
      <WorkerRegistrationForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleFormSuccess}
        worker={selectedWorkerForEdit}
        officerDepartment={activeDepartment}
      />

    </div>
  );
};

export default WorkerManagement;
