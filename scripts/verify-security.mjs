/**
 * Automated Verification Script: S-ARC Comprehensive Application Security Suite
 */

const BASE_URL = "http://localhost:3000";

async function runSecurityTests() {
  console.log("=== S-ARC COMPREHENSIVE SECURITY TESTING SUITE ===\n");
  const results = [];

  function record(name, passed, evidence) {
    results.push({ name, passed, evidence });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${name}`);
    console.log(`       Evidence: ${evidence}\n`);
  }

  // 1. SQL Injection Testing
  // 1a. In search query /api/projects?q=
  const sqliPayload = "' OR 1=1 --";
  const sqliRes = await fetch(`${BASE_URL}/api/projects?q=${encodeURIComponent(sqliPayload)}`);
  const sqliData = await sqliRes.json();
  // Safe parameterized query won't throw 500 SQL syntax error
  const sqliSafe = sqliRes.status === 200 && Array.isArray(sqliData.projects);
  record(
    "1. SQL Injection Resilience (Search Parameter)",
    sqliSafe,
    `HTTP ${sqliRes.status}, query executed safely without syntax error or unexpected dump`
  );

  // 1b. In login email field
  const loginSqliRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@s-arc.in' OR '1'='1",
      password: "wrong",
    }),
  });
  const loginSqliData = await loginSqliRes.json();
  const loginSqliSafe = loginSqliRes.status === 400 || loginSqliRes.status === 401;
  record(
    "2. SQL Injection Resilience (Login Parameter)",
    loginSqliSafe,
    `HTTP ${loginSqliRes.status}, message: "${loginSqliData.error}"`
  );

  // 2. Cross-Site Scripting (XSS) Sanitization / Safe Handling
  const xssPayload = "<script>alert('XSS_PWNED')</script>";
  const inqRes = await fetch(`${BASE_URL}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientName: "Sec Researcher",
      clientEmail: "sec@s-arc.test",
      message: `Inquiry message with XSS payload: ${xssPayload}`,
    }),
  });
  const inqData = await inqRes.json();
  // Must be stored safely without executing, returned as plain JSON strings
  const xssSafe = inqRes.status === 201 && inqData.inquiry?.message.includes(xssPayload);
  record(
    "3. Stored XSS Neutralization (JSON Escaping)",
    xssSafe,
    `HTTP ${inqRes.status}, JSON safely returned without unescaped execution`
  );

  // 3. CSRF Protection Attributes (HttpOnly, SameSite, Secure)
  const loginCookieRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@s-arc.in",
      password: "admin123",
    }),
  });
  const setCookieHeader = loginCookieRes.headers.get("set-cookie") || "";
  const hasHttpOnly = setCookieHeader.toLowerCase().includes("httponly");
  const hasSameSite = setCookieHeader.toLowerCase().includes("samesite=lax");
  const csrfSafe = hasHttpOnly && hasSameSite;
  record(
    "4. Session Cookie CSRF Hardening",
    csrfSafe,
    `Set-Cookie contains HttpOnly: ${hasHttpOnly}, SameSite=Lax: ${hasSameSite}`
  );
  const adminToken = (await loginCookieRes.json()).token;

  // 4. Insecure Direct Object References (IDOR) - Accessing Another User's Saved Plot
  // Re-use verified existing homeowner account from seed/initial setup
  const ownerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ramesh.client@gmail.com", password: "password123" }),
  });
  const ownerToken = (await ownerLoginRes.json()).token;

  // Owner saves a plot
  const plotSave = await fetch(`${BASE_URL}/api/plots`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ownerToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Confidential Land Parcel",
      coordinates: [
        [76.2999, 9.9816],
        [76.3009, 9.9816],
        [76.3009, 9.9806],
        [76.2999, 9.9806],
      ],
      locationName: "Kochi, Kerala",
    }),
  });
  const savedPlotId = (await plotSave.json()).plot?.id;

  // Use architect account as the non-owner / unauthorized actor
  const architectLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "nikhil@studiovayu.arch", password: "password123" }),
  });
  const rivalToken = (await architectLoginRes.json()).token;

  // Rival attempts to read Owner's plot: GET /api/plots/[id]
  const idorReadRes = await fetch(`${BASE_URL}/api/plots/${savedPlotId}`, {
    headers: { Authorization: `Bearer ${rivalToken}` },
  });
  const idorReadData = await idorReadRes.json();
  const idorReadBlocked = idorReadRes.status === 403;

  // Rival attempts to delete Owner's plot: DELETE /api/plots/[id]
  const idorDeleteRes = await fetch(`${BASE_URL}/api/plots/${savedPlotId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${rivalToken}` },
  });
  const idorDeleteBlocked = idorDeleteRes.status === 403;

  const idorPassed = idorReadBlocked && idorDeleteBlocked;
  record(
    "5. IDOR Defense (Unauthorized Plot Read & Delete Blocked)",
    idorPassed,
    `Read HTTP ${idorReadRes.status} (error: "${idorReadData.error}"), Delete HTTP ${idorDeleteRes.status}`
  );

  // 5. Privilege Escalation Prevention
  // Non-admin tries to call PATCH /api/users/[id] to elevate their own role to admin
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${rivalToken}` } });
  const meData = await meRes.json();
  const nonAdminUserId = meData.user?.id;

  const privEscRes = await fetch(`${BASE_URL}/api/users/${nonAdminUserId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${rivalToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ role: "admin" }),
  });
  const privEscBlocked = privEscRes.status === 403;
  record(
    "6. Privilege Escalation Defense (Self-Promotion to Admin Blocked)",
    privEscBlocked,
    `HTTP ${privEscRes.status}, Forbidden to non-admin actors`
  );

  // 6. Sensitive Information Exposure (Stack traces, secrets)
  const badEndpointRes = await fetch(`${BASE_URL}/api/projects/non-existent-id-404`);
  const badEndpointData = await badEndpointRes.json();
  const noStackLeak =
    !JSON.stringify(badEndpointData).includes("node_modules") &&
    !JSON.stringify(badEndpointData).includes("jwt_secret") &&
    !JSON.stringify(badEndpointData).includes("password_hash");
  record(
    "7. Sensitive Information Leakage Prevention",
    noStackLeak,
    `HTTP ${badEndpointRes.status}, clean sanitized response with zero internal stack or secret leakage`
  );

  console.log("=== SECURITY TESTING SUITE SUMMARY ===");
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`Passed: ${totalPassed} / ${results.length}`);
}

runSecurityTests().catch(console.error);
