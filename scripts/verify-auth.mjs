/**
 * Automated Verification Script: S-ARC Authentication & Authorization
 */

import { SignJWT } from "jose";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== S-ARC AUTHENTICATION & AUTHORIZATION VERIFICATION ===\n");
  const results = [];

  function record(name, passed, evidence) {
    results.push({ name, passed, evidence });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${name}`);
    console.log(`       Evidence: ${evidence}\n`);
  }

  // 1. Normal User Registration
  const testEmail = `homeowner.${Date.now()}@s-arc.test`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Mr. Verified Homeowner",
      email: testEmail,
      password: "HomeownerPassword123!",
      subRole: "homeowner",
      location: "Kottayam, Kerala",
    }),
  });
  const regData = await regRes.json();
  const regPassed = regRes.status === 201 && regData.user?.role === "user" && regData.user?.subRole === "homeowner";
  record(
    "1. Normal User Registration",
    regPassed,
    `HTTP ${regRes.status}, user role: ${regData.user?.role}, subRole: ${regData.user?.subRole}`
  );

  // 2. Normal User Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "HomeownerPassword123!",
    }),
  });
  const loginData = await loginRes.json();
  const normalUserToken = loginData.token;
  const loginPassed = loginRes.status === 200 && Boolean(normalUserToken) && loginData.user?.role === "user";
  record(
    "2. Normal User Login",
    loginPassed,
    `HTTP ${loginRes.status}, role: ${loginData.user?.role}, token length: ${normalUserToken?.length}`
  );

  // 3. Administrator Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@s-arc.in",
      password: "admin123",
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;
  const adminLoginPassed = adminLoginRes.status === 200 && adminLoginData.user?.role === "admin";
  record(
    "3. Administrator Login",
    adminLoginPassed,
    `HTTP ${adminLoginRes.status}, role: ${adminLoginData.user?.role}, token verified: ${Boolean(adminToken)}`
  );

  // 4. Invalid Credentials
  const invalidLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@s-arc.in",
      password: "WrongPasswordAttempt!",
    }),
  });
  const invalidLoginData = await invalidLoginRes.json();
  const invalidPassed = invalidLoginRes.status === 401 && invalidLoginData.error?.includes("Invalid email or password");
  record(
    "4. Invalid Credentials Rejection",
    invalidPassed,
    `HTTP ${invalidLoginRes.status}, error: "${invalidLoginData.error}"`
  );

  // 5. Missing JWT Access to Protected Route (/api/users)
  const missingJwtRes = await fetch(`${BASE_URL}/api/users`);
  const missingJwtData = await missingJwtRes.json();
  const missingJwtPassed = missingJwtRes.status === 401 && missingJwtData.error?.includes("Authentication required");
  record(
    "5. Missing JWT Rejection",
    missingJwtPassed,
    `HTTP ${missingJwtRes.status}, error: "${missingJwtData.error}"`
  );

  // 6. Forged JWT (signed with attacker secret)
  const attackerKey = new TextEncoder().encode("attacker-arbitrary-forged-secret-key-32chars");
  const forgedToken = await new SignJWT({ id: "usr-admin-01", email: "admin@s-arc.in", role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(attackerKey);

  const forgedRes = await fetch(`${BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${forgedToken}` },
  });
  const forgedData = await forgedRes.json();
  const forgedPassed = forgedRes.status === 401 && forgedData.error?.includes("Invalid or expired session");
  record(
    "6. Forged JWT Rejection",
    forgedPassed,
    `HTTP ${forgedRes.status}, error: "${forgedData.error}"`
  );

  // 7. Expired JWT
  // Sign with valid dev key but expired in the past
  const devKey = new TextEncoder().encode(
    process.env.JWT_SECRET || "s-arc-dev-secret-key-minimum-32-chars-for-hs256"
  );
  const expiredToken = await new SignJWT({
    id: "usr-admin-01",
    name: "Admin",
    email: "admin@s-arc.in",
    role: "admin",
    status: "active",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("s-arc-platform")
    .setAudience("s-arc-users")
    .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 1800) // Expired 30 mins ago
    .sign(devKey);

  const expiredRes = await fetch(`${BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  const expiredData = await expiredRes.json();
  const expiredPassed = expiredRes.status === 401 && expiredData.error?.includes("Invalid or expired session");
  record(
    "7. Expired JWT Rejection",
    expiredPassed,
    `HTTP ${expiredRes.status}, error: "${expiredData.error}"`
  );

  // 8. Role Escalation Attempt during Registration (attacker sends role: "admin")
  const exploitEmail = `attacker.${Date.now()}@exploit.test`;
  const exploitRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Malicious Actor",
      email: exploitEmail,
      password: "AttackerPassword123!",
      role: "admin", // Privilege escalation attack payload
      subRole: "admin",
    }),
  });
  const exploitRegData = await exploitRegRes.json();
  const exploitPassed = exploitRegRes.status === 201 && exploitRegData.user?.role === "user";
  record(
    "8. Privilege Escalation Prevention on Register",
    exploitPassed,
    `Attacker sent role: "admin", Server forced role: "${exploitRegData.user?.role}"`
  );

  // 9. Direct Administrator API Access Control (Normal User vs Admin)
  // 9a. Normal user calling GET /api/users
  const userAccessRes = await fetch(`${BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${normalUserToken}` },
  });
  const userAccessData = await userAccessRes.json();
  const userForbidden = userAccessRes.status === 403;
  record(
    "9a. Normal User Blocked from Admin Endpoint (/api/users)",
    userForbidden,
    `HTTP ${userAccessRes.status}, error: "${userAccessData.error}"`
  );

  // 9b. Admin calling GET /api/users
  const adminAccessRes = await fetch(`${BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminAccessData = await adminAccessRes.json();
  const adminAllowed = adminAccessRes.status === 200 && Array.isArray(adminAccessData.users);
  record(
    "9b. Administrator Allowed Access to /api/users",
    adminAllowed,
    `HTTP ${adminAccessRes.status}, total users returned: ${adminAccessData.total}`
  );

  console.log("=== AUTHENTICATION VERIFICATION SUMMARY ===");
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`Passed: ${totalPassed} / ${results.length}`);
}

runTests().catch(console.error);
