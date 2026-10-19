"""
==============================================================================
JANMITRA - Civic Issue Reporting & Management System
File: janmitra-backend/dashboard/views.py
Author: Team ResolveIT
Description: Dashboard KPI & Ward Statistics API Views for Municipal Administration
==============================================================================
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

# Department metadata
DEPARTMENTS = {
    1: {"name": "PWD", "title": "Public Works Department", "category": "Roads & Infrastructure", "color": "blue"},
    2: {"name": "SWM", "title": "Solid Waste Management", "category": "Garbage & Waste", "color": "green"},
    3: {"name": "PHE", "title": "Public Health Engineering", "category": "Water & Drainage", "color": "cyan"},
    4: {"name": "Electrical", "title": "Electrical Department", "category": "Street Lighting", "color": "yellow"},
}

# Baseline realistic civic statistics for Nagpur Municipal Corporation
DEPT_STATS = {
    1: {"total": 142, "pending": 38, "resolved": 104, "avg_days": 3.8, "in_progress": 22},
    2: {"total": 210, "pending": 45, "resolved": 165, "avg_days": 1.4, "in_progress": 31},
    3: {"total": 128, "pending": 29, "resolved": 99, "avg_days": 2.6, "in_progress": 18},
    4: {"total": 96,  "pending": 17, "resolved": 79, "avg_days": 1.9, "in_progress": 11},
}

# Ward distribution per department (Wards 1, 2, 3, 4)
WARD_MATRIX = {
    1: [
        {"ward": 1, "ward_name": "Ward 1", "count": 42, "pending": 12, "resolved": 30},
        {"ward": 2, "ward_name": "Ward 2", "count": 28, "pending": 7,  "resolved": 21},
        {"ward": 3, "ward_name": "Ward 3", "count": 36, "pending": 11, "resolved": 25},
        {"ward": 4, "ward_name": "Ward 4", "count": 36, "pending": 8,  "resolved": 28},
    ],
    2: [
        {"ward": 1, "ward_name": "Ward 1", "count": 58, "pending": 14, "resolved": 44},
        {"ward": 2, "ward_name": "Ward 2", "count": 64, "pending": 16, "resolved": 48},
        {"ward": 3, "ward_name": "Ward 3", "count": 48, "pending": 8,  "resolved": 40},
        {"ward": 4, "ward_name": "Ward 4", "count": 40, "pending": 7,  "resolved": 33},
    ],
    3: [
        {"ward": 1, "ward_name": "Ward 1", "count": 31, "pending": 9,  "resolved": 22},
        {"ward": 2, "ward_name": "Ward 2", "count": 24, "pending": 5,  "resolved": 19},
        {"ward": 3, "ward_name": "Ward 3", "count": 45, "pending": 11, "resolved": 34},
        {"ward": 4, "ward_name": "Ward 4", "count": 28, "pending": 4,  "resolved": 24},
    ],
    4: [
        {"ward": 1, "ward_name": "Ward 1", "count": 22, "pending": 4,  "resolved": 18},
        {"ward": 2, "ward_name": "Ward 2", "count": 18, "pending": 3,  "resolved": 15},
        {"ward": 3, "ward_name": "Ward 3", "count": 32, "pending": 6,  "resolved": 26},
        {"ward": 4, "ward_name": "Ward 4", "count": 24, "pending": 4,  "resolved": 20},
    ],
}


class DashboardKPIView(APIView):
    """
    GET /api/v1/dashboard/kpi/
    Supports query parameter: dept_id (1, 2, 3, 4)
    Without dept_id: Returns city-wide total and 4-category bar chart data.
    With dept_id: Returns department-specific KPI metrics.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        dept_id_param = request.query_params.get('dept_id')

        if dept_id_param:
            try:
                dept_id = int(dept_id_param)
            except ValueError:
                dept_id = 1

            info = DEPARTMENTS.get(dept_id, DEPARTMENTS[1])
            stats = DEPT_STATS.get(dept_id, DEPT_STATS[1])

            return Response({
                "dept_id": dept_id,
                "name": info["name"],
                "title": info["title"],
                "category": info["category"],
                "color": info["color"],
                "total": stats["total"],
                "pending": stats["pending"],
                "resolved": stats["resolved"],
                "in_progress": stats["in_progress"],
                "avg_days": stats["avg_days"],
                "resolution_rate": round((stats["resolved"] / stats["total"]) * 100, 1)
            }, status=status.HTTP_200_OK)

        # Cross-department city-wide KPI summary & 4-category breakdown
        total_all = sum(s["total"] for s in DEPT_STATS.values())
        pending_all = sum(s["pending"] for s in DEPT_STATS.values())
        resolved_all = sum(s["resolved"] for s in DEPT_STATS.values())
        avg_days_all = round(sum(s["avg_days"] for s in DEPT_STATS.values()) / 4, 1)

        # Recharts category bar data: 4 categories (Roads, Garbage, Water, Street Lighting)
        categories = [
            {
                "category": "Roads",
                "fullName": "Roads & Infrastructure",
                "department": "PWD",
                "dept_id": 1,
                "total": DEPT_STATS[1]["total"],
                "resolved": DEPT_STATS[1]["resolved"],
                "pending": DEPT_STATS[1]["pending"],
                "color": "#1A56DB"
            },
            {
                "category": "Garbage",
                "fullName": "Garbage & Waste",
                "department": "SWM",
                "dept_id": 2,
                "total": DEPT_STATS[2]["total"],
                "resolved": DEPT_STATS[2]["resolved"],
                "pending": DEPT_STATS[2]["pending"],
                "color": "#16A34A"
            },
            {
                "category": "Water",
                "fullName": "Water & Drainage",
                "department": "PHE",
                "dept_id": 3,
                "total": DEPT_STATS[3]["total"],
                "resolved": DEPT_STATS[3]["resolved"],
                "pending": DEPT_STATS[3]["pending"],
                "color": "#0891B2"
            },
            {
                "category": "Street Lighting",
                "fullName": "Street Lighting",
                "department": "Electrical",
                "dept_id": 4,
                "total": DEPT_STATS[4]["total"],
                "resolved": DEPT_STATS[4]["resolved"],
                "pending": DEPT_STATS[4]["pending"],
                "color": "#D97706"
            }
        ]

        # Departments summary array (convenient for single-call clients)
        dept_summaries = []
        for d_id, d_meta in DEPARTMENTS.items():
            st = DEPT_STATS[d_id]
            dept_summaries.append({
                "dept_id": d_id,
                "name": d_meta["name"],
                "title": d_meta["title"],
                "category": d_meta["category"],
                "color": d_meta["color"],
                "total": st["total"],
                "pending": st["pending"],
                "resolved": st["resolved"],
                "in_progress": st["in_progress"],
                "avg_days": st["avg_days"]
            })

        return Response({
            "total_complaints": total_all,
            "pending_complaints": pending_all,
            "resolved_complaints": resolved_all,
            "avg_resolution_days": avg_days_all,
            "categories": categories,
            "departments": dept_summaries
        }, status=status.HTTP_200_OK)


class WardStatsView(APIView):
    """
    GET /api/v1/dashboard/ward-stats/
    Supports query parameter: dept_id (1, 2, 3, 4)
    Returns ward complaints breakdown for the heatmap.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        dept_id_param = request.query_params.get('dept_id')

        if dept_id_param:
            try:
                dept_id = int(dept_id_param)
            except ValueError:
                dept_id = 1
            wards = WARD_MATRIX.get(dept_id, WARD_MATRIX[1])
            return Response(wards, status=status.HTTP_200_OK)

        # Return full matrix formatted by ward
        matrix = []
        for ward_idx in range(1, 5):
            ward_row = {
                "ward": ward_idx,
                "ward_name": f"Ward {ward_idx}",
                "pwd": WARD_MATRIX[1][ward_idx - 1]["count"],
                "swm": WARD_MATRIX[2][ward_idx - 1]["count"],
                "phe": WARD_MATRIX[3][ward_idx - 1]["count"],
                "electrical": WARD_MATRIX[4][ward_idx - 1]["count"],
            }
            ward_row["total"] = (
                ward_row["pwd"] + ward_row["swm"] + ward_row["phe"] + ward_row["electrical"]
            )
            matrix.append(ward_row)

        return Response(matrix, status=status.HTTP_200_OK)
