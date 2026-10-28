# Aircraft Maintenance and Service Management System

A hybrid relational and vector database management system engineered for aircraft fleet service tracking, defect search, and automated parts inventory control.

## System Architecture

- Web Tier and API Backend (frontend): Built with Next.js App Router and Tailwind CSS. Contains native server-side API Route Handlers (/api/summary, /api/maintenance, /api/search) and connection pooling to MySQL (src/lib/db.js).
- Semantic Vector Engine (vector_service): A persistent FastAPI microservice running on port 8000 for semantic similarity search over defect logs using Chroma and the all-MiniLM-L6-v2 ONNX embedding model.
- Relational Tier (aircraftmaintenancedb_dump.sql): MySQL 8.0 schema featuring 10 normalized tables (3NF/BCNF), B-Tree indexing, multi-table presentation views, automated inventory triggers, and ACID-compliant transactional stored procedures.

## Repository Layout

aircraft-maintenance-system
- frontend: Next.js UI and Server API Handlers
  - src/app/api: Backend REST endpoints (summary, maintenance, search)
  - src/lib/db.js: MySQL connection pool
  - src/app/page.js: Interactive dashboard with RBAC simulation
- vector_service: Chroma Vector Microservice
  - chroma_service.py: FastAPI semantic search backend
  - chroma_data: Embedded vector storage
- aircraftmaintenancedb_dump.sql: Complete MySQL database dump

## Advanced Database Concepts Implemented

1. B-Tree Indexes: idx_maintenance_date on MAINTENANCE_RECORD and idx_aircraft_status on AIRCRAFT.
2. Database View: view_aircraft_maintenance_summary denormalizing multi-table relations for fleet audits.
3. Trigger: trg_after_maintenance_part_insert auto-decrementing spare parts inventory on maintenance consumption.
4. Stored Procedure: sp_log_maintenance_with_part executing atomic inserts across maintenance and parts logs with transactional rollback protection.
