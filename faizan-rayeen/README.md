# Faizan Rayeen — Engineering Contributions & Work Portfolio
## Role: Citizen Portal Lead & Push Notification System Architect
**Team ResolveIT** | Project: **JANMITRA (Nagpur Municipal Corporation Civic Redressal Ecosystem)**  
**Academic Affiliation**: Priyadarshini Bhagwati College of Engineering (PBCOE), Nagpur | RTMNU (Final Year B.Tech CSE, 2026)  

---

## 1. Executive Summary

Over the 40-day engineering sprint of JANMITRA, Faizan Rayeen served as the primary architect and developer for the **Citizen Grievance Redressal Portal** and the **Dual-Mode Push Notification Infrastructure**. 

With the team restructuring where Om Gadekar's work was reassigned, Faizan Rayeen and Anurag Deshmukh now jointly handle and maintain the frontend ecosystems (Faizan driving the Citizen Portal & Notification UX, while collaborating on cross-portal design systems).

---

## 2. Core Deliverables & Key Modules

### A. Citizen Grievance Redressal Portal (React + Vite + Tailwind CSS + Leaflet)
Located in [`modules/citizen-portal-pages/`](./modules/citizen-portal-pages/) and [`../frontend/src/pages/citizen/`](../frontend/src/pages/citizen/):
- **Citizen Home & Dashboard (`Home.jsx`)**: Active vs resolved grievance KPI counters, NMC civic advisory broadcast banner, quick-action grievance submission button, and recent ticket activity cards.
- **Interactive Issue Submission Wizard (`Submit.jsx`)**: 3-step filing wizard featuring category selector (PWD, SWM, PHE, Electricity), drag-and-drop Leaflet GPS map centered at Nagpur (`21.14580° N, 79.08820° E`), address auto-detect, and camera photo capture.
- **6-Stage Grievance Stepper & Detail (`ComplaintDetail.jsx`)**: Real-time visual lifecycle tracker:
  `Submitted` ➔ `Validated` ➔ `Assigned` ➔ `In-Progress` ➔ `Work Done` ➔ `Closed` (with citizen star rating and photographic proof-of-work review).
- **Complaints History (`MyComplaints.jsx`)**: Searchable and filterable ticket archive with status badges and SLA timers.
- **Citizen Profile (`Profile.jsx`)**: Ward assignment, contact details, and municipal notification preferences.
- **Help & FAQ Portal (`Help.jsx`)**: Civic redressal procedures, emergency municipal contacts, and user guide.
- **Unified Portal Authentication (`LoginPage.jsx`)**: Shared authentication engine with direct 1-click test login switchers for all 4 roles.

### B. Push Notification System & Offline Service Worker (Firebase FCM + Django)
Located in [`modules/`](./modules/) and [`../frontend/src/firebase.js`](../frontend/src/firebase.js):
- **Service Worker Hardening (`public/firebase-messaging-sw.js`)**: 351 lines of production-grade service worker code. Configured with Cache Storage API for logos/badges, IndexedDB push queueing (`janmitra_offline_sync_db`) for low-connectivity offline fallback, and `skipWaiting` / `clients.claim` for seamless background updates.
- **Client Notification Handler (`src/firebase.js`)**: VAPID token handshake, gentle floating permission recovery banner when notifications are blocked, and real-time foreground toast modal with direct *"View Status"* deep-links.
- **Backend Push Dispatcher (`notifications/` app)**: Django models, triggers, and Celery tasks syncing push dispatches with in-app notification center database records.
- **Diagnostic Management Command (`send_test_notification.py`)**: CLI diagnostic tool allowing evaluators to dispatch simulated or live push notifications independently of browser state.

---

## 3. Work Reports & Documentation Suite

All official academic documents and verification reports authored by Faizan Rayeen are archived in the [`reports/`](./reports/) directory:

| Document | Format | Description |
| :--- | :---: | :--- |
| **40-Day Master Engineering Summary** | [PDF](./reports/JANMITRA_Faizan_Rayeen_Day1_to_Day40_Master_Summary.pdf) \| [MD](./reports/JANMITRA_Faizan_Rayeen_Day1_to_Day40_Master_Summary.md) | 7-page university report with embedded real screenshots, architecture flowcharts, and 40-day milestone matrix. |
| **Days 31 to 40 Work Report** | [PDF](./reports/JANMITRA_Faizan_Rayeen_Days_31_to_40_Work_Report.pdf) \| [MD](./reports/JANMITRA_Faizan_Rayeen_Days_31_to_40_Work_Report.md) | Hardening, notification testing guide, demo video scripts, and executive summary. |
| **Final Executive Summary** | [MD](./reports/FINAL_EXECUTIVE_SUMMARY.md) | Holistic capstone project retrospective covering metrics, architecture, and outcomes. |
| **Official College Sign-Off Certificate** | [MD](./reports/PROJECT_COMPLETION_SIGNOFF.md) | College sign-off document with guide endorsement and viva checklist. |
| **Thesis Chapter 1: Introduction** | [MD](./reports/REPORT_CHAPTER_1_INTRODUCTION.md) | Academic thesis introductory chapter following RTMNU engineering guidelines. |
| **Dual-Screen Viva Demo Protocol** | [MD](./reports/NOTIFICATION_DEMO_GUIDE.md) | Step-by-step viva presentation protocol connecting citizen mobile phone with officer laptop. |
| **Notification Testing & Debugging Guide** | [MD](./reports/notification_test_guide.md) | Complete FCM credential, browser permission, and service worker debugging handbook. |
| **Production Testing Checklist** | [MD](./reports/PRODUCTION_TEST_CHECKLIST.md) | 4-role verification checklist and master matrix of all 25 seeded demo accounts. |
| **3-Minute Demo Video Walkthrough Script** | [MD](./reports/DEMO_VIDEO_SCRIPT.md) | Video recording script with real Nagpur municipal defect imagery guidelines. |

---

## 4. Performance & Audit Metrics

- **System Health**: Django `manage.py check` — **0 Errors** (0 Silenced).
- **Database Migrations**: 100% applied across PostgreSQL models.
- **Lifecycle Journey Test**: `run_e2e_journey_test.py` — **100% PASS** across all 5 stages.
- **Notification Verification**: `verify_notification_flow.py` — **100% PASS** across Citizen, Officer, and Worker.
- **Build Quality**: Vite 5.4 production bundle built cleanly in 7.55s.

---
*Maintained by Faizan Rayeen | Lead Developer, Team ResolveIT.*
