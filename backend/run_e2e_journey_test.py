"""
==============================================================================
JANMITRA - Civic Issue Reporting & Management System
File: janmitra-backend/run_e2e_journey_test.py
Developer: Faizan Rayeen & Team ResolveIT
Description: Automated End-to-End User Journey Test for Day 30.
             Executes complete 5-step lifecycle:
             1. Citizen submits complaint via /citizen/submit (photo + GPS)
             2. AI task validates complaint (YOLOv8) and routes to PWD
             3. PWD Officer logs in and assigns Ward 2 worker (Nitin Bawankar)
             4. Field Worker logs in, views task, uploads proof photo, marks done
             5. Citizen logs in, verifies resolution with 5-star rating -> status Closed
==============================================================================
"""

import sys
import json
import urllib.request
import urllib.error

# Force UTF-8 on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"


def make_request(method, path, payload=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"

    data_bytes = json.dumps(payload).encode('utf-8') if payload else None
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            err_json = json.loads(body)
        except Exception:
            err_json = {"raw": body}
        return e.code, err_json
    except Exception as exc:
        return 0, {"error": str(exc)}


def run_e2e_journey():
    print("=" * 75)
    print("🏛️  JANMITRA CIVIC PLATFORM - END-TO-END USER JOURNEY VERIFICATION")
    print("   Nagpur Municipal Corporation (NMC) Civic Grievance Resolution Lifecycle")
    print("=" * 75)

    test_log = []

    # -------------------------------------------------------------------------
    # STEP 1: Citizen Submission (/citizen/submit)
    # -------------------------------------------------------------------------
    print("\n[STEP 1/5] Citizen Submits Complaint with Photo & GPS Coordinates...")
    
    # Authenticate as Citizen (Priya Sharma, Ward 2)
    c_status, c_auth = make_request("POST", "/api/v1/auth/login/", {
        "mobile": "9900002002",
        "password": "citizen@123"
    })
    citizen_token = c_auth.get("token") or c_auth.get("access")
    print(f"   👤 Citizen Login: 9900002002 (Priya Sharma) -> Status {c_status}, Role: {c_auth.get('role')}")

    # Submit complaint payload matching frontend Submit.jsx
    submit_payload = {
        "title": "Severe Asphalt Crater & Pothole on WHC Road near Shankar Nagar",
        "description": "Deep asphalt crater formed post heavy rain, creating severe skidding hazard for two-wheelers and heavy traffic congestion near Shankar Nagar Square.",
        "category": "Roads & Infrastructure",
        "category_id": 1,
        "department": "PWD",
        "ward": "Ward 2 - Dharampeth / West Nagpur",
        "ward_number": 2,
        "latitude": 21.1448,
        "longitude": 79.0682,
        "address": "WHC Road, Shankar Nagar Square, Dharampeth, Nagpur 440010",
        "landmark": "Near Shankar Nagar Petrol Pump",
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "photos": [
            "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
        ],
        "citizen_mobile": "9900002002"
    }

    s1_status, s1_res = make_request("POST", "/api/v1/complaints/", submit_payload, token=citizen_token)
    complaint_id = s1_res.get("id")
    tracking_id = s1_res.get("tracking_id")

    step1_pass = (s1_status in (200, 201) and s1_res.get("status") == "Submitted")
    print(f"   📝 Status: {s1_status} | Ticket: {tracking_id} | ID: {complaint_id}")
    print(f"   📍 Location: {s1_res.get('latitude')}, {s1_res.get('longitude')} | Ward: {s1_res.get('ward')}")
    print(f"   ✅ Step 1 {'PASSED' if step1_pass else 'FAILED'}: Initial Status = '{s1_res.get('status')}' (Step {s1_res.get('status_step')})")
    
    test_log.append({
        "step": 1,
        "name": "Citizen Complaint Submission",
        "status": "PASS" if step1_pass else "FAIL",
        "tracking_id": tracking_id,
        "complaint_id": complaint_id,
        "details": s1_res
    })

    # -------------------------------------------------------------------------
    # STEP 2: AI Model Validation & Routing
    # -------------------------------------------------------------------------
    print("\n[STEP 2/5] AI Task Computer Vision Validation & GIS Auto-Routing...")
    ai_payload = {
        "confidence": 97.4,
        "detected_category": "Roads & Infrastructure / Severe Pothole Defect",
        "routed_department": "Public Works Department (PWD)"
    }
    s2_status, s2_res = make_request("POST", f"/api/v1/complaints/{tracking_id}/validate/", ai_payload)
    step2_pass = (s2_status == 200 and s2_res.get("status") == "Validated")
    print(f"   🤖 AI YOLOv8 Model: {s2_res.get('ai_details', {}).get('model')} (Confidence: {s2_res.get('ai_details', {}).get('confidence')}%)")
    print(f"   🔀 Routed Department: {s2_res.get('ai_details', {}).get('routed_department')}")
    print(f"   ✅ Step 2 {'PASSED' if step2_pass else 'FAILED'}: Status Transitioned to '{s2_res.get('status')}' (Step {s2_res.get('status_step')})")

    test_log.append({
        "step": 2,
        "name": "AI Validation & Routing",
        "status": "PASS" if step2_pass else "FAIL",
        "ai_details": s2_res.get("ai_details"),
        "details": s2_res
    })

    # -------------------------------------------------------------------------
    # STEP 3: PWD Officer Assigns Ward 2 Worker
    # -------------------------------------------------------------------------
    print("\n[STEP 3/5] PWD Officer Login & Field Worker Assignment...")
    
    # Authenticate as PWD Officer (Shri V. R. Sharma)
    o_status, o_auth = make_request("POST", "/api/v1/auth/login/", {
        "mobile": "9900000001",
        "password": "admin@123"
    })
    officer_token = o_auth.get("token") or o_auth.get("access")
    print(f"   🏢 Officer Login: 9900000001 (Shri V. R. Sharma) -> Status {o_status}, Role: {o_auth.get('role')}")

    assign_payload = {
        "worker_mobile": "9900001102",
        "worker_name": "Nitin Bawankar (PWD W2)",
        "employee_id": "NMC-PWD-W2",
        "ward": 2
    }
    s3_status, s3_res = make_request("POST", f"/api/v1/complaints/{tracking_id}/assign/", assign_payload, token=officer_token)
    step3_pass = (s3_status == 200 and s3_res.get("status") == "Assigned")
    print(f"   👷 Assigned Field Worker: {s3_res.get('assigned_worker', {}).get('name')} ({s3_res.get('assigned_worker', {}).get('employee_id')})")
    print(f"   📱 Worker Mobile: {s3_res.get('assigned_worker', {}).get('mobile')}")
    print(f"   ✅ Step 3 {'PASSED' if step3_pass else 'FAILED'}: Status Transitioned to '{s3_res.get('status')}' (Step {s3_res.get('status_step')})")

    test_log.append({
        "step": 3,
        "name": "Officer Worker Assignment",
        "status": "PASS" if step3_pass else "FAIL",
        "assigned_worker": s3_res.get("assigned_worker"),
        "details": s3_res
    })

    # -------------------------------------------------------------------------
    # STEP 4: Field Worker Uploads Proof & Marks Work Done
    # -------------------------------------------------------------------------
    print("\n[STEP 4/5] Field Worker Login, Uploads Proof Photo & Marks Work Done...")

    # Authenticate as Field Worker (Nitin Bawankar)
    w_status, w_auth = make_request("POST", "/api/v1/auth/login/", {
        "mobile": "9900001102",
        "password": "worker@123"
    })
    worker_token = w_auth.get("token") or w_auth.get("access")
    print(f"   👷 Worker Login: 9900001102 (Nitin Bawankar) -> Status {w_status}, Role: {w_auth.get('role')}")

    work_payload = {
        "resolved_photo_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
        "remarks": "Asphalt cold-mix patching, bitumen sealing, and vibratory roller compaction completed on WHC Road. Leveling aligned with roadway."
    }
    s4_status, s4_res = make_request("POST", f"/api/v1/complaints/{tracking_id}/work-done/", work_payload, token=worker_token)
    step4_pass = (s4_status == 200 and s4_res.get("status") == "Work Done")
    print(f"   📸 Proof Photo Submitted: {s4_res.get('resolved_photo_url')}")
    print(f"   🛠️ Remarks: {s4_res.get('remarks')}")
    print(f"   ✅ Step 4 {'PASSED' if step4_pass else 'FAILED'}: Status Transitioned to '{s4_res.get('status')}' (Step {s4_res.get('status_step')})")

    test_log.append({
        "step": 4,
        "name": "Field Worker Execution & Proof Upload",
        "status": "PASS" if step4_pass else "FAIL",
        "resolved_photo_url": s4_res.get("resolved_photo_url"),
        "details": s4_res
    })

    # -------------------------------------------------------------------------
    # STEP 5: Citizen Verification & 5-Star Rating (/citizen/complaint/:id)
    # -------------------------------------------------------------------------
    print("\n[STEP 5/5] Citizen Verifies Resolution with 5-Star Rating -> Closed...")
    verify_payload = {
        "action": "accept",
        "accepted": True,
        "rating": 5,
        "feedback": "Outstanding prompt response by Nagpur Municipal Corporation! Pothole was completely repaired and leveled within 16 hours. Excellent work by Nitin Bawankar and PWD team."
    }
    s5_status, s5_res = make_request("POST", f"/api/v1/complaints/{tracking_id}/verify/", verify_payload, token=citizen_token)
    step5_pass = (s5_status == 200 and s5_res.get("status") == "Closed")
    print(f"   ⭐ Citizen Rating: {s5_res.get('rating')} / 5 Stars")
    print(f"   💬 Citizen Feedback: \"{s5_res.get('feedback')}\"")
    print(f"   ✅ Step 5 {'PASSED' if step5_pass else 'FAILED'}: Status Transitioned to '{s5_res.get('status')}' (Step {s5_res.get('status_step')})")

    test_log.append({
        "step": 5,
        "name": "Citizen Resolution Verification & Rating",
        "status": "PASS" if step5_pass else "FAIL",
        "rating": s5_res.get("rating"),
        "feedback": s5_res.get("feedback"),
        "details": s5_res
    })

    # -------------------------------------------------------------------------
    # Final Complaint Audit Check
    # -------------------------------------------------------------------------
    print("\n" + "-" * 75)
    print("🔍 Final Complaint Audit & Timeline Verification...")
    f_status, final_complaint = make_request("GET", f"/api/v1/complaints/{tracking_id}/")
    print(f"   Ticket: {final_complaint.get('tracking_id')} | Final Status: {final_complaint.get('status')}")
    print(f"   Department: {final_complaint.get('department')} | Ward: {final_complaint.get('ward')}")
    print(f"   Timeline Audit Log ({len(final_complaint.get('timeline', []))} events):")
    for idx, t in enumerate(final_complaint.get('timeline', []), 1):
        print(f"     [{idx}] {t.get('status'):<12} | {t.get('timestamp')} | {t.get('actor')}")

    # Summary Result
    all_passed = all(entry["status"] == "PASS" for entry in test_log)
    print("\n" + "=" * 75)
    if all_passed:
        print("🎉 END-TO-END USER JOURNEY TEST: 100% ALL 5 STEPS PASSED SUCCESSFULLY!")
    else:
        print("⚠️ END-TO-END USER JOURNEY TEST: Some steps encountered errors.")
    print("=" * 75)

    return all_passed, test_log, final_complaint


if __name__ == "__main__":
    success, log, final_data = run_e2e_journey()
    sys.exit(0 if success else 1)
