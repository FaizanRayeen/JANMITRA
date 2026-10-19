# Anurag Deshmukh — Engineering Contributions & Work Portfolio
## Role: AI & Data Lead + Authority Dashboard & Worker Frontend Co-Lead
**Team ResolveIT** | Project: **JANMITRA (Nagpur Municipal Corporation Civic Redressal Ecosystem)**  
**Academic Affiliation**: Priyadarshini Bhagwati College of Engineering (PBCOE), Nagpur | RTMNU (Final Year B.Tech CSE, 2026)  

---

## 1. Executive Summary & Role Reorganization

Anurag Deshmukh serves as the **AI & Data Lead** and **Authority Dashboard & Worker Frontend Co-Lead** for the JANMITRA project. 

> [!IMPORTANT]
> **Team Structure Update**:  
> In the updated project execution plan, the responsibilities previously allocated to Om Gadekar (Authority Dashboard, Recharts Analytics, Worker Panel, and Workforce Management) are now **co-handled and maintained by Anurag Deshmukh and Faizan Rayeen**. Anurag drives the analytical dashboards, worker allocation interfaces, and AI validation pipeline, while Faizan co-handles frontend integration and visual design consistency.

---

## 2. Core Modules & Deliverables

### A. Authority & Zonal Officer Dashboard (Frontend + Backend)
Located in [`authority-dashboard/`](./authority-dashboard/) and [`../frontend/src/pages/officer/`](../frontend/src/pages/officer/):
- **Zonal Officer Triage Dashboard (`OfficerDashboard.jsx`)**:
  - Live KPI cards: Total Reported, Pending Triage, Resolved & Closed, and Average SLA Turnaround.
  - Department-specific views (Public Works Department, Solid Waste Management, Water Supply, Electricity).
  - Ward volume breakdown (Wards 1 to 4) tracking ticket distribution across Nagpur zones.
  - Priority triage list prioritizing critical civic hazards.
- **Cross-Department Super Admin Dashboard (`CrossDeptDashboard.jsx`)**:
  - Citywide civic analytics combining performance across all 4 departments.
  - Recharts visual graphs: Monthly grievance resolution curves and ward choropleth metrics.
- **Backend Dashboard API (`backend_dashboard_app/`)**:
  - Located in [`authority-dashboard/backend_dashboard_app/`](./authority-dashboard/backend_dashboard_app/) and [`../backend/dashboard/`](../backend/dashboard/).
  - REST endpoints serving KPI summaries, ward analytics, and department performance data.

### B. Municipal Worker Management & Roster
Located in [`worker-management/`](./worker-management/) and [`../frontend/src/pages/admin/`](../frontend/src/pages/admin/):
- **Worker Management Panel (`WorkerManagement.jsx`)**:
  - Master field worker directory across all 4 municipal wards.
  - Real-time search by Employee ID (e.g., `NMC-PWD-101`) or worker name.
  - Filters by Department (PWD, SWM, PHE, ELE), Ward (1 to 4), and Status (Active, Inactive, On Leave).
  - Active task count badges and instant activation/deactivation action triggers.
- **Worker Registration Form (`WorkerRegistrationForm.jsx`)**:
  - Administrative modal for onboarding new municipal field technicians with departmental and ward assignment.

### C. AI & Computer Vision Validation Pipeline (Specifications & Design)
Located in [`ai-validation-module/`](./ai-validation-module/):
- **YOLOv8 Civic Defect Classifier (`yolo_validator.py`)**:
  - Deep learning model architecture to verify whether an uploaded photo is an authentic civic defect (road pothole, uncollected garbage, open manhole, broken streetlight) or a fake/synthetic image.
  - Minimum confidence threshold: 0.70.
- **Geospatial Duplicate Detector (`duplicate_detector.py`)**:
  - PostGIS spatial radius query (`ST_DWithin`) flagging new complaints submitted within **100 meters** of an existing open complaint in the same category.
- **Multi-Factor Priority Scoring Engine (`priority_engine.py`)**:
  - Computes weighted priority score:
    $$\text{Priority Score} = (w_1 \times \text{Defect Severity}) + (w_2 \times \text{Ward Population Density}) + (w_3 \times \text{Duplicate Volume}) + (w_4 \times \text{SLA Age})$$

---

## 3. Directory Contents

```
anurag-deshmukh/
├── authority-dashboard/
│   ├── OfficerDashboard.jsx          # Zonal Officer Triage Dashboard
│   ├── CrossDeptDashboard.jsx        # Cross-Department Super Admin View
│   └── backend_dashboard_app/        # Django dashboard views & serializers
├── worker-management/
│   ├── WorkerManagement.jsx          # Worker Roster & Allocation Interface
│   └── WorkerRegistrationForm.jsx    # Technician Onboarding Form
├── ai-validation-module/
│   └── README.md                     # AI Model Specifications & Formulas
└── README.md                         # This summary document
```

---
*Maintained by Anurag Deshmukh | Team ResolveIT (PBCOE Nagpur).*
