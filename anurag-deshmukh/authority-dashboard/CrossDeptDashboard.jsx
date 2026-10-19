/**
 * ==============================================================================
 * JANMITRA - Civic Issue Reporting & Management System
 * File: src/pages/admin/CrossDeptDashboard.jsx
 * Author: Team ResolveIT (Lead: Faizan Rayeen)
 * Description: Super Admin Cross-Department Overview Dashboard.
 *              - Department Switcher (Toggle between All Departments & Specific Depts)
 *              - 4 Cross-Dept KPI Cards (PWD, SWM, PHE, Electrical)
 *              - Recharts Cross-Department Category Bar Chart
 *              - Ward-by-Department Civic Heatmap Table
 *              - Admin Quick Action Links
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '../../services/api';
import OfficerDashboard from '../officer/Dashboard';

// Department Switcher Options
const DEPT_TABS = [
  { id: 'all', label: 'All Departments', icon: '🏛️' },
  { id: 'pwd', dept_id: 1, label: 'PWD', fullName: 'Public Works Department', icon: '🚧' },
  { id: 'swm', dept_id: 2, label: 'Solid Waste', fullName: 'Solid Waste Management', icon: '🗑️' },
  { id: 'phe', dept_id: 3, label: 'Water Works', fullName: 'Public Health Engineering', icon: '🚰' },
  { id: 'electrical', dept_id: 4, label: 'Electrical', fullName: 'Electrical Department', icon: '💡' }
];

// Department Configuration for cross-department summary
const DEPT_CONFIGS = [
  {
    id: 1,
    code: 'PWD',
    name: 'PWD',
    title: 'Roads & Infrastructure',
    colorHex: '#1A56DB',
    accentBorder: 'border-blue-500',
    headerBg: 'bg-blue-50',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    tagColor: 'text-blue-600',
    icon: '🚧',
    defaultStats: { total: 142, pending: 38, resolved: 104, avg_days: 3.8 }
  },
  {
    id: 2,
    code: 'SWM',
    name: 'Solid Waste Management',
    title: 'Garbage & Cleanliness',
    colorHex: '#16A34A',
    accentBorder: 'border-emerald-500',
    headerBg: 'bg-emerald-50',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    tagColor: 'text-emerald-600',
    icon: '🗑️',
    defaultStats: { total: 210, pending: 45, resolved: 165, avg_days: 1.4 }
  },
  {
    id: 3,
    code: 'PHE',
    name: 'Public Health Eng. (PHE)',
    title: 'Water Works & Drainage',
    colorHex: '#0891B2',
    accentBorder: 'border-cyan-500',
    headerBg: 'bg-cyan-50',
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    tagColor: 'text-cyan-600',
    icon: '🚰',
    defaultStats: { total: 128, pending: 29, resolved: 99, avg_days: 2.6 }
  },
  {
    id: 4,
    code: 'Electrical',
    name: 'Electrical Department',
    title: 'Street Lighting & Poles',
    colorHex: '#D97706',
    accentBorder: 'border-amber-500',
    headerBg: 'bg-amber-50',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    tagColor: 'text-amber-600',
    icon: '💡',
    defaultStats: { total: 96, pending: 17, resolved: 79, avg_days: 1.9 }
  }
];

// Initial category breakdown data for Recharts (Roads, Garbage, Water, Street Lighting)
const DEFAULT_CATEGORY_BARS = [
  { category: 'Roads', fullName: 'Roads & Infrastructure (PWD)', total: 142, pending: 38, resolved: 104, color: '#1A56DB', icon: '🚧' },
  { category: 'Garbage', fullName: 'Garbage & Waste (SWM)', total: 210, pending: 45, resolved: 165, color: '#16A34A', icon: '🗑️' },
  { category: 'Water', fullName: 'Water & Drainage (PHE)', total: 128, pending: 29, resolved: 99, color: '#0891B2', icon: '🚰' },
  { category: 'Street Lighting', fullName: 'Street Lighting (Electrical)', total: 96, pending: 17, resolved: 79, color: '#D97706', icon: '💡' }
];

// Fallback heatmap matrix: Rows: Ward 1-4, Columns: PWD, SWM, PHE, Electrical
const DEFAULT_HEATMAP = [
  { ward: 1, ward_name: 'Ward 1', pwd: 42, swm: 58, phe: 31, electrical: 22 },
  { ward: 2, ward_name: 'Ward 2', pwd: 28, swm: 64, phe: 24, electrical: 18 },
  { ward: 3, ward_name: 'Ward 3', pwd: 36, swm: 48, phe: 45, electrical: 32 },
  { ward: 4, ward_name: 'Ward 4', pwd: 36, swm: 40, phe: 28, electrical: 24 }
];

export default function CrossDeptDashboard() {
  const navigate = useNavigate();

  // 1. Department Switcher State: 'all' | 'pwd' | 'swm' | 'phe' | 'electrical'
  const [activeTab, setActiveTab] = useState('all');

  // Loading and refreshing states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Cross-Dept Summary (4 KPI cards)
  const [deptStats, setDeptStats] = useState(DEPT_CONFIGS.map(d => ({
    ...d,
    ...d.defaultStats
  })));

  // 3. Category Bar Chart Data
  const [categoryChartData, setCategoryChartData] = useState(DEFAULT_CATEGORY_BARS);

  // 4. Ward Heatmap Data
  const [heatmapData, setHeatmapData] = useState(DEFAULT_HEATMAP);

  // Quick summary aggregates
  const cityTotals = useMemo(() => {
    const total = deptStats.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const pending = deptStats.reduce((acc, curr) => acc + (curr.pending || 0), 0);
    const resolved = deptStats.reduce((acc, curr) => acc + (curr.resolved || 0), 0);
    const avgDays = deptStats.length > 0 
      ? (deptStats.reduce((acc, curr) => acc + Number(curr.avg_days || 0), 0) / deptStats.length).toFixed(1)
      : '2.4';
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, pending, resolved, avgDays, resolutionRate };
  }, [deptStats]);

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    try {
      // 1. Fetch KPI cards for each of the 4 departments: GET /api/v1/dashboard/kpi/?dept_id=X
      const deptKpiPromises = DEPT_CONFIGS.map(dept => 
        api.get(`/api/v1/dashboard/kpi/?dept_id=${dept.id}`)
          .then(res => ({
            deptId: dept.id,
            total: res.data?.total ?? dept.defaultStats.total,
            pending: res.data?.pending ?? dept.defaultStats.pending,
            resolved: res.data?.resolved ?? dept.defaultStats.resolved,
            avg_days: res.data?.avg_days ?? dept.defaultStats.avg_days,
          }))
          .catch(() => ({
            deptId: dept.id,
            ...dept.defaultStats
          }))
      );

      // 2. Fetch cross-department overall KPI: GET /api/v1/dashboard/kpi/
      const overallKpiPromise = api.get('/api/v1/dashboard/kpi/')
        .then(res => res.data)
        .catch(() => null);

      // 3. Fetch 4 ward stats: GET /api/v1/dashboard/ward-stats/?dept_id=X
      const wardStatsPromises = [1, 2, 3, 4].map(id =>
        api.get(`/api/v1/dashboard/ward-stats/?dept_id=${id}`)
          .then(res => ({ deptId: id, data: res.data }))
          .catch(() => ({ deptId: id, data: null }))
      );

      const [kpiResults, overallKpi, wardResults] = await Promise.all([
        Promise.all(deptKpiPromises),
        overallKpiPromise,
        Promise.all(wardStatsPromises)
      ]);

      // Update 4 Department KPI cards
      setDeptStats(DEPT_CONFIGS.map(dept => {
        const fetched = kpiResults.find(k => k.deptId === dept.id);
        return {
          ...dept,
          total: fetched?.total ?? dept.defaultStats.total,
          pending: fetched?.pending ?? dept.defaultStats.pending,
          resolved: fetched?.resolved ?? dept.defaultStats.resolved,
          avg_days: fetched?.avg_days ?? dept.defaultStats.avg_days
        };
      }));

      // Update Recharts Bar Chart Data (Roads, Garbage, Water, Street Lighting)
      if (overallKpi && Array.isArray(overallKpi.categories) && overallKpi.categories.length > 0) {
        setCategoryChartData(overallKpi.categories.map((cat, idx) => ({
          category: cat.category,
          fullName: cat.fullName || cat.category,
          total: cat.total ?? DEFAULT_CATEGORY_BARS[idx % 4].total,
          pending: cat.pending ?? DEFAULT_CATEGORY_BARS[idx % 4].pending,
          resolved: cat.resolved ?? DEFAULT_CATEGORY_BARS[idx % 4].resolved,
          color: cat.color || DEFAULT_CATEGORY_BARS[idx % 4].color,
          icon: cat.icon || DEFAULT_CATEGORY_BARS[idx % 4].icon
        })));
      } else {
        // Compute from department KPIs if overall endpoint is unconfigured
        setCategoryChartData([
          {
            category: 'Roads',
            fullName: 'Roads & Infrastructure (PWD)',
            total: kpiResults[0]?.total ?? 142,
            pending: kpiResults[0]?.pending ?? 38,
            resolved: kpiResults[0]?.resolved ?? 104,
            color: '#1A56DB',
            icon: '🚧'
          },
          {
            category: 'Garbage',
            fullName: 'Garbage & Waste (SWM)',
            total: kpiResults[1]?.total ?? 210,
            pending: kpiResults[1]?.pending ?? 45,
            resolved: kpiResults[1]?.resolved ?? 165,
            color: '#16A34A',
            icon: '🗑️'
          },
          {
            category: 'Water',
            fullName: 'Water & Drainage (PHE)',
            total: kpiResults[2]?.total ?? 128,
            pending: kpiResults[2]?.pending ?? 29,
            resolved: kpiResults[2]?.resolved ?? 99,
            color: '#0891B2',
            icon: '🚰'
          },
          {
            category: 'Street Lighting',
            fullName: 'Street Lighting (Electrical)',
            total: kpiResults[3]?.total ?? 96,
            pending: kpiResults[3]?.pending ?? 17,
            resolved: kpiResults[3]?.resolved ?? 79,
            color: '#D97706',
            icon: '💡'
          }
        ]);
      }

      // Reconstruct Ward Heatmap Table from 4 department ward calls
      const newHeatmap = [1, 2, 3, 4].map(wNum => {
        const row = { ward: wNum, ward_name: `Ward ${wNum}` };
        
        // PWD (id: 1)
        const pwdWards = wardResults.find(r => r.deptId === 1)?.data;
        const pwdItem = Array.isArray(pwdWards) ? pwdWards.find(w => (w.ward || w.id) === wNum) : null;
        row.pwd = pwdItem?.count ?? DEFAULT_HEATMAP[wNum - 1].pwd;

        // SWM (id: 2)
        const swmWards = wardResults.find(r => r.deptId === 2)?.data;
        const swmItem = Array.isArray(swmWards) ? swmWards.find(w => (w.ward || w.id) === wNum) : null;
        row.swm = swmItem?.count ?? DEFAULT_HEATMAP[wNum - 1].swm;

        // PHE (id: 3)
        const pheWards = wardResults.find(r => r.deptId === 3)?.data;
        const pheItem = Array.isArray(pheWards) ? pheWards.find(w => (w.ward || w.id) === wNum) : null;
        row.phe = pheItem?.count ?? DEFAULT_HEATMAP[wNum - 1].phe;

        // Electrical (id: 4)
        const eleWards = wardResults.find(r => r.deptId === 4)?.data;
        const eleItem = Array.isArray(eleWards) ? eleWards.find(w => (w.ward || w.id) === wNum) : null;
        row.electrical = eleItem?.count ?? DEFAULT_HEATMAP[wNum - 1].electrical;

        return row;
      });

      setHeatmapData(newHeatmap);

    } catch (err) {
      console.warn('[CrossDeptDashboard] Utilizing fallback live data simulation:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Helper for Heatmap Cell Coloring (green if low, amber if medium, red if high)
  const getHeatmapColorClass = (count) => {
    const val = Number(count) || 0;
    if (val < 25) {
      // Low activity: Green
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
    } else if (val <= 42) {
      // Medium activity: Amber / Yellow
      return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
    } else {
      // High activity: Red
      return 'bg-rose-50 text-rose-800 border-rose-300 font-bold hover:bg-rose-100';
    }
  };

  // Custom Recharts Tooltip showing category name, total, pending, and resolved counts
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl text-xs border border-slate-700 min-w-[210px] space-y-2.5 animate-fadeIn">
          {/* Category Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-black text-sm" style={{ color: data.color || '#38BDF8' }}>
              <span>{data.icon || '📊'}</span>
              <span>{data.fullName || label}</span>
            </div>
          </div>

          {/* Counts: Total, Pending, Resolved */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-xl">
              <span className="text-slate-300 font-medium">Total Complaints:</span>
              <strong className="text-white font-black text-sm">{data.total}</strong>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <span className="font-medium flex items-center gap-1">
                <span>⏳</span>
                <span>Pending / Active:</span>
              </span>
              <strong className="font-black text-amber-200">{data.pending ?? 0}</strong>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span className="font-medium flex items-center gap-1">
                <span>✓</span>
                <span>Resolved Issues:</span>
              </span>
              <strong className="font-black text-emerald-200">{data.resolved ?? 0}</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/80 text-center">
            Click department tab for ward-level drilldown
          </div>
        </div>
      );
    }
    return null;
  };

  // ---------------------------------------------------------------------------
  // IF SPECIFIC DEPARTMENT SELECTED IN TOP BAR:
  // Render same Dashboard.jsx as officer for that dept
  // ---------------------------------------------------------------------------
  if (activeTab !== 'all') {
    const activeTabMeta = DEPT_TABS.find(t => t.id === activeTab);
    return (
      <div className="space-y-6">
        {/* Persistent Top Department Switcher Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
          {DEPT_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0d2a53] text-white shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Embedded Single-Department Officer Dashboard */}
        <OfficerDashboard
          deptCode={activeTab}
          deptId={activeTabMeta?.dept_id}
          onBackToAll={() => setActiveTab('all')}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // DEFAULT: ALL DEPARTMENTS CROSS-DEPARTMENT VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              JANMITRA Admin Dashboard
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Central Command
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            All Departments Overview &bull; Municipal Corporation
          </p>
        </div>

        {/* Refresh & Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-medium">City Health:</span>
            <strong className="text-slate-800 font-bold">{cityTotals.resolutionRate}% Resolved</strong>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-all disabled:opacity-50"
            title="Refresh All Department Data"
          >
            <svg
              className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Department Switcher (Top Bar) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center justify-between px-2 pt-1 pb-1.5 md:hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Switch View
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            Showing: <strong className="text-slate-800">All Departments</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {DEPT_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0d2a53] text-white shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cross-Dept Summary (4 cards in a row with Department Colour Accents) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Department Performance Cards
          </h2>
          <span className="text-xs text-slate-500">
            Total City Civic Complaints: <strong className="text-slate-800 font-bold">{cityTotals.total}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {deptStats.map((dept) => (
            <div
              key={dept.id}
              onClick={() => {
                const tabMatch = DEPT_TABS.find(t => t.dept_id === dept.id);
                if (tabMatch) setActiveTab(tabMatch.id);
              }}
              className={`bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer p-4.5 relative overflow-hidden group hover:border-slate-300`}
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: dept.colorHex }}
              />

              {/* Department Header */}
              <div className="flex items-start justify-between gap-2 pt-1 mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{dept.icon}</span>
                    <h3
                      className="text-sm font-black tracking-tight"
                      style={{ color: dept.colorHex }}
                    >
                      {dept.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {dept.title}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dept.badgeClass}`}>
                  {dept.code}
                </span>
              </div>

              {/* Main Total Number */}
              <div className="flex items-baseline justify-between mb-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600">Total Logged:</span>
                <span className="text-2xl font-black text-slate-900">
                  {loading ? '...' : dept.total}
                </span>
              </div>

              {/* Pending, Resolved & Avg Days Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100 text-xs">
                {/* Pending */}
                <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100/60">
                  <div className="text-[10px] font-bold text-amber-700 uppercase">Pending</div>
                  <div className="text-sm font-black text-amber-700 mt-0.5">
                    {loading ? '..' : dept.pending}
                  </div>
                </div>

                {/* Resolved */}
                <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100/60">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Resolved</div>
                  <div className="text-sm font-black text-emerald-700 mt-0.5">
                    {loading ? '..' : dept.resolved}
                  </div>
                </div>

                {/* Avg Days */}
                <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100/60">
                  <div className="text-[10px] font-bold text-blue-700 uppercase">Avg. Days</div>
                  <div className="text-sm font-black text-blue-700 mt-0.5">
                    {loading ? '..' : `${dept.avg_days}d`}
                  </div>
                </div>
              </div>

              {/* Hover Drilldown Hint */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors">
                <span className="font-semibold">View Officer Dashboard</span>
                <span className="font-bold">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 & 5. Middle Split Grid: Bar Chart & Ward Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4. Cross-Dept Bar Chart (Recharts) - 6 cols on lg */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Cross-Dept Issue Volume
                </h3>
                <p className="text-xs text-slate-500">
                  Total civic complaints grouped by category
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">
                Recharts Visual
              </span>
            </div>

            {/* Recharts Bar Chart (height 280px) */}
            <div className="w-full pt-2" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 20, right: 10, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="total"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={52}
                    animationDuration={800}
                  >
                    {categoryChartData.map((entry, index) => {
                      let cellFill = entry.color;
                      if (entry.category === 'Roads') cellFill = '#1A56DB';
                      else if (entry.category === 'Garbage') cellFill = '#16A34A';
                      else if (entry.category === 'Water') cellFill = '#0891B2';
                      else if (entry.category === 'Street Lighting') cellFill = '#D97706';
                      return <Cell key={`cell-${index}`} fill={cellFill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Color Legend Footer */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#1A56DB] shrink-0" />
              <span>PWD: Roads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#16A34A] shrink-0" />
              <span>SWM: Garbage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#0891B2] shrink-0" />
              <span>PHE: Water</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#D97706] shrink-0" />
              <span>Electrical: Lighting</span>
            </div>
          </div>
        </div>

        {/* 5. Ward Heatmap Table (Text Heatmap) - 6 cols on lg */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Ward-by-Department Heatmap
                </h3>
                <p className="text-xs text-slate-500">
                  Municipal complaint density matrix across Wards 1 to 4
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">
                4 x 4 Matrix
              </span>
            </div>

            {/* Heatmap Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                    <th className="py-2.5 px-3">Ward</th>
                    <th className="py-2.5 px-2 text-center text-blue-600">PWD</th>
                    <th className="py-2.5 px-2 text-center text-emerald-600">SWM</th>
                    <th className="py-2.5 px-2 text-center text-cyan-600">PHE</th>
                    <th className="py-2.5 px-2 text-center text-amber-600">Electrical</th>
                    <th className="py-2.5 px-3 text-right text-slate-700">Ward Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {heatmapData.map((row) => {
                    const rowTotal = (row.pwd || 0) + (row.swm || 0) + (row.phe || 0) + (row.electrical || 0);
                    return (
                      <tr key={row.ward} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {row.ward_name}
                        </td>
                        
                        {/* PWD Cell */}
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`inline-block w-12 py-1 text-center font-bold text-xs rounded-lg border transition-all ${getHeatmapColorClass(row.pwd)}`}
                            title={`Ward ${row.ward} PWD: ${row.pwd} complaints`}
                          >
                            {row.pwd}
                          </span>
                        </td>

                        {/* SWM Cell */}
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`inline-block w-12 py-1 text-center font-bold text-xs rounded-lg border transition-all ${getHeatmapColorClass(row.swm)}`}
                            title={`Ward ${row.ward} SWM: ${row.swm} complaints`}
                          >
                            {row.swm}
                          </span>
                        </td>

                        {/* PHE Cell */}
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`inline-block w-12 py-1 text-center font-bold text-xs rounded-lg border transition-all ${getHeatmapColorClass(row.phe)}`}
                            title={`Ward ${row.ward} PHE: ${row.phe} complaints`}
                          >
                            {row.phe}
                          </span>
                        </td>

                        {/* Electrical Cell */}
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`inline-block w-12 py-1 text-center font-bold text-xs rounded-lg border transition-all ${getHeatmapColorClass(row.electrical)}`}
                            title={`Ward ${row.ward} Electrical: ${row.electrical} complaints`}
                          >
                            {row.electrical}
                          </span>
                        </td>

                        {/* Row Total */}
                        <td className="py-3 px-3 text-right font-black text-slate-800">
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-black text-xs text-slate-900">
                    <td className="py-2.5 px-3">Dept Total</td>
                    <td className="py-2.5 px-2 text-center text-blue-700">
                      {heatmapData.reduce((acc, r) => acc + (r.pwd || 0), 0)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-emerald-700">
                      {heatmapData.reduce((acc, r) => acc + (r.swm || 0), 0)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-cyan-700">
                      {heatmapData.reduce((acc, r) => acc + (r.phe || 0), 0)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-amber-700">
                      {heatmapData.reduce((acc, r) => acc + (r.electrical || 0), 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900">
                      {cityTotals.total}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400">Activity Level:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>&lt; 25 (Low)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>25-42 (Moderate)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>&gt; 42 (Critical)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Quick Links Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Administrative Quick Actions
            </h3>
            <p className="text-xs text-slate-500">
              Direct shortcuts to critical governance workflows
            </p>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
            Municipal Admin Tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Link 1: Register New Worker */}
          <button
            onClick={() => navigate('/admin/workers?action=new')}
            className="group p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 text-left transition-all duration-200 flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              👷
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 flex items-center gap-1">
                <span>Register New Worker</span>
                <span className="text-blue-500 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Onboard field supervisors, technicians and inspectors across all 4 departments.
              </p>
              <span className="inline-block mt-2 text-[10px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full">
                /admin/workers?action=new
              </span>
            </div>
          </button>

          {/* Quick Link 2: View All Complaints */}
          <button
            onClick={() => navigate('/admin/complaints')}
            className="group p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 text-left transition-all duration-200 flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              📋
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700 flex items-center gap-1">
                <span>View All Complaints</span>
                <span className="text-emerald-500 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                City-wide civic complaints ledger with ward, category, and date range filters.
              </p>
              <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                /admin/complaints
              </span>
            </div>
          </button>

          {/* Quick Link 3: Pending Validation (all depts) */}
          <button
            onClick={() => navigate('/officer/validation')}
            className="group p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50/40 hover:border-purple-300 text-left transition-all duration-200 flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              ⚖️
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 group-hover:text-purple-700 flex items-center gap-1">
                <span>Pending Validation (All Depts)</span>
                <span className="text-purple-500 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Review complaints flagged by AI edge-case model or awaiting officer approval.
              </p>
              <span className="inline-block mt-2 text-[10px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
                /officer/validation
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
