"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ArchitecturalProject, ClientInquiry, StudioProfile } from "./types";
import { FEATURED_PROJECTS } from "./data";

const STORAGE_KEY_PROJECTS = "sarc_custom_projects_v1";
const STORAGE_KEY_PROFILE = "sarc_studio_profile_v1";
const STORAGE_KEY_INQUIRIES = "sarc_client_inquiries_v1";

const DEFAULT_PROFILE: StudioProfile = {
  name: "Ar. Nikhil Rajan",
  studio: "Studio Vayu",
  coaNumber: "CA/2016/78291",
  location: "Kochi, Kerala",
  verified: true,
  bio: "Pioneering climate-responsive tropical minimalism across South India. Specializing in central courtyards, exposed laterite masonry, and cantilevered green villas.",
  email: "nikhil@studiovayu.arch",
  phone: "+91 98471 28910",
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  specialization: "Tropical Minimalism, Nalukettu Courtyard Restorations & Low-Carbon Villas",
  awards: [
    "IIA Kerala Design Excellence Award (2024)",
    "Architectural Digest South Gold Medal (2022)",
    "South Asia Sustainable Habitat Fellowship (2020)"
  ]
};

const DEFAULT_INQUIRIES: ClientInquiry[] = [
  {
    id: "inq-001",
    clientName: "Adv. K. Ramesh & Sunitha",
    clientEmail: "ramesh.legal@gmail.com",
    clientPhone: "+91 94470 55122",
    projectName: "The Ridge House",
    projectId: "ridge-house",
    plotLocation: "Wayanad, Kerala (Sloping Terrain)",
    plotDimensions: "55ft x 92ft (11.5 Cents)",
    budgetRange: "₹85L - ₹1.1 Cr",
    message: "We love the cantilevered deck and central water court of The Ridge House. Our plot has an 8-degree slope facing North-East. Can this plan be adapted with minimal retaining wall work?",
    date: "Today, 10:45 AM",
    status: "new"
  },
  {
    id: "inq-002",
    clientName: "Dr. Ananya Menon",
    clientEmail: "ananya.menon.cardio@amrita.edu",
    clientPhone: "+91 98950 14890",
    projectName: "Kerala Courtyard",
    projectId: "kerala-courtyard",
    plotLocation: "Thrissur town (East-Facing)",
    plotDimensions: "62ft x 98ft (14 Cents)",
    budgetRange: "₹1.2 Cr - ₹1.5 Cr",
    message: "Interested in the complete 42-sheet CAD + Structural BOQ package. We want to verify if the puja room placement matches strict Padavinyasa Vastu for East orientation.",
    date: "Yesterday",
    status: "responded",
    replyText: "Dr. Menon, thank you! The Kerala Courtyard is 100% compliant with Padavinyasa Vastu grid principles. I've sent the orientation diagram to your email.",
    respondedAt: "Yesterday, 4:20 PM"
  },
  {
    id: "inq-003",
    clientName: "Joseph & Mariam Kurian",
    clientEmail: "j.kurian@gulflogistics.ae",
    clientPhone: "+971 50 182 9941",
    projectName: "The Green Nest",
    projectId: "the-green-nest",
    plotLocation: "Kottayam, Kerala",
    plotDimensions: "50ft x 85ft (9.8 Cents)",
    budgetRange: "₹75L - ₹90L",
    message: "Planning our retirement home in Kottayam while currently based in Dubai. Does the license include 3 online revision sessions for plumbing and solar inverter sizing?",
    date: "Oct 29, 2026",
    status: "in_review"
  }
];

const INITIAL_ENRICHED_PROJECTS: ArchitecturalProject[] = FEATURED_PROJECTS.map((p, idx) => ({
  ...p,
  status: idx === 5 ? "draft" : "published",
  facing: (["East", "North", "North-East", "East", "North", "West"][idx] || "East") as any,
  vastuScore: [98, 100, 95, 96, 92, 94][idx] || 95,
  views: [4210, 3890, 2740, 2190, 1850, 980][idx] || 1500,
  inquiries: [18, 14, 9, 7, 5, 2][idx] || 4,
  sheetCount: [42, 48, 38, 44, 36, 40][idx] || 42,
  dwgAvailable: true,
  bimAvailable: true,
  boqAvailable: true,
  mepAvailable: true,
  updatedAt: "Oct 2026"
}));

interface ProjectsContextType {
  projects: ArchitecturalProject[];
  addProject: (project: Omit<ArchitecturalProject, "id"> & { id?: string }) => ArchitecturalProject;
  updateProject: (id: string, updated: Partial<ArchitecturalProject>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  togglePublishStatus: (id: string) => void;
  resetAllData: () => void;
  // Studio Profile
  profile: StudioProfile;
  updateProfile: (updated: Partial<StudioProfile>) => void;
  // Inquiries
  inquiries: ClientInquiry[];
  updateInquiryStatus: (id: string, status: ClientInquiry["status"]) => void;
  replyToInquiry: (id: string, replyText: string) => void;
  deleteInquiry: (id: string) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ArchitecturalProject[]>(INITIAL_ENRICHED_PROJECTS);
  const [profile, setProfile] = useState<StudioProfile>(DEFAULT_PROFILE);
  const [inquiries, setInquiries] = useState<ClientInquiry[]>(DEFAULT_INQUIRIES);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }

      const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }

      const storedInquiries = localStorage.getItem(STORAGE_KEY_INQUIRIES);
      if (storedInquiries) {
        setInquiries(JSON.parse(storedInquiries));
      }
    } catch (err) {
      console.error("Error reading localStorage", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save projects to localStorage whenever changed
  const saveProjects = (newProjects: ArchitecturalProject[]) => {
    setProjects(newProjects);
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(newProjects));
    } catch (e) {
      console.error("Error saving projects", e);
    }
  };

  // Save profile
  const updateProfile = (updated: Partial<StudioProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
      } catch (e) {
        console.error("Error saving profile", e);
      }
      return next;
    });
  };

  // Add project
  const addProject = (projectData: Omit<ArchitecturalProject, "id"> & { id?: string }) => {
    const slug = (projectData.name || "new-project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    const newId = projectData.id || `${slug}-${Date.now().toString().slice(-4)}`;
    
    const newProject: ArchitecturalProject = {
      ...projectData,
      id: newId,
      status: projectData.status || "published",
      views: 0,
      inquiries: 0,
      sheetCount: projectData.sheetCount || 42,
      dwgAvailable: projectData.dwgAvailable ?? true,
      bimAvailable: projectData.bimAvailable ?? true,
      boqAvailable: projectData.boqAvailable ?? true,
      mepAvailable: projectData.mepAvailable ?? true,
      updatedAt: "Just now",
      architect: {
        name: profile.name,
        studio: profile.studio,
        location: profile.location,
        verified: profile.verified,
        image: profile.image
      }
    };

    const updated = [newProject, ...projects];
    saveProjects(updated);
    return newProject;
  };

  // Update project
  const updateProject = (id: string, updatedData: Partial<ArchitecturalProject>) => {
    const updated = projects.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedData,
          updatedAt: "Just now"
        };
      }
      return item;
    });
    saveProjects(updated);
  };

  // Delete project
  const deleteProject = (id: string) => {
    const updated = projects.filter((item) => item.id !== id);
    saveProjects(updated);
  };

  // Duplicate project
  const duplicateProject = (id: string) => {
    const existing = projects.find((p) => p.id === id);
    if (!existing) return;

    const copyId = `${existing.id}-copy-${Date.now().toString().slice(-4)}`;
    const copyProject: ArchitecturalProject = {
      ...existing,
      id: copyId,
      name: `${existing.name} (Copy)`,
      status: "draft",
      views: 0,
      inquiries: 0,
      updatedAt: "Just now"
    };

    const updated = [copyProject, ...projects];
    saveProjects(updated);
  };

  // Toggle Publish / Draft
  const togglePublishStatus = (id: string) => {
    const updated = projects.map((p) => {
      if (p.id === id) {
        const nextStatus = p.status === "draft" ? "published" : "draft";
        return {
          ...p,
          status: (nextStatus as "published" | "draft"),
          updatedAt: "Just now"
        };
      }
      return p;
    });
    saveProjects(updated);
  };

  // Inquiries methods
  const updateInquiryStatus = (id: string, status: ClientInquiry["status"]) => {
    setInquiries((prev) => {
      const next = prev.map((inq) => (inq.id === id ? { ...inq, status } : inq));
      try {
        localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const replyToInquiry = (id: string, replyText: string) => {
    setInquiries((prev) => {
      const next = prev.map((inq) => {
        if (inq.id === id) {
          return {
            ...inq,
            status: "responded" as const,
            replyText,
            respondedAt: "Just now"
          };
        }
        return inq;
      });
      try {
        localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => {
      const next = prev.filter((inq) => inq.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Reset to default mock data
  const resetAllData = () => {
    saveProjects(INITIAL_ENRICHED_PROJECTS);
    setProfile(DEFAULT_PROFILE);
    setInquiries(DEFAULT_INQUIRIES);
    try {
      localStorage.removeItem(STORAGE_KEY_PROJECTS);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_INQUIRIES);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        duplicateProject,
        togglePublishStatus,
        resetAllData,
        profile,
        updateProfile,
        inquiries,
        updateInquiryStatus,
        replyToInquiry,
        deleteInquiry
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}

