"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAccount, UserRole, UserSubRole, PlatformSettings, AuditLog } from "./types";

const STORAGE_KEY_AUTH_USER = "sarc_auth_current_user_v1";
const STORAGE_KEY_AUTH_USERS = "sarc_auth_all_users_v1";
const STORAGE_KEY_SETTINGS = "sarc_platform_settings_v1";
const STORAGE_KEY_AUDIT_LOGS = "sarc_audit_logs_v1";

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr-super-01",
    name: "Vikram Sarabhai",
    email: "superadmin@s-arc.in",
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
    joinedDate: "Yesterday"
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
  currentUser: UserAccount;
  users: UserAccount[];
  role: UserRole;
  switchRole: (role: UserRole, subRole?: UserSubRole) => void;
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateUserStatus: (userId: string, newStatus: UserAccount["status"]) => void;
  createUser: (userData: Omit<UserAccount, "id" | "joinedDate">) => void;
  deleteUser: (userId: string) => void;
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  auditLogs: AuditLog[];
  logAction: (action: string, target: string) => void;
  resetAuthData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to Super Admin so the user immediately sees the full administrative controls
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEFAULT_USERS[0]);
  const [users, setUsers] = useState<UserAccount[]>(DEFAULT_USERS);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEFAULT_AUDIT_LOGS);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_AUTH_USERS);
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        setUsers(parsed);
        const storedCur = localStorage.getItem(STORAGE_KEY_AUTH_USER);
        if (storedCur) {
          const parsedCur = JSON.parse(storedCur);
          const found = parsed.find((u: UserAccount) => u.id === parsedCur.id);
          if (found) setCurrentUser(found);
        }
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

  const saveCurrentUser = (user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const logAction = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
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
        email: `${newRole}@s-arc.in`,
        role: newRole,
        subRole: newSubRole || "homeowner",
        status: "active",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
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
    if (currentUser.id === userId) {
      saveCurrentUser({ ...currentUser, role: newRole });
    }
    logAction(`Changed User Role to ${newRole.toUpperCase()}`, `User ID: ${userId}`);
  };

  // Admin / Super Admin: Update user status
  const updateUserStatus = (userId: string, newStatus: UserAccount["status"]) => {
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    saveUsers(updated);
    if (currentUser.id === userId) {
      saveCurrentUser({ ...currentUser, status: newStatus });
    }
    logAction(
      newStatus === "active" ? "Verified & Activated Account" : `Updated status to ${newStatus}`,
      targetUser ? `${targetUser.name} (${targetUser.email})` : userId
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
        users,
        role: currentUser.role,
        switchRole,
        switchUser,
        updateUserRole,
        updateUserStatus,
        createUser,
        deleteUser,
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
