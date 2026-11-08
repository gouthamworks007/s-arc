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
  bathrooms?: number;
  builtUpAreaSqft?: number;
  buildingFootprintSqft?: number;
  minimumPlotAreaCent?: number;
  minimumFrontageFt?: number;
  minimumDepthFt?: number;
  requiredParking?: number;
  estimatedConstructionCost?: number;
  requiredAccessWidthFt?: number;
  applicableRegulations?: string;
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

export type UserRole = "admin" | "user";
export type UserSubRole = "homeowner" | "architect" | "contractor";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subRole?: UserSubRole;
  practiceType?: "freelance" | "agency";
  portfolioUrl?: string;
  status: "active" | "suspended" | "pending_verification";
  avatar: string;
  phone?: string;
  location?: string;
  coaNumber?: string;
  studioName?: string;
  bio?: string;
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

export type KeralaLandUnit = "cent" | "sqft" | "sqm" | "acre" | "hectare";

export interface BoundarySegment {
  index: number;
  label: string; // e.g. "Side A", "Side B"
  lengthMeters: number;
  lengthFeet: number;
  startPoint: [number, number]; // [lng, lat]
  endPoint: [number, number]; // [lng, lat]
  bearingDeg: number;
}

export interface PlotCornerPoint {
  index: number;
  label: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface PlotAnalysisData {
  geojson: GeoJSON.Feature<GeoJSON.Polygon>;
  areaSqMeters: number;
  areaSqFt: number;
  areaCents: number;
  areaAcres: number;
  areaHectares: number;
  perimeterMeters: number;
  perimeterFeet: number;
  segments: BoundarySegment[];
  corners: PlotCornerPoint[];
  roadFacingSegmentIndex: number;
  frontageFeet: number;
  depthFeet: number;
  aspectRatio: number; // frontage to depth ratio
  shapeCategory: "regular" | "irregular" | "narrow" | "corner";
  center: [number, number]; // [lng, lat]
  boundingBox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  locationName?: string;
  userInputs?: {
    roadAccessWidthFt?: number;
    preferredFloors?: number;
    preferredBedrooms?: number;
    preferredStyle?: string;
    parkingCount?: number;
  };
}

export interface CompatibilityCheckItem {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface PlanCompatibilityResult {
  project: ArchitecturalProject;
  category: "good" | "possible" | "not_suitable";
  score: number; // 0 to 100
  checklist: CompatibilityCheckItem[];
  areaRatio: number; // plot area / required plot area
  footprintFits: boolean;
  frontageFits: boolean;
  depthFits: boolean;
  requiredSetbacks: {
    frontFt: number;
    rearFt: number;
    sidesFt: number;
  };
  buildableEnvelope: {
    widthFt: number;
    lengthFt: number;
    areaSqFt: number;
  };
}

export interface SavedPlotRecord {
  id: string;
  user_id: string;
  name: string;
  geojson: string;
  area_cents: number;
  area_sqft: number;
  area_sqm: number;
  perimeter_m: number;
  perimeter_ft: number;
  frontage_ft?: number;
  depth_ft?: number;
  road_side_index: number;
  location_name?: string;
  center_lat?: number;
  center_lng?: number;
  metadata?: string;
  created_at?: string;
  updated_at?: string;
}


