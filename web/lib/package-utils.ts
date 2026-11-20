import { ProjectPackage } from "@/lib/types";

/**
 * Format raw D1 database row into frontend ProjectPackage
 */
export function formatPackageRow(p: any): ProjectPackage & { priceFormatted: string } {
  const pricePaise = Number(p.price_paise ?? p.pricePaise) || 0;
  const priceInRupees = pricePaise / 100;
  const priceFormatted = `₹${priceInRupees.toLocaleString("en-IN")}`;

  let deliverables: string[] = [];
  try {
    deliverables = typeof p.deliverables === "string" ? JSON.parse(p.deliverables || "[]") : (p.deliverables || []);
  } catch {
    deliverables = [];
  }

  return {
    id: p.id,
    projectId: p.project_id || p.projectId,
    architectId: p.architect_id || p.architectId,
    name: p.name,
    description: p.description || "",
    pricePaise,
    priceFormatted,
    currency: p.currency || "INR",
    deliverables,
    status: p.status || "draft",
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
  };
}
