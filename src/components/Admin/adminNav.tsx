import { ReactNode } from "react";
import { AppstoreOutlined, DashboardOutlined, ShoppingCartOutlined, PercentageOutlined, TagsOutlined, TeamOutlined, TruckOutlined, SettingOutlined, StarOutlined, WarningOutlined, FileTextOutlined, GlobalOutlined } from "@ant-design/icons";

export type AdminNavItem = { key: string; label: string; icon: ReactNode };

export const ADMIN_NAV: AdminNavItem[] = [
  { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/admin/users", label: "Customers", icon: <TeamOutlined /> },
  { key: "/admin/categories", label: "Categories", icon: <TagsOutlined /> },
  { key: "/admin/products", label: "Products", icon: <AppstoreOutlined /> },
  { key: "/admin/orders", label: "Orders", icon: <ShoppingCartOutlined /> },
  { key: "/admin/inventory", label: "Inventory", icon: <WarningOutlined /> },
  { key: "/admin/blogs", label: "Blogs", icon: <FileTextOutlined /> },
  { key: "/admin/site-content", label: "Site Content", icon: <GlobalOutlined /> },
  { key: "/admin/coupons", label: "Coupons", icon: <PercentageOutlined /> },
  { key: "/admin/shipping", label: "Shipping", icon: <TruckOutlined /> },
  { key: "/admin/reviews", label: "Reviews", icon: <StarOutlined /> },
  { key: "/admin/support", label: "Support", icon: <TeamOutlined /> },
  { key: "/admin/settings", label: "Settings", icon: <SettingOutlined /> },
];

export const getActiveKey = (pathname: string) => {
  if (pathname === "/admin") return "/admin";
  const match = ADMIN_NAV.find((item) => item.key !== "/admin" && (pathname === item.key || pathname.startsWith(`${item.key}/`)));
  return match?.key ?? "/admin";
};

export const getPageTitle = (pathname: string) => {
  const key = getActiveKey(pathname);
  return ADMIN_NAV.find((item) => item.key === key)?.label ?? "Admin";
};
