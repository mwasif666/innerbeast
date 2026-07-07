"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useUpdateCoupon,
} from "@/hooks/useCoupons";
import {
  Coupon,
  CouponPayload,
  extractCoupons,
  getCouponExpiry,
  getCouponMaximum,
  getCouponMinimum,
  getCouponType,
  getCouponValue,
} from "@/services/coupon.service";

const { Title, Text } = Typography;
const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

type CouponForm = Omit<CouponPayload, "expiresAt"> & { expiresAt?: string };

const AdminCouponsPage = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<CouponForm>();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [open, setOpen] = useState(false);
  const couponsQuery = useCoupons();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();
  const coupons = useMemo(() => extractCoupons(couponsQuery.data), [couponsQuery.data]);
  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      code: "",
      description: "",
      discountType: "percentage",
      value: 10,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      usageLimit: 0,
      expiresAt: "",
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    const expiry = getCouponExpiry(coupon);
    form.setFieldsValue({
      code: coupon.code,
      description: coupon.description || "",
      discountType: getCouponType(coupon),
      value: getCouponValue(coupon),
      minOrderAmount: getCouponMinimum(coupon),
      maxDiscountAmount: getCouponMaximum(coupon),
      usageLimit: coupon.usageLimit || 0,
      expiresAt: expiry ? new Date(expiry).toISOString().slice(0, 16) : "",
      isActive: coupon.isActive !== false,
    });
    setOpen(true);
  };

  const submit = async (values: CouponForm) => {
    const payload: CouponPayload = {
      ...values,
      code: values.code.trim().toUpperCase(),
      value: Number(values.value),
      minOrderAmount: Number(values.minOrderAmount || 0),
      maxDiscountAmount: Number(values.maxDiscountAmount || 0),
      usageLimit: Number(values.usageLimit || 0),
      expiresAt: values.expiresAt
        ? new Date(values.expiresAt).toISOString()
        : undefined,
      isActive: values.isActive !== false,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, payload });
        message.success("Coupon updated successfully.");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("Coupon created successfully.");
      }
      setOpen(false);
      form.resetFields();
    } catch (error) {
      message.error((error as Error).message || "Coupon could not be saved.");
    }
  };

  const remove = (coupon: Coupon) => {
    modal.confirm({
      title: `Delete ${coupon.code}?`,
      content: "This coupon will no longer be available to customers.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(coupon._id);
          message.success("Coupon deleted successfully.");
        } catch (error) {
          message.error((error as Error).message || "Coupon could not be deleted.");
        }
      },
    });
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: "Code",
      dataIndex: "code",
      render: (code: string) => <strong style={{ color: "var(--adm-text)" }}>{code}</strong>,
    },
    {
      title: "Discount",
      render: (_, coupon) =>
        getCouponType(coupon) === "percentage"
          ? `${getCouponValue(coupon)}%`
          : formatGBP(getCouponValue(coupon)),
    },
    {
      title: "Minimum order",
      render: (_, coupon) => formatGBP(getCouponMinimum(coupon)),
    },
    {
      title: "Usage",
      render: (_, coupon) => `${coupon.usedCount || 0} / ${coupon.usageLimit || "∞"}`,
    },
    {
      title: "Expiry",
      render: (_, coupon) => {
        const value = getCouponExpiry(coupon);
        return value ? new Date(value).toLocaleDateString("en-PK") : "No expiry";
      },
    },
    {
      title: "Status",
      render: (_, coupon) => (
        <Tag color={coupon.isActive === false ? "error" : "success"}>
          {coupon.isActive === false ? "Disabled" : "Active"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      align: "right",
      render: (_, coupon) => (
        <Space>
          <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => openEdit(coupon)} />
          <Button danger type="text" shape="circle" icon={<DeleteOutlined />} onClick={() => remove(coupon)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ color: "var(--adm-warn)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>Promotions</div>
          <Title level={2} style={{ color: "var(--adm-text)", margin: "6px 0 0" }}>Coupons</Title>
          <Text type="secondary">Create and manage storefront discount codes.</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreate}>Add coupon</Button>
      </div>

      <Card styles={{ body: { padding: 18 } }}>
        <Table<Coupon>
          rowKey="_id"
          columns={columns}
          dataSource={coupons}
          loading={couponsQuery.isLoading}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10 }}
        />
        {couponsQuery.isError && <Text type="danger">Coupons could not be loaded.</Text>}
      </Card>

      <Modal
        title={editing ? `Edit ${editing.code}` : "Create coupon"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? "Save changes" : "Create coupon"}
        confirmLoading={saving}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={submit} style={{ marginTop: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0 16px" }}>
            <Form.Item label="Coupon code" name="code" rules={[{ required: true }, { min: 3 }]}>
              <Input placeholder="GET10" style={{ textTransform: "uppercase" }} />
            </Form.Item>
            <Form.Item label="Discount type" name="discountType" rules={[{ required: true }]}>
              <Select options={[{ value: "percentage", label: "Percentage" }, { value: "fixed", label: "Fixed amount" }]} />
            </Form.Item>
            <Form.Item label="Discount value" name="value" rules={[{ required: true }]}>
              <InputNumber min={0.01} precision={2} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Minimum order" name="minOrderAmount">
              <InputNumber min={0} precision={2} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Maximum discount (0 = no cap)" name="maxDiscountAmount">
              <InputNumber min={0} precision={2} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Usage limit (0 = unlimited)" name="usageLimit">
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Expires at" name="expiresAt">
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Description" name="description" style={{ gridColumn: "1 / -1" }}>
              <Input.TextArea rows={3} placeholder="Optional internal description" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCouponsPage;
