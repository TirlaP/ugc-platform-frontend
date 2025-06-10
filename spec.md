# UGC Agency Management Platform - Project Specification

## Vision
Build a modern SaaS platform for agencies managing User-Generated Content (UGC) creators and clients. The platform will centralize campaign management, content collaboration, communication, and analytics—eliminating the chaos of spreadsheets and fragmented chat groups.

## Core Features

### 1. Authentication & User Management
- Better Auth integration with email/password and social login (Google, GitHub)
- Role-based access: ADMIN, STAFF, CREATOR, CLIENT
- Multi-organization (multi-tenancy) support
- 2FA (optional)
- Secure session management

### 2. CRM for Clients & Creators
- Detailed profiles with contact info, skills, rates, history, status
- Assign creators to clients and campaigns
- Search, filter, and sort functionality
- Import/export capabilities

### 3. Campaign & Order Management
- Create/manage campaigns with title, brief, requirements, deadlines, budget
- Track statuses: New, In Progress, Review, Completed
- File attachments
- Workflow automation

### 4. Content Collaboration & Delivery
- Secure media upload (S3/Drive integration)
- Versioning and approval workflow
- Tagging and search
- Preview and download

### 5. Communication & Notifications
- In-app messaging threaded by campaign/order
- Email notifications
- Activity feeds
- Notification preferences

### 6. Client Portal
- Campaign/order status views
- Downloadable deliverables
- Feedback system
- Dashboard for active/past campaigns

### 7. Analytics & Reporting
- Campaign performance metrics
- Creator activity tracking
- Exportable reports (CSV, PDF)
- Visual dashboards

## Tech Stack
- **Frontend**: React + Vite, TypeScript, TailwindCSS
- **Backend**: Hono (serverless), TypeScript
- **Database**: PostgreSQL
- **Auth**: Better Auth
- **ORM**: Prisma
- **Storage**: AWS S3 or Google Drive
- **Email**: SendGrid/Postmark/Resend

## MVP Scope
1. User authentication/authorization
2. Role-based dashboards
3. Campaign/order CRUD
4. Media upload/storage
5. Messaging & notifications
6. Client portal
7. Basic analytics

## Architecture Principles
- Clean Architecture
- SOLID principles
- DRY (Don't Repeat Yourself)
- Test-Driven Development (TDD)
- Mobile-first responsive design
- Accessibility (WCAG 2.1 compliance)

## Security Requirements
- Role-based access control
- Encrypted data
- GDPR compliance
- Secure file handling
- Audit logging

## Performance Goals
- Fast, responsive UI
- Optimized backend queries
- 99.9% uptime target
- Support 100+ creators
- Multi-client, multi-organization scale
