import AdminRoute from "@/components/Auth/AdminRoute";
import AdminShell from "@/components/Admin/AdminShell";
import AdminAntdProvider from "@/providers/AdminAntdProvider";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminAntdProvider>
      <AdminRoute>
        <AdminShell>{children}</AdminShell>
      </AdminRoute>
    </AdminAntdProvider>
  );
};

export default AdminLayout;
