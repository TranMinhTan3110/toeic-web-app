import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Search, Filter, ShieldAlert, UserCheck, UserX, Loader2, ChevronLeft, ChevronRight, Shield, PlusCircle, Edit3, Trash2, X, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { getAllUsersForAdmin, lockUser, unlockUser, createAdmin, editAdmin, deleteAdmin, assignRole } from "../../services/userService";
import Swal from "sweetalert2";

export default function AdminsPage() {
  const { profile } = useSelector((state) => state.auth);
  const currentUserRole = profile?.role || "admin";
  const currentUserId = profile?.uid || "";
  const isSuper = currentUserRole === "superadmin";

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const roleFilter = "admin"; // Strictly fetch admin/superadmin accounts

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 9; // 3x3 grid layout

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "admin",
  });

  // Trigger load when filters or page change
  useEffect(() => {
    fetchAdmins();
  }, [currentPage, statusFilter]);

  // Handle Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdmins();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAllUsersForAdmin(
        currentPage,
        pageSize,
        searchTerm,
        statusFilter,
        roleFilter
      );
      setAdmins(data.items || []);
      setTotalCount(data.totalCount || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError("Không thể tải danh sách tài khoản admin. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (u) => {
    const result = await Swal.fire({
      title: "Khóa tài khoản?",
      text: `Bạn có chắc chắn muốn khóa tài khoản của "${u.displayName || u.email}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Khóa",
      cancelButtonText: "Hủy",
      background: "var(--bg-secondary)",
      color: "var(--text)",
      confirmButtonColor: "var(--red)",
      cancelButtonColor: "var(--border-strong)",
    });

    if (!result.isConfirmed) return;

    try {
      await lockUser(u.uid);
      setAdmins((prev) =>
        prev.map((item) => (item.uid === u.uid ? { ...item, isLocked: true } : item))
      );
      Swal.fire({
        icon: "success",
        title: "Đã khóa!",
        text: "Tài khoản đã được khóa thành công.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
        timer: 1500,
      });
    } catch (err) {
      console.error("Lock error:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể khóa tài khoản.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });
    }
  };

  const handleUnlock = async (u) => {
    try {
      await unlockUser(u.uid);
      setAdmins((prev) =>
        prev.map((item) => (item.uid === u.uid ? { ...item, isLocked: false } : item))
      );
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Tài khoản đã được mở khóa.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
        timer: 1500,
      });
    } catch (err) {
      console.error("Unlock error:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể mở khóa tài khoản.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });
    }
  };

  const handleRoleChange = async (u, newRole) => {
    const isPromote = newRole === "superadmin";
    const title = isPromote ? "Thăng chức Super Admin?" : "Hạ chức Admin?";
    const text = isPromote
      ? `Bạn có chắc chắn muốn thăng chức "${u.displayName || u.email}" lên làm Super Admin?`
      : `Bạn có chắc chắn muốn hạ chức "${u.displayName || u.email}" xuống làm Admin?`;
    
    const result = await Swal.fire({
      title,
      text,
      icon: isPromote ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: isPromote ? "Thăng chức" : "Hạ chức",
      cancelButtonText: "Hủy",
      background: "var(--bg-secondary)",
      color: "var(--text)",
      confirmButtonColor: isPromote ? "var(--accent)" : "var(--orange)",
      cancelButtonColor: "var(--border-strong)",
    });

    if (!result.isConfirmed) return;

    try {
      await assignRole(u.uid, newRole);
      setAdmins((prev) =>
        prev.map((item) => (item.uid === u.uid ? { ...item, role: newRole } : item))
      );
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: `Đã thay đổi chức vụ thành công.`,
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
        timer: 1500,
      });
    } catch (err) {
      console.error("Role change error:", err);
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Không thể thay đổi chức vụ.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });
    }
  };

  const handleDelete = async (u) => {
    const result = await Swal.fire({
      title: "Xóa tài khoản?",
      text: `Hành động này không thể hoàn tác. Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản quản trị của "${u.displayName || u.email}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
      background: "var(--bg-secondary)",
      color: "var(--text)",
      confirmButtonColor: "var(--red)",
      cancelButtonColor: "var(--border-strong)",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteAdmin(u.uid);
      setAdmins((prev) => prev.filter((item) => item.uid !== u.uid));
      setTotalCount((prev) => prev - 1);
      Swal.fire({
        icon: "success",
        title: "Đã xóa!",
        text: "Tài khoản quản trị đã được gỡ bỏ khỏi hệ thống.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
        timer: 1500,
      });
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể xóa tài khoản quản trị này.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });
    }
  };

  const openModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        email: admin.email,
        password: "", // Keep empty, only change if specified
        displayName: admin.displayName || "",
        role: admin.role || "admin",
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        email: "",
        password: "",
        displayName: "",
        role: "admin",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAdmin) {
        // Edit flow
        const payload = {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
        };
        if (formData.password.trim().length > 0) {
          payload.password = formData.password.trim();
        }
        await editAdmin(editingAdmin.uid, payload);
        
        Swal.fire({
          icon: "success",
          title: "Hoàn tất!",
          text: `Đã cập nhật tài khoản "${formData.displayName}" thành công.`,
          background: "var(--bg-secondary)",
          color: "var(--text)",
          confirmButtonColor: "var(--accent)",
          timer: 2000,
        });
        
        setAdmins((prev) =>
          prev.map((u) =>
            u.uid === editingAdmin.uid
              ? { ...u, email: formData.email, displayName: formData.displayName, role: formData.role }
              : u
          )
        );
      } else {
        // Create flow
        if (formData.password.trim().length < 8) {
          Swal.fire({
            icon: "warning",
            title: "Mật khẩu yếu",
            text: "Mật khẩu phải dài ít nhất 8 ký tự.",
            background: "var(--bg-secondary)",
            color: "var(--text)",
            confirmButtonColor: "var(--accent)",
          });
          setSubmitting(false);
          return;
        }
        await createAdmin(formData);
        
        Swal.fire({
          icon: "success",
          title: "Hoàn tất!",
          text: `Đã tạo tài khoản admin "${formData.displayName}" thành công.`,
          background: "var(--bg-secondary)",
          color: "var(--text)",
          confirmButtonColor: "var(--accent)",
          timer: 2000,
        });
        
        fetchAdmins();
      }
      closeModal();
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.response?.data?.message || "Không thể thực hiện tác vụ.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 className="page-title">Quản lý Admin</h1>
            <p className="page-subtitle">
              Tìm thấy {totalCount} tài khoản quản trị hệ thống
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <PlusCircle size={15} />
            Thêm Admin mới
          </button>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="toolbar-search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
            }}
          />
          <input
            className="toolbar-search"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={14} style={{ color: "var(--text-secondary)" }} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="btn btn-secondary"
              style={{
                height: 36,
                padding: "0 24px 0 12px",
                outline: "none",
                cursor: "pointer",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            color: "var(--accent)",
            gap: 12,
          }}
        >
          <Loader2 className="animate-spin" size={32} />
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Đang truy xuất dữ liệu phân trang từ cache...
          </p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <ShieldAlert className="empty-icon" size={48} style={{ color: "var(--red)" }} />
          <div className="empty-title">Lỗi tải dữ liệu</div>
          <div className="empty-desc">{error}</div>
          <button
            className="btn btn-primary"
            onClick={fetchAdmins}
            style={{ marginTop: 16 }}
          >
            Thử lại
          </button>
        </div>
      ) : admins.length === 0 ? (
        <div className="empty-state">
          <Search className="empty-icon" size={48} />
          <div className="empty-title">Không tìm thấy quản trị viên</div>
          <div className="empty-desc">
            Không có kết quả nào phù hợp với bộ lọc hiện tại.
          </div>
        </div>
      ) : (
        <>
          <div className="user-grid">
            {admins.map((u) => {
              const targetIsSuper = u.role === "superadmin";
              const canModify = isSuper || !targetIsSuper;
              const isSelf = u.uid === currentUserId;

              return (
                <div key={u.uid} className="user-card" style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    {/* Status Badge */}
                    <span
                      className={`badge ${u.isLocked ? "red" : "green"}`}
                      style={{
                        display: "inline-flex",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      {u.isLocked ? (
                        <>
                          <UserX size={10} /> Bị khóa
                        </>
                      ) : (
                        <>
                          <UserCheck size={10} /> Hoạt động
                        </>
                      )}
                    </span>

                    {/* Role Badge */}
                    <span
                      className={`badge ${targetIsSuper ? "purple" : "blue"}`}
                      style={{
                        display: "inline-flex",
                        gap: 4,
                        alignItems: "center",
                        textTransform: "uppercase"
                      }}
                    >
                      {targetIsSuper ? "Super Admin" : "Admin"}
                    </span>
                  </div>

                  <div className="user-name" style={{ fontSize: 16, marginBottom: 4 }}>
                    {u.displayName || "Quản trị viên"}
                  </div>
                  <div className="user-email" style={{ marginBottom: 12 }}>
                    {u.email}
                  </div>

                  <div
                    style={{
                      background: "var(--bg)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginBottom: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px dashed var(--border)",
                    }}
                  >
                    <span>Ngày tạo:</span>
                    <strong style={{ color: "var(--text)" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                    </strong>
                  </div>

                  {/* Edit & Delete Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openModal(u)}
                      disabled={!canModify}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        fontSize: "12px",
                        padding: "8px 12px",
                        gap: 4,
                        opacity: canModify ? 1 : 0.5,
                        cursor: canModify ? "pointer" : "not-allowed",
                      }}
                    >
                      <Edit3 size={12} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={!canModify || isSelf}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        fontSize: "12px",
                        padding: "8px 12px",
                        gap: 4,
                        color: canModify && !isSelf ? "var(--red)" : "var(--text-tertiary)",
                        borderColor: canModify && !isSelf ? "var(--red-soft)" : "var(--border)",
                        opacity: canModify && !isSelf ? 1 : 0.5,
                        cursor: canModify && !isSelf ? "pointer" : "not-allowed",
                      }}
                      title={isSelf ? "Không thể tự xóa chính mình" : ""}
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  </div>

                  {/* Lock & Unlock Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => handleLock(u)}
                      disabled={u.isLocked || !canModify || isSelf}
                      className="btn"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        background: u.isLocked || !canModify || isSelf ? "var(--border)" : "var(--red-soft)",
                        color: u.isLocked || !canModify || isSelf ? "var(--text-tertiary)" : "var(--red)",
                        fontSize: "12px",
                        padding: "8px 12px",
                        cursor: u.isLocked || !canModify || isSelf ? "not-allowed" : "pointer",
                        border: "none",
                        transition: "all 0.2s",
                        opacity: u.isLocked || !canModify || isSelf ? 0.6 : 1,
                      }}
                    >
                      Khóa
                    </button>
                    <button
                      onClick={() => handleUnlock(u)}
                      disabled={!u.isLocked || !canModify}
                      className="btn"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        background: !u.isLocked || !canModify ? "var(--border)" : "var(--green-soft)",
                        color: !u.isLocked || !canModify ? "var(--text-tertiary)" : "var(--green)",
                        fontSize: "12px",
                        padding: "8px 12px",
                        cursor: !u.isLocked || !canModify ? "not-allowed" : "pointer",
                        border: "none",
                        transition: "all 0.2s",
                        opacity: !u.isLocked || !canModify ? 0.6 : 1,
                      }}
                    >
                      Mở khóa
                    </button>
                  </div>

                  {/* Promote / Demote Action */}
                  {targetIsSuper ? (
                    <button
                      onClick={() => handleRoleChange(u, "admin")}
                      disabled={!isSuper || isSelf}
                      className="btn btn-secondary"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        marginTop: 8,
                        fontSize: "12px",
                        padding: "8px 12px",
                        gap: 6,
                        color: isSuper && !isSelf ? "var(--orange)" : "var(--text-tertiary)",
                        borderColor: isSuper && !isSelf ? "var(--orange-soft)" : "var(--border)",
                        display: "flex",
                        alignItems: "center",
                        opacity: isSuper && !isSelf ? 1 : 0.5,
                        cursor: isSuper && !isSelf ? "pointer" : "not-allowed",
                      }}
                      title={isSelf ? "Không thể tự hạ chức chính mình" : ""}
                    >
                      <ArrowDownCircle size={12} /> Hạ cấp xuống Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(u, "superadmin")}
                      disabled={!isSuper}
                      className="btn btn-secondary"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        marginTop: 8,
                        fontSize: "12px",
                        padding: "8px 12px",
                        gap: 6,
                        color: isSuper ? "var(--accent)" : "var(--text-tertiary)",
                        borderColor: isSuper ? "var(--accent-soft)" : "var(--border)",
                        display: "flex",
                        alignItems: "center",
                        opacity: isSuper ? 1 : 0.5,
                        cursor: isSuper ? "pointer" : "not-allowed",
                      }}
                    >
                      <ArrowUpCircle size={12} /> Thăng cấp Super Admin
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 24,
                padding: "16px 0 8px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} trong số {totalCount} quản trị viên
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn btn-secondary"
                  style={{
                    height: 32,
                    padding: "0 12px",
                    gap: 6,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft size={14} /> Trước
                </button>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    padding: "0 8px",
                    fontWeight: 500,
                  }}
                >
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{
                    height: 32,
                    padding: "0 12px",
                    gap: 6,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                  }}
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= ADD / EDIT MODAL ================= */}
      {isModalOpen && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <div className="modal-header" style={modalHeaderStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>
                {editingAdmin ? `Chỉnh sửa admin: ${editingAdmin.displayName || editingAdmin.email}` : "Thêm Admin mới"}
              </h2>
              <button onClick={closeModal} style={closeBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={modalFormStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Tên hiển thị *</label>
                <input
                  type="text"
                  name="displayName"
                  required
                  style={inputStyle}
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="ví dụ: Nguyễn Văn A"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  style={inputStyle}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ví dụ: admin@example.com"
                  disabled={!!editingAdmin}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {editingAdmin ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu *"}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!editingAdmin}
                  style={inputStyle}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={editingAdmin ? "Nhập mật khẩu mới..." : "Nhập mật khẩu..."}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Vai trò *</label>
                <select
                  name="role"
                  style={inputStyle}
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!isSuper}
                >
                  <option value="admin">Admin</option>
                  {isSuper && <option value="superadmin">Super Admin</option>}
                </select>
              </div>

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={submitting}
                  style={{ height: 38 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ height: 38 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles for glassmorphic modal
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.65)",
  backdropFilter: "blur(6px)",
  zIndex: 1000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  overflowY: "auto",
};

const modalContentStyle = {
  backgroundColor: "var(--bg-secondary)",
  borderRadius: "var(--radius)",
  border: "1px solid var(--glass-border)",
  width: "100%",
  maxWidth: "520px",
  maxHeight: "85vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  boxShadow: "var(--shadow-md)",
  animation: "dropIn 0.22s ease-out forwards",
};

const modalHeaderStyle = {
  padding: "16px 24px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 0,
  backgroundColor: "var(--bg-secondary)",
  zIndex: 10,
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "4px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const modalFormStyle = {
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--text-secondary)",
  letterSpacing: "0.2px",
};

const inputStyle = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "13px",
  color: "var(--text)",
  outline: "none",
  transition: "all 0.2s",
};

const modalFooterStyle = {
  marginTop: "16px",
  borderTop: "1px solid var(--border)",
  paddingTop: "16px",
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  position: "sticky",
  bottom: 0,
  backgroundColor: "var(--bg-secondary)",
  zIndex: 10,
};
