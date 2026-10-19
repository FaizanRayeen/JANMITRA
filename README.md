# JANMITRA — Civic Grievance Redressal Ecosystem
### Nagpur Municipal Corporation (NMC) Pilot Project
**Developed by Team ResolveIT** | **Affiliation**: Priyadarshini Bhagwati College of Engineering (PBCOE), Nagpur | **RTMNU (2026)**

---

## 🏛️ Project Overview

**JANMITRA** is an intelligent, transparent, and crowdsourced civic issue reporting and municipal resolution platform engineered for the **Nagpur Municipal Corporation (NMC)**. It eliminates traditional municipal grievance gridlock by establishing a real-time, closed-loop pipeline connecting citizens, zonal department officers (PWD, SWM, PHE, Electricity), and ward-level maintenance personnel.

### 👥 Team Work Distribution & Directory Structure

To showcase individual engineering contributions for college evaluation and GitHub portfolios, the repository includes dedicated contributor directories:

- **[`faizan-rayeen/`](./faizan-rayeen/) — Faizan Rayeen**
  - **Role**: Citizen Portal Lead & Push Notification System Architect
  - **Deliverables**: Complete Citizen Portal (Home, Multi-Step Report with GPS, Stepper, History, Profile), Firebase Cloud Messaging (FCM) push pipeline, Service Worker caching & offline IndexedDB sync, university work reports (Days 1–40 Master Summary PDF), test commands, and viva presentation scripts.
- **[`anurag-deshmukh/`](./anurag-deshmukh/) — Anurag Deshmukh**
  - **Role**: Frontend Lead — Authority Dashboard & Worker Management *(Swapped with Om)*
  - **Deliverables**: Zonal Officer Triage Dashboard (`OfficerDashboard.jsx`), Cross-Department Analytics (`CrossDeptDashboard.jsx`), Field Worker Management Panel (`WorkerManagement.jsx`), Worker Onboarding Form (`WorkerRegistrationForm.jsx`), Recharts analytics, and ward distribution views.
- **[`om-gadekar/`](./om-gadekar/) — Om Gadekar**
  - **Role**: AI/ML & Spatial Data Lead *(Swapped with Anurag)*
  - **Deliverables**: Visual defect validation pipeline (YOLOv8 + OpenCV), PostGIS 100-meter duplicate proximity queries (`ST_DWithin`), and weighted multi-factor priority scoring engine.
- **Backend Infrastructure (Anas Shaikh)**:
  - **Role**: Backend & Core Systems Lead
  - **Deliverables**: Django REST core architecture, Custom User RBAC authentication, Celery task orchestrations, and PostGIS spatial modeling.

---

## 📂 Repository Directory Layout

```
JANMITRA/
├── backend/                  # Django 5.x REST API & PostgreSQL models
│   ├── accounts/             # Custom User model, JWT authentication, RBAC
│   ├── complaints/           # Grievance CRUD, GPS models, 6-stage lifecycle
│   ├── dashboard/            # Zonal officer & admin analytics endpoints
│   ├── notifications/        # Firebase Admin SDK push alerts & management commands
│   └── config/               # Settings, CORS, WSGI/ASGI configuration
│
├── frontend/                 # React 18 + Vite 5 + Tailwind CSS PWA
│   ├── src/pages/citizen/    # Citizen Portal (Home, Submit, Detail, Profile, Help)
│   ├── src/pages/officer/    # Zonal Officer Triage Dashboard
│   ├── src/pages/admin/      # Worker Management & Cross-Department View
│   ├── src/services/         # Axios API instance with dynamic network host resolution
│   ├── src/firebase.js       # FCM push client, toasts, gentle permission recovery banner
│   └── public/               # Hardened Service Worker (firebase-messaging-sw.js)
│
├── faizan-rayeen/            # Faizan Rayeen's dedicated workspace & portfolio
│   ├── reports/              # 40-Day Master Summary PDF, Days 31-40 PDF, Chapter 1, Guides
│   ├── modules/              # Citizen Portal components, Firebase, Notification backend
│   └── README.md             # Detailed breakdown of Faizan Rayeen's contributions
│
├── anurag-deshmukh/          # Anurag Deshmukh's dedicated workspace & portfolio
│   ├── authority-dashboard/  # Officer Dashboard & Cross-Department analytics
│   ├── worker-management/    # Worker roster & onboarding modal
│   └── README.md             # Detailed breakdown of Anurag's Frontend role
│
├── om-gadekar/               # Om Gadekar's dedicated workspace & portfolio
│   ├── ai-validation-module/ # YOLOv8 validation & 100m duplicate radius specifications
│   └── README.md             # Detailed breakdown of Om's AI/ML role
│
├── docs/                     # 11 Master technical specification PDFs (PRD, SRS, Architecture)
├── screenshots/              # Real application UI screenshots (Desktop & Mobile)
├── push_to_github.bat        # 1-Click direct push helper script
└── README.md                 # Master project documentation
```

---

## ⚡ Quickstart Guide: Running Locally

### 1. Backend Setup (Django REST Framework)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```
- Open local web app: **[http://localhost:5173](http://localhost:5173)**
- Unified Login Switcher: **[http://localhost:5173/login](http://localhost:5173/login)**

---

## 📱 How to Run & Test on Mobile Phone (Wi-Fi LAN)

The frontend services feature **Dynamic Hostname Resolution**, automatically routing API requests to your computer's IP address when accessed over the network:

1. Connect your **smartphone** and **laptop** to the **same Wi-Fi network** (or laptop Mobile Hotspot).
2. Check your laptop's Wi-Fi IP address (e.g., `192.168.31.94`).
3. Start the backend with `python manage.py runserver 0.0.0.0:8000`.
4. Start the frontend with `npm run dev -- --host 0.0.0.0`.
5. On your phone's browser (Chrome or Safari), visit:
   ```text
   http://192.168.31.94:5173
   ```
6. *Firewall Note (if blocked)*: Run in PowerShell as Administrator:
   ```powershell
   New-NetFirewallRule -DisplayName "Janmitra Dev" -Direction Inbound -LocalPort 5173,8000 -Protocol TCP -Action Allow
   ```

---

## 🔑 Pre-Configured Demo Accounts

| Role | Mobile Number | Password | Ward & Department | Key Capabilities |
| :--- | :---: | :---: | :--- | :--- |
| **Citizen (Faizan)** | `9876543210` | `password123` | Ward 4 (Mangalwari) | Lead developer profile with verified tickets |
| **Citizen (Ward 1)** | `9900000021` | `citizen@123` | Ward 1 (Dharampeth) | Report issues, pin Nagpur GPS, rate repairs |
| **Officer (PWD)** | `9900000001` | `officer@123` | Roads & Infrastructure | Review AI validation, assign field workers |
| **Officer (SWM)** | `9900000002` | `officer@123` | Solid Waste Management | Garbage triage and sanitary inspections |
| **Field Worker** | `9900000005` | `worker@123` | PWD Ward 1 Maintenance | Receive task push alerts, upload proof of work |
| **Super Admin** | `9900000000` | `admin@123` | NMC Central Admin | Citywide analytics and SLA oversight |

---

## 📜 Academic Master Documentation Suite (11 Volumes)

All 11 technical specification PDFs are located in [`docs/`](./docs/):
1. `01_PRD_ResolveIT_Janmitra.pdf` — Product Requirement Document
2. `02_SRS_ResolveIT_Janmitra.pdf` — Software Requirements Specification
3. `03_Architecture_ResolveIT_Janmitra.pdf` — System Architecture & Data Flows
4. `04_UIUX_Design_ResolveIT_Janmitra.pdf` — UI/UX Design System & Wireframes
5. `05_Development_Document_ResolveIT_Janmitra.pdf` — Engineering & Implementation Guide
6. `06_Team_Distribution_ResolveIT_Janmitra.pdf` — Team Roles & Execution Plan
7. `07_Dept_Dashboard_ResolveIT_Janmitra.pdf` — Department Officer Specifications
8. `08_Worker_Management_ResolveIT_Janmitra.pdf` — Field Worker Allocation Framework
9. `09_TechStack_ResolveIT_Janmitra.pdf` — Technology Stack Specifications
10. `10_Project_Breakdown_ResolveIT_Janmitra.pdf` — 40-Day Sprint Breakdown
11. `11_Day_by_Day_Prompts_ResolveIT_Janmitra.pdf` — Complete 40-Day Development Prompts

---
*Built with ❤️ for Nagpur Municipal Corporation by Team ResolveIT (PBCOE Nagpur).*
