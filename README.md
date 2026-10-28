\# Aircraft Maintenance \& Service Management System



A hybrid relational and vector database management system engineered for aircraft fleet service tracking, predictive fault search, and automated parts inventory control.



\## System Architecture



\- \*\*Web Tier \& API Backend (`frontend/`):\*\* Built with Next.js (App Router) and Tailwind CSS. Contains native server-side API Route Handlers (`/api/summary`, `/api/maintenance`, `/api/search`) and connection pooling to MySQL (`src/lib/db.js`).

\- \*\*Semantic Vector Engine (`vector\_service/`):\*\* A persistent FastAPI microservice exposing port 8000 for semantic similarity search over defect logs using Chroma and the `all-MiniLM-L6-v2` ONNX embedding model.

\- \*\*Relational Tier (`aircraftmaintenancedb\_dump.sql`):\*\* MySQL 8.0 schema featuring 10 normalized tables (3NF/BCNF), B-Tree indexing, multi-table presentation views, automated inventory triggers, and ACID-compliant transactional stored procedures.



\## Repository Layout



aircraft-maintenance-system/

├── frontend/                     # Next.js UI \& Server API Handlers

│   ├── src/app/api/             # Backend REST endpoints (summary, maintenance, search)

│   ├── src/lib/db.js            # MySQL connection pool

│   └── src/app/page.js          # Interactive dashboard with RBAC simulation

├── vector\_service/              # Chroma Vector Microservice

│   ├── chroma\_service.py        # FastAPI semantic search backend

│   └── chroma\_data/             # Embedded vector storage

└── aircraftmaintenancedb\_dump.sql # Complete MySQL database dump



\## Advanced Database Concepts Implemented



1\. \*\*B-Tree Indexes:\*\* `idx\_maintenance\_date` on `MAINTENANCE\_RECORD` and `idx\_aircraft\_status` on `AIRCRAFT`.

2\. \*\*Database View:\*\* `view\_aircraft\_maintenance\_summary` denormalizing multi-table relations for fleet audits.

3\. \*\*Trigger:\*\* `trg\_after\_maintenance\_part\_insert` auto-decrementing spare parts inventory on maintenance consumption.

4\. \*\*Stored Procedure:\*\* `sp\_log\_maintenance\_with\_part` executing atomic inserts across maintenance and parts logs with transactional rollback protection.


