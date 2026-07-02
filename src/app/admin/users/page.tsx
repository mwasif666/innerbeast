"use client";

import { useMemo, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Card,
  Input,
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
  UserSwitchOutlined,
} from "@ant-design/icons";

import {
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomerRole,
  useUpdateCustomerStatus,
} from "@/hooks/useUsers";
import { Customer } from "@/services/user.service";

const { Title, Text } = Typography;

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

  const customersQuery = useCustomers();
  const updateStatusMutation = useUpdateCustomerStatus();
  const updateRoleMutation = useUpdateCustomerRole();
  const deleteCustomerMutation = useDeleteCustomer();

  const customers = customersQuery.data?.data || [];

  const filteredCustomers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();
    if (!searchValue) return customers;

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchValue) ||
        customer.email?.toLowerCase().includes(searchValue) ||
        customer.role?.toLowerCase().includes(searchValue),
    );
  }, [customers, search]);

  const handleToggleStatus = (customer: Customer) => {
    const nextStatus = !customer.isActive;

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

  const handleMakeAdmin = (customer: Customer) => {
    modal.confirm({
      title: "Update Customer Role",
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to make ${customer.name} an admin?`,
      okText: "Make Admin",
      onOk: async () => {
        try {
          await updateRoleMutation.mutateAsync({
            id: customer._id,
            role: "admin",
          });
          message.success("Customer role updated successfully.");
        } catch {
          message.error("Failed to update customer role.");
        }
      },
    });
  };

  const handleDeleteCustomer = (customer: Customer) => {
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
            <div style={{ fontWeight: 500, color: "#fff" }}>{customer.name}</div>
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
      render: (role: Customer["role"]) => {
        const privileged = role === "admin" || role === "superAdmin";
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
        const isSuperAdmin = customer.role === "superAdmin";
        return (
          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
            <Tooltip title={customer.isActive ? "Disable" : "Activate"}>
              <Button
                type="text"
                shape="circle"
                icon={customer.isActive ? <LockOutlined /> : <UnlockOutlined />}
                danger={customer.isActive}
                onClick={() => handleToggleStatus(customer)}
              />
            </Tooltip>
            <Tooltip title="Make Admin">
              <Button
                type="text"
                shape="circle"
                icon={<UserSwitchOutlined />}
                disabled={customer.role === "admin" || isSuperAdmin}
                onClick={() => handleMakeAdmin(customer)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="text"
                shape="circle"
                danger
                icon={<DeleteOutlined />}
                disabled={isSuperAdmin}
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
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 7,
            }}
          >
            User management
          </div>
          <Title level={2} style={{ margin: 0, color: "#fff" }}>
            Customers
          </Title>
          <Text type="secondary">Manage registered customer accounts.</Text>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 10px 8px 16px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            color: "rgba(255,255,255,0.65)",
            fontSize: 13,
          }}
        >
          <span>Total customers</span>
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
            {customersQuery.data?.count || 0}
          </span>
        </div>
      </div>

      <Card
        styles={{ body: { padding: 18 } }}
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
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
            prefix={<SearchOutlined style={{ color: "rgba(255,255,255,0.4)" }} />}
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
          loading={customersQuery.isLoading}
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
