"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { UserAccount, UserRole } from "@/lib/types";
import { 
  Crown, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Sliders, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  Key, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Percent,
  Search
} from "lucide-react";

export default function SuperAdminView() {
  const { 
    users, 
    settings, 
    updateSettings, 
    auditLogs, 
    updateUserRole, 
    updateUserStatus, 
    createUser, 
    deleteUser 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"admins" | "finances" | "users" | "audit">("admins");

  // Create Admin Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminLocation, setNewAdminLocation] = useState("Kochi, Kerala");

  // Commission State
  const [commissionRate, setCommissionRate] = useState(settings.platformCommissionPercent);
  const [escrowDays, setEscrowDays] = useState(settings.payoutEscrowHoldDays);
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // User search filter
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  const adminsList = users.filter((u) => u.role === "admin" || u.role === "super_admin");

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveSettings = () => {
    updateSettings({
      platformCommissionPercent: commissionRate,
      payoutEscrowHoldDays: escrowDays,
      maintenanceMode: maintenance
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;

    createUser({
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      role: "admin",
      status: "active",
      location: newAdminLocation,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      permissions: ["verify_architects", "moderate_listings", "manage_users"]
    });

    setNewAdminName("");
    setNewAdminEmail("");
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Tier 1 Super Admin Header & Global Numbers */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/40 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-charcoal flex items-center justify-center font-bold shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">
                  Super Admin Root Authority
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-900 border border-amber-400/30 text-xs font-mono font-bold uppercase">
                  Tier 1 System Access
                </span>
              </div>
              <p className="text-xs text-secondaryText font-sans mt-0.5">
                Global governance over platform finances, administrative staff, security audit logs, and system configuration.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-charcoal hover:bg-charcoal/90 text-white text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Appoint New Admin</span>
          </button>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white/90 backdrop-blur-sm border border-warm-border rounded-2xl">
            <span className="text-[11px] text-secondaryText font-sans block mb-1">
              Platform Gross Volume (GMV)
            </span>
            <div className="text-xl sm:text-2xl font-serif text-charcoal font-medium">
              ₹54,20,000
            </div>
            <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +18.4% this quarter
            </span>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-sm border border-warm-border rounded-2xl">
            <span className="text-[11px] text-secondaryText font-sans block mb-1">
              S-ARC Platform Commission ({settings.platformCommissionPercent}%)
            </span>
            <div className="text-xl sm:text-2xl font-serif text-copper font-medium">
              ₹5,42,000
            </div>
            <span className="text-[10px] text-secondaryText font-mono mt-1 block">
              Escrow automated payout
            </span>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-sm border border-warm-border rounded-2xl">
            <span className="text-[11px] text-secondaryText font-sans block mb-1">
              Administrative Officers
            </span>
            <div className="text-xl sm:text-2xl font-serif text-charcoal font-medium">
              {adminsList.length} Active
            </div>
            <span className="text-[10px] text-secondaryText font-mono mt-1 block">
              Tier 1 & Tier 2 credentials
            </span>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-sm border border-warm-border rounded-2xl">
            <span className="text-[11px] text-secondaryText font-sans block mb-1">
              Total Registered User Accounts
            </span>
            <div className="text-xl sm:text-2xl font-serif text-charcoal font-medium">
              {users.length} Users
            </div>
            <span className="text-[10px] text-emerald-700 font-mono mt-1 block">
              {users.filter((u) => u.status === "active").length} Active • {users.filter((u) => u.status === "pending_verification").length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-warm-border overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab("admins")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "admins"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>Admin Team & Privileges ({adminsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("finances")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "finances"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Sliders className="w-4 h-4 text-copper" />
          <span>Platform Settings & Escrow Policy</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "users"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Users className="w-4 h-4 text-sky-500" />
          <span>All Users & Account Controls ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "audit"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Clock className="w-4 h-4 text-secondaryText" />
          <span>Security & Operational Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: ADMIN MANAGEMENT */}
      {activeTab === "admins" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-lg font-serif text-charcoal">Appointed Platform Administrators</h3>
              <p className="text-xs text-secondaryText font-sans">
                Admins have permission to approve COA licenses, moderate blueprint submissions, and resolve client disputes.
              </p>
            </div>
          </div>

          <div className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-warm-grey/60 border-b border-warm-border text-secondaryText font-medium">
                  <tr>
                    <th className="py-3.5 px-5">Administrator</th>
                    <th className="py-3.5 px-4">Role Tier</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Active Permissions</th>
                    <th className="py-3.5 px-5 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border/60">
                  {adminsList.map((adm) => (
                    <tr key={adm.id} className="hover:bg-warm-grey/20 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-warm-border bg-charcoal shrink-0">
                            <Image src={adm.avatar} alt={adm.name} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="font-serif text-sm font-medium text-charcoal">
                              {adm.name}
                            </div>
                            <div className="text-[11px] text-secondaryText">{adm.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          adm.role === "super_admin"
                            ? "bg-amber-400 text-charcoal font-bold"
                            : "bg-sky-50 text-sky-800 border border-sky-200"
                        }`}>
                          {adm.role === "super_admin" ? "Super Admin (Tier 1)" : "Admin (Tier 2)"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-secondaryText">
                        <div>{adm.email}</div>
                        <div className="text-[11px] text-secondaryText/70">{adm.phone || "No phone"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {adm.role === "super_admin" ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono">
                              Full Root Access
                            </span>
                          ) : (
                            adm.permissions?.map((p) => (
                              <span key={p} className="px-2 py-0.5 rounded bg-warm-grey text-charcoal text-[10px] font-mono">
                                {p.replace("_", " ")}
                              </span>
                            )) || <span className="text-secondaryText">Standard Moderation</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        {adm.role !== "super_admin" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateUserRole(adm.id, "super_admin")}
                              className="px-2.5 py-1 rounded-lg border border-warm-border text-[11px] text-secondaryText hover:text-amber-700 hover:border-amber-400 transition-colors"
                              title="Promote to Super Admin"
                            >
                              Promote to Tier 1
                            </button>
                            <button
                              onClick={() => updateUserRole(adm.id, "user")}
                              className="px-2.5 py-1 rounded-lg border border-warm-border text-[11px] text-red-600 hover:bg-red-50 transition-colors"
                              title="Revoke Admin Access"
                            >
                              Demote to User
                            </button>
                          </div>
                        )}
                        {adm.role === "super_admin" && (
                          <span className="text-[11px] text-secondaryText italic">Primary Root</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLATFORM SETTINGS & ESCROW */}
      {activeTab === "finances" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-5">
            <h3 className="text-base font-serif text-charcoal flex items-center gap-2">
              <Percent className="w-4 h-4 text-copper" />
              <span>Marketplace Commission & Fee Policy</span>
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs font-sans mb-2">
                <span className="text-charcoal font-medium">S-ARC Platform Cut on CAD Licensing</span>
                <span className="font-mono text-copper text-sm font-semibold">{commissionRate}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                step={0.5}
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                className="w-full accent-copper cursor-pointer"
              />
              <p className="text-[11px] text-secondaryText mt-1.5 font-sans">
                Automatically deducted when escrow releases the drawing package to the homeowner.
              </p>
            </div>

            <div className="pt-4 border-t border-warm-border/60">
              <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                Escrow Payout Holding Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={escrowDays}
                onChange={(e) => setEscrowDays(parseInt(e.target.value) || 7)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal font-mono"
              />
              <p className="text-[11px] text-secondaryText mt-1 font-sans">
                Days funds are held in escrow before architect withdrawal, allowing structural file download and buyer verification.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-serif text-charcoal flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>System Health & Safety Controls</span>
              </h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-warm-border hover:bg-warm-grey/30 cursor-pointer transition-colors">
                  <div>
                    <div className="text-xs font-medium text-charcoal font-sans">Platform Maintenance Mode</div>
                    <div className="text-[11px] text-secondaryText">Temporarily disable CAD downloads and checkout during updates.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={(e) => setMaintenance(e.target.checked)}
                    className="accent-copper w-4 h-4 rounded"
                  />
                </label>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans leading-relaxed">
                  <strong>Notice</strong>: Changes made by Super Admin are timestamped and permanently logged in the encrypted audit trail.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-warm-border">
              {settingsSuccess ? (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> Changes applied!
                </span>
              ) : <div />}

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-full bg-charcoal hover:bg-charcoal/90 text-white text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Update System Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL USERS DIRECTORY */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="p-4 bg-white border border-warm-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-warm-border text-xs text-charcoal bg-white focus:outline-none focus:border-copper"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admins</option>
              <option value="admin">Platform Admins</option>
              <option value="user">Users (Architects & Homeowners)</option>
            </select>
          </div>

          <div className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-warm-grey/60 border-b border-warm-border text-secondaryText font-medium">
                  <tr>
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-4">Role & Sub-Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-5 text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-warm-grey/20 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-warm-border bg-charcoal shrink-0">
                            <Image src={u.avatar} alt={u.name} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="font-serif text-sm font-medium text-charcoal">{u.name}</div>
                            <div className="text-[11px] text-secondaryText">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-charcoal capitalize">
                          {u.role.replace("_", " ")}
                        </span>
                        {u.subRole && (
                          <span className="text-[11px] text-secondaryText block">
                            Sub-type: {u.subRole}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          u.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : u.status === "pending_verification"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {u.status === "active" ? "Active" : u.status === "pending_verification" ? "Pending Verify" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-secondaryText font-mono text-[11px]">
                        {u.joinedDate}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {u.role !== "super_admin" && (
                          <div className="flex items-center justify-end gap-2">
                            {u.status === "active" ? (
                              <button
                                onClick={() => updateUserStatus(u.id, "suspended")}
                                className="px-2.5 py-1 rounded-lg border border-warm-border text-[11px] text-amber-700 hover:bg-amber-50"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(u.id, "active")}
                                className="px-2.5 py-1 rounded-lg border border-warm-border text-[11px] text-emerald-700 hover:bg-emerald-50"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 rounded-lg text-secondaryText hover:text-red-600 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {u.role === "super_admin" && (
                          <span className="text-[11px] text-secondaryText italic">Root protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-lg font-serif text-charcoal">Platform Security & Audit Trail</h3>
              <p className="text-xs text-secondaryText font-sans">
                Every administrative authorization, role upgrade, and compliance change is recorded with immutable timestamps.
              </p>
            </div>
          </div>

          <div className="bg-white border border-warm-border rounded-3xl p-6 shadow-sm space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-warm-grey/30 border border-warm-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    log.actorRole === "super_admin"
                      ? "bg-amber-400 text-charcoal"
                      : "bg-sky-400 text-charcoal"
                  }`}>
                    {log.actorRole === "super_admin" ? "S1" : "A2"}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-charcoal font-sans">
                      {log.action}
                    </div>
                    <div className="text-[11px] text-secondaryText">
                      By <strong className="text-charcoal">{log.actorName}</strong> • Target: {log.target}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-secondaryText shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Admin Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <form
            onSubmit={handleCreateAdmin}
            className="w-full max-w-md bg-white border border-warm-border rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-charcoal flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-charcoal">Appoint Platform Admin (Tier 2)</h3>
                <p className="text-xs text-secondaryText font-sans">Grant moderation and verification credentials.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1 font-sans">Full Name</label>
              <input
                type="text"
                required
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="e.g. John Mathew"
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1 font-sans">Admin Email</label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="name.admin@s-arc.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1 font-sans">Office / City</label>
              <input
                type="text"
                value={newAdminLocation}
                onChange={(e) => setNewAdminLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-border">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-full border border-warm-border text-xs text-secondaryText"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-charcoal text-white text-xs font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Confirm Appointment</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
