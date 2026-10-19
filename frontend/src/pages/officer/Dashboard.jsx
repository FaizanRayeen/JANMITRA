/**
 * ==============================================================================
 * JANMITRA - Civic Issue Reporting & Management System
 * File: src/pages/officer/Dashboard.jsx
 * Author: Team ResolveIT
 * Description: Department Officer Dashboard.
 *              Displays department-specific civic resolution metrics, ward
 *              distribution, priority queue, and worker capacity.
 *              Reusable both directly for Officer portal and inside Admin switcher.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Department Definitions
const DEPARTMENT_CONFIG = {
  pwd: {
    id: 1,
    code: 'pwd',
    name: 'Public Works Department (PWD)',
    category: 'Roads & Infrastructure',
    colorHex: '#1A56DB',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    accentBorder: 'border-blue-500',
    lightBg: 'bg-blue-50/60',
    icon: '🚧',
    officer: 'Er. Rajesh Sharma, Executive Engineer'
  },
  swm: {
    id: 2,
    code: 'swm',
    name: 'Solid Waste Management (SWM)',
    category: 'Garbage & Waste',
    colorHex: '#16A34A',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    accentBorder: 'border-emerald-500',
    lightBg: 'bg-emerald-50/60',
    icon: '🗑️',
    officer: 'Dr. Anand Kulkarni, Chief Sanitation Officer'
  },
  phe: {
    id: 3,
    code: 'phe',
    name: 'Public Health Engineering (PHE / Water Works)',
    category: 'Water & Drainage',
    colorHex: '#0891B2',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    accentBorder: 'border-cyan-500',
    lightBg: 'bg-cyan-50/60',
    icon: '🚰',
    officer: 'Er. Sandeep Patil, Superintending Engineer'
  },
  electrical: {
    id: 4,
    code: 'electrical',
    name: 'Electrical Department',
    category: 'Street Lighting',
    colorHex: '#D97706',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    accentBorder: 'border-amber-500',
    lightBg: 'bg-amber-50/60',
    icon: '💡',
    officer: 'Er. Vikas Deshpande, Executive Engineer (Elec.)'
  }
};

export default function OfficerDashboard({ deptCode = 'pwd', deptId = null, onBackToAll = null }) {
  const navigate = useNavigate();

  // Resolve config from deptCode or deptId
  const getDept = () => {
    if (deptId) {
      const match = Object.values(DEPARTMENT_CONFIG).find(d => d.id === Number(deptId));
      if (match) return match;
    }
    const cleanCode = (deptCode || '').toLowerCase().replace(/[^a-z]/g, '');
    if (cleanCode.includes('swm') || cleanCode.includes('waste')) return DEPARTMENT_CONFIG.swm;
    if (cleanCode.includes('phe') || cleanCode.includes('water')) return DEPARTMENT_CONFIG.phe;
    if (cleanCode.includes('elec') || cleanCode.includes('light')) return DEPARTMENT_CONFIG.electrical;
    return DEPARTMENT_CONFIG.pwd;
  };

  const currentDept = getDept();

  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    total: 142,
    pending: 38,
    resolved: 104,
    in_progress: 22,
    avg_days: 3.8,
    active_workers: 18,
    sla_compliance: 88.5
  });

  const [wardBreakdown, setWardBreakdown] = useState([
    { ward: 1, name: 'Ward 1', count: 42, pending: 12, resolved: 30 },
    { ward: 2, name: 'Ward 2', count: 28, pending: 7, resolved: 21 },
    { ward: 3, name: 'Ward 3', count: 36, pending: 11, resolved: 25 },
    { ward: 4, name: 'Ward 4', count: 36, pending: 8, resolved: 28 }
  ]);

  const [recentQueue, setRecentQueue] = useState([
    { id: 'MC-2026-081', issue: 'Pothole cluster on Great Nag Road', ward: 1, priority: 'High', status: 'Pending Validation', time: '2 hrs ago' },
    { id: 'MC-2026-079', issue: 'Broken culvert near Dharampeth square', ward: 2, priority: 'Critical', status: 'In-Progress', time: '4 hrs ago' },
    { id: 'MC-2026-074', issue: 'Asphalt peeling near Manewada signal', ward: 4, priority: 'Medium', status: 'Assigned', time: '6 hrs ago' },
  ]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch Department KPI
        const kpiRes = await api.get(`/api/v1/dashboard/kpi/?dept_id=${currentDept.id}`);
        if (isMounted && kpiRes.data) {
          setKpiData(prev => ({
            ...prev,
            total: kpiRes.data.total ?? prev.total,
            pending: kpiRes.data.pending ?? prev.pending,
            resolved: kpiRes.data.resolved ?? prev.resolved,
            in_progress: kpiRes.data.in_progress ?? prev.in_progress,
            avg_days: kpiRes.data.avg_days ?? prev.avg_days,
            resolution_rate: kpiRes.data.resolution_rate ?? 73.2
          }));
        }
      } catch (err) {
        console.warn(`[OfficerDashboard] Using fallback KPIs for Dept ${currentDept.name}:`, err.message);
      }

      try {
        // Fetch Ward Stats for Department
        const wardRes = await api.get(`/api/v1/dashboard/ward-stats/?dept_id=${currentDept.id}`);
        if (isMounted && Array.isArray(wardRes.data) && wardRes.data.length > 0) {
          setWardBreakdown(wardRes.data);
        }
      } catch (err) {
        console.warn(`[OfficerDashboard] Using fallback Ward Stats for Dept ${currentDept.name}:`, err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [currentDept.id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Department Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs" style={{ backgroundColor: `${currentDept.colorHex}15` }}>
            <span>{currentDept.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentDept.badgeColor}`}>
                {currentDept.code.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Civic Category: <strong className="text-slate-700">{currentDept.category}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {currentDept.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              In-Charge: {currentDept.officer}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onBackToAll && (
            <button
              onClick={onBackToAll}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Cross-Dept</span>
            </button>
          )}

          <button
            onClick={() => navigate('/officer/validation')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0d2a53] hover:bg-[#12386e] rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <span>Review Validations</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-black">
              {kpiData.pending}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Highlights (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Complaints */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Reported</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{loading ? '...' : kpiData.total}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">100%</span>
            <span>Nagpur City Wards</span>
          </div>
          <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: currentDept.colorHex }} />
        </div>

        {/* Pending Action */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Triage</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{loading ? '...' : kpiData.pending}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requires supervisor assignment</div>
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" />
        </div>

        {/* Resolved Successfully */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Resolved & Closed</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{loading ? '...' : kpiData.resolved}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {kpiData.total > 0 ? `${Math.round((kpiData.resolved / kpiData.total) * 100)}% resolution efficiency` : 'Verified by Citizens'}
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
        </div>

        {/* Resolution TAT */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Average Turnaround</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{loading ? '...' : `${kpiData.avg_days} Days`}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Target SLA: &lt; 4.0 Days</div>
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
        </div>
      </div>

      {/* 2-Column Split: Ward Distribution & Priority Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Distribution Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900">Ward Breakdown ({currentDept.code.toUpperCase()})</h2>
              <p className="text-xs text-slate-500">Issue volume across Municipal administrative zones</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-600">
              4 Wards
            </span>
          </div>

          <div className="space-y-3.5">
            {wardBreakdown.map((w, idx) => {
              const maxCount = Math.max(...wardBreakdown.map(item => item.count || 1));
              const pct = Math.round(((w.count || 0) / maxCount) * 100);
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-800">Ward {w.ward || idx + 1}</span>
                    <span className="text-slate-700">{w.count || 0} Issues ({w.pending || 0} pending)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: currentDept.colorHex }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Action Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Recent Priority Complaints</h2>
                <p className="text-xs text-slate-500">Escalated items requiring field action</p>
              </div>
              <button
                onClick={() => navigate('/officer/validation')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentQueue.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{item.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Ward {item.ward}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                        item.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 truncate">{item.issue}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-amber-600 block">{item.status}</span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need to allocate field manpower?</span>
            <button
              onClick={() => navigate('/officer/workers')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Open Worker Roster &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
