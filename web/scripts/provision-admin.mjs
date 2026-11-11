#!/usr/bin/env node

/**
 * S-ARC Trusted Administrator Provisioning Script
 *
 * Usage:
 *   node scripts/provision-admin.mjs <email> <name> <password>
 * Example:
 *   node scripts/provision-admin.mjs admin@s-arc.in "Senior Architect Admin" "MySecurePassword123!"
 *
 * This administrative script generates a cryptographically hashed administrator
 * account record with full RBAC privileges and produces the Cloudflare D1 migration SQL.
 */

import bcrypt from "bcryptjs";

const args = process.argv.slice(2);
const email = args[0] || process.env.ADMIN_PROVISION_EMAIL;
const name = args[1] || process.env.ADMIN_PROVISION_NAME || "System Administrator";
const password = args[2] || process.env.ADMIN_PROVISION_PASSWORD;

if (!email || !password) {
  console.error("Usage: node scripts/provision-admin.mjs <email> <name> <password>");
  console.error("Or define ADMIN_PROVISION_EMAIL and ADMIN_PROVISION_PASSWORD environment variables.");
  process.exit(1);
}

const cleanEmail = email.trim().toLowerCase();
if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
  console.error("Error: Invalid email address format.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Error: Administrator password must be at least 8 characters long.");
  process.exit(1);
}

async function provision() {
  console.log(`[S-ARC Provisioning] Generating secure admin credentials for: ${cleanEmail}`);
  const salt = await bcrypt.genSalt(11);
  const passwordHash = await bcrypt.hash(password, salt);
  const id = `usr-admin-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const permissions = JSON.stringify([
    "all",
    "manage_users",
    "manage_finances",
    "system_settings",
    "audit_logs",
    "approve_architects",
    "moderate_listings",
  ]);

  const sql = `
-- Cloudflare D1 Administrator Provisioning Statement
INSERT INTO users (
  id, name, email, password_hash, role, sub_role, status, permissions, created_at, updated_at
) VALUES (
  '${id}',
  '${name.replace(/'/g, "''")}',
  '${cleanEmail}',
  '${passwordHash}',
  'admin',
  NULL,
  'active',
  '${permissions}',
  datetime('now'),
  datetime('now')
) ON CONFLICT(email) DO UPDATE SET
  role = 'admin',
  status = 'active',
  password_hash = '${passwordHash}',
  permissions = '${permissions}',
  updated_at = datetime('now');

-- Administrative Audit Log
INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
VALUES (
  'aud-${Date.now()}',
  '${id}',
  '${name.replace(/'/g, "''")}',
  '${cleanEmail}',
  'admin',
  'ADMIN_PROVISIONED',
  '${id}',
  'user',
  '{"method": "trusted_cli_provisioning", "timestamp": "${now}"}'
);
`;

  console.log("\n=======================================================");
  console.log("       S-ARC ADMINISTRATOR PROVISIONING COMPLETED      ");
  console.log("=======================================================");
  console.log(`ID:          ${id}`);
  console.log(`Name:        ${name}`);
  console.log(`Email:       ${cleanEmail}`);
  console.log(`Role:        admin`);
  console.log(`Status:      active`);
  console.log(`Hash (cost 11): ${passwordHash.slice(0, 16)}...`);
  console.log("\nTo apply this directly to Cloudflare D1 via wrangler:");
  console.log(`npx wrangler d1 execute s-arc-db --command="INSERT INTO users ..."\n`);
  console.log("Generated SQL Query:");
  console.log(sql);
}

provision().catch((err) => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
