export interface ArchitecturalProject {
  id: string;
  name: string;
  style: string;
  location: string;
  plotSize: string;
  cents: number;
  builtUpArea: string;
  bedrooms: number;
  floors: number;
  price: string;
  architect: {
    name: string;
    studio: string;
    location: string;
    verified: boolean;
    image: string;
  };
  image: string;
  gallery: string[];
  description: string;
  highlights: string[];
  dimensions: {
    plotWidth: string;
    plotLength: string;
    setbacks: string;
  };
  floorPlanImage?: string;
  featured?: boolean;
  status?: "published" | "draft";
  facing?: "North" | "South" | "East" | "West" | "North-East";
  vastuScore?: number;
  views?: number;
  inquiries?: number;
  sheetCount?: number;
  dwgAvailable?: boolean;
  bimAvailable?: boolean;
  boqAvailable?: boolean;
  mepAvailable?: boolean;
  updatedAt?: string;
}

export interface ClientInquiry {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectName: string;
  projectId: string;
  plotLocation: string;
  plotDimensions: string;
  budgetRange: string;
  message: string;
  date: string;
  status: "new" | "in_review" | "responded" | "completed";
  replyText?: string;
  respondedAt?: string;
}

export interface StudioProfile {
  name: string;
  studio: string;
  coaNumber: string;
  location: string;
  verified: boolean;
  bio: string;
  email: string;
  phone: string;
  image: string;
  coverImage: string;
  specialization: string;
  awards: string[];
}

export interface ArchitecturalStyle {
  id: string;
  name: string;
  tagline: string;
  image: string;
  projectCount: number;
}

export interface ArchitectProfile {
  id: string;
  name: string;
  location: string;
  title: string;
  projectsCount: number;
  verified: boolean;
  image: string;
  bio: string;
  specialty: string;
}

export type UserRole = "super_admin" | "admin" | "user";
export type UserSubRole = "homeowner" | "architect" | "contractor";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subRole?: UserSubRole;
  status: "active" | "suspended" | "pending_verification";
  avatar: string;
  phone?: string;
  location?: string;
  coaNumber?: string;
  studioName?: string;
  joinedDate: string;
  permissions?: string[];
  reviewNotes?: string;
  reviewedByAdmin?: boolean;
}

export interface PlatformSettings {
  platformCommissionPercent: number;
  autoApproveVerifiedArchitects: boolean;
  maintenanceMode: boolean;
  minListingPrice: number;
  payoutEscrowHoldDays: number;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  timestamp: string;
}

export interface JournalArticle {
  id: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  image: string;
  summary: string;
}

