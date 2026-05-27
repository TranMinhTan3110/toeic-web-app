import React, { useState, useEffect } from "react";
import { Search, Filter, ShieldAlert, UserCheck, UserX, Loader2, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { getAllUsersForAdmin, lockUser, unlockUser } from "../../services/userService";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 9; // Perfect for a 3x3 responsive grid

  // Trigger loading of paginated users when filters or page changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, roleFilter]);

  // Handle Search Debounce to keep UI typing smooth
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsersForAdmin(
        currentPage,
        pageSize,
        searchTerm,
        statusFilter,
        roleFilter
      );
      // Backend returns PagedUsersResultDto: { items: [...], totalCount: X, page: Y, pageSize: Z }
      setUsers(data.items || []);
      setTotalCount(data.totalCount || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (userId) => {
    try {
      await lockUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.uid === userId ? { ...u, isLocked: true } : u))
      );
    } catch (err) {
      console.error("Lock error:", err);
      alert("Không thể khóa người dùng.");
    }
  };

  const handleUnlock = async (userId) => {
    try {
      await unlockUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.uid === userId ? { ...u, isLocked: false } : u))
      );
    } catch (err) {
      console.error("Unlock error:", err);
      alert("Không thể mở khóa người dùng.");
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
            <h1 className="page-title">Quản lý Người dùng</h1>
            <p className="page-subtitle">
              Tìm thấy {totalCount} tài khoản phù hợp với bộ lọc
            </p>
          </div>
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
              setCurrentPage(1); // Reset page on search
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
                setCurrentPage(1); // Reset page on filter
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

          {/* Role Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={14} style={{ color: "var(--text-secondary)" }} />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1); // Reset page on filter
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
              <option value="all">Tất cả vai trò</option>
              <option value="user">User (Người học)</option>
              <option value="admin">Admin (Quản trị)</option>
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
            onClick={fetchUsers}
            style={{ marginTop: 16 }}
          >
            Thử lại
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <Search className="empty-icon" size={48} />
          <div className="empty-title">Không tìm thấy người dùng</div>
          <div className="empty-desc">
            Không có kết quả nào phù hợp với bộ lọc hiện tại.
          </div>
        </div>
      ) : (
        <>
          <div className="user-grid">
            {users.map((u) => (
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
                    className={`badge ${u.role === "admin" ? "purple" : "blue"}`}
                    style={{
                      display: "inline-flex",
                      gap: 4,
                      alignItems: "center",
                      textTransform: "uppercase"
                    }}
                  >
                    {u.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>

                <div className="user-name" style={{ fontSize: 16, marginBottom: 4 }}>
                  {u.displayName || "Người dùng TOEIC"}
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
                  <span>Ngày tham gia:</span>
                  <strong style={{ color: "var(--text)" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                  </strong>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => handleLock(u.uid)}
                    disabled={u.isLocked}
                    className="btn"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      background: u.isLocked ? "var(--border)" : "var(--red-soft)",
                      color: u.isLocked ? "var(--text-tertiary)" : "var(--red)",
                      fontSize: "12px",
                      padding: "8px 12px",
                      cursor: u.isLocked ? "not-allowed" : "pointer",
                      border: u.isLocked ? "none" : "1px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    Khóa
                  </button>
                  <button
                    onClick={() => handleUnlock(u.uid)}
                    disabled={!u.isLocked}
                    className="btn"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      background: !u.isLocked ? "var(--border)" : "var(--green-soft)",
                      color: !u.isLocked ? "var(--text-tertiary)" : "var(--green)",
                      fontSize: "12px",
                      padding: "8px 12px",
                      cursor: !u.isLocked ? "not-allowed" : "pointer",
                      border: !u.isLocked ? "none" : "1px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    Mở khóa
                  </button>
                </div>
              </div>
            ))}
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
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} trong số {totalCount} người dùng
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
    </div>
  );
}
