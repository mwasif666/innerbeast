"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme } from "antd";
import type { ThemeConfig } from "antd";

export type AdminThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "admin-theme-mode";

type AdminThemeContextValue = {
  mode: AdminThemeMode;
  toggleMode: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue>({
  mode: "dark",
  toggleMode: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);

const CSS_VARS: Record<AdminThemeMode, Record<string, string>> = {
  dark: {
    "--adm-body-bg": "#080808",
    "--adm-sider-bg": "#0d0d0d",
    "--adm-text": "#ffffff",
    "--adm-text-2": "rgba(255,255,255,0.65)",
    "--adm-text-3": "rgba(255,255,255,0.45)",
    "--adm-text-4": "rgba(255,255,255,0.3)",
    "--adm-border": "rgba(255,255,255,0.08)",
    "--adm-wash": "rgba(255,255,255,0.05)",
    "--adm-baseline": "rgba(255,255,255,0.16)",
    "--adm-panel-bg":
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
    "--adm-hero-bg":
      "radial-gradient(circle at top left, rgba(96,165,250,0.22), transparent 38%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.88))",
    "--adm-accent": "#60a5fa",
    "--adm-accent-soft": "rgba(96,165,250,0.12)",
    "--adm-accent-border": "rgba(96,165,250,0.45)",
    "--adm-good": "#22c55e",
    "--adm-warn": "#f59e0b",
    "--adm-status-pending": "#f59e0b",
    "--adm-status-confirmed": "#60a5fa",
    "--adm-status-processing": "#7c3aed",
    "--adm-status-shipped": "#22d3ee",
    "--adm-status-delivered": "#22c55e",
    "--adm-status-cancelled": "#ef4444",
    "--adm-status-returned": "#fb923c",
  },
  light: {
    "--adm-body-bg": "#f4f6f9",
    "--adm-sider-bg": "#ffffff",
    "--adm-text": "#0f172a",
    "--adm-text-2": "rgba(15,23,42,0.68)",
    "--adm-text-3": "rgba(15,23,42,0.48)",
    "--adm-text-4": "rgba(15,23,42,0.32)",
    "--adm-border": "rgba(15,23,42,0.1)",
    "--adm-wash": "rgba(15,23,42,0.05)",
    "--adm-baseline": "rgba(15,23,42,0.18)",
    "--adm-panel-bg": "linear-gradient(180deg, #ffffff, #fbfcfe)",
    "--adm-hero-bg":
      "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 38%), linear-gradient(135deg, #ffffff, #e8eef7)",
    "--adm-accent": "#2563eb",
    "--adm-accent-soft": "rgba(37,99,235,0.1)",
    "--adm-accent-border": "rgba(37,99,235,0.45)",
    "--adm-good": "#16a34a",
    "--adm-warn": "#d97706",
    "--adm-status-pending": "#d97706",
    "--adm-status-confirmed": "#3b82f6",
    "--adm-status-processing": "#5b21b6",
    "--adm-status-shipped": "#0891b2",
    "--adm-status-delivered": "#16a34a",
    "--adm-status-cancelled": "#dc2626",
    "--adm-status-returned": "#ea580c",
  },
};

const DARK_THEME: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#60a5fa",
    colorInfo: "#60a5fa",
    colorBgBase: "#080808",
    colorBgContainer: "#111111",
    colorBgElevated: "#151515",
    colorBorder: "rgba(255,255,255,0.1)",
    colorBorderSecondary: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    fontFamily: "inherit",
  },
  components: {
    Layout: {
      siderBg: "#0d0d0d",
      headerBg: "rgba(8,8,8,0.85)",
      bodyBg: "#080808",
    },
    Menu: {
      itemBg: "transparent",
      itemColor: "rgba(255,255,255,0.62)",
      itemHoverColor: "#ffffff",
      itemHoverBg: "rgba(255,255,255,0.05)",
      itemSelectedColor: "#ffffff",
      itemSelectedBg: "rgba(96,165,250,0.14)",
      itemHeight: 44,
      itemMarginInline: 8,
      iconSize: 17,
    },
    Table: {
      headerBg: "#191919",
      headerColor: "rgba(255,255,255,0.5)",
      rowHoverBg: "#1b1b1b",
      borderColor: "rgba(255,255,255,0.07)",
    },
  },
};

const LIGHT_THEME: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#2563eb",
    colorInfo: "#2563eb",
    colorBgBase: "#f8fafc",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBorder: "rgba(15,23,42,0.12)",
    colorBorderSecondary: "rgba(15,23,42,0.08)",
    borderRadius: 12,
    fontFamily: "inherit",
  },
  components: {
    Layout: {
      siderBg: "#ffffff",
      headerBg: "rgba(244,246,249,0.85)",
      bodyBg: "#f4f6f9",
    },
    Menu: {
      itemBg: "transparent",
      itemColor: "rgba(15,23,42,0.65)",
      itemHoverColor: "#0f172a",
      itemHoverBg: "rgba(15,23,42,0.05)",
      itemSelectedColor: "#1d4ed8",
      itemSelectedBg: "rgba(37,99,235,0.1)",
      itemHeight: 44,
      itemMarginInline: 8,
      iconSize: 17,
    },
    Table: {
      headerBg: "#f8fafc",
      headerColor: "rgba(15,23,42,0.55)",
      rowHoverBg: "#f1f5f9",
      borderColor: "rgba(15,23,42,0.07)",
    },
  },
};

const AdminAntdProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<AdminThemeMode>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "light" || stored === "dark") {
      setMode(stored);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ mode, toggleMode }),
    [mode, toggleMode],
  );

  const cssVars = Object.entries(CSS_VARS[mode])
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");

  return (
    <AntdRegistry>
      <AdminThemeContext.Provider value={contextValue}>
        <ConfigProvider theme={mode === "dark" ? DARK_THEME : LIGHT_THEME}>
          <style>{`:root { ${cssVars} }`}</style>
          <App>{children}</App>
        </ConfigProvider>
      </AdminThemeContext.Provider>
    </AntdRegistry>
  );
};

export default AdminAntdProvider;
