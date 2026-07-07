"use client";

import { useMemo, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Card,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  LockOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";

import { useCurrentUser } from "@/hooks/useAuth";
import {
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomerRole,
  useUpdateCustomerStatus,
} from "@/hooks/useUsers";
import { Customer, CustomerRole } from "@/services/user.service";

const { Title, Text } = Typography;
const USER_ROLES: CustomerRole[] = ["user", "admin", "superAdmin"];

const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getInitials = (name?: string) =>
  (name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AdminUsersPage = () => {
  const { message, modal } = App.useApp();
  const [search, setSearch] = useState("");

  const currentUserQuery = useCurrentUser();
  const customersQuery = useCustomers();
  const updateStatusMutation = useUpdateCustomerStatus();
  const updateRoleMutation = useUpdateCustomerRole();
  const deleteCustomerMutation = useDeleteCustomer();

  const currentUser = currentUserQuery.data?.data;
  const actorIsSuperAdmin = currentUser?.role === "superAdmin";
  const customers = useMemo(
    () => customersQuery.data?.data || [],
    [customersQuery.data?.data],
  );
  const manageableUsers = useMemo(
    () =>
      actorIsSuperAdmin
        ? customers
        : customers.filter((customer) => customer.role === "user"),
    [actorIsSuperAdmin, customers],
  );
  const activeSuperAdminCount = customers.filter(
    (customer) => customer.role === "superAdmin" && customer.isActive,
  ).length;

  const isLastActiveSuperAdmin = (customer: Customer) =>
    customer.role === "superAdmin" &&
    customer.isActive &&
    activeSuperAdminCount <= 1;

  const canManageAccount = (customer: Customer) =>
    actorIsSuperAdmin || customer.role === "user";

  const filteredCustomers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();
    if (!searchValue) return manageableUsers;

    return manageableUsers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchValue) ||
        customer.email?.toLowerCase().includes(searchValue) ||
        customer.role?.toLowerCase().includes(searchValue),
    );
  }, [manageableUsers, search]);

  const handleToggleStatus = (customer: Customer) => {
    if (!canManageAccount(customer)) {
      message.error("Normal admins can only manage customer accounts.");
      return;
    }

    const nextStatus = !customer.isActive;
    if (!nextStatus && isLastActiveSuperAdmin(customer)) {
      message.error("The last active super admin cannot be disabled.");
      return;
    }

    modal.confirm({
      title: nextStatus ? "Activate Customer" : "Disable Customer",
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to ${
        nextStatus ? "activate" : "disable"
      } ${customer.name}?`,
      okText: nextStatus ? "Activate" : "Disable",
      okButtonProps: { danger: !nextStatus },
      onOk: async () => {
        try {
          await updateStatusMutation.mutateAsync({
            id: customer._id,
            isActive: nextStatus,
          });
          message.success(
            `Customer ${nextStatus ? "activated" : "disabled"} successfully.`,
          );
        } catch {
          message.error("Failed to update customer status.");
        }
      },
    });
  };

  const handleChangeRole = (customer: Customer, role: CustomerRole) => {
    if (!actorIsSuperAdmin) {
      message.error("Only a super admin can change roles.");
      return;
    }
    if (role === customer.role) return;
    if (role !== "superAdmin" && isLastActiveSuperAdmin(customer)) {
      message.error("The last active super admin cannot be demoted.");
      return;
    }

    modal.confirm({
      title: "Update User Role",
      icon: <ExclamationCircleFilled />,
      content: `Change ${customer.name}'s role from ${customer.role} to ${role}?`,
      okText: "Change Role",
      onOk: async () => {
        try {
          await updateRoleMutation.mutateAsync({
            id: customer._id,
            role,
          });
          message.success("User role updated successfully.");
        } catch {
          message.error("Failed to update user role.");
        }
      },
    });
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (!canManageAccount(customer)) {
      message.error("Normal admins can only manage customer accounts.");
      return;
    }
    if (isLastActiveSuperAdmin(customer)) {
      message.error("The last active super admin cannot be deleted.");
      return;
    }

    modal.confirm({
      title: "Delete Customer",
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCustomerMutation.mutateAsync(customer._id);
          message.success("Customer deleted successfully.");
        } catch {
          message.error("Failed to delete customer.");
        }
      },
    });
  };

  const columns: ColumnsType<Customer> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (_, customer) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            style={{
              background: "rgba(96,165,250,0.2)",
              color: "#93c5fd",
              border: "1px solid rgba(96,165,250,0.25)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {getInitials(customer.name)}
          </Avatar>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontWeight: 500, color: "var(--adm-text)" }}>{customer.name}</div>
            <Text type="secondary" style={{ fontSize: 12.5 }}>
              {customer.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      sorter: (a, b) => (a.role || "").localeCompare(b.role || ""),
      render: (role: Customer["role"], customer) => {
        const privileged = role === "admin" || role === "superAdmin";
        if (actorIsSuperAdmin) {
          return (
            <Select<CustomerRole>
              size="small"
              value={role}
              disabled={
                updateRoleMutation.isPending ||
                isLastActiveSuperAdmin(customer)
              }
              onChange={(nextRole) => handleChangeRole(customer, nextRole)}
              style={{ width: 132 }}
              options={USER_ROLES.map((value) => ({
                value,
                label: value === "superAdmin" ? "Super admin" : value[0].toUpperCase() + value.slice(1),
              }))}
            />
          );
        }
        return (
          <Tag
            color={privileged ? "blue" : "default"}
            style={{ borderRadius: 999, textTransform: "capitalize", margin: 0 }}
          >
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      sorter: (a, b) => Number(a.isActive) - Number(b.isActive),
      render: (isActive: boolean) => (
        <Tag
          color={isActive ? "success" : "error"}
          style={{ borderRadius: 999, margin: 0 }}
        >
          {isActive ? "Active" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime(),
      render: (createdAt?: string) => (
        <Text type="secondary">{formatDate(createdAt)}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, customer) => {
        const canManage = canManageAccount(customer);
        const protectedSuperAdmin = isLastActiveSuperAdmin(customer);
        const statusTitle = !canManage
          ? "Only super admins can manage staff accounts"
          : protectedSuperAdmin && customer.isActive
            ? "Last active super admin cannot be disabled"
            : customer.isActive
              ? "Disable"
              : "Activate";
        return (
          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
            <Tooltip title={statusTitle}>
              <Button
                type="text"
                shape="circle"
                icon={customer.isActive ? <LockOutlined /> : <UnlockOutlined />}
                danger={customer.isActive}
                disabled={
                  !canManage ||
                  (protectedSuperAdmin && customer.isActive) ||
                  updateStatusMutation.isPending
                }
                onClick={() => handleToggleStatus(customer)}
              />
            </Tooltip>
            <Tooltip
              title={
                !canManage
                  ? "Only super admins can delete staff accounts"
                  : protectedSuperAdmin
                    ? "Last active super admin cannot be deleted"
                    : "Delete"
              }
            >
              <Button
                type="text"
                shape="circle"
                danger
                icon={<DeleteOutlined />}
                disabled={
                  !canManage || protectedSuperAdmin || deleteCustomerMutation.isPending
                }
                onClick={() => handleDeleteCustomer(customer)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              color: "var(--adm-accent)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 7,
            }}
          >
            User management
          </div>
          <Title level={2} style={{ margin: 0, color: "var(--adm-text)" }}>
            {actorIsSuperAdmin ? "Users & Staff" : "Customers"}
          </Title>
          <Text type="secondary">
            {actorIsSuperAdmin
              ? "Manage customer accounts, staff access and roles."
              : "Manage registered customer accounts."}
          </Text>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 10px 8px 16px",
            background: "var(--adm-wash)",
            border: "1px solid var(--adm-border)",
            borderRadius: 14,
            color: "var(--adm-text-2)",
            fontSize: 13,
          }}
        >
          <span>{actorIsSuperAdmin ? "Total users" : "Total customers"}</span>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              minWidth: 34,
              height: 30,
              padding: "0 8px",
              color: "#07111f",
              background: "#60a5fa",
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {manageableUsers.length}
          </span>
        </div>
      </div>

      <Card
        styles={{ body: { padding: 18 } }}
        style={{ borderColor: "var(--adm-border)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined style={{ color: "var(--adm-text-3)" }} />}
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ maxWidth: 440 }}
          />
          <Text type="secondary" style={{ fontSize: 13 }}>
            {filteredCustomers.length} results
          </Text>
        </div>

        <Table<Customer>
          rowKey="_id"
          columns={columns}
          dataSource={filteredCustomers}
          loading={customersQuery.isLoading || currentUserQuery.isLoading}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: [8, 16, 24],
            showTotal: (total, range) =>
              `Showing ${range[0]}–${range[1]} of ${total}`,
          }}
          locale={{ emptyText: "No customers found." }}
        />
      </Card>

      {customersQuery.isError && (
        <Text type="danger" style={{ display: "block", marginTop: 16 }}>
          Failed to load customers.
        </Text>
      )}
    </div>
  );
};

export default AdminUsersPage;
