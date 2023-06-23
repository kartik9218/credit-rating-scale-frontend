import { CorporateFare, Dashboard, Settings } from "@mui/icons-material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const routes = [
  {
    name: "Dashboard",
    key: "dashboard",
    icon: <Dashboard fontSize="medium" />,
    type: "collapse",
    noCollapse: true,
    route: "/dashboard",
  },
  {
    name: "Management",
    key: "management",
    icon: <CorporateFare fontSize="medium" />,
    type: "collapse",
    collapse: [
      {
        name: "Users",
        key: "management-users",
        icon: <Settings fontSize="medium" />,
        route: "/dashboard/users",
      },
      {
        name: "Roles",
        key: "management-roles",
        icon: <Settings fontSize="medium" />,
        route: "/dashboard/roles",
      },
      {
        name: "Permissions",
        key: "management-permissions",
        icon: <Settings fontSize="medium" />,
        route: "/dashboard/permissions",
      },
      {
        name: "Navigations",
        key: "management-navigations",
        icon: <Settings fontSize="medium" />,
        route: "/dashboard/navigations",
      },
    ],
  },
  {
    name: "Administrator",
    key: "admin",
    icon: <AdminPanelSettingsIcon fontSize="medium" />,
    type: "collapse",
    collapse: [
      {
        name: "Users",
        key: "admin-user-master",
        icon: <Settings fontSize="medium" />,
        route: "/dashboard/user-master",
      },
      {
        name: "Roles",
        key: "roles",
        icon: <Settings fontSize="medium" />,
        route: "/dashboard/roles",
      },
      {
        name: "Assign Role",
        key: "assign-role",
        icon: <Settings fontSize="medium" />,
        route: "/dashboard/assign-role",
      },
    ],
  },
];

export { routes };
