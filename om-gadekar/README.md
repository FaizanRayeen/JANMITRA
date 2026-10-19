# Om Gadekar — Engineering Contributions & Work Portfolio
## Role: AI/ML & Spatial Data Lead
**Team ResolveIT** | Project: **JANMITRA (Nagpur Municipal Corporation Civic Redressal Ecosystem)**  
**Academic Affiliation**: Priyadarshini Bhagwati College of Engineering (PBCOE), Nagpur | RTMNU (Final Year B.Tech CSE, 2026)  

---

## 1. Executive Summary

In the JANMITRA project, **Om Gadekar** served as the **AI/ML & Spatial Data Lead**. His primary responsibility was the design and implementation of the automated image validation pipeline, geospatial duplicate detection, and dynamic priority scoring to filter fraudulent submissions and prioritize critical civic hazards for the Nagpur Municipal Corporation.

*(Note: In the team work allocation, Om Gadekar executed the AI & Computer Vision module, while Anurag Deshmukh executed the Frontend Dashboard & Worker Panel modules).*

---

## 2. Core Modules & Key Deliverables

### A. Visual Defect Classifier (YOLOv8 + OpenCV)
- Deep learning computer vision pipeline to inspect citizen-uploaded photos.
- Verifies that images contain authentic civic defects (asphalt potholes, uncollected garbage, open manholes, damaged streetlights) rather than random selfies, documents, or synthetic/AI-generated images.
- Rejects non-civic media and flags suspicious photos for manual officer verification.

### B. Geospatial 100m Duplicate Detection (PostGIS)
- Spatial queries using PostGIS (`ST_DWithin`) evaluating incoming GPS coordinates against active open complaints within a **100-meter radius** in the same civic category.
- Groups repeat reports under a primary ticket to prevent municipal dispatchers from issuing redundant work orders.

### C. Multi-Factor Priority Scoring Engine
- Calculates weighted urgency scores dynamically:
  $$\text{Priority Score} = (w_1 \times \text{Defect Severity}) + (w_2 \times \text{Ward Population Density}) + (w_3 \times \text{Duplicate Volume}) + (w_4 \times \text{SLA Age})$$
- Automatically classifies grievances into `Critical`, `High`, `Medium`, and `Low` priorities.

---

## 3. Directory Layout

```
om-gadekar/
├── ai-validation-module/
│   └── README.md                     # Model specifications, formulas & API contracts
└── README.md                         # This summary document
```

---
*Maintained by Om Gadekar | Team ResolveIT (PBCOE Nagpur).*
