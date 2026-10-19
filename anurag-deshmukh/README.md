# Anurag Deshmukh — Engineering Contributions & Work Portfolio
## Role: Frontend Lead — Authority Dashboard & Worker Management
**Team ResolveIT** | Project: **JANMITRA (Nagpur Municipal Corporation Civic Redressal Ecosystem)**  
**Academic Affiliation**: Priyadarshini Bhagwati College of Engineering (PBCOE), Nagpur | RTMNU (Final Year B.Tech CSE, 2026)  

---

## 1. Executive Summary

In the JANMITRA project, **Anurag Deshmukh** served as the **Frontend Lead for the Authority Dashboard and Worker Management System**. His primary responsibility was building the administrative control centers that enable municipal officials and field maintenance personnel to triage, assign, and track civic issues across all 4 pilot municipal wards in Nagpur.

*(Note: In the team work allocation, Anurag Deshmukh executed the Frontend Dashboard & Worker Panel modules, while Om Gadekar executed the AI & Computer Vision module).*

---

## 2. Core Modules & Key Deliverables

### A. Department Officer Triage Dashboard (`authority-dashboard/`)
- **`OfficerDashboard.jsx`**:
  - Real-time KPI summary cards: Total Reported (142), Pending Triage (38), Resolved & Closed (104), Average SLA Turnaround (3.8 Days).
  - Departmental views for Public Works Department (PWD), Solid Waste Management (SWM), Public Health Engineering (PHE), and Electricity (ELE).
  - Ward volume breakdown (Wards 1, 2, 3, and 4) tracking ticket distribution across Nagpur.
  - Priority triage queue highlighting high-risk and critical civic hazards.
- **`CrossDeptDashboard.jsx`**:
  - Super Admin view providing unified cross-departmental analytics for municipal leadership.
  - Interactive Recharts visualization showing resolution curves, SLA compliance, and ward-level distribution.

### B. Field Worker Management & Allocation (`worker-management/`)
- **`WorkerManagement.jsx`**:
  - Master field worker directory covering all 4 departments and 4 municipal wards.
  - Live search by worker name or Employee ID (e.g., `NMC-PWD-101`).
  - Dropdown filters for Department, Ward, and Employment Status (Active, Inactive, On Leave).
  - Active task count badges and instant status toggle action triggers.
- **`WorkerRegistrationForm.jsx`**:
  - Modal interface for onboarding new municipal field workers and assigning department/ward jurisdictions.

### C. Backend Dashboard Integration (`backend_dashboard_app/`)
- Integration with Django REST Framework endpoints under `dashboard/` serving KPI summaries, ward analytics, and worker roster data.

---

## 3. Directory Layout

```
anurag-deshmukh/
├── authority-dashboard/
│   ├── OfficerDashboard.jsx          # Zonal Officer Triage Dashboard
│   ├── CrossDeptDashboard.jsx        # Cross-Department Super Admin View
│   └── backend_dashboard_app/        # Django dashboard views & serializers
├── worker-management/
│   ├── WorkerManagement.jsx          # Worker Roster & Allocation Interface
│   └── WorkerRegistrationForm.jsx    # Technician Onboarding Form
└── README.md                         # This work summary
```

---
*Maintained by Anurag Deshmukh | Team ResolveIT (PBCOE Nagpur).*
