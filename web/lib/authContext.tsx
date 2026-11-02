"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAccount, UserRole, UserSubRole, PlatformSettings, AuditLog } from "./types";

const STORAGE_KEY_AUTH_USER = "sarc_auth_current_user_v1";
const STORAGE_KEY_AUTH_USERS = "sarc_auth_all_users_v1";
const STORAGE_KEY_SETTINGS = "sarc_platform_settings_v1";
const STORAGE_KEY_AUDIT_LOGS = "sarc_audit_logs_v1";
const STORAGE_KEY_IS_LOGGED_IN = "sarc_is_logged_in_v1";

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr-super-01",
    name: "Super Admin",
    email: "superadmin@admin.com",
    role: "super_admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98400 99999",
    location: "Bengaluru, Karnataka",
    joinedDate: "Jan 2025",
    permissions: ["all", "manage_admins", "manage_finances", "system_settings", "audit_logs"]
  },
  {
    id: "usr-admin-01",
    name: "Sarah Thomas",
    email: "sarah.admin@s-arc.in",
    role: "admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94471 22334",
    location: "Kochi, Kerala",
    joinedDate: "Mar 2025",
    permissions: ["verify_architects", "moderate_listings", "manage_users", "view_reports"]
  },
  {
    id: "usr-admin-02",
    name: "Rajesh Nair",
    email: "rajesh.moderator@s-arc.in",
    role: "admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98950 44556",
    location: "Trivandrum, Kerala",
    joinedDate: "Apr 2025",
    permissions: ["moderate_listings", "manage_users"]
  },
  {
    id: "usr-admin-pending-01",
    name: "Jayashankar Menon",
    email: "jayashankar.nominee@s-arc.in",
    role: "admin",
    status: "pending_verification",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94475 88990",
    location: "Calicut, Kerala",
    joinedDate: "Today",
    permissions: ["moderate_listings", "manage_users"],
    reviewNotes: "Nominated Regional Admin for Malabar operations. Awaiting Super Admin Tier 1 approval."
  },
  {
    id: "usr-arch-01",
    name: "Ar. Nikhil Rajan",
    email: "nikhil@studiovayu.arch",
    role: "user",
    subRole: "architect",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98471 28910",
    location: "Kochi, Kerala",
    studioName: "Studio Vayu",
    coaNumber: "CA/2016/78291",
    joinedDate: "Feb 2025"
  },
  {
    id: "usr-arch-02",
    name: "Ar. Sneha Philip",
    email: "sneha.design@gmail.com",
    role: "user",
    subRole: "architect",
    status: "pending_verification",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94460 77889",
    location: "Calicut, Kerala",
    studioName: "Philip Habitat Design",
    coaNumber: "CA/2023/94102",
    joinedDate: "Yesterday",
    reviewNotes: "COA license CA/2023/94102 audited against COA India registry. Recommended by Admin Sarah Thomas."
  },
  {
    id: "usr-client-01",
    name: "Adv. K. Ramesh",
    email: "ramesh.client@gmail.com",
    role: "user",
    subRole: "homeowner",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94470 55122",
    location: "Wayanad, Kerala",
    joinedDate: "Jun 2025"
  },
  {
    id: "usr-contractor-01",
    name: "Manoj Builders",
    email: "manoj.turnkey@keralabuild.in",
    role: "user",
    subRole: "contractor",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98460 11223",
    location: "Thrissur, Kerala",
    joinedDate: "Jul 2025"
  }
];

const DEFAULT_SETTINGS: PlatformSettings = {
  platformCommissionPercent: 10,
  autoApproveVerifiedArchitects: false,
  maintenanceMode: false,
  minListingPrice: 25000,
  payoutEscrowHoldDays: 7
};

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-001",
    actorName: "Sarah Thomas",
    actorRole: "admin",
    action: "Approved Architect COA Verification",
    target: "Studio Vayu (CA/2016/78291)",
    timestamp: "Today, 09:30 AM"
  },
  {
    id: "log-002",
    actorName: "Vikram Sarabhai",
    actorRole: "super_admin",
    action: "Updated Platform Commission",
    target: "Set marketplace commission fee to 10%",
    timestamp: "Yesterday, 04:15 PM"
  },
  {
    id: "log-003",
    actorName: "Rajesh Nair",
    actorRole: "admin",
    action: "Approved Blueprint Package",
    target: "The Ridge House (42 sheets validated)",
    timestamp: "Oct 29, 2026"
  }
];

interface AuthContextType {
  currentUser: UserAccount | null;
  isLoggedIn: boolean;
  users: UserAccount[];
  role: UserRole | null;
  login: (user: UserAccount) => void;
  logout: () => void;
  switchRole: (role: UserRole, subRole?: UserSubRole) => void;
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateUserStatus: (userId: string, newStatus: UserAccount["status"], notes?: string) => void;
  forwardForApproval: (userId: string, notes: string) => void;
  createUser: (userData: Omit<UserAccount, "id" | "joinedDate">) => void;
  deleteUser: (userId: string) => void;
  applyForArchitectUpgrade: (data: {
    practiceType: "freelance" | "agency";
    studioName: string;
    coaNumber: string;
    location?: string;
    phone?: string;
    portfolioUrl?: string;
    bio?: string;
  }) => Promise<void>;
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  auditLogs: AuditLog[];
  logAction: (action: string, target: string) => void;
  resetAuthData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Visitors start as guests (not logged in) until explicitly signing into an account
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [users, setUsers] = useState<UserAccount[]>(DEFAULT_USERS);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEFAULT_AUDIT_LOGS);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedLoggedIn = localStorage.getItem(STORAGE_KEY_IS_LOGGED_IN) === "true";
      const storedUsers = localStorage.getItem(STORAGE_KEY_AUTH_USERS);
      let activeUsers = DEFAULT_USERS;

      if (storedUsers) {
        let parsed = JSON.parse(storedUsers);
        // Seamlessly migrate legacy superadmin email to superadmin@admin.com
        let mutated = false;
        parsed = parsed.map((u: UserAccount) => {
          if (u.role === "super_admin" && u.email !== "superadmin@admin.com") {
            mutated = true;
            return {
              ...u,
              name: u.name === "Vikram Sarabhai" ? "Super Admin" : u.name,
              email: "superadmin@admin.com"
            };
          }
          return u;
        });
        if (mutated) {
          localStorage.setItem(STORAGE_KEY_AUTH_USERS, JSON.stringify(parsed));
        }
        activeUsers = parsed;
        setUsers(parsed);
      }

      if (storedLoggedIn) {
        const storedCur = localStorage.getItem(STORAGE_KEY_AUTH_USER);
        if (storedCur) {
          let parsedCur = JSON.parse(storedCur);
          if (parsedCur.role === "super_admin" && parsedCur.email !== "superadmin@admin.com") {
            parsedCur = { ...parsedCur, email: "superadmin@admin.com", name: "Super Admin" };
            localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(parsedCur));
          }
          const found = activeUsers.find((u: UserAccount) => u.id === parsedCur.id);
          if (found) {
            setCurrentUser(found);
            setIsLoggedIn(true);
          } else {
            setCurrentUser(parsedCur);
            setIsLoggedIn(true);
          }
        }
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }

      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      const storedLogs = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      if (storedLogs) setAuditLogs(JSON.parse(storedLogs));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_USERS, JSON.stringify(newUsers));
    } catch (e) {
      console.error(e);
    }
  };

  const login = (account: UserAccount) => {
    setCurrentUser(account);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(account));
      localStorage.setItem(STORAGE_KEY_IS_LOGGED_IN, "true");
    } catch (e) {
      console.error(e);
    }
    logAction("User Signed In", `${account.name} (${account.email})`);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      localStorage.removeItem(STORAGE_KEY_IS_LOGGED_IN);
    } catch (e) {
      console.error(e);
    }
  };

  const saveCurrentUser = (user: UserAccount) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_IS_LOGGED_IN, "true");
    } catch (e) {
      console.error(e);
    }
  };

  const logAction = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      actorName: currentUser ? currentUser.name : "System Operator",
      actorRole: currentUser ? currentUser.role : "super_admin",
      action,
      target,
      timestamp: "Just now"
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Switch role helper
  const switchRole = (newRole: UserRole, newSubRole?: UserSubRole) => {
    const match = users.find((u) => {
      if (newRole === "user") {
        return u.role === "user" && (newSubRole ? u.subRole === newSubRole : true);
      }
      return u.role === newRole;
    });

    if (match) {
      saveCurrentUser(match);
    } else {
      // Fallback
      const fallback: UserAccount = {
        id: `usr-${newRole}-${Date.now().toString().slice(-4)}`,
        name: newRole === "super_admin" ? "Super Admin" : newRole === "admin" ? "Platform Admin" : "Client User",
        email: newRole === "super_admin" ? "superadmin@admin.com" : `${newRole}@s-arc.in`,
        role: newRole,
        subRole: newSubRole || "homeowner",
        status: "active",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        joinedDate: "Just now"
      };
      saveCurrentUser(fallback);
    }
  };

  // Switch to specific user ID
  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      saveCurrentUser(found);
    }
  };

  // Super Admin: Update user role
  const updateUserRole = (userId: string, newRole: UserRole) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    saveUsers(updated);
    if (currentUser && currentUser.id === userId) {
      saveCurrentUser({ ...currentUser, role: newRole });
    }
    logAction(`Changed User Role to ${newRole.toUpperCase()}`, `User ID: ${userId}`);
  };

  // Only Super Admin can approve accounts (set status to active)
  const updateUserStatus = (userId: string, newStatus: UserAccount["status"], notes?: string) => {
    const targetUser = users.find((u) => u.id === userId);

    // Strict Enforcement: Only Super Admin can approve accounts
    if (newStatus === "active" && (!currentUser || currentUser.role !== "super_admin")) {
      alert("Permission Denied: Only Super Admin (Tier 1) has authority to approve and activate accounts.");
      return;
    }

    const updated = users.map((u) => (u.id === userId ? {
      ...u,
      status: newStatus,
      ...(notes ? { reviewNotes: notes } : {})
    } : u));
    saveUsers(updated);
    if (currentUser && currentUser.id === userId) {
      saveCurrentUser({ ...currentUser, status: newStatus });
    }
    logAction(
      newStatus === "active"
        ? `Super Admin Approved Account [${targetUser?.role === "admin" ? "Admin" : targetUser?.subRole || "User"}]`
        : `Updated status to ${newStatus}`,
      targetUser ? `${targetUser.name} (${targetUser.email})` : userId
    );
  };

  // Tier 2 Admins audit and forward recommendations to Super Admin for final approval
  const forwardForApproval = (userId: string, notes: string) => {
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? {
      ...u,
      reviewedByAdmin: true,
      reviewNotes: notes
    } : u));
    saveUsers(updated);
    logAction(
      "Admin Audited & Forwarded Recommendation to Super Admin",
      targetUser ? `${targetUser.name} (${targetUser.coaNumber || targetUser.email})` : userId
    );
  };

  // Create new user (e.g. Admin invites)
  const createUser = (userData: Omit<UserAccount, "id" | "joinedDate">) => {
    const newUser: UserAccount = {
      ...userData,
      id: `usr-${Date.now().toString().slice(-5)}`,
      joinedDate: "Just now"
    };
    const updated = [newUser, ...users];
    saveUsers(updated);
    logAction(`Created New Account [${userData.role.toUpperCase()}]`, `${userData.name} (${userData.email})`);
  };

  // Super Admin: Delete user
  const deleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.filter((u) => u.id !== userId);
    saveUsers(updated);
    logAction("Deleted User Account", targetUser ? `${targetUser.name} (${targetUser.email})` : userId);
  };

  // User: Apply for Freelance Architect or Agency Firm verification (directly to Super Admin)
  const applyForArchitectUpgrade = async (data: {
    practiceType: "freelance" | "agency";
    studioName: string;
    coaNumber: string;
    location?: string;
    phone?: string;
    portfolioUrl?: string;
    bio?: string;
  }) => {
    if (!currentUser) return;
    const cleanCoa = data.coaNumber.trim().toUpperCase();
    const reviewNote = `Submitted application for ${data.practiceType === "agency" ? "Architecture Firm / Agency" : "Freelance Architect"}. CoA: ${cleanCoa}. Studio: ${data.studioName}. Awaiting Super Admin Tier 1 approval.`;

    const updatedUser: UserAccount = {
      ...currentUser,
      subRole: "architect",
      status: "pending_verification",
      practiceType: data.practiceType,
      studioName: data.studioName,
      coaNumber: cleanCoa,
      location: data.location || currentUser.location,
      phone: data.phone || currentUser.phone,
      portfolioUrl: data.portfolioUrl,
      bio: data.bio || currentUser.bio,
      reviewNotes: reviewNote,
    };

    saveCurrentUser(updatedUser);
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    saveUsers(updatedUsers);

    try {
      await fetch("/api/users/upgrade-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error("Upgrade API call error:", e);
    }

    logAction(
      `Submitted Application for ${data.practiceType === "agency" ? "Architecture Firm" : "Freelance Architect"} Verification`,
      `Super Admin Queue • CoA: ${cleanCoa}`
    );
  };

  // Update platform settings
  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    const next = { ...settings, ...newSettings };
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    logAction("Updated Platform System Settings", JSON.stringify(newSettings));
  };

  // Reset to default state
  const resetAuthData = () => {
    saveUsers(DEFAULT_USERS);
    saveCurrentUser(DEFAULT_USERS[0]);
    setSettings(DEFAULT_SETTINGS);
    setAuditLogs(DEFAULT_AUDIT_LOGS);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      localStorage.removeItem(STORAGE_KEY_AUTH_USERS);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
      localStorage.removeItem(STORAGE_KEY_AUDIT_LOGS);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        users,
        role: currentUser ? currentUser.role : null,
        login,
        logout,
        switchRole,
        switchUser,
        updateUserRole,
        updateUserStatus,
        forwardForApproval,
        createUser,
        deleteUser,
        applyForArchitectUpgrade,
        settings,
        updateSettings,
        auditLogs,
        logAction,
        resetAuthData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

