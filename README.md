# Blood Donation & Emergency Assistance Platform - Backend API

Robust, scalable, and secure RESTful backend API for Blood Donation & Emergency Platform built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features
- Strict Role-Based Access Control (RBAC): 3 Roles (ADMIN, DONOR, RECIPIENT).
- Standardized API Response: Consistent structure for all success and error responses.
- Robust Authentication: Email/Password + GCP Social Login integration.
- 20+ Production-Ready Endpoints: Pagination, filtering, searching, soft deletes, and audit trails.
- Concurrency & Transaction Safety: Atomic Prisma transactions for donor assignment preventing race conditions.
- Real Payment Processing: Stripe Payment Intent and verification flow.
- Database Indexing & Soft Deletes: High performance queries with proper indices.

## Demo Credentials
- Admin: admin@bloodemergency.com / admin123456
- Donor: donor@bloodemergency.com / donor123456
- Recipient: recipient@bloodemergency.com / recipient123456

## Postman Collection
Import postman_collection.json located in the project root directly into Postman. Set environment variable baseUrl to http://localhost:5000.
