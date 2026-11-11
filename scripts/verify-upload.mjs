/**
 * S-ARC Architect Plan & Blueprint File Upload Verification Suite
 */

const BASE_URL = "http://localhost:3000";

async function runUploadVerification() {
  console.log("==================================================================");
  console.log("   S-ARC ARCHITECT PLAN & BLUEPRINT UPLOAD VERIFICATION");
  console.log("==================================================================\n");

  const results = [];

  function record(testNum, title, passed, evidence) {
    results.push({ testNum, title, passed, evidence });
    const tag = passed ? "[PASS]" : "[FAIL]";
    console.log(`${tag} Test ${testNum}: ${title}`);
    console.log(`       Evidence: ${evidence}\n`);
  }

  try {
    // -------------------------------------------------------------
    // Step 1: Unauthenticated Upload Rejection
    // -------------------------------------------------------------
    const formDataAnon = new FormData();
    const blobAnon = new Blob(["fake png content"], { type: "image/png" });
    formDataAnon.append("file", blobAnon, "plan.png");
    formDataAnon.append("category", "plans");

    const resAnon = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: formDataAnon,
    });
    const dataAnon = await resAnon.json();
    record(
      1,
      "Unauthenticated upload request rejection (401)",
      resAnon.status === 401,
      `Status=${resAnon.status}, Error="${dataAnon.error}"`
    );

    // -------------------------------------------------------------
    // Step 2: Homeowner Client Upload Rejection (Role-Based Access Control)
    // -------------------------------------------------------------
    const timestamp = Date.now();
    const clientEmail = `client.tester.${timestamp}@s-arc.test`;
    const regClientRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Client",
        email: clientEmail,
        password: "TestPassword123!",
        subRole: "homeowner",
        location: "Kochi, Kerala",
      }),
    });
    const clientData = await regClientRes.json();
    const clientToken = clientData.token;

    const resClientUpload = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientToken}`,
      },
      body: formDataAnon,
    });
    const dataClientUpload = await resClientUpload.json();
    record(
      2,
      "Homeowner upload rejection (403 Forbidden for non-architects)",
      resClientUpload.status === 403,
      `Status=${resClientUpload.status}, Error="${dataClientUpload.error}"`
    );

    // -------------------------------------------------------------
    // Step 3: Verified Architect Login
    // -------------------------------------------------------------
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nikhil@studiovayu.arch",
        password: "password123",
      }),
    });
    const loginData = await loginRes.json();
    const architectToken = loginData.token;
    record(
      3,
      "Verified Architect authentication (Ar. Nikhil Rajan)",
      Boolean(architectToken),
      `Token obtained, Role=${loginData.user?.role}, SubRole=${loginData.user?.subRole}`
    );

    // -------------------------------------------------------------
    // Step 4: Upload 2D Floor Plan Blueprint Image
    // -------------------------------------------------------------
    const planBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    const planBlob = new Blob([planBuffer], { type: "image/png" });
    const formDataPlan = new FormData();
    formDataPlan.append("file", planBlob, "ground-floor-blueprint-1-50.png");
    formDataPlan.append("category", "plans");

    const resPlanUpload = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${architectToken}`,
      },
      body: formDataPlan,
    });
    const dataPlanUpload = await resPlanUpload.json();
    const planUrl = dataPlanUpload.url;
    record(
      4,
      "Verified architect floor plan blueprint upload",
      resPlanUpload.status === 200 && typeof planUrl === "string" && planUrl.startsWith("/uploads/plans/"),
      `Status=${resPlanUpload.status}, URL=${planUrl}, Size=${dataPlanUpload.fileSize}`
    );

    // -------------------------------------------------------------
    // Step 5: Upload CAD Technical Deliverable Package (.dwg/.zip)
    // -------------------------------------------------------------
    const cadBuffer = Buffer.from("AC1032 dummy dwg header binary test content");
    const cadBlob = new Blob([cadBuffer], { type: "application/octet-stream" });
    const formDataCad = new FormData();
    formDataCad.append("file", cadBlob, "kochi-residence-complete-cad.dwg");
    formDataCad.append("category", "cad");

    const resCadUpload = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${architectToken}`,
      },
      body: formDataCad,
    });
    const dataCadUpload = await resCadUpload.json();
    const cadUrl = dataCadUpload.url;
    record(
      5,
      "Verified architect CAD drawing package upload (.dwg)",
      resCadUpload.status === 200 && typeof cadUrl === "string" && cadUrl.startsWith("/uploads/cad/"),
      `Status=${resCadUpload.status}, URL=${cadUrl}, FileName=${dataCadUpload.fileName}, Size=${dataCadUpload.fileSize}`
    );

    // -------------------------------------------------------------
    // Step 6: Disallowed File Type Rejection (.exe / malicious script)
    // -------------------------------------------------------------
    const badBlob = new Blob(["MZ dangerous executable"], { type: "application/x-msdownload" });
    const formDataBad = new FormData();
    formDataBad.append("file", badBlob, "payload.exe");
    formDataBad.append("category", "plans");

    const resBadUpload = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${architectToken}`,
      },
      body: formDataBad,
    });
    const dataBadUpload = await resBadUpload.json();
    record(
      6,
      "Disallowed file extension security rejection (.exe)",
      resBadUpload.status === 400,
      `Status=${resBadUpload.status}, Error="${dataBadUpload.error}"`
    );

    // -------------------------------------------------------------
    // Step 7: Update Architectural Project with Uploaded Plan & CAD
    // -------------------------------------------------------------
    // Target Ar. Nikhil Rajan's project
    const projectId = "proj-001";
    const updatePayload = {
      floorPlanImage: planUrl,
      cadFileUrl: cadUrl,
      cadFileName: dataCadUpload.fileName || dataCadUpload.originalName,
      cadFileSize: dataCadUpload.fileSize || dataCadUpload.formattedSize,
    };

    const resUpdate = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${architectToken}`,
      },
      body: JSON.stringify(updatePayload),
    });
    const dataUpdate = await resUpdate.json();
    record(
      7,
      "Project update persisting uploaded blueprint and CAD package",
      resUpdate.status === 200,
      `Status=${resUpdate.status}, Updated floorPlanImage=${Boolean(dataUpdate.project?.floorPlanImage)}, cadFileUrl=${Boolean(dataUpdate.project?.cadFileUrl)}`
    );

    // -------------------------------------------------------------
    // Step 8: GET /api/projects/[id] Verification
    // -------------------------------------------------------------
    const resGet = await fetch(`${BASE_URL}/api/projects/${projectId}`);
    const dataGet = await resGet.json();
    const fetchedProject = dataGet.project;

    const matchesPlan = fetchedProject?.floorPlanImage === planUrl;
    const matchesCad = fetchedProject?.cadFileUrl === cadUrl;
    const matchesCadName = fetchedProject?.cadFileName === dataCadUpload.originalName;

    record(
      8,
      "Retrieve updated project: floor plan & CAD metadata verified in D1",
      matchesPlan && matchesCad && matchesCadName,
      `floorPlanImage="${fetchedProject?.floorPlanImage}", cadFileName="${fetchedProject?.cadFileName}", cadFileSize="${fetchedProject?.cadFileSize}"`
    );

    // Summary
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.passed).length;
    console.log("==================================================================");
    console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log("==================================================================");

    if (passedTests === totalTests) {
      console.log("\nALL ARCHITECT PLAN UPLOAD TESTS PASSED!");
      process.exit(0);
    } else {
      console.error("\nSOME TESTS FAILED.");
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  }
}

runUploadVerification();
