"use client";

import { useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import {
  useCreateShippingRule,
  useDeleteShippingRule,
  useShippingRules,
  useUpdateShippingRule,
} from "@/hooks/useShipping";
import type {
  ShippingRule,
  ShippingRulePayload,
} from "@/services/shipping.service";

const { Title, Text } = Typography;

const formatGBP = (value?: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value || 0));

type ShippingFormValues = ShippingRulePayload;

const AdminShippingPage = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<ShippingFormValues>();
  const [editing, setEditing] = useState<ShippingRule | null>(null);
  const [open, setOpen] = useState(false);

  const rulesQuery = useShippingRules();
  const createMutation = useCreateShippingRule();
  const updateMutation = useUpdateShippingRule();
  const deleteMutation = useDeleteShippingRule();
  const rules = rulesQuery.data?.data || [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      name: "",
      country: "",
      city: "",
      rate: 0,
      freeShippingThreshold: 0,
      priority: 0,
      isDefault: false,
      isActive: true,
      notes: "",
    });
    setOpen(true);
  };

  const openEdit = (rule: ShippingRule) => {
    setEditing(rule);
    form.setFieldsValue({
      name: rule.name,
      country: rule.country || "",
      city: rule.city || "",
      rate: rule.rate,
      freeShippingThreshold: rule.freeShippingThreshold || 0,
      priority: rule.priority || 0,
      isDefault: rule.isDefault === true,
      isActive: rule.isActive !== false,
      notes: rule.notes || "",
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const submit = async (values: ShippingFormValues) => {
    const payload: ShippingRulePayload = {
      name: values.name.trim(),
      country: values.country?.trim() || undefined,
      city: values.city?.trim() || undefined,
      rate: Number(values.rate),
      freeShippingThreshold: Number(values.freeShippingThreshold || 0),
      priority: Number(values.priority || 0),
      isDefault: values.isDefault === true,
      isActive: values.isActive !== false,
      notes: values.notes?.trim() || undefined,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, payload });
        message.success("Shipping rule updated successfully.");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("Shipping rule created successfully.");
      }
      closeModal();
    } catch (error) {
      message.error(
        (error as Error).message || "Shipping rule could not be saved.",
      );
    }
  };

  const remove = (rule: ShippingRule) => {
    modal.confirm({
      title: `Delete ${rule.name}?`,
      content: "This shipping rate will no longer be available at checkout.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(rule._id);
          message.success("Shipping rule deleted successfully.");
        } catch (error) {
          message.error(
            (error as Error).message || "Shipping rule could not be deleted.",
          );
        }
      },
    });
  };

  const columns: ColumnsType<ShippingRule> = [
    {
      title: "Rule",
      dataIndex: "name",
      render: (name: string, rule) => (
        <div>
          <strong style={{ color: "#fff" }}>{name}</strong>
          {rule.isDefault && <Tag color="blue" style={{ marginLeft: 8 }}>Default</Tag>}
        </div>
      ),
    },
    {
      title: "Location",
      render: (_, rule) =>
        [rule.city, rule.country].filter(Boolean).join(", ") || "All locations",
    },
    {
      title: "Shipping cost",
      dataIndex: "rate",
      render: (rate: number) => <strong>{formatGBP(rate)}</strong>,
    },
    {
      title: "Free shipping from",
      dataIndex: "freeShippingThreshold",
      render: (threshold?: number) =>
        threshold && threshold > 0 ? formatGBP(threshold) : "Not enabled",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (priority?: number) => priority || 0,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive?: boolean) => (
        <Tag color={isActive === false ? "error" : "success"}>
          {isActive === false ? "Disabled" : "Active"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      align: "right",
      render: (_, rule) => (
        <Space>
          <Button
            type="text"
            shape="circle"
            aria-label={`Edit ${rule.name}`}
            icon={<EditOutlined />}
            onClick={() => openEdit(rule)}
          />
          <Button
            danger
            type="text"
            shape="circle"
            aria-label={`Delete ${rule.name}`}
            icon={<DeleteOutlined />}
            onClick={() => remove(rule)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1500, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            Delivery settings
          </div>
          <Title level={2} style={{ color: "#fff", margin: "6px 0 0" }}>
            Shipping
          </Title>
          <Text type="secondary">
            Manage shipping costs and free-delivery thresholds by location.
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={openCreate}
        >
          Add shipping rule
        </Button>
      </div>

      <Card styles={{ body: { padding: 18 } }}>
        <Table<ShippingRule>
          rowKey="_id"
          columns={columns}
          dataSource={rules}
          loading={rulesQuery.isLoading}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
        />
        {rulesQuery.isError && (
          <Text type="danger">Shipping rules could not be loaded.</Text>
        )}
      </Card>

      <Modal
        title={editing ? `Edit ${editing.name}` : "Add shipping rule"}
        open={open}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editing ? "Save changes" : "Create rule"}
        confirmLoading={saving}
        width={720}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          style={{ marginTop: 22 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "0 16px",
            }}
          >
            <Form.Item
              label="Rule name"
              name="name"
              rules={[{ required: true, message: "Enter a rule name." }]}
            >
              <Input placeholder="UK standard delivery" />
            </Form.Item>
            <Form.Item
              label="Shipping cost"
              name="rate"
              rules={[{ required: true, message: "Enter a shipping cost." }]}
            >
              <InputNumber min={0} precision={2} prefix="£" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Country" name="country">
              <Input placeholder="United Kingdom" />
            </Form.Item>
            <Form.Item label="City (optional)" name="city">
              <Input placeholder="London" />
            </Form.Item>
            <Form.Item
              label="Free shipping threshold (0 = disabled)"
              name="freeShippingThreshold"
            >
              <InputNumber min={0} precision={2} prefix="£" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Priority" name="priority">
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Default fallback rule" name="isDefault" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Notes" name="notes" style={{ gridColumn: "1 / -1" }}>
              <Input.TextArea rows={3} placeholder="Optional internal notes" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminShippingPage;
