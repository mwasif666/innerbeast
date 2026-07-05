import { ReactNode } from "react";
import {
  AppstoreOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";

export type AdminNavItem = {
  key: string;
  label: string;
  icon: ReactNode;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/admin/users", label: "Customers", icon: <TeamOutlined /> },
  { key: "/admin/categories", label: "Categories", icon: <TagsOutlined /> },
  { key: "/admin/products", label: "Products", icon: <AppstoreOutlined /> },
  { key: "/admin/orders", label: "Orders", icon: <ShoppingCartOutlined /> },
  { key: "/admin/coupons", label: "Coupons", icon: <PercentageOutlined /> },
];

export const getActiveKey = (pathname: string) => {
  if (pathname === "/admin") return "/admin";

  const match = ADMIN_NAV.find(
    (item) =>
      item.key !== "/admin" &&
      (pathname === item.key || pathname.startsWith(`${item.key}/`)),
  );

  return match?.key ?? "/admin";
};

export const getPageTitle = (pathname: string) => {
  const key = getActiveKey(pathname);
  return ADMIN_NAV.find((item) => item.key === key)?.label ?? "Admin";
};
