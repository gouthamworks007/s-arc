# S-ARC API Reference Documentation

All endpoints return JSON responses. Protected endpoints accept authentication via:
1. `sarc_session_token` HTTP-only Cookie
2. `Authorization: Bearer <jwt-token>` HTTP Header

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a standard user account (`homeowner`, `architect`, `contractor`). Direct registration as `admin` is strictly forbidden.

**Request Body:**
```json
{
  "name": "Ar. Nikhil Rajan",
  "email": "nikhil@studiovayu.arch",
  "password": "SecurePassword123!",
  "subRole": "architect",
  "coaNumber": "CA/2016/78291",
  "studioName": "Studio Vayu",
  "phone": "+91 98471 28910",
  "location": "Kochi, Kerala"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Architect registration submitted. Council of Architecture credentials are under administrative review.",
  "user": {
    "id": "usr-123456",
    "name": "Ar. Nikhil Rajan",
    "email": "nikhil@studiovayu.arch",
    "role": "user",
    "subRole": "architect",
    "status": "pending_verification"
  },
  "token": "eyJhbGciOi..."
}
```

---

### `POST /api/auth/login`
Authenticates a user with rate limiting (15 attempts/IP, 5 attempts/email per 15 minutes).

**Request Body:**
```json
{
  "email": "admin@s-arc.in",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful.",
  "user": {
    "id": "usr-admin-01",
    "name": "Admin",
    "email": "admin@s-arc.in",
    "role": "admin",
    "status": "active"
  },
  "token": "eyJhbGciOi..."
}
```

---

### `GET /api/auth/me`
Retrieves and validates the current session against the database.

**Response (200 OK):**
```json
{
  "authenticated": true,
  "user": {
    "id": "usr-admin-01",
    "name": "Admin",
    "email": "admin@s-arc.in",
    "role": "admin",
    "status": "active"
  }
}
```

---

### `POST /api/auth/logout`
Clears the session cookie and invalidates client session state.

---

## 2. Architectural Blueprint Listing Endpoints

### `GET /api/projects`
Search and filter architectural design blueprints.

**Query Parameters:**
- `style`: Architectural style filter (e.g. `TROPICAL MODERNISM`, `TRADITIONAL KERALA`)
- `minCents`: Minimum plot size in Cents
- `maxCents`: Maximum plot size in Cents
- `facing`: Vastu/cardinal orientation (`North`, `South`, `East`, `West`, `North-East`)
- `status`: `published` (default), `draft`, or `all`
- `q`: Free-text search query matching title, location, or architect name

---

### `POST /api/projects`
Publish a new architectural design blueprint. **Requires Verified Architect or Administrator.**

**Request Body:**
```json
{
  "name": "The Courtyard Pavilion",
  "style": "TROPICAL MODERNISM",
  "location": "Alappuzha, Kerala",
  "price": "₹42,000",
  "cents": 11.2,
  "builtUpArea": "2,750 Sq.Ft",
  "bedrooms": 4,
  "floors": 2,
  "facing": "East",
  "vastuScore": 96,
  "description": "Climate-responsive home designed around a rain-fed central courtyard.",
  "image": "https://images.unsplash.com/..."
}
```

---

### `GET /api/projects/[id]`
Retrieves full details of a specific design blueprint.

---

### `PUT /api/projects/[id]`
Updates an existing project. **Requires resource ownership or Administrator role.**

---

### `DELETE /api/projects/[id]`
Deletes or archives a project listing. **Requires resource ownership or Administrator role.**

---

## 3. Administrative User & Verification Management

### `GET /api/users`
List platform users. **Requires Administrator role.**

### `PATCH /api/users/[id]`
Approve Council of Architecture credentials, update status (`active`, `suspended`), or modify user roles. **Requires Administrator role.**

### `DELETE /api/users/[id]`
Delete a user account. Primary platform administrators cannot be deleted. **Requires Administrator role.**

---

## 4. Plot Intelligence & Saved Parcels

### `GET /api/plots`
Retrieves all measured parcels saved by the authenticated homeowner.

### `POST /api/plots`
Saves a measured boundary polygon with area in Cents and computed KMBR setbacks.
