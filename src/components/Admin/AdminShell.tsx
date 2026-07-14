"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Drawer, Grid, Layout } from "antd";

import { useCurrentUser } from "@/hooks/useAuth";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { getActiveKey, getPageTitle } from "./adminNav";

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;

const SIDER_WIDTH = 264;

const AdminShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentUserQuery = useCurrentUser();
  const user = currentUserQuery.data?.data;

  const isDesktop = !!screens.lg;
  const activeKey = getActiveKey(pathname);
  const title = getPageTitle(pathname);

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--adm-body-bg)" }}>
      {isDesktop && (
        <Sider
          width={SIDER_WIDTH}
          style={{
            position: "fixed",
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            height: "100vh",
            borderInlineEnd: "1px solid var(--adm-border)",
            zIndex: 50,
          }}
        >
          <AdminSidebar activeKey={activeKey} />
        </Sider>
      )}

      <Drawer
        placement="left"
        open={!isDesktop && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={SIDER_WIDTH}
        closable={false}
        styles={{ body: { padding: 0, background: "var(--adm-sider-bg)" } }}
        rootClassName="admin-drawer"
      >
        <AdminSidebar
          activeKey={activeKey}
          onNavigate={() => setDrawerOpen(false)}
        />
      </Drawer>

      <Layout
        style={{
          marginInlineStart: isDesktop ? SIDER_WIDTH : 0,
          background: "var(--adm-body-bg)",
        }}
      >
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            height: 68,
            padding: 0,
            lineHeight: "normal",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--adm-border)",
          }}
        >
          <AdminTopbar
            title={title}
            user={user}
            showMenuButton={!isDesktop}
            onMenuClick={() => setDrawerOpen(true)}
          />
        </Header>

        <Content style={{ padding: "clamp(20px, 3vw, 36px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminShell;
