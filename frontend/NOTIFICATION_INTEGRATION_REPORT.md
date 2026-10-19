# JANMITRA — Cross-Role Notification Integration Test Report

> **Lead Developer**: Faizan Rayeen (Citizen Portal Lead & Push Notifications Lead)  
> **Team**: ResolveIT (B.Tech Final Year)  
> **Target Civic Body**: Nagpur Municipal Corporation (NMC)  
> **Test Date**: 17 October 2026  
> **Status**: **100% PASS (5/5 Lifecycle Stages Verified)**

---

## 1. Executive Summary

This report documents the cross-role notification integration test conducted across the three primary JANMITRA actor roles:
1. **Window 1 (Citizen)**: Faizan Rayeen (`/citizen`)
2. **Window 2 (Department Officer)**: Officer Ramesh Patil — PWD (`/officer`)
3. **Window 3 (Field Worker)**: Suresh Kamble — Roads Maintenance (`/worker`)

The automated and multi-window test evaluated the end-to-end lifecycle:
$$\text{Submit} \longrightarrow \text{Assign} \longrightarrow \text{Work Done} \longrightarrow \text{Close}$$

All lifecycle events successfully dispatched dual-channel alerts:
- **Foreground Toast Alert**: In-browser reactive alert banner.
- **NotificationBell Badge Increment**: Red unread counter badge (`+1`) and real-time dropdown update.

---

## 2. Test Architecture & Environment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CROSS-ROLE NOTIFICATION TOPOLOGY                      │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ Window 1: Citizen Portal      │ Window 2: Officer Portal                    │
│ URL: http://localhost:5173/citizen│ URL: http://localhost:5173/officer       │
│ User: Faizan Rayeen (Citizen) │ User: Officer Ramesh Patil (PWD Lead)       │
├───────────────────────────────┴─────────────────────────────────────────────┤
│ Window 3: Worker Portal                                                     │
│ URL: http://localhost:5173/worker                                           │
│ User: Suresh Kamble (Technician / Field Inspector)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                  [Django Backend: notifications/triggers.py]
                                       │
                       ┌───────────────┴───────────────┐
                       ▼                               ▼
            [SQLite / Postgres DB]           [FCM Service / Celery]
            (Table: notifications)           (send_push_notification)
```

---

## 3. Detailed Stage-by-Stage Test Results

### Stage 1: Citizen Submits Complaint
- **Action**: Citizen files a civic grievance for a severe road crater on Central Avenue (`POST /api/v1/complaints/`).
- **Tracking ID**: `NMC-2026-W47EA`
- **Ward & Category**: Ward 2 (Dharampeth) &bull; Roads & Infrastructure (PWD).
- **Trigger**: `trigger_complaint_submitted(complaint)`

| Role | Window | Toast Notification Header & Message | Bell Badge | Result |
| :--- | :--- | :--- | :---: | :---: |
| **Citizen** | Window 1 | **Complaint Received**: *"Your complaint #NMC-2026-W47EA is being reviewed."* | `0 ➔ 1` | **PASS** |
| **Officer** | Window 2 | **New Complaint Logged**: *"New PWD complaint #NMC-2026-W47EA reported in Ward 2 requiring assignment."* | `0 ➔ 1` | **PASS** |

---

### Stage 2: Officer Assigns Field Worker
- **Action**: Officer reviews triage queue and assigns the pothole repair task to field technician Suresh Kamble (`PATCH /api/v1/complaints/:id/`).
- **Trigger**: `trigger_task_assigned(complaint, worker)`

| Role | Window | Toast Notification Header & Message | Bell Badge | Result |
| :--- | :--- | :--- | :---: | :---: |
| **Worker** | Window 3 | **New Task Assigned**: *"You have a new complaint to handle in Ward 2 (Dharampeth)."* | `0 ➔ 1` | **PASS** |
| **Citizen** | Window 1 | **Field Worker Assigned**: *"Field technician Suresh Kamble has been dispatched for repair on #NMC-2026-W47EA."* | `1 ➔ 2` | **PASS** |

---

### Stage 3: Worker Completes Repairs ('Work Done')
- **Action**: Field Worker reaches Shankar Nagar Square, fills crater with cold mix asphalt, captures GPS-tagged proof photo, and marks status as `Work Done`.
- **Trigger**: `trigger_work_done(complaint)`

| Role | Window | Toast Notification Header & Message | Bell Badge | Result |
| :--- | :--- | :--- | :---: | :---: |
| **Citizen** | Window 1 | **Issue Resolved?**: *"Please verify if the issue has been resolved."* | `2 ➔ 3` | **PASS** |
| **Officer** | Window 2 | **Work Done Proof Uploaded**: *"Worker Suresh Kamble marked #NMC-2026-W47EA as Work Done. Awaiting citizen inspection."* | `1 ➔ 2` | **PASS** |

---

### Stage 4: Citizen Verifies & Closes Complaint
- **Action**: Citizen inspects road surface, verifies clean bituminous leveling, rates resolution 5/5 Stars, and submits feedback:
  > *"Prompt road resurfacing by PWD team within 48 hours. Very satisfied with the smooth finish."*
- **Trigger**: `trigger_complaint_closed(complaint)`

| Role | Window | Toast Notification Header & Message | Bell Badge | Result |
| :--- | :--- | :--- | :---: | :---: |
| **Citizen** | Window 1 | **Complaint Closed**: *"Thank you for your report."* | `3 (Updated)` | **PASS** |
| **Worker** | Window 3 | **Task Verified & Closed (5 Stars)**: *"Citizen Faizan Rayeen verified #NMC-2026-W47EA resolution and awarded 5 stars! Great work."* | `1 ➔ 2` | **PASS** |

---

### Stage 5: Notification Bell Dismissal & Read Status
- **Action**: Users click "Mark all read" (`PATCH /api/v1/notifications/mark-read/`) or open individual notification cards.
- **Verification**:
  - Citizen unread counter resets to `0` (badge cleared).
  - Worker unread counter resets to `0` (badge cleared).
  - Database persistence: All notification records updated with `is_read = True`.

---

## 4. Test Matrix Summary

| Test ID | Test Scenario | Expected Outcome | Actual Outcome | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | Citizen Complaint Submission | Citizen confirmation + Officer triage notification | Dispatched & persisted in DB | ✅ PASS |
| **TC-02** | Department Worker Assignment | Worker task alert + Citizen progress alert | Dispatched & persisted in DB | ✅ PASS |
| **TC-03** | Field Worker Work Done Submission | Citizen review prompt + Officer proof alert | Dispatched & persisted in DB | ✅ PASS |
| **TC-04** | Citizen Verification & Star Rating | Citizen closure toast + Worker praise toast | Dispatched & persisted in DB | ✅ PASS |
| **TC-05** | NotificationBell Badge Counter | Increment counter when unread > 0, clear on mark read | Correct pulse badge & clear | ✅ PASS |
| **TC-06** | Database Audit Trail | Records linked to recipient & complaint ID | Correct foreign keys | ✅ PASS |

---

## 5. Verification Script Reference

The automated verification script is located at:
[`janmitra-backend/verify_notification_flow.py`](file:///C:/Users/Asus/Downloads/janmitra-backend/verify_notification_flow.py)

To re-run the verification suite at any time:
```bash
cd c:\Users\Asus\Downloads\janmitra-backend
python verify_notification_flow.py
```

---

## 6. Frontend Quick-Login Test Access

To visually observe notifications in 3 separate browser windows/tabs, use the quick-switcher buttons on the [Login Page](http://127.0.0.1:5173/login):

| Window | Target URL | Direct Test Button | Initial Route |
| :---: | :--- | :--- | :--- |
| **Window 1** | `http://127.0.0.1:5173/login` | Click **👤 Faizan (Citizen)** | [`/citizen`](http://127.0.0.1:5173/citizen) |
| **Window 2** | `http://127.0.0.1:5173/login` | Click **🏢 Officer Portal** | [`/officer`](http://127.0.0.1:5173/officer) |
| **Window 3** | `http://127.0.0.1:5173/login` | Click **👷 Field Worker** | [`/worker`](http://127.0.0.1:5173/worker) |

---
*Report certified by Faizan Rayeen & Team ResolveIT — Nagpur Municipal Corporation JANMITRA Initiative.*
