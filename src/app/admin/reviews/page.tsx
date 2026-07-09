"use client";

import { FormEvent, useEffect, useState } from "react";
import { App, Button, Card, Empty, Form, Input, InputNumber, List, Select, Space, Switch, Tag, Typography } from "antd";
import {
  useAdminReviews,
  useDeleteAdminReview,
  useReviewSettings,
  useUpdateAdminReview,
  useUpdateReviewSettings,
} from "@/hooks/useReviews";
import type { ProductReview, ReviewStatus } from "@/services/review.service";

const { Text, Title } = Typography;

const statusColor: Record<ReviewStatus, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const getProductTitle = (review: ProductReview) => {
  return typeof review.product === "object" ? review.product.title || "Product" : "Product";
};

const AdminReviewsPage = () => {
  const { message, modal } = App.useApp();
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<ProductReview | null>(null);
  const [form] = Form.useForm();

  const reviewsQuery = useAdminReviews(status);
  const settingsQuery = useReviewSettings();
  const updateSettings = useUpdateReviewSettings();
  const updateReview = useUpdateAdminReview();
  const deleteReview = useDeleteAdminReview();

  const reviews = reviewsQuery.data?.data || [];
  const requireApproval = settingsQuery.data?.data?.requireApproval !== false;

  useEffect(() => {
    if (!editing) return;
    form.setFieldsValue({
      status: editing.status,
      rating: editing.rating,
      title: editing.title || "",
      comment: editing.comment,
    });
  }, [editing, form]);

  const quickStatus = async (review: ProductReview, nextStatus: ReviewStatus) => {
    await updateReview.mutateAsync({ id: review._id, payload: { status: nextStatus } });
    message.success(`Review ${nextStatus}`);
  };

  const saveEdit = async (values: { status: ReviewStatus; rating: number; title?: string; comment: string }) => {
    if (!editing) return;
    await updateReview.mutateAsync({ id: editing._id, payload: values });
    message.success("Review updated");
    setEditing(null);
  };

  const removeReview = (review: ProductReview) => {
    modal.confirm({
      title: "Delete review?",
      content: "This will permanently remove the review and recalculate product rating.",
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteReview.mutateAsync(review._id);
        message.success("Review deleted");
      },
    });
  };

  const toggleApproval = async (checked: boolean) => {
    await updateSettings.mutateAsync({ requireApproval: checked });
    message.success(checked ? "Approval required for new reviews" : "Eligible buyer reviews publish instantly");
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>Reviews</Title>
            <Text type="secondary">Approve, edit, reject or delete verified purchase reviews.</Text>
          </div>
          <Space wrap>
            <Text>Require admin approval</Text>
            <Switch checked={requireApproval} onChange={toggleApproval} loading={updateSettings.isPending} />
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 150 }}
              options={[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
            />
            <Button onClick={() => reviewsQuery.refetch()} loading={reviewsQuery.isFetching}>Refresh</Button>
          </Space>
        </Space>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: editing ? "1fr 420px" : "1fr", gap: 24 }}>
        <Card>
          <List
            loading={reviewsQuery.isLoading}
            dataSource={reviews}
            locale={{ emptyText: <Empty description="No reviews found" /> }}
            renderItem={(review) => (
              <List.Item
                actions={[
                  <Button key="approve" type="link" onClick={() => quickStatus(review, "approved")}>Approve</Button>,
                  <Button key="reject" type="link" danger onClick={() => quickStatus(review, "rejected")}>Reject</Button>,
                  <Button key="edit" onClick={() => setEditing(review)}>Edit</Button>,
                  <Button key="delete" danger onClick={() => removeReview(review)}>Delete</Button>,
                ]}
              >
                <List.Item.Meta
                  title={(
                    <Space wrap>
                      <span>{getProductTitle(review)}</span>
                      <Tag color={statusColor[review.status]}>{review.status}</Tag>
                      {review.isVerifiedPurchase && <Tag color="blue">Verified purchase</Tag>}
                    </Space>
                  )}
                  description={(
                    <div>
                      <div><strong>{review.rating}/5</strong> {review.title || "Review"}</div>
                      <div>{review.comment}</div>
                      <Text type="secondary">{review.customerName || "Customer"}</Text>
                    </div>
                  )}
                />
              </List.Item>
            )}
          />
        </Card>

        {editing && (
          <Card title="Edit review" extra={<Button onClick={() => setEditing(null)}>Close</Button>}>
            <Form form={form} layout="vertical" onFinish={saveEdit}>
              <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                <Select options={[
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ]} />
              </Form.Item>
              <Form.Item label="Rating" name="rating" rules={[{ required: true }]}>
                <InputNumber min={1} max={5} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Title" name="title">
                <Input />
              </Form.Item>
              <Form.Item label="Comment" name="comment" rules={[{ required: true, min: 5 }]}>
                <Input.TextArea rows={5} />
              </Form.Item>
              <Button htmlType="submit" type="primary" loading={updateReview.isPending}>Save review</Button>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
