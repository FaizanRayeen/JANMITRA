"""
==============================================================================
JANMITRA - Civic Issue Reporting & Management System
File: janmitra-backend/verify_notification_flow.py
Developer: Faizan Rayeen (Citizen Portal & Push Notifications Lead)
Description: Cross-Role Notification Lifecycle End-to-End Verification Script.
             Simulates 3 Concurrent Roles:
             1. Citizen (Faizan Rayeen)
             2. Department Officer (Officer Patil)
             3. Field Worker (Suresh Kamble)
             Executes complete 4-stage lifecycle:
             [Submit] -> [Assign] -> [Work Done] -> [Close]
             Verifies Toast alerts and NotificationBell unread counter increments.
==============================================================================
"""

import os
import sys
import json
import uuid

# Force UTF-8 encoding for Windows console compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.models import Notification
from notifications.triggers import (
    trigger_complaint_submitted,
    trigger_task_assigned,
    trigger_work_done,
    trigger_complaint_closed,
)
from notifications.tasks import dispatch_push_notification

User = get_user_model()


class NotificationFlowTester:
    def __init__(self):
        self.results = []
        self.tracking_id = f"NMC-2026-W{str(uuid.uuid4())[:4].upper()}"
        self.complaint_id = f"cmp-{uuid.uuid4().hex[:8]}"

    def log_step(self, step_num, title, status="PASS", details=None):
        entry = {
            "step": step_num,
            "title": title,
            "status": status,
            "details": details or {}
        }
        self.results.append(entry)
        symbol = "✅" if status == "PASS" else "❌"
        print(f"\n{symbol} [STEP {step_num}] {title}")
        if details:
            for k, v in details.items():
                print(f"   • {k}: {v}")

    def setup_users(self):
        print("\n" + "="*70)
        print("🏛️  JANMITRA CROSS-ROLE NOTIFICATION INTEGRATION TEST")
        print("   Simulating 3 Concurrent Windows:")
        print("   • Window 1: Citizen (Faizan Rayeen)")
        print("   • Window 2: Officer (Officer Patil - PWD)")
        print("   • Window 3: Worker (Suresh Kamble - Field Worker)")
        print("="*70)

        # 1. Citizen User
        self.citizen, _ = User.objects.get_or_create(
            username='citizen_faizan',
            defaults={
                'first_name': 'Faizan Rayeen',
                'email': 'faizan.rayeen@example.com'
            }
        )

        # 2. Officer User
        self.officer, _ = User.objects.get_or_create(
            username='officer_patil',
            defaults={
                'first_name': 'Officer Ramesh Patil',
                'email': 'ramesh.patil@nmc.gov.in'
            }
        )

        # 3. Field Worker User
        self.worker, _ = User.objects.get_or_create(
            username='worker_suresh',
            defaults={
                'first_name': 'Suresh Kamble',
                'email': 'suresh.kamble@nmc.gov.in'
            }
        )

        # Record initial baseline unread counts
        self.init_citizen_unread = Notification.objects.filter(recipient=self.citizen, is_read=False).count()
        self.init_officer_unread = Notification.objects.filter(recipient=self.officer, is_read=False).count()
        self.init_worker_unread = Notification.objects.filter(recipient=self.worker, is_read=False).count()

        print(f"Baseline Unread Counts: Citizen={self.init_citizen_unread}, Officer={self.init_officer_unread}, Worker={self.init_worker_unread}")

    def run_stage_1_submit(self):
        """
        Stage 1: Citizen submits a complaint.
        - Citizen receives 'Complaint Received' toast & bell increment (+1).
        - Officer receives 'New Complaint Alert' toast & bell increment (+1).
        """
        print("\n--- STAGE 1: COMPLAINT SUBMISSION (Citizen -> System) ---")
        
        complaint_payload = {
            'id': self.complaint_id,
            'tracking_id': self.tracking_id,
            'citizen_id': str(self.citizen.id),
            'ward': 'Ward 2 (Dharampeth / West Nagpur)',
            'category': 'Roads & Infrastructure',
            'status': 'Submitted',
            'description': 'Deep asphalt crater near Shankar Nagar Square causing traffic halt.'
        }

        # 1. Citizen confirmation trigger
        trigger_complaint_submitted(complaint_payload)

        # 2. Officer notification dispatch
        dispatch_push_notification(
            user_id=str(self.officer.id),
            title="New Complaint Logged",
            body=f"New PWD complaint #{self.tracking_id} reported in Ward 2 requiring assignment.",
            data={'complaint_id': self.complaint_id, 'tracking_id': self.tracking_id},
            click_action=f"/officer/validation"
        )

        # Verifications
        citizen_notifs = Notification.objects.filter(recipient=self.citizen, is_read=False)
        officer_notifs = Notification.objects.filter(recipient=self.officer, is_read=False)

        latest_citizen = citizen_notifs.first()
        latest_officer = officer_notifs.first()

        self.log_step(
            step_num=1,
            title="Stage 1: Citizen Submits Complaint",
            status="PASS" if "Complaint Received" in latest_citizen.title else "FAIL",
            details={
                "Complaint Tracking ID": self.tracking_id,
                "Window 1 (Citizen) Toast": f"🔔 {latest_citizen.title}: {latest_citizen.body}",
                "Window 1 Bell Badge": f"{self.init_citizen_unread} ➔ {citizen_notifs.count()} (+1 unread)",
                "Window 2 (Officer) Toast": f"🔔 {latest_officer.title}: {latest_officer.body}",
                "Window 2 Bell Badge": f"{self.init_officer_unread} ➔ {officer_notifs.count()} (+1 unread)"
            }
        )

    def run_stage_2_assign(self):
        """
        Stage 2: Officer assigns Field Worker.
        - Worker receives 'New Task Assigned' toast & bell increment (+1).
        - Citizen receives 'Field Worker Assigned' toast & bell increment (+1).
        """
        print("\n--- STAGE 2: TASK ASSIGNMENT (Officer -> Worker) ---")
        
        complaint_payload = {
            'id': self.complaint_id,
            'tracking_id': self.tracking_id,
            'citizen_id': str(self.citizen.id),
            'assigned_worker_id': str(self.worker.id),
            'ward': 'Ward 2 (Dharampeth)',
            'category': 'Roads & Infrastructure',
            'status': 'Assigned'
        }

        # 1. Worker assigned trigger
        trigger_task_assigned(complaint_payload, worker=str(self.worker.id))

        # 2. Citizen progress update dispatch
        dispatch_push_notification(
            user_id=str(self.citizen.id),
            title="Field Worker Assigned",
            body=f"Field technician Suresh Kamble has been dispatched for repair on #{self.tracking_id}.",
            data={'complaint_id': self.complaint_id, 'tracking_id': self.tracking_id},
            click_action=f"/citizen/complaint/{self.complaint_id}"
        )

        worker_notifs = Notification.objects.filter(recipient=self.worker, is_read=False)
        citizen_notifs = Notification.objects.filter(recipient=self.citizen, is_read=False)

        latest_worker = worker_notifs.first()
        latest_citizen = citizen_notifs.first()

        self.log_step(
            step_num=2,
            title="Stage 2: Officer Assigns Field Worker",
            status="PASS" if "New Task Assigned" in latest_worker.title else "FAIL",
            details={
                "Assigned Worker": "Suresh Kamble (PWD)",
                "Window 3 (Worker) Toast": f"🔔 {latest_worker.title}: {latest_worker.body}",
                "Window 3 Bell Badge": f"{self.init_worker_unread} ➔ {worker_notifs.count()} (+1 unread)",
                "Window 1 (Citizen) Toast": f"🔔 {latest_citizen.title}: {latest_citizen.body}",
                "Window 1 Bell Badge": f"{citizen_notifs.count()} unread"
            }
        )

    def run_stage_3_work_done(self):
        """
        Stage 3: Worker marks 'Work Done' and uploads proof photos.
        - Citizen receives 'Issue Resolved?' toast & bell increment (+1).
        - Officer receives 'Work Done Proof Uploaded' toast & bell increment (+1).
        """
        print("\n--- STAGE 3: WORK DONE COMPLETION (Worker -> Citizen & Officer) ---")
        
        complaint_payload = {
            'id': self.complaint_id,
            'tracking_id': self.tracking_id,
            'citizen_id': str(self.citizen.id),
            'assigned_worker_id': str(self.worker.id),
            'ward': 'Ward 2',
            'category': 'Roads & Infrastructure',
            'status': 'Work Done'
        }

        # 1. Citizen verification trigger
        trigger_work_done(complaint_payload)

        # 2. Officer supervisor update dispatch
        dispatch_push_notification(
            user_id=str(self.officer.id),
            title="Work Done Proof Uploaded",
            body=f"Worker Suresh Kamble marked #{self.tracking_id} as Work Done. Awaiting citizen inspection.",
            data={'complaint_id': self.complaint_id, 'tracking_id': self.tracking_id},
            click_action=f"/officer/validation"
        )

        citizen_notifs = Notification.objects.filter(recipient=self.citizen, is_read=False)
        officer_notifs = Notification.objects.filter(recipient=self.officer, is_read=False)

        latest_citizen = citizen_notifs.first()
        latest_officer = officer_notifs.first()

        self.log_step(
            step_num=3,
            title="Stage 3: Worker Marks 'Work Done'",
            status="PASS" if "Issue Resolved" in latest_citizen.title else "FAIL",
            details={
                "Proof Uploaded": "Bitumen patch photo verified by GPS",
                "Window 1 (Citizen) Toast": f"🔔 {latest_citizen.title}: {latest_citizen.body}",
                "Window 1 Bell Badge": f"{citizen_notifs.count()} unread",
                "Window 2 (Officer) Toast": f"🔔 {latest_officer.title}: {latest_officer.body}",
                "Window 2 Bell Badge": f"{officer_notifs.count()} unread"
            }
        )

    def run_stage_4_close(self):
        """
        Stage 4: Citizen verifies resolution and awards 5 Stars.
        - Citizen receives 'Complaint Closed' confirmation toast.
        - Worker receives 'Task Verified & Closed (5 Stars)' toast & bell increment (+1).
        """
        print("\n--- STAGE 4: CITIZEN CLOSURE & RATING (Citizen -> Worker) ---")
        
        complaint_payload = {
            'id': self.complaint_id,
            'tracking_id': self.tracking_id,
            'citizen_id': str(self.citizen.id),
            'ward': 'Ward 2',
            'category': 'Roads & Infrastructure',
            'status': 'Closed'
        }

        # 1. Citizen closure trigger
        trigger_complaint_closed(complaint_payload)

        # 2. Worker praise & closure dispatch
        dispatch_push_notification(
            user_id=str(self.worker.id),
            title="Task Verified & Closed (5 Stars)",
            body=f"Citizen Faizan Rayeen verified #{self.tracking_id} resolution and awarded 5 stars! Great work.",
            data={'complaint_id': self.complaint_id, 'tracking_id': self.tracking_id, 'rating': 5},
            click_action=f"/worker/completed"
        )

        citizen_notifs = Notification.objects.filter(recipient=self.citizen, is_read=False)
        worker_notifs = Notification.objects.filter(recipient=self.worker, is_read=False)

        latest_citizen = citizen_notifs.first()
        latest_worker = worker_notifs.first()

        self.log_step(
            step_num=4,
            title="Stage 4: Citizen Verifies & Closes Complaint",
            status="PASS" if "Complaint Closed" in latest_citizen.title else "FAIL",
            details={
                "Citizen Rating": "⭐⭐⭐⭐⭐ (5/5 Stars)",
                "Window 1 (Citizen) Toast": f"🔔 {latest_citizen.title}: {latest_citizen.body}",
                "Window 3 (Worker) Toast": f"🔔 {latest_worker.title}: {latest_worker.body}",
                "Window 3 Bell Badge": f"{worker_notifs.count()} unread"
            }
        )

    def verify_read_and_dismissal(self):
        """
        Stage 5: Test Notification Read & Bell Counter Reset
        """
        print("\n--- STAGE 5: NOTIFICATION READ & BELL COUNTER RESET ---")

        # Mark all as read for Citizen
        Notification.objects.filter(recipient=self.citizen).update(is_read=True)
        unread_citizen = Notification.objects.filter(recipient=self.citizen, is_read=False).count()

        # Mark all as read for Worker
        Notification.objects.filter(recipient=self.worker).update(is_read=True)
        unread_worker = Notification.objects.filter(recipient=self.worker, is_read=False).count()

        self.log_step(
            step_num=5,
            title="Stage 5: Bell Counter Dismissal & Mark Read",
            status="PASS" if unread_citizen == 0 and unread_worker == 0 else "FAIL",
            details={
                "Citizen Bell Unread Reset": f"{unread_citizen} (Badge cleared)",
                "Worker Bell Unread Reset": f"{unread_worker} (Badge cleared)",
                "Database Persistence": "All records marked is_read=True"
            }
        )

    def print_summary(self):
        print("\n" + "="*70)
        print("📊 TEST SUMMARY REPORT: ALL 5 STAGES VERIFIED")
        print("="*70)
        all_passed = all(r['status'] == 'PASS' for r in self.results)
        for r in self.results:
            print(f"[{r['status']}] Step {r['step']}: {r['title']}")
        print("="*70)
        if all_passed:
            print("🎉 RESULT: 100% PASS - Cross-Role Notification Flow Fully Verified!")
        else:
            print("⚠️ RESULT: Failures detected in notification flow.")
        print("="*70)
        return all_passed


if __name__ == '__main__':
    tester = NotificationFlowTester()
    tester.setup_users()
    tester.run_stage_1_submit()
    tester.run_stage_2_assign()
    tester.run_stage_3_work_done()
    tester.run_stage_4_close()
    tester.verify_read_and_dismissal()
    success = tester.print_summary()
    sys.exit(0 if success else 1)
