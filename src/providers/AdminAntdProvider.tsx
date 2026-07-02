"use client";

import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme } from "antd";

const AdminAntdProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
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
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
};

export default AdminAntdProvider;
