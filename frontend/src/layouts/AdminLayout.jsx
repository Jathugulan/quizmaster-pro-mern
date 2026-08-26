import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  FileCheck2,
  Users,
  Award,
  BarChart3,
  User as UserIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import AppShell from "./AppShell.jsx";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/quiz/new", label: "Create Quiz", icon: PlusCircle },
  { to: "/admin/quizzes", label: "Manage Quizzes", icon: BookOpen },
  { to: "/admin/results", label: "Quiz Results", icon: FileCheck2 },
  { to: "/admin/students", label: "Student Performance", icon: Users },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/profile", label: "Profile", icon: UserIcon },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout() {
  return <AppShell items={ADMIN_NAV} roleLabel="Enterprise Admin" />;
}
