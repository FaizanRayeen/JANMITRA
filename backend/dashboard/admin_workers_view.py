"""
==============================================================================
JANMITRA - Civic Issue Reporting & Management System
File: janmitra-backend/dashboard/admin_workers_view.py
Author: Team ResolveIT
Description: Workers Admin Management API Views (GET, POST, PATCH)
==============================================================================
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

# In-memory storage seeded with realistic municipal workers
WORKERS_STORE = [
    {
        "id": "1",
        "employee_id": "NMC-PWD-101",
        "name": "Ramesh Patil",
        "mobile": "9823011223",
        "email": "ramesh.patil@nmc.gov.in",
        "department": "PWD",
        "dept_id": 1,
        "ward": 1,
        "designation": "Supervisor",
        "active_tasks": 4,
        "status": "Active"
    },
    {
        "id": "2",
        "employee_id": "NMC-SWM-204",
        "name": "Sunita Deshmukh",
        "mobile": "9823044556",
        "email": "sunita.d@nmc.gov.in",
        "department": "Solid Waste Management",
        "dept_id": 2,
        "ward": 2,
        "designation": "Sanitation Inspector",
        "active_tasks": 7,
        "status": "Active"
    },
    {
        "id": "3",
        "employee_id": "NMC-PHE-309",
        "name": "Ganesh Bawankule",
        "mobile": "9823077889",
        "email": "ganesh.b@nmc.gov.in",
        "department": "Public Health Eng. / Water Works",
        "dept_id": 3,
        "ward": 3,
        "designation": "Technician",
        "active_tasks": 2,
        "status": "Active"
    },
    {
        "id": "4",
        "employee_id": "NMC-ELE-412",
        "name": "Dinesh Meshram",
        "mobile": "9823099001",
        "email": "dinesh.m@nmc.gov.in",
        "department": "Electrical",
        "dept_id": 4,
        "ward": 4,
        "designation": "Lineman",
        "active_tasks": 0,
        "status": "Inactive"
    },
    {
        "id": "5",
        "employee_id": "NMC-PWD-105",
        "name": "Pravin Kadu",
        "mobile": "9823022334",
        "email": "pravin.kadu@nmc.gov.in",
        "department": "PWD",
        "dept_id": 1,
        "ward": 2,
        "designation": "Field Inspector",
        "active_tasks": 3,
        "status": "Active"
    },
    {
        "id": "6",
        "employee_id": "NMC-SWM-211",
        "name": "Kavita Raut",
        "mobile": "9823055667",
        "email": "kavita.raut@nmc.gov.in",
        "department": "Solid Waste Management",
        "dept_id": 2,
        "ward": 1,
        "designation": "Supervisor",
        "active_tasks": 5,
        "status": "On Leave"
    }
]


class AdminWorkersListCreateView(APIView):
    """
    GET  /api/v1/admin/workers/
    POST /api/v1/admin/workers/
    """
    permission_classes = [AllowAny]

    def get(self, request):
        search = (request.query_params.get('search') or '').strip().lower()
        dept = request.query_params.get('department')
        ward = request.query_params.get('ward')
        stat = request.query_params.get('status')

        results = WORKERS_STORE

        if search:
            results = [
                w for w in results
                if search in w['name'].lower() or search in w['employee_id'].lower()
            ]

        if dept and dept != 'All':
            results = [
                w for w in results
                if dept.lower() in w['department'].lower() or dept.lower() in str(w.get('dept_id', '')).lower()
            ]

        if ward and ward != 'All':
            try:
                ward_num = int(ward.replace('Ward', '').strip())
                results = [w for w in results if w['ward'] == ward_num]
            except ValueError:
                pass

        if stat and stat != 'All':
            results = [w for w in results if w['status'].lower() == stat.lower()]

        page = int(request.query_params.get('page', 1))
        page_size = 20
        start = (page - 1) * page_size
        paginated = results[start:start + page_size]

        return Response({
            "count": len(results),
            "page": page,
            "total_pages": max(1, (len(results) + page_size - 1) // page_size),
            "results": paginated
        }, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        new_worker = {
            "id": str(len(WORKERS_STORE) + 1),
            "employee_id": data.get("employee_id"),
            "name": data.get("name"),
            "mobile": data.get("mobile"),
            "email": data.get("email", ""),
            "department": data.get("department"),
            "ward": int(str(data.get("ward", "1")).replace("Ward", "").strip() or 1),
            "designation": data.get("designation"),
            "active_tasks": 0,
            "status": "Active"
        }
        WORKERS_STORE.insert(0, new_worker)
        return Response(new_worker, status=status.HTTP_201_CREATED)


class AdminWorkerDetailUpdateView(APIView):
    """
    PATCH /api/v1/admin/workers/<id>/
    """
    permission_classes = [AllowAny]

    def patch(self, request, worker_id):
        worker = next((w for w in WORKERS_STORE if str(w["id"]) == str(worker_id)), None)
        if not worker:
            return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if "designation" in data:
            worker["designation"] = data["designation"]
        if "ward" in data:
            try:
                worker["ward"] = int(str(data["ward"]).replace("Ward", "").strip())
            except ValueError:
                pass
        if "department" in data:
            worker["department"] = data["department"]
        if "status" in data:
            worker["status"] = data["status"]

        return Response(worker, status=status.HTTP_200_OK)


# Administrative settings store with broadcast advisory
SETTINGS_STORE = {
    "broadcast_message": "Scheduled municipal water supply maintenance across Ward 2 and Ward 3 from 10:00 AM to 4:00 PM this Sunday. Please store adequate water in advance.",
    "id": "nmc-adv-2026-10-18",
    "title": "NMC Civic Advisory",
    "is_active": True,
    "announcement": {
        "id": "nmc-adv-2026-10-18",
        "title": "NMC Civic Advisory",
        "text": "Scheduled municipal water supply maintenance across Ward 2 and Ward 3 from 10:00 AM to 4:00 PM this Sunday. Please store adequate water in advance.",
        "active": True,
        "priority": "high",
        "created_at": "2026-10-17T18:00:00Z"
    }
}


class AdminSettingsView(APIView):
    """
    GET /api/v1/admin/settings/
    PATCH /api/v1/admin/settings/
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(SETTINGS_STORE, status=status.HTTP_200_OK)

    def patch(self, request):
        data = request.data
        if "broadcast_message" in data:
            SETTINGS_STORE["broadcast_message"] = data["broadcast_message"]
            if "announcement" in SETTINGS_STORE:
                SETTINGS_STORE["announcement"]["text"] = data["broadcast_message"]
        if "is_active" in data:
            SETTINGS_STORE["is_active"] = bool(data["is_active"])
            if "announcement" in SETTINGS_STORE:
                SETTINGS_STORE["announcement"]["active"] = bool(data["is_active"])
        if "id" in data:
            SETTINGS_STORE["id"] = data["id"]
        return Response(SETTINGS_STORE, status=status.HTTP_200_OK)

