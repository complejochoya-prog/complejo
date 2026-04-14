import AnalyticsDashboard from "./components/AnalyticsDashboard";

/**
 * Analytics Plugin definition.
 * Integrates into the global admin panel with a custom route.
 */
export const AnalyticsPlugin = {
    id: "analytics",
    name: "Analytics",
    routes: [
        {
            path: "/admin/analytics",
            element: AnalyticsDashboard,
            layout: "admin",
            roles: ["admin"]
        }
    ]
};
