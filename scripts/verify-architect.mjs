/**
 * Automated Verification Script: S-ARC Architect Verification Workflow & Project Ownership
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== S-ARC ARCHITECT VERIFICATION WORKFLOW & OWNERSHIP ===\n");
  const results = [];

  function record(name, passed, evidence) {
    results.push({ name, passed, evidence });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${name}`);
    console.log(`       Evidence: ${evidence}\n`);
  }

  // 0. Authenticate Admin to use for approvals/inspections
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@s-arc.in", password: "admin123" }),
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;

  // 1. Architect Registration
  const archEmail = `architect.${Date.now()}@vayu.design`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ar. Vikram Varma",
      email: archEmail,
      password: "ArchitectPassword123!",
      subRole: "architect",
      coaNumber: "CA/2026/12345",
      studioName: "Varma Design Studio",
      location: "Thrissur, Kerala",
    }),
  });
  const regData = await regRes.json();
  const archToken = regData.token;
  const archUserId = regData.user?.id;

  const regPassed = regRes.status === 201 && regData.user?.subRole === "architect";
  record(
    "1. Architect Registration",
    regPassed,
    `HTTP ${regRes.status}, subRole: ${regData.user?.subRole}, coa: ${regData.user?.coaNumber}`
  );

  // 2. Status Defaults to pending_verification
  const pendingPassed = regData.user?.status === "pending_verification";
  record(
    "2. Default Status is pending_verification",
    pendingPassed,
    `Registered architect status: "${regData.user?.status}"`
  );

  // 3. Publishing while Pending Verification (Must Return 403 Forbidden)
  const publishPendingRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${archToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Unapproved Cantilever House",
      price: "₹45,000",
      cents: 10,
      builtUpArea: "2,400 Sq.Ft",
      bedrooms: 3,
      floors: 2,
    }),
  });
  const publishPendingData = await publishPendingRes.json();
  const publishBlocked =
    publishPendingRes.status === 403 &&
    publishPendingData.error?.includes("Council of Architecture registration is currently under administrative review");
  record(
    "3. Publishing Blocked While Status is pending_verification",
    publishBlocked,
    `HTTP ${publishPendingRes.status}, error: "${publishPendingData.error}"`
  );

  // 4. Administrator Approval (PATCH /api/users/[id] status: "active")
  const approveRes = await fetch(`${BASE_URL}/api/users/${archUserId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "active",
      reviewNotes: "Council of Architecture license CA/2026/12345 verified in Council Registry.",
    }),
  });
  const approveData = await approveRes.json();
  const approvePassed = approveRes.status === 200 && approveData.updatedFields?.status === "active";
  record(
    "4. Administrator Approval of Architect",
    approvePassed,
    `HTTP ${approveRes.status}, updated status: ${approveData.updatedFields?.status}`
  );

  // Re-login architect to receive fresh JWT with status: "active"
  const approvedLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: archEmail,
      password: "ArchitectPassword123!",
    }),
  });
  const approvedLoginData = await approvedLoginRes.json();
  const approvedArchToken = approvedLoginData.token;

  // 5. Publishing After Administrator Approval (Must Succeed 201)
  const publishApprovedRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${approvedArchToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Varma Tropical Villa",
      price: "₹48,000",
      cents: 12.0,
      builtUpArea: "2,900 Sq.Ft",
      bedrooms: 4,
      floors: 2,
      facing: "East",
      vastuScore: 97,
      description: "Passive solar tropical residence with open central courtyard.",
    }),
  });
  const publishApprovedData = await publishApprovedRes.json();
  const createdProject = publishApprovedData.project;
  const publishAllowed = publishApprovedRes.status === 201 && Boolean(createdProject?.id);
  record(
    "5. Publishing Allowed After Approval",
    publishAllowed,
    `HTTP ${publishApprovedRes.status}, project ID: ${createdProject?.id}, status: ${createdProject?.status}`
  );

  // 6. Editing Another Architect's Project (Must Return 403 Forbidden)
  // Create another architect account
  const rivalEmail = `rival.${Date.now()}@rival.design`;
  const rivalRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ar. Rival Architect",
      email: rivalEmail,
      password: "RivalPassword123!",
      subRole: "architect",
      coaNumber: "CA/2026/99111",
      studioName: "Rival Design",
    }),
  });
  const rivalRegData = await rivalRegRes.json();

  // Approve rival so they have an active token
  await fetch(`${BASE_URL}/api/users/${rivalRegData.user?.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "active" }),
  });

  const rivalLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: rivalEmail, password: "RivalPassword123!" }),
  });
  const rivalToken = (await rivalLoginRes.json()).token;

  // Rival attempts to PUT /api/projects/[id] on Varma's project
  const rivalEditRes = await fetch(`${BASE_URL}/api/projects/${createdProject.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${rivalToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Hijacked Varma Villa",
      price: "₹1,000",
    }),
  });
  const rivalEditData = await rivalEditRes.json();
  const rivalBlocked = rivalEditRes.status === 403;
  record(
    "6. Editing Another Architect's Project Blocked",
    rivalBlocked,
    `HTTP ${rivalEditRes.status}, error: "${rivalEditData.error}"`
  );

  // 7. Owner Editing Own Project (Must Succeed 200)
  const ownerEditRes = await fetch(`${BASE_URL}/api/projects/${createdProject.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${approvedArchToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price: "₹52,000",
      description: "Updated luxury specifications.",
    }),
  });
  const ownerEditData = await ownerEditRes.json();
  const ownerAllowed = ownerEditRes.status === 200 && ownerEditData.success === true;
  record(
    "7. Owner Editing Own Project Allowed",
    ownerAllowed,
    `HTTP ${ownerEditRes.status}, updated price: ${ownerEditData.project?.price}`
  );

  // 8. Administrator Rejection / Suspension
  const rejectRes = await fetch(`${BASE_URL}/api/users/${rivalRegData.user?.id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "suspended",
      reviewNotes: "Invalid Council of Architecture credentials. Registration rejected.",
    }),
  });
  const rejectData = await rejectRes.json();
  const rejectPassed = rejectRes.status === 200 && rejectData.updatedFields?.status === "suspended";
  record(
    "8. Administrator Rejection / Account Suspension",
    rejectPassed,
    `HTTP ${rejectRes.status}, status: ${rejectData.updatedFields?.status}`
  );

  console.log("=== ARCHITECT WORKFLOW VERIFICATION SUMMARY ===");
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`Passed: ${totalPassed} / ${results.length}`);
}

runTests().catch(console.error);
