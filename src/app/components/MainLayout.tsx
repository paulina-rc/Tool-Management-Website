import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router";
import {
  LayoutDashboard,
  Wrench,
  Calendar,
  FileText,
  Package,
  History,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  LogOut,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { useAppStore } from "../store/AppStore";
import type { UserRole } from "../store/AppStore";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Panel de Control", icon: LayoutDashboard, roles: ["admin"] },
  { path: "/tools", label: "Herramientas", icon: Wrench, roles: ["admin"] },
  { path: "/reservations", label: "Gestión de Reservas", icon: ClipboardList, roles: ["admin"] },
  { path: "/loans/open", label: "Abrir Préstamo", icon: Package, roles: ["admin"] },
  { path: "/history", label: "Historial Global", icon: History, roles: ["admin"] },
  { path: "/reports", label: "Reportes", icon: FileText, roles: ["admin"] },
  { path: "/my-reservations", label: "Mis Reservas", icon: Calendar, roles: ["profesor"] },
  { path: "/history", label: "Mi Historial", icon: History, roles: ["profesor"] },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userRole, userName, logout } = useAppStore();

  if (!isAuthenticated || !userRole) {
    return <Navigate to="/" replace />;
  }

  const visibleNav = navItems.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isAdmin = userRole === "admin";

  return (
    <div className="min-h-screen flex bg-[#F9FAF7]">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-[#42511c] to-[#5c6934] flex flex-col shadow-2xl">

        {/* HEADER */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#6B8E23] shadow-md">
              <GraduationCap className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight">
                Gestión de Herramientas
              </h1>
              <p className="text-[#DDE5D3] text-xs">
                Colegio San Carlos
              </p>
            </div>
          </div>
        </div>

        {/* USER */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-white/10 backdrop-blur border border-white/10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isAdmin ? "bg-[#6B8E23]" : "bg-[#8FAE5D]"
            }`}>
              {isAdmin
                ? <ShieldCheck className="size-4 text-white" />
                : <BookOpen className="size-4 text-white" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{userName}</p>
              <p className="text-[#DDE5D3] text-xs capitalize">
                {isAdmin ? "Administrador" : "Profesor"}
              </p>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 mt-2 space-y-1">

          <p className="text-[#DDE5D3] text-[10px] uppercase tracking-widest font-medium px-4 pb-2 pt-1">
            {isAdmin ? "Administración" : "Mi Espacio"}
          </p>

          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-[#6B8E23] text-white shadow-md"
                    : "text-[#DDE5D3] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {isActive && <ChevronRight className="size-3.5 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#DDE5D3] hover:bg-red-900/30 hover:text-red-300 transition-all duration-300"
          >
            <LogOut className="size-4" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>

          <p className="text-xs text-[#DDE5D3] text-center mt-3">
            © 2026 Sistema
          </p>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}