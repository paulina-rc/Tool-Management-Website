import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ToolsList } from "./components/ToolsList";
import { CreateReservation } from "./components/CreateReservation";
import { ReservationsManagement } from "./components/ReservationsManagement";
import { ReservationDetail } from "./components/ReservationDetail";
import { OpenLoan } from "./components/OpenLoan";
import { ToolDelivery } from "./components/ToolDelivery";
import { ToolReturn } from "./components/ToolReturn";
import { LoanLiquidation } from "./components/LoanLiquidation";
import { Reports } from "./components/Reports";
import { LoanHistoryView } from "./components/LoanHistoryView";
import { MainLayout } from "./components/MainLayout";
import { AdminOnly } from "./components/AdminOnly";
import { useAppStore } from "./store/AppStore";

/** Redirect to the correct home based on role */
function RoleAwareRedirect() {
  const { userRole } = useAppStore();
  return <Navigate to={userRole === 'admin' ? '/dashboard' : '/my-reservations'} replace />;
}

/** Factory — call once inside the React tree (inside AppProvider) */
export function createAppRouter() {
  return createBrowserRouter([
    {
      path: "/",
      Component: Login,
    },
    {
      path: "/",
      Component: MainLayout,
      children: [
        // ── Profesor routes ────────────────────────────────────────────────────
        { path: "my-reservations", Component: ReservationsManagement },
        { path: "reservations/:id", Component: ReservationDetail },
        { path: "history",          Component: LoanHistoryView },

        // ── Admin-only routes ──────────────────────────────────────────────────
        {
          path: "dashboard",
          Component: () => <AdminOnly><Dashboard /></AdminOnly>,
        },
        {
          path: "tools",
          Component: () => <AdminOnly><ToolsList /></AdminOnly>,
        },
        {
          path: "reservations",
          Component: () => <AdminOnly><ReservationsManagement /></AdminOnly>,
        },
        {
          path: "reservations/create",
          Component: () => <AdminOnly><CreateReservation /></AdminOnly>,
        },
        {
          path: "loans/open",
          Component: () => <AdminOnly><OpenLoan /></AdminOnly>,
        },
        {
          path: "loans/:id/delivery",
          Component: () => <AdminOnly><ToolDelivery /></AdminOnly>,
        },
        {
          path: "loans/:id/return",
          Component: () => <AdminOnly><ToolReturn /></AdminOnly>,
        },
        {
          path: "loans/:id/liquidate",
          Component: () => <AdminOnly><LoanLiquidation /></AdminOnly>,
        },
        {
          path: "reports",
          Component: () => <AdminOnly><Reports /></AdminOnly>,
        },
        { path: "*", Component: RoleAwareRedirect },
      ],
    },
  ]);
}