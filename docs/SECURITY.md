# S-ARC Security Architecture & Hardening Guide

## 1. Security Overview

S-ARC incorporates defense-in-depth principles across authentication, role-based authorization, session management, input validation, and audit tracking.

---

## 2. Authentication & Credential Management

### A. Deprecation of Email-Based Privilege Assignment
- **Vulnerability Remediation**: All previous email-based administrator matching (e.g. `admin@admin.com`, `admin@s-arc.in`, `superadmin@admin.com`) and hardcoded fallback passwords (`admin123`, `password123`) have been **completely excised** from API routes.
- **Strict Database Authority**: User roles and permissions are retrieved strictly from authenticated database records in Cloudflare D1.

### B. Password Security
- **Algorithm**: `bcryptjs` with a cost factor of 11 (minimum 10) salt rounds.
- **Length Bounds**: Passwords must be between 6 and 128 characters (preventing bcrypt calculation Denial of Service).
- **Constant-Time Verification**: When an email is not found in the database, the system computes bcrypt against a static dummy hash (`DUMMY_HASH`) to prevent user enumeration timing attacks.

### C. JWT Session Encryption
- **Algorithm**: `HS256` signed using the `jose` cryptographic library.
- **Claims Enforcement**: Every token contains `iss` (`s-arc-platform`), `aud` (`s-arc-users`), `iat`, `exp` (7 days), `id`, `email`, and `role`.
- **Environment Key Enforcement**:
  - In production (`process.env.NODE_ENV === "production"`), the application strictly requires a 32+ character `JWT_SECRET`. Missing or default secrets throw an immediate fatal runtime exception.
- **Cookie Security**:
  - Cookie name: `sarc_session_token`
  - Attributes: `HttpOnly: true`, `SameSite: Lax`, `Path: /`, `Secure: true` in production.

---

## 3. Role-Based Access Control (RBAC)

The platform enforces four distinct authorization tiers:

| Role | Sub-Role | Status | Capabilities |
| :--- | :--- | :--- | :--- |
| `admin` | `null` | `active` | Full governance, CoA verification approvals, user suspension, fee configuration, immutable audit logs. |
| `user` | `architect` | `active` | Publish blueprint listings, edit own designs, respond to consultations, manage studio profile. |
| `user` | `architect` | `pending_verification` | Create draft listings; public marketplace publishing is **restricted** until administrative CoA approval. |
| `user` | `homeowner` | `active` | Save satellite plots, calculate KMBR setbacks, download reports, submit project consultation inquiries. |
| `user` | `contractor` | `active` | Access turnkey estimation data and material specifications. |

### Server-Side Route Guards (`web/lib/auth-middleware.ts`)
- `authenticateRequest(req)`: Validates JWT signature, expiration, issuer, and audience from cookie or Authorization Bearer header.
- `requireRole(req, ['admin'])`: Denies access unless the user holds the specified role.
- `requireVerifiedArchitect(req)`: Ensures the user is either an Administrator or an Architect with `status === "active"`. Unverified architects receive a 403 Forbidden.
- `requireOwnershipOrAdmin(req, resourceOwnerId)`: Prevents unauthorized modification of architectural listings and user profiles.

---

## 4. Rate Limiting & DoS Protection

An in-memory sliding window rate limiter (`web/lib/rate-limit.ts`) defends against brute-force attacks:
- **IP Login Rate Limit**: 15 attempts per 15 minutes per IP address.
- **Account Login Rate Limit**: 5 attempts per 15 minutes per email address.
- **Registration Rate Limit**: 6 accounts per hour per IP address.
- On successful authentication, rate limits for that IP and account are automatically reset.

---

## 5. Trusted Administrator Provisioning

Administrative accounts cannot be registered via public HTTP endpoints. They must be provisioned through the trusted administrative CLI script:

```bash
cd web
node scripts/provision-admin.mjs <email> <name> <password>
```

The script outputs the parameterized Cloudflare D1 SQL query and writes an entry to the immutable `audit_logs` table.
