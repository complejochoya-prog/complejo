import ReportsDashboard from "./pages/ReportsDashboard";

export const ReportsModule = {
    id: "reports",
    name: "Reportes Avanzados",
    routes: [
        { path: "/:negocioId/reportes-pro", element: ReportsDashboard, layout: "admin", roles: ["admin"] }
    ]
};
