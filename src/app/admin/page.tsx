"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, Pencil, Trash2, X, Check, AlertTriangle,
  Search, UserCog, Crown, User as UserIcon, Loader2,
} from "lucide-react";
import DashboardNav from "@/components/DashboardNav";

interface UserRow {
  id: number;
  display_name: string;
  role: "admin" | "user";
  created_at: string;
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  user,
  currentAdminId,
  onClose,
  onSave,
}: {
  user: UserRow;
  currentAdminId: number;
  onClose: () => void;
  onSave: (id: number, display_name: string, role: string) => Promise<string | null>;
}) {
  const [name, setName] = useState(user.display_name);
  const [role, setRole] = useState<"admin" | "user">(user.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setError("Display name cannot be empty."); return; }
    setSaving(true);
    const err = await onSave(user.id, name.trim(), role);
    setSaving(false);
    if (err) { setError(err); return; }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="relative w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#0d1117] shadow-2xl overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/20 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Edit Account</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">ID #{user.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#1f2937] text-[#6b7280] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Role</label>
              <div className="flex gap-3">
                {(["user", "admin"] as const).map((r) => {
                  const active = role === r;
                  const disabled = r === "user" && user.id === currentAdminId && user.role === "admin";
                  return (
                    <button
                      key={r}
                      disabled={disabled}
                      onClick={() => !disabled && setRole(r)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all
                        ${active
                          ? r === "admin"
                            ? "border-[#f97316]/50 bg-[#f97316]/10 text-[#f97316]"
                            : "border-[#38bdf8]/50 bg-[#38bdf8]/10 text-[#38bdf8]"
                          : "border-[#1f2937] bg-[#111827] text-[#6b7280] hover:border-[#374151]"
                        }
                        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {r === "admin" ? <Crown className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  );
                })}
              </div>
              {user.id === currentAdminId && (
                <p className="mt-1.5 text-[10px] text-[#6b7280]">You cannot demote your own account.</p>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[#ef4444] text-sm bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-4 py-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1f2937] text-sm text-[#9ca3af] hover:border-[#374151] hover:text-white transition-all">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#22c55e] text-black text-sm font-semibold hover:bg-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({
  user,
  onClose,
  onConfirm,
}: {
  user: UserRow;
  onClose: () => void;
  onConfirm: (id: number) => Promise<string | null>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    const err = await onConfirm(user.id);
    setDeleting(false);
    if (err) { setError(err); return; }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="relative w-full max-w-sm rounded-2xl border border-[#1f2937] bg-[#0d1117] shadow-2xl overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#ef4444]/0 via-[#ef4444] to-[#ef4444]/0" />
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">Delete Account</h2>
          <p className="text-sm text-[#9ca3af] mb-1">
            Are you sure you want to delete{" "}
            <span className="text-white font-medium">{user.display_name}</span>?
          </p>
          <p className="text-xs text-[#6b7280] mb-5">
            This action cannot be undone. All boards and data will also be deleted.
          </p>

          {error && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[#ef4444] text-sm bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-4 py-2 mb-4"
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1f2937] text-sm text-[#9ca3af] hover:border-[#374151] hover:text-white transition-all">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl bg-[#ef4444] text-white text-sm font-semibold hover:bg-[#dc2626] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  // Auth guard — admin only
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || data.role !== "admin") {
          router.replace("/dashboard");
        } else {
          setCurrentUserId(data.userId);
        }
      })
      .catch(() => router.replace("/dashboard"));
  }, [router]);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: UserRow[]) => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (currentUserId !== null) fetchUsers();
  }, [currentUserId]);

  const handleSave = async (id: number, display_name: string, role: string): Promise<string | null> => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name, role }),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Update failed.";
    fetchUsers();
    return null;
  };

  const handleDelete = async (id: number): Promise<string | null> => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Delete failed.";
    setUsers((prev) => prev.filter((u) => u.id !== id));
    return null;
  };

  const filtered = users.filter((u) =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalUsers  = users.filter((u) => u.role === "user").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <DashboardNav />

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#f97316]/15 border border-[#f97316]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#f97316]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-sm text-[#6b7280] ml-12">Manage user accounts, roles, and access.</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: "Total Accounts", value: users.length, icon: Users,    color: "#9ca3af" },
            { label: "Admins",         value: totalAdmins,  icon: Crown,    color: "#f97316" },
            { label: "Users",          value: totalUsers,   icon: UserIcon, color: "#38bdf8" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl border border-[#1f2937] bg-[#0d1117] p-4 flex items-center gap-3"
                style={{ borderColor: s.color + "22" }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.color + "15" }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[10px] text-[#6b7280]">{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Table card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1f2937] bg-[#0d1117] overflow-hidden"
        >
          {/* Search */}
          <div className="px-5 py-4 border-b border-[#1f2937] flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4b5563]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or role…"
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#4b5563]">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-sm">No accounts found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937]">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider w-12">ID</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider">Display Name</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider hidden sm:table-cell">Created</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {filtered.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`transition-colors ${user.id === currentUserId ? "bg-[#22c55e]/5" : "hover:bg-[#111827]"}`}
                    >
                      <td className="px-5 py-3.5 text-[#4b5563] font-mono text-xs">{user.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#f0f0f0] font-medium">{user.display_name}</span>
                          {user.id === currentUserId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22c55e]/15 text-[#22c55e] font-semibold">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f97316]/10 text-[#f97316] text-xs font-semibold border border-[#f97316]/20">
                            <Crown className="w-3 h-3" />Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] text-xs font-semibold border border-[#38bdf8]/20">
                            <UserIcon className="w-3 h-3" />User
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#6b7280] text-xs hidden sm:table-cell">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditTarget(user)}
                            className="p-1.5 rounded-lg border border-[#1f2937] bg-[#111827] text-[#6b7280] hover:border-[#22c55e]/40 hover:text-[#22c55e] hover:bg-[#22c55e]/10 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            disabled={user.id === currentUserId}
                            className="p-1.5 rounded-lg border border-[#1f2937] bg-[#111827] text-[#6b7280] hover:border-[#ef4444]/40 hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title={user.id === currentUserId ? "Cannot delete your own account" : "Delete"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {editTarget && currentUserId !== null && (
          <EditModal
            key="edit"
            user={editTarget}
            currentAdminId={currentUserId}
            onClose={() => setEditTarget(null)}
            onSave={handleSave}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            key="delete"
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
