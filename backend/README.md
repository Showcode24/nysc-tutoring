# Kopa360 Backend

A production-grade backend system for tutor onboarding and gig-matching with strict status-based access control, role-based authorization, and comprehensive audit logging.

## Architecture Overview

### Core Principles

1. **Status-Based Access Control**: Tutors progress through defined statuses (REGISTERED_RESTRICTED → CHECKED_IN → ACTIVE). Each status determines what features they can access.
2. **State Machine**: Status transitions are validated server-side through a dedicated service. Bad admins cannot bypass rules.
3. **Audit Accountability**: Every admin action is logged with timestamps, IP addresses, and user agents for compliance.
4. **Event-Driven**: Business logic emits events (not direct notifications), allowing async handlers for emails/WhatsApp without blocking.
5. **Role-Based Authorization**: Fine-grained admin roles (FRONT_DESK, MANAGER, SUPER_ADMIN) with endpoint-level guards.

## Technology Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Validation**: Joi + Zod
- **Security**: Helmet, CORS

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Express app setup
│   ├── middleware/
│   │   └── auth.ts            # JWT + role middleware
│   ├── routes/
│   │   ├── tutorRoutes.ts      # /api/tutors endpoints
│   │   └── adminRoutes.ts      # /api/admin endpoints
│   ├── services/
│   │   ├── authService.ts      # Registration, login
│   │   ├─��� tutorService.ts     # Tutor business logic
│   │   ├── appointmentService.ts # Appointment management
│   │   ├── statusTransitionService.ts # STATE MACHINE
│   │   ├── auditService.ts     # Audit logging
│   │   └── eventService.ts     # Event emitter
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── utils/
│       └── index.ts           # Helpers (JWT, bcrypt, etc)
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # Database migrations
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Database Schema

### Core Tables

#### User

- Base user table for both tutors and admins
- **Key Fields**: email (unique), password (hashed), userType, firstName, lastName

#### Tutor

- Tutor-specific data
- **Status**: REGISTERED_RESTRICTED, CHECKED_IN, ACTIVE, REJECTED
- **Key Fields**: specialization, yearsOfExperience, hourlyRate, bio
- **Important**: Status determines feature access (gigs only visible when ACTIVE)

#### Admin

- Admin-specific data
- **Role**: FRONT_DESK, MANAGER, SUPER_ADMIN
- **Key Fields**: role, department
- **Important**: Different roles have different permissions

#### TutorDocument

- Uploaded documents (IDs, certificates, degrees)
- **Key Fields**: documentType, fileUrl, verified, verifiedBy

#### Appointment

- Scheduled check-in appointments
- **Status**: SCHEDULED, COMPLETED, CANCELLED, MISSED
- **Key Fields**: tutorId, adminId, scheduledAt, checkedInAt

#### TutorStatusHistory

- PERMANENT RECORD of all status changes
- **Key Fields**: tutorId, oldStatus, newStatus, changedBy, reason, changedAt
- **Use Case**: Answer "Who approved this tutor?" with exact timestamp

#### AdminActionLog

- PERMANENT RECORD of all admin actions
- **Key Fields**: adminId, action, targetType, targetId, details, performedAt
- **Use Case**: Compliance audits, "Who did what when?"

#### Gig

- Available tutoring gigs (ready for assignment when ACTIVE)
- **Key Fields**: title, subject, level, hourlyRate, startDate

## Status Transition State Machine

```
REGISTERED_RESTRICTED
    ├→ CHECKED_IN (front desk checks in)
    │   ├→ ACTIVE (manager approves)
    │   └→ REJECTED (manager rejects)
    └→ REJECTED (manager can reject early)

ACTIVE → (terminal, cannot change)
REJECTED → (terminal, cannot change)
```

### Transition Rules (Non-Negotiable)

1. **REGISTERED_RESTRICTED → CHECKED_IN**
   - Triggered by: Front desk via appointment check-in
   - Validates: Appointment exists and is scheduled
   - Audit: TUTOR_CHECKED_IN logged

2. **CHECKED_IN → ACTIVE**
   - Triggered by: Manager approves
   - Validates: Document verification, background checks
   - Audit: TUTOR_APPROVED logged
   - Effect: Tutor can now access gigs

3. **CHECKED_IN → REJECTED**
   - Triggered by: Manager rejects
   - Validates: Reason required
   - Audit: TUTOR_REJECTED logged

4. **REGISTERED_RESTRICTED → REJECTED**
   - Triggered by: Manager rejects without check-in
   - Validates: Reason required
   - Audit: TUTOR_REJECTED logged

**No other transitions are allowed. Ever.**

## Authentication & Authorization

### JWT Token Structure

```json
{
  "userId": "user-id",
  "email": "user@example.com",
  "userType": "TUTOR" | "ADMIN",
  "adminRole": "FRONT_DESK" | "MANAGER" | "SUPER_ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Middleware Hierarchy

1. **authenticateToken**: Optional - validates JWT if present, attaches to request
2. **requireAuth**: Requires valid JWT, any type
3. **requireTutor**: Requires tutor type
4. **requireAdmin**: Requires admin type
5. **requireAdminRole(...roles)**: Requires specific admin roles

### Role Permissions

| Role        | Can                                                            | Cannot                             |
| ----------- | -------------------------------------------------------------- | ---------------------------------- |
| FRONT_DESK  | Check in tutors, view pending tutors                           | Approve/reject, create admins      |
| MANAGER     | Approve/reject tutors, schedule appointments, verify documents | Create admins, view all audit logs |
| SUPER_ADMIN | Everything                                                     | (nothing)                          |

## API Endpoints

### Tutor Endpoints

#### Register

```
POST /api/tutors/register
Public
Body:
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  specialization: string
  yearsOfExperience: number
  hourlyRate: number
  bio?: string
Response: tutorId, email
```

#### Login

```
POST /api/tutors/login
Public
Body:
  email: string
  password: string
Response: user object, JWT token
```

#### Get Profile

```
GET /api/tutors/profile
Protected (Tutor)
Response: Full tutor profile with documents
```

#### Upload Document

```
POST /api/tutors/documents
Protected (Tutor)
Body:
  documentType: string
  fileUrl: string
  fileName: string
Response: Document object
```

#### Get Status

```
GET /api/tutors/status
Protected (Tutor)
Response: { status, canAccessGigs: boolean }
```

#### View Gigs

```
GET /api/tutors/gigs
Protected (Tutor)
Authorization: Only works if status === ACTIVE
Response: Array of available gigs
```

#### Get Appointments

```
GET /api/tutors/appointments
Protected (Tutor)
Response: Array of appointments with admin details
```

### Admin Endpoints

#### Login

```
POST /api/admin/login
Public
Body:
  email: string
  password: string
Response: user object, JWT token with role
```

#### Get Pending Tutors

```
GET /api/admin/tutors/pending
Protected (Admin)
Response: Array of REGISTERED_RESTRICTED tutors
```

#### Get Tutor Details

```
GET /api/admin/tutors/:tutorId
Protected (Admin)
Response: Full tutor details + documents + appointments
```

#### Schedule Appointment

```
POST /api/admin/appointments/schedule
Protected (Manager, Super Admin)
Body:
  tutorId: string
  scheduledAt: ISO date
  location?: string
  notes?: string
Response: Appointment object
Audit: APPOINTMENT_SCHEDULED logged
```

#### Check In Tutor

```
POST /api/admin/appointments/:appointmentId/check-in
Protected (Front Desk, Manager, Super Admin)
Effect: Transitions tutor from REGISTERED_RESTRICTED → CHECKED_IN
Response: Updated appointment
Audit: TUTOR_CHECKED_IN logged
```

#### Approve Tutor

```
POST /api/admin/tutors/:tutorId/approve
Protected (Manager, Super Admin)
Body:
  reason?: string
Effect: Transitions tutor from CHECKED_IN → ACTIVE
Response: Status transition result
Audit: TUTOR_APPROVED logged
```

#### Reject Tutor

```
POST /api/admin/tutors/:tutorId/reject
Protected (Manager, Super Admin)
Body:
  reason: string (required)
Effect: Transitions tutor to REJECTED (from any state)
Response: Status transition result
Audit: TUTOR_REJECTED logged
```

#### Get Audit Logs

```
GET /api/admin/audit-logs?limit=50&offset=0
Protected (Super Admin)
Response: Paginated audit logs with admin details
```

#### Get Tutor Timeline

```
GET /api/admin/tutors/:tutorId/timeline
Protected (Admin)
Response: All status changes + all actions for this tutor
Use Case: "Show me everything that happened with this tutor"
```

## Events & Notifications

The system emits events that external handlers can subscribe to.

### Events

```typescript
TUTOR_REGISTERED
  {
    tutorId: string,
    email: string,
    firstName: string,
    lastName: string
  }

APPOINTMENT_SCHEDULED
  {
    appointmentId: string,
    tutorId: string,
    tutorEmail: string,
    scheduledAt: Date,
    adminName: string
  }

TUTOR_CHECKED_IN
  {
    tutorId: string,
    tutorEmail: string,
    tutorName: string,
    appointmentId: string,
    checkedInAt: Date
  }

TUTOR_APPROVED
  {
    tutorId: string,
    tutorEmail: string,
    tutorName: string,
    approvedBy: string,
    approvedAt: Date
  }

TUTOR_REJECTED
  {
    tutorId: string,
    tutorEmail: string,
    tutorName: string,
    reason: string,
    rejectedBy: string
  }

DOCUMENT_UPLOADED
  {
    tutorId: string,
    documentType: string,
    fileName: string,
    uploadedAt: Date
  }

APPOINTMENT_COMPLETED
  {
    appointmentId: string,
    tutorId: string,
    tutorEmail: string,
    completedAt: Date
  }
```

### Example: Email Notifications

```typescript
// src/services/eventService.ts
emailHandler.subscribe(SystemEvent.TUTOR_APPROVED, async (payload) => {
  await sendEmail({
    to: payload.tutorEmail,
    subject: "Congratulations! You are Approved",
    template: "tutor-approved",
    data: { tutorName: payload.tutorName },
  });
});
```

### Example: WhatsApp Notifications

```typescript
whatsappHandler.subscribe(
  SystemEvent.APPOINTMENT_SCHEDULED,
  async (payload) => {
    await whatsapp.send({
      phone: getTutorPhone(payload.tutorId),
      message: `Your appointment is scheduled for ${payload.scheduledAt}`,
    });
  },
);
```

## Audit & Compliance

Every admin action is permanently logged:

### Audit Log Schema

- **adminId**: Who performed the action
- **action**: What action (TUTOR_APPROVED, TUTOR_REJECTED, etc)
- **targetType**: What was affected (Tutor, Appointment, etc)
- **targetId**: ID of affected resource
- **details**: JSON details of the action
- **ipAddress**: Admin's IP address
- **userAgent**: Admin's browser/client
- **performedAt**: Exact timestamp

### Answering Accountability Questions

1. **"Who approved tutor X?"**

   ```
   SELECT * FROM admin_action_log
   WHERE targetId = 'tutor-x'
   AND action = 'TUTOR_APPROVED'
   ```

2. **"What did admin Y do on date Z?"**

   ```
   SELECT * FROM admin_action_log
   WHERE adminId = 'admin-y'
   AND performedAt BETWEEN start AND end
   ORDER BY performedAt DESC
   ```

3. **"Show me all changes to tutor X"**
   ```
   SELECT * FROM tutor_status_history
   WHERE tutorId = 'tutor-x'
   UNION
   SELECT * FROM admin_action_log
   WHERE targetId = 'tutor-x'
   ORDER BY changedAt DESC
   ```

## Setup & Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Environment variables configured

### Development Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

3. **Setup database**

   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Server runs on http://localhost:3000

### Production Setup

1. **Build**

   ```bash
   npm run build
   ```

2. **Start**

   ```bash
   npm start
   ```

3. **Environment**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure database for replication/backup

## Edge Cases & Failure Scenarios

### Status Transitions

1. **Invalid transition attempted**: Rejected with clear error message
2. **Appointment doesn't exist**: Check-in fails
3. **Duplicate check-in**: Idempotent - returns current status

### Authentication

1. **Expired token**: 401 response, frontend redirects to login
2. **Invalid signature**: Token rejected
3. **Missing token**: Allowed for public endpoints

### Authorization

1. **Tutor tries to approve**: 403 Forbidden
2. **Front desk tries to approve**: 403 Forbidden (insufficient role)
3. **Admin tries to access tutor gigs**: 403 Forbidden

### Gig Access

1. **Tutor in REGISTERED_RESTRICTED accesses gigs**: 403 "Cannot view gigs. Must be ACTIVE"
2. **Tutor in ACTIVE accesses gigs**: Success
3. **Rejected tutor accesses gigs**: 403 "Status: REJECTED"

### Document Verification

1. **Upload document without JWT**: 401
2. **Invalid file type**: Accepted (no validation - handle in frontend)
3. **Verify non-existent document**: 404

## Performance Considerations

### Indexes

All critical columns are indexed:

- `User.email` - for login
- `Tutor.status` - for filtering pending tutors
- `Admin.role` - for authorization checks
- `AdminActionLog.performedAt` - for audit range queries
- `Appointment.scheduledAt` - for scheduling

### Query Optimization

- Prisma includes relations only when needed
- Pagination on audit logs and large result sets
- Connection pooling via Prisma

## Security Best Practices

1. **Passwords**: Hashed with bcrypt (salt rounds: 10)
2. **JWT**: Signed with strong secret, 7-day expiry
3. **CORS**: Limited to frontend domain
4. **Helmet**: Security headers enabled
5. **SQL Injection**: Impossible - using Prisma parameterized queries
6. **CSRF**: Handled by framework
7. **Rate Limiting**: Ready to add via middleware

## Testing

Run tests:

```bash
npm test
```

Test structure:

```
tests/
├── auth.test.ts
├── statusTransition.test.ts
├── api/
│   ├── tutor.test.ts
│   └── admin.test.ts
└── integration.test.ts
```

## Deployment Checklist

- [ ] Database migrated to production
- [ ] Environment variables configured
- [ ] JWT_SECRET is cryptographically random
- [ ] Database backups enabled
- [ ] Logs aggregated to monitoring service
- [ ] Error tracking enabled (Sentry/similar)
- [ ] CORS frontend URL configured
- [ ] Rate limiting enabled
- [ ] Database replication/failover configured
- [ ] API documentation deployed

## Support & Troubleshooting

### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error

1. Verify DATABASE_URL in .env
2. Check PostgreSQL is running
3. Confirm credentials

### JWT Decode Error

- Check JWT_SECRET matches between server
- Verify token hasn't expired
- Ensure Authorization header format: `Bearer <token>`

### Tutor Can't View Gigs

- Check tutor status is ACTIVE
- Verify gigs exist with status='OPEN'

## License

Proprietary - Kopa360
