# JANMITRA — Civic Grievance Redressal Ecosystem
### Nagpur Municipal Corporation (NMC) Pilot Project
**Developer**: **Faizan Rayeen** | **Department of Computer Science & Engineering**  
**Institution**: Priyadarshini Bhagwati College of Engineering (PBCOE), Nagpur | **RTMNU (Final Year B.Tech, 2026)**

---

## 🏛️ Project Overview

**JANMITRA** is an intelligent, transparent, and crowdsourced civic issue reporting and municipal resolution ecosystem engineered for the **Nagpur Municipal Corporation (NMC)**. The platform bridges the communication gap between citizens, municipal zonal officers, and ward-level maintenance personnel to accelerate grievance redressal with verified photographic proof and real-time tracking.

---

## 👤 Developer Portfolio: Faizan Rayeen

All core deliverables, reports, and architecture specifications developed by **Faizan Rayeen** are organized inside the **[`faizan-rayeen/`](./faizan-rayeen/)** directory:

- **[`faizan-rayeen/reports/`](./faizan-rayeen/reports/)**:
  - 📄 **[40-Day Master Engineering Summary (PDF)](./faizan-rayeen/reports/JANMITRA_Faizan_Rayeen_Day1_to_Day40_Master_Summary.pdf)** — 7-page university report with embedded screenshots, flowcharts, and 40-day milestone matrix.
  - 📄 **[Days 31 to 40 Work Report (PDF)](./faizan-rayeen/reports/JANMITRA_Faizan_Rayeen_Days_31_to_40_Work_Report.pdf)** — Production hardening, FCM test guide, and capstone sign-off.
  - 📘 **[Academic Thesis Chapter 1: Introduction](./faizan-rayeen/reports/REPORT_CHAPTER_1_INTRODUCTION.md)** — Formal university thesis introductory chapter.
  - 📱 **[Dual-Screen Viva Demo Protocol](./faizan-rayeen/reports/NOTIFICATION_DEMO_GUIDE.md)** — Step-by-step viva presentation protocol connecting citizen phone with officer laptop.
  - 🛠️ **[Notification Testing & Debugging Guide](./faizan-rayeen/reports/notification_test_guide.md)** — FCM credentials, browser permissions, and service worker guide.
  - 📋 **[Production Testing Checklist](./faizan-rayeen/reports/PRODUCTION_TEST_CHECKLIST.md)** — 4-role verification checklist & 25 demo accounts reference table.
  - 🎓 **[Official College Sign-Off Certificate](./faizan-rayeen/reports/PROJECT_COMPLETION_SIGNOFF.md)** — Certified college completion document.
- **[`faizan-rayeen/modules/`](./faizan-rayeen/modules/)**:
  - `citizen-portal-pages/` — Citizen Portal (`Home.jsx`, `Submit.jsx`, `ComplaintDetail.jsx`, `MyComplaints.jsx`, `Profile.jsx`, `Help.jsx`).
  - `firebase.js` & `firebase-messaging-sw.js` — Client FCM handlers, foreground toasts, and offline IndexedDB background sync.
  - `notifications-backend/` — Custom Django diagnostic command (`send_test_notification.py`) and notification triggers.

---

## 📂 Repository Directory Layout

```
JANMITRA/
├── faizan-rayeen/            # Faizan Rayeen's dedicated workspace & work portfolio
│   ├── reports/              # 40-Day Master Summary PDF, Days 31-40 PDF, Chapter 1, Guides
│   ├── modules/              # Citizen Portal components, Firebase, Notification backend
│   └── README.md             # Detailed breakdown of Faizan Rayeen's 40-day contributions
│
├── frontend/                 # React 18 + Vite 5 + Tailwind CSS PWA
│   ├── src/pages/citizen/    # Citizen Portal (Home, Submit with GPS, Detail, Profile)
│   ├── src/pages/officer/    # Zonal Officer Triage Dashboard
│   ├── src/pages/admin/      # Field Worker Management & Roster
│   ├── src/services/         # Axios API instance with dynamic network host resolution
│   ├── src/firebase.js       # FCM push client, toasts, gentle permission recovery banner
│   └── public/               # Hardened Service Worker (firebase-messaging-sw.js)
│
├── backend/                  # Django 5.x REST API & PostgreSQL models
│   ├── accounts/             # Custom User model, JWT authentication, RBAC
│   ├── complaints/           # Grievance CRUD, GPS models, 6-stage lifecycle
│   ├── dashboard/            # Zonal officer & admin analytics endpoints
│   ├── notifications/        # Firebase Admin SDK push alerts & management commands
│   └── config/               # Settings, CORS, WSGI/ASGI configuration
│
├── docs/                     # 11 Master technical specification PDFs (PRD, SRS, Architecture)
├── screenshots/              # Real application UI screenshots (Desktop & Mobile)
├── push_to_github.bat        # 1-Click push script
└── README.md                 # Master project documentation
```

---

## ⚡ Quickstart: Running Locally

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
2. Check your laptop's Wi-Fi IP address: **`192.168.31.94`**.
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

## 📜 Master Technical Documentation Suite (11 Volumes)

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
*Developed by Faizan Rayeen | PBCOE Nagpur / RTMNU.*
