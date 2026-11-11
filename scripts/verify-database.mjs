/**
 * Automated Verification Script: S-ARC Database Operations & Persistence
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== S-ARC DATABASE OPERATIONS & PERSISTENCE VERIFICATION ===\n");
  const results = [];

  function record(name, passed, evidence) {
    results.push({ name, passed, evidence });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${name}`);
    console.log(`       Evidence: ${evidence}\n`);
  }

  // 1. Admin login
  const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@s-arc.in", password: "admin123" }),
  });
  const adminToken = (await adminRes.json()).token;

  // 2. Project Creation Persistence
  const createProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `DB Persistence Test Villa ${Date.now()}`,
      style: "TROPICAL MODERNISM",
      location: "Alappuzha, Kerala",
      price: "₹65,000",
      cents: 14.5,
      builtUpArea: "3,400 Sq.Ft",
      bedrooms: 4,
      floors: 2,
      facing: "East",
      vastuScore: 99,
      description: "Waterfront climate-resilient residence.",
    }),
  });
  const createProjData = await createProjRes.json();
  const testProjectId = createProjData.project?.id;
  const projectCreated = createProjRes.status === 201 && Boolean(testProjectId);
  record(
    "1. Project Creation Persistence",
    projectCreated,
    `HTTP ${createProjRes.status}, Created Project ID: ${testProjectId}`
  );

  // 3. Project Fetch Verification (GET /api/projects/[id])
  const getProjRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}`);
  const getProjData = await getProjRes.json();
  const projectRetrieved = getProjRes.status === 200 && getProjData.project?.id === testProjectId;
  record(
    "2. Project Read-After-Write",
    projectRetrieved,
    `HTTP ${getProjRes.status}, Retrieved Name: "${getProjData.project?.name}"`
  );

  // 4. Project Editing Persistence (PUT /api/projects/[id])
  const updateProjRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price: "₹72,000",
      description: "Updated with solar microgrid and rainwater harvesting.",
    }),
  });
  const updateProjData = await updateProjRes.json();
  const projectUpdated = updateProjRes.status === 200 && updateProjData.success === true;
  record(
    "3. Project Update Persistence",
    projectUpdated,
    `HTTP ${updateProjRes.status}, Updated Price: ${updateProjData.project?.price}`
  );

  // 5. Project Deletion Persistence (DELETE /api/projects/[id])
  const deleteProjRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const deleteProjData = await deleteProjRes.json();
  const projectDeleted = deleteProjRes.status === 200 && deleteProjData.success === true;
  record(
    "4. Project Deletion Persistence",
    projectDeleted,
    `HTTP ${deleteProjRes.status}, message: "${deleteProjData.message}"`
  );

  // 6. Verify Deletion in Database (GET /api/projects/[id] should now 404)
  const verifyDeleteRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}`);
  const verifyDeleted = verifyDeleteRes.status === 404;
  record(
    "5. Project Deletion Verification (404 Not Found)",
    verifyDeleted,
    `HTTP ${verifyDeleteRes.status}`
  );

  // 7. Inquiry Creation & Persistence (POST /api/inquiries)
  const inquiryEmail = `client.${Date.now()}@example.com`;
  const inqRes = await fetch(`${BASE_URL}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientName: "Mr. Thomas K.",
      clientEmail: inquiryEmail,
      clientPhone: "+91 94471 99887",
      projectName: "The Ridge House",
      message: "Requesting site consultation for sloping terrain in Wayanad.",
      budgetRange: "₹80L - ₹1Cr",
    }),
  });
  const inqData = await inqRes.json();
  const inquiryCreated = inqRes.status === 201 && inqData.success === true;
  record(
    "6. Consultation Inquiry Submission & Persistence",
    inquiryCreated,
    `HTTP ${inqRes.status}, Inquiry ID: ${inqData.inquiry?.id}`
  );

  // 8. Saved Plot Persistence (POST & GET /api/plots)
  // Register a homeowner to save plots
  const plotUserEmail = `plotowner.${Date.now()}@s-arc.test`;
  const plotUserReg = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Landowner Test",
      email: plotUserEmail,
      password: "PlotPassword123!",
      subRole: "homeowner",
    }),
  });
  const plotUserToken = (await plotUserReg.json()).token;

  const savePlotRes = await fetch(`${BASE_URL}/api/plots`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${plotUserToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Palakkad Agricultural Estate Plot",
      coordinates: [
        [76.6548, 10.7867],
        [76.6558, 10.7867],
        [76.6558, 10.7857],
        [76.6548, 10.7857],
      ],
      roadSideIndex: 0,
      locationName: "Palakkad, Kerala",
    }),
  });
  const savePlotData = await savePlotRes.json();
  const plotSaved = savePlotRes.status === 201 && savePlotData.success === true;
  record(
    "7. Saved Plot Geometry & KMBR Persistence",
    plotSaved,
    `HTTP ${savePlotRes.status}, Plot ID: ${savePlotData.plot?.id}, Cents: ${savePlotData.plot?.area_cents}`
  );

  // 9. Read Saved Plot List (GET /api/plots)
  const getPlotsRes = await fetch(`${BASE_URL}/api/plots`, {
    headers: { Authorization: `Bearer ${plotUserToken}` },
  });
  const getPlotsData = await getPlotsRes.json();
  const plotsListRetrieved = getPlotsRes.status === 200 && getPlotsData.plots?.length > 0;
  record(
    "8. Saved Plot Read-After-Write List",
    plotsListRetrieved,
    `HTTP ${getPlotsRes.status}, Total Plots: ${getPlotsData.plots?.length}`
  );

  console.log("=== DATABASE VERIFICATION SUMMARY ===");
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`Passed: ${totalPassed} / ${results.length}`);
}

runTests().catch(console.error);
