# AI & Computer Vision Validation Module
## Architecture & Specifications | Author: Anurag Deshmukh

---

## 1. Module Overview

The AI module of **JANMITRA** performs automated real-time verification of citizen grievance submissions. It addresses the critical flaw of false or duplicate reports overwhelming municipal control rooms.

### Core Pipelines:
1. **Visual Defect Classifier (YOLOv8 + OpenCV)**:
   - Validates that user-submitted photos contain authentic civic hazards (asphalt potholes, garbage piles, burst pipes, broken streetlights).
   - Flags non-civic photos, selfies, and synthetic/AI-generated images for manual officer review.
2. **Geospatial 100m Duplicate Detection (PostGIS)**:
   - Evaluates incoming GPS coordinates against active open complaints within a 100-meter radius in the same civic category.
   - Automatically groups duplicate reports to avoid redundant work orders.
3. **Multi-Factor Priority Engine**:
   - Calculates dynamic urgency scores to prioritize repairs near schools, hospitals, and high-traffic arterial roads.

---

## 2. API Contract & Integration

- **Trigger**: Celery asynchronous task triggered on complaint submission (`validate_complaint_images`).
- **Endpoint**: Integrated into Django `complaints/` and `dashboard/` apps.
- **Output**: Writes confidence score, duplicate status, and assigned priority (`Critical`, `High`, `Medium`, `Low`) directly to the PostgreSQL `Complaint` record.
