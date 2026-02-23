# Kopa360 Backend - Architecture Documentation

Complete technical architecture, design decisions, and system flows.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│                    (React, TypeScript, TailwindCSS)             │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/HTTPS
                 │
┌────────────────▼─────────────────────────────────────────────────┐
│                    Express.js Backend                             │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│ │  Auth Layer  │  │ Middleware   │  │  Validators  │              │
│ │  (JWT, Role) │  │  (Auth, CORS)│  │  (Joi, Zod)  │              │
│ └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │              API Routes                                     │   │
│ ├────────────────────────────────────────────────────────────┤   │
│ │  /api/tutors    (Register, Login, Profile, Docs, Gigs)    │   │
│ │  /api/admin     (Manage, Approve, Reject, Audit)          │   │
│ └────────────────────────────────────────────────────────────┘   │
│                          ▲                                        │
│                          │ Uses                                   │
│                          │                                        │
│ ┌────────────────────────┴───────────────────────────────────┐   │
│ │              Service Layer                                 │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │ ┌─────────────────┐  ┌──────────────────┐               │   │
│ │ │ AuthService     │  │ StatusTransition │ (STATE MACHINE)│   │
│ │ │ • Register      │  │ • Validate rules │               │   │
│ │ │ • Login         │  │ • Execute change │               │   │
│ │ │ • CreateAdmin   │  │ • Log all changes│               │   │
│ │ └─────────────────┘  └──────────────────┘               │   │
│ │                                                           │   │
│ │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│ │ │ TutorService │  │ Appointment  │  │ AuditService │   │   │
│ │ │              │  │ Service      │  │              │   │   │
│ │ │ • Profile    │  │              │  │ • Log action │   │   │
│ │ │ • Documents  │  │ • Schedule   │  │ • Query logs │   │   │
│ │ │ • Gigs       │  │ • CheckIn    │  │ • Timeline   │   │   │
│ │ │ • Status     │  │ • Complete   │  │              │   │   │
│ │ └──────────────┘  └──────────────┘  └──────────────┘   │   │
│ │                                                           │   │
│ │ ┌──────────────────────────────────────────────────┐   │   │
│ │ │        EventService (Event Emitter)              │   │   │
│ │ │  • Emits events (TUTOR_REGISTERED, etc)         │   │   │
│ │ │  • Handlers subscribe (Email, WhatsApp, etc)    │   │   │
│ │ │  • Non-blocking, async                          │   │   │
│ │ └──────────────────────────────────────────────────┘   │   │
│ └──────────────────────────────────────────────────────────┘   │
│                          ▲                                        │
│                          │ Uses Prisma                            │
└──────────────────────────┼────────────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────────────┐
│           PostgreSQL Database (Primary Datastore)                  │
├────────────────────────────────────────────────────────────────────┤
│ Tables:                                                             │
│  • users (auth)                                                    │
│  • tutors (tutor data + status)                                   │
│  • admins (admin data + role)                                     │
│  • tutor_documents (uploaded files)                               │
│  • appointments (check-ins)                                       │
│  • tutor_status_history (AUDIT TRAIL)                             │
│  • admin_action_log (AUDIT TRAIL)                                 │
│  • gigs (available jobs)                                          │
│                                                                    │
│ Indexes: 30+ strategic indexes for query performance              │
│ Backups: Daily automated backups                                  │
│ Replication: Multi-AZ available                                   │
└────────────────────────────────────────────────────────────────────┘
```

## Request Lifecycle

### 1. Incoming Request

```
Browser/Mobile → HTTP Request
                 ↓
        Express Router
        ↓
        Middleware Stack
        ├─ helmet (security headers)
        ├─ cors (cross-origin)
        ├─ express.json (body parsing)
        └─ authenticateToken (JWT extraction)
                 ↓
        Route Handler
```

### 2. Authentication Flow

```
Authorization Header: "Bearer <JWT_TOKEN>"
                 ↓
        extractBearerToken()
                 ↓
        verifyJWT() with secret
                 ↓
        Decode payload (userId, email, userType, adminRole)
                 ↓
        Attach to req.user
                 ↓
        Route Handler sees authenticated user
```

### 3. Authorization Checks

```
Route Protection Middleware Chain:

authenticateToken (optional - applies to all)
        ↓
Optional: requireAuth (requires JWT)
        ↓
Optional: requireTutor (requires userType === TUTOR)
        ↓
Optional: requireAdmin (requires userType === ADMIN)
        ↓
Optional: requireAdminRole ("MANAGER" | "SUPER_ADMIN")
        ↓
✅ Access Granted → Handler executes
❌ Access Denied → 403 Forbidden response
```

### 4. Service Layer Execution

```
Example: Approve Tutor Request

Handler receives:
  ├─ tutorId (from URL)
  ├─ reason (from body)
  └─ req.user.userId (from JWT)
                 ↓
StatusTransitionService.approveTutor()
  ├─ Get tutor by ID
  ├─ Get admin by ID
  ├─ Validate: Tutor status is CHECKED_IN
  ├─ Validate: Transition is allowed
  └─ Execute transaction:
      ├─ Update tutor.status = ACTIVE
      ├─ Create TutorStatusHistory record
      ├─ Create AdminActionLog record
      └─ Return result
                 ↓
EventService.emit(TUTOR_APPROVED, {
  tutorId,
  tutorEmail,
  approvedBy,
  approvedAt
})
                 ↓
External handlers subscribe:
  ├─ EmailHandler → Send email
  └─ WhatsAppHandler → Send message
                 ↓
Response sent to client
  ├─ 200 OK with status change
  └─ Events fire asynchronously (non-blocking)
```

### 5. Audit Logging

```
EVERY admin action is logged:

Admin approves tutor
        ↓
StatusTransitionService records:
  ├─ TutorStatusHistory
  │   ├─ tutorId
  │   ├─ oldStatus
  │   ├─ newStatus
  │   ├─ changedBy (userId)
  │   ├─ reason
  │   └─ changedAt (timestamp)
  │
  └─ AdminActionLog
      ├─ adminId
      ├─ action (TUTOR_APPROVED)
      ├─ targetType (Tutor)
      ├─ targetId
      ├─ details (JSON)
      ├─ ipAddress
      ├─ userAgent
      └─ performedAt (timestamp)

Later: Query to answer
  "Who approved tutor X?" → AdminActionLog
  "When?" → performedAt
  "From which IP?" → ipAddress
  "With what reason?" → details
```

## Status Transition State Machine

```
                    REGISTRATION
                         │
                         ▼
              ┌──────────────────────┐
              │ REGISTERED_RESTRICTED │ ← Initial state
              └──────────┬───────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        │ (Admin schedules appointment)    │ (Admin rejects early)
        │ (Front desk checks in)           │
        ▼                                  ▼
    ┌─────────┐                      ┌──────────┐
    │ CHECKED │                      │ REJECTED │ ← Terminal
    │   IN    │                      └──────────┘
    └────┬────┘
         │
    ┌��───┴────────────────┐
    │                     │
    │ (Manager approves)  │ (Manager rejects)
    ▼                     ▼
┌────────┐           ┌──────────┐
│ ACTIVE │ ← Can    │ REJECTED │ ← Terminal
│  Gigs  │ access   └──────────┘
└────────┘    gigs
```

### State Machine Rules

**Immutable transitions:**

1. REGISTERED_RESTRICTED has exactly 2 paths:
   - Check in → CHECKED_IN
   - Reject → REJECTED

2. CHECKED_IN has exactly 2 paths:
   - Approve → ACTIVE
   - Reject → REJECTED

3. ACTIVE is terminal: No further transitions

4. REJECTED is terminal: No further transitions

**Validation on every transition:**

```typescript
// Cannot bypass!
const valid = VALID_TRANSITIONS[currentStatus].includes(newStatus);
if (!valid) throw Error("Invalid transition");
```

## Database Design Rationale

### Why these tables?

#### users

- **Why**: Single table for both tutors and admins (SOLID principle)
- **Benefit**: Shared authentication logic, email uniqueness constraint

#### tutors + admins

- **Why**: Separate for type-specific data (specialization, role)
- **Benefit**: Extensibility without schema bloat

#### tutor_documents

- **Why**: Support multiple documents per tutor
- **Benefit**: Scalable to N documents, audit document uploads

#### appointments

- **Why**: Explicit check-in workflow (not auto-approve)
- **Benefit**: Enforces human interaction, prevents API-only approvals

#### tutor_status_history

- **Why**: Immutable audit trail of status changes
- **Benefit**: Answer "When did X happen?" with 100% accuracy
- **Property**: NEVER deleted, only inserted
- **Queries**:
  - Who approved tutor X?
  - How many rejections today?
  - Timeline of tutor X

#### admin_action_log

- **Why**: Immutable audit trail of admin actions
- **Benefit**: Compliance, security investigation
- **Property**: NEVER deleted, only inserted
- **Queries**:
  - All actions by admin Y
  - All actions on tutor Z
  - Actions between dates

### Why PostgreSQL?

- **ACID guarantees**: Status transitions are atomic (all-or-nothing)
- **Constraints**: Foreign keys prevent orphaned records
- **Triggers**: Can enforce immutability of audit tables
- **Indexes**: 30+ strategic indexes for performance
- **Replication**: Built-in failover capability
- **Cost**: Open source, battle-tested

### Why Prisma?

- **Type safety**: TypeScript models match database schema
- **Transactions**: Easy atomic operations (status + history + audit)
- **Migrations**: Version control for schema changes
- **Query builder**: Prevents SQL injection automatically
- **Developer experience**: Intuitive API, IntelliSense support

## Authentication & Authorization

### JWT Design

```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "userType": "TUTOR" | "ADMIN",
  "adminRole": "FRONT_DESK" | "MANAGER" | "SUPER_ADMIN",
  "iat": 1704369600,
  "exp": 1705000000
}
```

**Benefits:**

- Stateless: No session lookup needed
- Self-contained: All info in token
- Revocable: Implement blacklist if needed
- Scalable: Works across multiple servers

### Role-Based Access Control (RBAC)

```
                User
                 │
        ┌────────┴─────────┐
        │                  │
    ┌─────────┐        ┌───────┐
    │  Tutor  │        │ Admin │
    └─────────┘        └───┬───┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
      ┌──────────┐  ┌──────────┐  ┌──────────────┐
      │Front Desk│  │ Manager  │  │ Super Admin  │
      └──────────┘  └──────────┘  └──────────────┘
```

**Permission Matrix:**

| Action          | Tutor       | Front Desk | Manager | Super Admin |
| --------------- | ----------- | ---------- | ------- | ----------- |
| View gigs       | ACTIVE only | ✗          | ✗       | ✗           |
| Upload docs     | Always      | ✗          | ✗       | ✗           |
| Schedule appt   | ✗           | ✗          | ✓       | ✓           |
| Check in        | ✗           | ✓          | ✓       | ✓           |
| Approve         | ✗           | ✗          | ✓       | ✓           |
| Reject          | ✗           | ✗          | ✓       | ✓           |
| View audit logs | ✗           | ✗          | ✗       | ✓           |

## Event-Driven Architecture

### Why Events?

```
❌ Bad (Tightly Coupled):
Handler directly calls email + WhatsApp + SMS services
    ├─ If email service fails, whole request fails
    ├─ Adding SMS requires code change
    └─ Hard to test

✅ Good (Event-Driven):
Handler emits event
    ├─ Handlers subscribe to events
    ├─ If handler fails, others continue
    ├─ Adding new handler = no code change
    └─ Easy to test
```

### Event Flow

```
User Action
    │
    ├─ Core Logic (e.g., status change)
    │
    ├─ Validate (state machine, auth, etc)
    │
    ├─ Execute (update database)
    │
    ├─ Emit Event
    │   ├─ TUTOR_APPROVED
    │   ├─ payload: { tutorId, email, ... }
    │   └─ timestamp: 2024-01-04T10:30:00Z
    │
    └─ Async Handlers
        ├─ EmailHandler: Send email
        ├─ WhatsAppHandler: Send message
        ├─ LogHandler: Log to external service
        └─ WebhookHandler: Call third-party webhook

    (All handlers run in parallel, non-blocking)
    (If handler fails, event is retried or logged)
```

## Error Handling Strategy

### HTTP Status Codes

```
200 OK              → Success
201 Created         → Resource created
400 Bad Request     → Validation error
401 Unauthorized    → No JWT token
403 Forbidden       → Insufficient role/status
404 Not Found       → Resource doesn't exist
409 Conflict        → Invalid state transition
422 Unprocessable   → Business logic violation
500 Internal Error  → Unexpected error
```

### Error Response Format

```json
{
  "success": false,
  "error": "Tutor status must be CHECKED_IN to approve",
  "code": "INVALID_STATUS_TRANSITION"
}
```

### Example: Tutor tries to access gigs in REGISTERED_RESTRICTED

```
Request: GET /api/tutors/gigs
         Authorization: Bearer <token-for-restricted-tutor>

Handler:
  1. verifyAuth() → Success, user is tutor
  2. getTutorStatus() → Returns REGISTERED_RESTRICTED
  3. viewGigs() → Checks status
  4. status !== ACTIVE → throw Error()

Response: 403 Forbidden
{
  "success": false,
  "error": "Cannot view gigs. Current status: REGISTERED_RESTRICTED. Must be ACTIVE.",
  "code": "ACCESS_DENIED"
}

Client: Shows error message to tutor
```

## Performance Optimizations

### Database Indexes

```sql
-- Frequently used in WHERE clauses:
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tutors_status ON tutors(status);
CREATE INDEX idx_admins_role ON admins(role);

-- Frequently used in ORDER BY:
CREATE INDEX idx_appointments_scheduled ON appointments(scheduledAt);
CREATE INDEX idx_audit_performed ON admin_action_log(performedAt);

-- Composite indexes for common queries:
CREATE INDEX idx_audit_admin_action ON admin_action_log(adminId, action);
CREATE INDEX idx_appointments_tutor_status ON appointments(tutorId, status);
```

### Query Optimization

```typescript
// ✅ Good: Specify only needed fields
const tutor = await prisma.tutor.findUnique({
  where: { id: tutorId },
  select: {
    id: true,
    status: true,
    specialization: true,
  },
});

// ❌ Bad: Fetch everything
const tutor = await prisma.tutor.findUnique({
  where: { id: tutorId },
});
```

### Caching Strategy

Current: None (future enhancement)

Recommended:

```typescript
// Cache status lookups (expires 1 hour)
const status = await cache.get(`tutor:${tutorId}:status`);
if (!status) {
  status = await prisma.tutor.findUnique(...);
  await cache.set(`tutor:${tutorId}:status`, status, 3600);
}
```

## Security Architecture

### Layers

```
Layer 1: HTTPS/TLS (Transport)
  └─ Encrypt in-transit

Layer 2: CORS (Cross-Origin)
  └─ Only allow frontend domain

Layer 3: JWT (Authentication)
  └─ Verify identity

Layer 4: Role-Based Access (Authorization)
  └─ Verify permissions

Layer 5: Business Logic (Authorization)
  └─ Verify status (only ACTIVE tutors see gigs)

Layer 6: SQL Injection Prevention (Prisma)
  └─ Parameterized queries

Layer 7: Rate Limiting (Future)
  └─ Prevent brute force

Layer 8: Input Validation (Joi/Zod)
  └─ Reject malformed input

Layer 9: Helmet (Security Headers)
  └─ XSS, Clickjacking protection
```

### Password Security

```typescript
// Registration
plaintext → hashPassword() → bcrypt(10 rounds) → storage

// Login
input → comparePasswords() → bcrypt verify → ✓ Access

Key properties:
  • One-way hash (irreversible)
  • Salted (unique per password)
  • Slow (10 rounds = ~100ms per check)
```

## Testing Strategy

### Unit Tests (Services)

```typescript
describe('StatusTransitionService', () => {
  it('allows REGISTERED_RESTRICTED → CHECKED_IN', async () => {
    const result = await transitionStatus({
      tutorId,
      fromStatus: REGISTERED_RESTRICTED,
      toStatus: CHECKED_IN
    });
    expect(result.success).toBe(true);
  });

  it('rejects ACTIVE → CHECKED_IN', async () => {
    await expect(
      transitionStatus({..., fromStatus: ACTIVE, toStatus: CHECKED_IN})
    ).rejects.toThrow('Invalid transition');
  });
});
```

### Integration Tests (API)

```typescript
describe("POST /api/admin/tutors/:id/approve", () => {
  it("approves tutor and emits event", async () => {
    const response = await request(app)
      .post("/api/admin/tutors/tutor-1/approve")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(eventService.emit).toHaveBeenCalledWith(
      "TUTOR_APPROVED",
      expect.any(Object),
    );
  });
});
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│            DNS (api.Kopa360.com)                   │
└──────────────────┬���─────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│       CloudFlare / AWS Shield (DDoS Protection)     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  AWS Application Load Balancer (TLS Termination)    │
└──────────────────┬──────────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
 ┌────────┐  ┌────────┐  ┌────────┐
 │EC2 1   │  │EC2 2   │  │EC2 3   │  (Auto-scaling group)
 │API     │  │API     │  │API     │  (Health checks)
 │3000    │  │3000    │  │3000    │
 └────┬───┘  └────┬───┘  └────┬───┘
      │           │           │
      └───────────┼───────────┘
                  │
         ┌────────▼────────┐
         │  RDS PostgreSQL  │
         │  Multi-AZ        │
         │  Automated       │
         │  Backups         │
         └──────────────────┘
```

## Summary

The Kopa360 backend implements:

1. **State Machine**: Enforces strict status transitions
2. **RBAC**: Fine-grained role-based permissions
3. **Audit Trail**: Immutable records of all actions
4. **Event-Driven**: Async, non-blocking notifications
5. **Type-Safe**: TypeScript + Prisma prevent bugs
6. **Scalable**: Horizontal scaling with load balancing
7. **Secure**: Multiple security layers (HTTPS, JWT, validation)
8. **Accountable**: "Who did what when" always answerable
