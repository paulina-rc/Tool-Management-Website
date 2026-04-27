import { Navigate } from "react-router";
import { useAppStore } from "../store/AppStore";

/**
 * Wrapper que redirige a los profesores fuera de las rutas de administrador.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { userRole } = useAppStore();
  if (userRole !== "admin") {
    return <Navigate to="/my-reservations" replace />;
  }
  return <>{children}</>;
}