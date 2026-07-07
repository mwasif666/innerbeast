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
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";
import { useUploadSingleImage } from "@/hooks/useUploads";
import { Category, CategoryPayload } from "@/services/category.service";

const { Title, Text } = Typography;
const { TextArea } = Input;

type CategoryFormValues = {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  isActive?: boolean;
  sortOrder?: number;
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const buildPayload = (values: CategoryFormValues): CategoryPayload => {
  return {
    name: values.name,
    slug: values.slug || undefined,
    description: values.description || "",
    isActive: values.isActive ?? true,
    sortOrder: values.sortOrder ?? 0,
    image: {
      url: values.imageUrl || "",
      publicId: values.imagePublicId || "",
    },
  };
};

const AdminCategoriesPage = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<CategoryFormValues>();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const categoriesQuery = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const uploadImageMutation = useUploadSingleImage();

  const imagePreviewUrl = Form.useWatch("imageUrl", form);

  const categories = categoriesQuery.data?.data || [];

  const filteredCategories = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return categories;

    return categories.filter((category) => {
      return (
        category.name?.toLowerCase().includes(searchValue) ||
        category.slug?.toLowerCase().includes(searchValue) ||
        category.description?.toLowerCase().includes(searchValue)
      );
    });
  }, [categories, search]);

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      sortOrder: 0,
      imageUrl: "",
      imagePublicId: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);

    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.image?.url || "",
      imagePublicId: category.image?.publicId || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleImageUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");

    if (!isImage) {
      message.error("Please upload a valid image file.");
      return false;
    }

    const isUnderFiveMb = file.size / 1024 / 1024 < 5;

    if (!isUnderFiveMb) {
      message.error("Image must be smaller than 5MB.");
      return false;
    }

    try {
      const response = await uploadImageMutation.mutateAsync(file);

      form.setFieldsValue({
        imageUrl: response.data.url,
        imagePublicId: response.data.publicId,
      });

      message.success("Image uploaded successfully.");
    } catch {
      message.error("Failed to upload image.");
    }

    return false;
  };

  const handleRemoveImage = () => {
    form.setFieldsValue({
      imageUrl: "",
      imagePublicId: "",
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildPayload(values);

      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory._id,
          payload,
        });

        message.success("Category updated successfully.");
      } else {
        await createCategoryMutation.mutateAsync(payload);
        message.success("Category created successfully.");
      }

      closeModal();
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        return;
      }

      message.error(
        editingCategory
          ? "Failed to update category."
          : "Failed to create category.",
      );
    }
  };

  const handleDelete = (category: Category) => {
    modal.confirm({
      title: "Delete Category",
      content: `Are you sure you want to delete ${category.name}? This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCategoryMutation.mutateAsync(category._id);
          message.success("Category deleted successfully.");
        } catch {
          message.error("Failed to delete category.");
        }
      },
    });
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Category",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, category) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              overflow: "hidden",
              background: "var(--adm-accent-soft)",
              border: "1px solid var(--adm-border)",
              display: "grid",
              placeItems: "center",
              color: "#93c5fd",
              fontWeight: 700,
            }}
          >
            {category.image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.image.url}
                alt={category.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              category.name?.slice(0, 2).toUpperCase()
            )}
          </div>

          <div style={{ lineHeight: 1.3 }}>
            <div style={{ color: "var(--adm-text)", fontWeight: 600 }}>
              {category.name}
            </div>
            <Text type="secondary" style={{ fontSize: 12.5 }}>
              /{category.slug}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
      render: (description?: string) => (
        <Text type="secondary">{description || "-"}</Text>
      ),
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
      title: "Sort",
      dataIndex: "sortOrder",
      sorter: (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
      render: (sortOrder: number) => (
        <Text type="secondary">{sortOrder || 0}</Text>
      ),
    },
    {
      title: "Created",
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
      render: (_, category) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => openEditModal(category)}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Button
              type="text"
              shape="circle"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(category)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const saving =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    uploadImageMutation.isPending;

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
            Catalog management
          </div>

          <Title level={2} style={{ margin: 0, color: "var(--adm-text)" }}>
            Categories
          </Title>

          <Text type="secondary">Create and organize product categories.</Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Add Category
        </Button>
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
            prefix={
              <SearchOutlined style={{ color: "var(--adm-text-3)" }} />
            }
            placeholder="Search by name, slug or description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ maxWidth: 440 }}
          />

          <Text type="secondary" style={{ fontSize: 13 }}>
            {filteredCategories.length} results
          </Text>
        </div>

        <Table<Category>
          rowKey="_id"
          columns={columns}
          dataSource={filteredCategories}
          loading={categoriesQuery.isLoading}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: [8, 16, 24],
            showTotal: (total, range) =>
              `Showing ${range[0]}–${range[1]} of ${total}`,
          }}
          locale={{ emptyText: "No categories found." }}
        />
      </Card>

      {categoriesQuery.isError && (
        <Text type="danger" style={{ display: "block", marginTop: 16 }}>
          Failed to load categories.
        </Text>
      )}

      <Modal
        title={editingCategory ? "Edit Category" : "Create Category"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingCategory ? "Save Changes" : "Create Category"}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Category name is required",
              },
              {
                max: 60,
                message: "Category name cannot exceed 60 characters",
              },
            ]}
          >
            <Input placeholder="Example: T-Shirts" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="Auto generated if empty" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                max: 500,
                message: "Description cannot exceed 500 characters",
              },
            ]}
          >
            <TextArea rows={3} placeholder="Short category description" />
          </Form.Item>

          <Form.Item label="Category Image">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                beforeUpload={handleImageUpload}
                disabled={uploadImageMutation.isPending}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploadImageMutation.isPending}
                >
                  {uploadImageMutation.isPending
                    ? "Uploading..."
                    : "Upload from PC"}
                </Button>
              </Upload>

              {imagePreviewUrl && (
                <Button danger onClick={handleRemoveImage}>
                  Remove Image
                </Button>
              )}
            </div>

            {imagePreviewUrl && (
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 10,
                  border: "1px solid var(--adm-border)",
                  borderRadius: 12,
                  background: "var(--adm-wash)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "var(--adm-wash)",
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreviewUrl}
                    alt="Category preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <Text style={{ display: "block", color: "var(--adm-text)" }}>
                    Image uploaded
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      fontSize: 12,
                      wordBreak: "break-all",
                    }}
                  >
                    {imagePreviewUrl}
                  </Text>
                </div>
              </div>
            )}
          </Form.Item>

          <Form.Item label="Image URL" name="imageUrl">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="Image Public ID" name="imagePublicId">
            <Input placeholder="Cloudinary public ID optional" />
          </Form.Item>

          <Form.Item label="Sort Order" name="sortOrder">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
