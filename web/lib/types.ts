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

export interface JournalArticle {
  id: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  image: string;
  summary: string;
}

