import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Users, Loader2, Search, Trash2, CheckCircle2, XCircle, Clock,
  ShieldCheck, ChevronDown, Filter, RefreshCw, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  createdAt: string;
}

const ROLE_LABELS: Record<string, { en: string; ar: string; color: string }> = {
  tourist:       { en: "Tourist",      ar: "سائح",         color: "bg-sky-50 text-sky-700 border-sky-200" },
  hotel_owner:   { en: "Hotel",        ar: "فندق",         color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  resort_owner:  { en: "Resort",       ar: "منتجع",        color: "bg-purple-50 text-purple-700 border-purple-200" },
  guide:         { en: "Guide",        ar: "مرشد",         color: "bg-amber-50 text-amber-700 border-amber-200" },
  rental_owner:  { en: "Rental",       ar: "تأجير",        color: "bg-teal-50 text-teal-700 border-teal-200" },
  admin:         { en: "Admin",        ar: "مدير",         color: "bg-rose-50 text-rose-700 border-rose-200" },
};

const PROVIDER_ROLES = ["hotel_owner", "resort_owner", "guide", "rental_owner"];

export default function AdminUsers() {
  const { isRTL } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterApproval, setFilterApproval] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("pacta_token");
      const params = new URLSearchParams({ limit: "100" });
      if (filterRole !== "all") params.set("role", filterRole);
      if (filterApproval !== "all") params.set("approvalStatus", filterApproval);
      const res = await fetch(`${API_URL}/auth/users?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) setUsers(data.data || []);
    } catch {
      toast.error(isRTL ? "فشل تحميل المستخدمين" : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterApproval]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const authHeader = () => {
    const token = localStorage.getItem("pacta_token");
    return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  };

  const toggleActive = async (user: User) => {
    setActionLoading(user._id + "_toggle");
    try {
      const res = await fetch(`${API_URL}/auth/users/${user._id}/toggle`, {
        method: "PATCH",
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: data.data.isActive } : u));
        toast.success(isRTL ? "تم تحديث الحالة" : "Status updated");
      } else toast.error(data.message);
    } catch { toast.error("Error"); }
    finally { setActionLoading(null); }
  };

  const handleApproval = async (user: User, status: ApprovalStatus) => {
    setActionLoading(user._id + "_approval");
    try {
      const res = await fetch(`${API_URL}/auth/users/${user._id}/approval`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ approvalStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, approvalStatus: status } : u));
        toast.success(
          status === "approved"
            ? (isRTL ? "تمت الموافقة" : "Provider approved")
            : (isRTL ? "تم الرفض" : "Provider rejected")
        );
      } else toast.error(data.message);
    } catch { toast.error("Error"); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (user: User) => {
    setActionLoading(user._id + "_delete");
    setConfirmDelete(null);
    try {
      const res = await fetch(`${API_URL}/auth/users/${user._id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        toast.success(isRTL ? "تم حذف المستخدم" : "User deleted");
      } else toast.error(data.message);
    } catch { toast.error("Error"); }
    finally { setActionLoading(null); }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (!q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    );
  });

  const pendingCount = users.filter((u) => PROVIDER_ROLES.includes(u.role) && u.approvalStatus === "pending").length;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-gradient-to-br from-pacta-navy to-pacta-teal text-white rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-pacta-navy">{isRTL ? "إدارة المستخدمين" : "User Management"}</h1>
            <p className="text-gray-400 text-sm">{filtered.length} {isRTL ? "مستخدم" : "users"}</p>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold">
            <Clock size={14} />
            {pendingCount} {isRTL ? "طلب موافقة معلق" : "pending approval"}
          </div>
        )}
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-pacta-sand/50 text-pacta-navy rounded-2xl text-sm font-semibold hover:bg-pacta-sand transition-colors"
        >
          <RefreshCw size={14} />
          {isRTL ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-pacta-sand p-5 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRTL ? "right-4" : "left-4"}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث..." : "Search users..."}
            className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-2.5 bg-pacta-sand/40 border border-pacta-sand rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy placeholder:text-gray-300`}
          />
        </div>
        <div className="relative">
          <Filter size={13} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? "right-4" : "left-4"} pointer-events-none`} />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`${isRTL ? "pr-10 pl-8" : "pl-10 pr-8"} py-2.5 bg-pacta-sand/40 border border-pacta-sand rounded-xl text-sm font-semibold focus:outline-none text-pacta-navy appearance-none cursor-pointer`}
          >
            <option value="all">{isRTL ? "كل الأدوار" : "All Roles"}</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{isRTL ? v.ar : v.en}</option>
            ))}
          </select>
          <ChevronDown size={13} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? "left-3" : "right-3"} pointer-events-none`} />
        </div>
        <div className="relative">
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className={`px-4 py-2.5 bg-pacta-sand/40 border border-pacta-sand rounded-xl text-sm font-semibold focus:outline-none text-pacta-navy appearance-none cursor-pointer pr-8`}
          >
            <option value="all">{isRTL ? "كل الحالات" : "All Status"}</option>
            <option value="pending">{isRTL ? "معلق" : "Pending"}</option>
            <option value="approved">{isRTL ? "موافق عليه" : "Approved"}</option>
            <option value="rejected">{isRTL ? "مرفوض" : "Rejected"}</option>
          </select>
          <ChevronDown size={13} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? "left-3" : "right-3"} pointer-events-none`} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-pacta-sand overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-pacta-navy" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pacta-sand/30 text-gray-400 uppercase text-[10px] font-bold tracking-[0.12em]">
                <tr>
                  <th className="p-4 text-start">{isRTL ? "المستخدم" : "User"}</th>
                  <th className="p-4 text-start">{isRTL ? "البريد" : "Email"}</th>
                  <th className="p-4 text-start">{isRTL ? "الدور" : "Role"}</th>
                  <th className="p-4 text-start">{isRTL ? "الموافقة" : "Approval"}</th>
                  <th className="p-4 text-start">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="p-4 text-start">{isRTL ? "تاريخ التسجيل" : "Joined"}</th>
                  <th className="p-4 text-start">{isRTL ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pacta-sand/40">
                {filtered.map((user) => {
                  const isProvider = PROVIDER_ROLES.includes(user.role);
                  const isLoading = (k: string) => actionLoading === user._id + k;
                  return (
                    <tr key={user._id} className="hover:bg-pacta-sand/10 transition-colors">
                      {/* User */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pacta-navy to-pacta-teal text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {user.avatar
                              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                              : user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-pacta-navy text-xs whitespace-nowrap">{user.name}</span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="p-4 text-gray-500 text-xs">{user.email}</td>
                      {/* Role */}
                      <td className="p-4">
                        {ROLE_LABELS[user.role] && (
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase ${ROLE_LABELS[user.role].color}`}>
                            {isRTL ? ROLE_LABELS[user.role].ar : ROLE_LABELS[user.role].en}
                          </span>
                        )}
                      </td>
                      {/* Approval */}
                      <td className="p-4">
                        {isProvider ? (
                          <span className={`flex items-center gap-1 w-fit px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                            user.approvalStatus === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            user.approvalStatus === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {user.approvalStatus === "approved" ? <CheckCircle2 size={10} /> : user.approvalStatus === "rejected" ? <XCircle size={10} /> : <Clock size={10} />}
                            {isRTL
                              ? user.approvalStatus === "approved" ? "موافق" : user.approvalStatus === "rejected" ? "مرفوض" : "معلق"
                              : user.approvalStatus === "approved" ? "Approved" : user.approvalStatus === "rejected" ? "Rejected" : "Pending"}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[10px]">—</span>
                        )}
                      </td>
                      {/* Active */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {user.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "معطل" : "Inactive")}
                        </span>
                      </td>
                      {/* Joined */}
                      <td className="p-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {/* Approve/Reject for providers */}
                          {isProvider && user.approvalStatus !== "approved" && (
                            <button
                              onClick={() => handleApproval(user, "approved")}
                              disabled={!!actionLoading}
                              title={isRTL ? "موافقة" : "Approve"}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                            >
                              {isLoading("_approval") ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            </button>
                          )}
                          {isProvider && user.approvalStatus !== "rejected" && (
                            <button
                              onClick={() => handleApproval(user, "rejected")}
                              disabled={!!actionLoading}
                              title={isRTL ? "رفض" : "Reject"}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
                            >
                              {isLoading("_approval") ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                            </button>
                          )}
                          {/* Toggle active */}
                          <button
                            onClick={() => toggleActive(user)}
                            disabled={!!actionLoading}
                            title={user.isActive ? (isRTL ? "تعطيل" : "Deactivate") : (isRTL ? "تفعيل" : "Activate")}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${user.isActive ? "text-gray-500 hover:bg-gray-100" : "text-pacta-teal hover:bg-teal-50"}`}
                          >
                            {isLoading("_toggle") ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setConfirmDelete(user)}
                            disabled={!!actionLoading}
                            title={isRTL ? "حذف" : "Delete"}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            {isLoading("_delete") ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-16 text-center">
            <p className="text-gray-400 font-bold">{isRTL ? "لا يوجد مستخدمون" : "No users found"}</p>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-pacta-navy">
                {isRTL ? "تأكيد الحذف" : "Confirm Delete"}
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              {isRTL
                ? `هل أنت متأكد أنك تريد حذف "${confirmDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-pacta-sand text-pacta-navy font-semibold text-sm hover:bg-pacta-sand/30 transition-colors"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={() => deleteUser(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                {isRTL ? "حذف" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
