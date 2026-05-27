import {
  LayoutDashboard, BookOpen, BookMarked, FileText, Users, Bot,
  AlertCircle, Brain, GraduationCap
} from "lucide-react";

export const NAV = [
  { id: "dashboard", label: "Dashboard",           icon: LayoutDashboard, badge: null  },
  { id: "qbank",     label: "Quản lý Câu hỏi",    icon: BookOpen,        badge: "248" },
  { id: "vocab",     label: "Quản lý Từ vựng",    icon: BookMarked,      badge: null  },
  { id: "grammar",   label: "Quản lý Ngữ pháp",   icon: GraduationCap,   badge: null  },
  { id: "exam",      label: "Quản lý Đề thi",      icon: FileText,        badge: "12"  },
  { id: "users",     label: "Quản lý Người dùng",  icon: Users,           badge: null  },
  { id: "ai",        label: "Cấu hình AI",          icon: Bot,             badge: null  },
];

export const PAGE_TITLES = {
  dashboard: "Tổng quan",
  qbank:     "Ngân hàng Câu hỏi",
  vocab:     "Quản lý Từ vựng",
  grammar:   "Quản lý Ngữ pháp",
  exam:      "Quản lý Đề thi",
  users:     "Quản lý Người dùng",
  ai:        "Cấu hình AI",
};

export const NOTIFICATIONS = [
  {
    icon:  Users,
    color: "var(--green)",
    bg:    "var(--green-soft)",
    title: "120 người dùng mới đăng ký hôm nay",
    time:  "5 phút trước",
  },
  {
    icon:  AlertCircle,
    color: "var(--orange)",
    bg:    "var(--orange-soft)",
    title: "Đề thi #9 có tỉ lệ bỏ thi cao bất thường (34%)",
    time:  "1 giờ trước",
  },
  {
    icon:  Brain,
    color: "var(--accent)",
    bg:    "var(--accent-soft)",
    title: "AI đã hoàn tất tạo 80 câu hỏi Part 7 mới",
    time:  "3 giờ trước",
  },
];
