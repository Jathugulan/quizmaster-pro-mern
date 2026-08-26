import {
  LayoutDashboard,
  LibraryBig,
  FileCheck2,
  Award,
  TrendingUp,
  Trophy,
  Sparkles,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import AppShell from "./AppShell.jsx";

const USER_NAV = [
  { to: "/user", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/user/library", label: "Quiz Library", icon: LibraryBig },
  { to: "/user/results", label: "My Results", icon: FileCheck2 },
  { to: "/user/certificates", label: "Certificates", icon: Award },
  { to: "/user/progress", label: "Performance", icon: TrendingUp },
  { to: "/user/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/user/ai-assistant", label: "Study Assistant", icon: Sparkles },
  { to: "/user/profile", label: "Profile", icon: User },
  { to: "/user/settings", label: "Settings", icon: SettingsIcon },
];

export default function UserLayout() {
  return <AppShell items={USER_NAV} roleLabel="Student" />;
}
