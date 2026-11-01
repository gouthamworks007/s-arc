"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ArchitecturalProject } from "./types";
import { FEATURED_PROJECTS } from "./data";

interface SavedProjectsContextType {
  savedIds: string[];
  savedProjects: ArchitecturalProject[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAllSaved: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
}

const SavedProjectsContext = createContext<SavedProjectsContextType | undefined>(undefined);

export function SavedProjectsProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sarc_saved_designs");
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) {
          alert("You can shortlist up to 4 architectural designs to compare.");
          return prev;
        }
        updated = [...prev, id];
      }
      try {
        localStorage.setItem("sarc_saved_designs", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  const clearAllSaved = () => {
    setSavedIds([]);
    try {
      localStorage.removeItem("sarc_saved_designs");
    } catch (e) {
      console.error(e);
    }
  };

  const savedProjects = FEATURED_PROJECTS.filter((p) => savedIds.includes(p.id));

  return (
    <SavedProjectsContext.Provider
      value={{
        savedIds,
        savedProjects,
        toggleSave,
        isSaved,
        clearAllSaved,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}
    </SavedProjectsContext.Provider>
  );
}

export function useSavedProjects() {
  const context = useContext(SavedProjectsContext);
  if (!context) {
    throw new Error("useSavedProjects must be used within a SavedProjectsProvider");
  }
  return context;
}

