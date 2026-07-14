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
  Radio,
  Select,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useCategories } from "@/hooks/useCategories";
import {
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/hooks/useAdminProducts";
import { useUploadMultipleImages } from "@/hooks/useUploads";
import { MultiImageUploader } from "@/components/Admin/ImageUploader";
import {
  Product,
  ProductImage,
  ProductPayload,
} from "@/services/admin-product.service";

const { Title, Text } = Typography;
const { TextArea } = Input;

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const FIT_TYPE_OPTIONS = [
  "Oversized",
  "Regular",
  "Slim",
  "Compression",
  "Relaxed",
];

const GENDER_OPTIONS = ["Men", "Women", "Unisex"];

type ProductFormValues = {
  title: string;
  slug?: string;
  sku?: string;
  description: string;
  category: string;
  price: number;
  discountType?: "fixed" | "percentage";
  discountPrice?: number;
  discountPercentage?: number;
  stock: number;
  images?: ProductImage[];
  sizes?: string[];
  colors?: {
    name?: string;
    hex?: string;
  }[];
  fitType?: string;
  gender?: string;
  material?: string;
  tagsText?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
};

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return "-";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const parseCommaValues = (value?: string) => {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const createSlug = (text?: string) => {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const generateSku = (title?: string, categoryName?: string) => {
  const titlePart = createSlug(title)
    .slice(0, 10)
    .replace(/-/g, "")
    .toUpperCase();

  const categoryPart = createSlug(categoryName)
    .slice(0, 6)
    .replace(/-/g, "")
    .toUpperCase();

  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `IB-${categoryPart || "PROD"}-${titlePart || "ITEM"}-${randomPart}`;
};

const calculateDiscountPrice = (values: ProductFormValues) => {
  const price = Number(values.price || 0);

  if (!price) return 0;

  if (values.discountType === "percentage") {
    const percentage = Number(values.discountPercentage || 0);

    if (!percentage) return 0;

    return Math.round(price - (price * percentage) / 100);
  }

  return Number(values.discountPrice || 0);
};

const buildPayload = (
  values: ProductFormValues,
  categories: { _id: string; name: string }[],
  editingProduct?: Product | null,
): ProductPayload => {
  const selectedCategory = categories.find(
    (category) => category._id === values.category,
  );

  const colors =
    values.colors
      ?.filter((color) => color.name?.trim() || color.hex?.trim())
      .map((color, index) => {
        const hex = color.hex?.trim().toLowerCase() || "";

        return {
          name:
            color.name?.trim() ||
            (hex ? hex.toUpperCase() : `Color ${index + 1}`),
          hex,
        };
      }) || [];

  const tags = parseCommaValues(values.tagsText).map((tag) =>
    tag.toLowerCase(),
  );

  const discountPrice = calculateDiscountPrice(values);

  return {
    title: values.title,
    slug: values.slug || undefined,
    sku:
      editingProduct?.sku ||
      values.sku ||
      generateSku(values.title, selectedCategory?.name),
    description: values.description,
    category: values.category,
    price: Number(values.price),
    discountPrice,
    stock: Number(values.stock || 0),
    images: values.images || [],
    sizes: values.sizes || [],
    colors,
    fitType: values.fitType || "Regular",
    gender: values.gender || "Unisex",
    material: values.material || "",
    tags,
    isFeatured: values.isFeatured ?? false,
    isNewArrival: values.isNewArrival ?? false,
    isActive: values.isActive ?? true,
  };
};

const AdminProductsPage = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<ProductFormValues>();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const productsQuery = useAdminProducts();
  const categoriesQuery = useCategories();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const uploadImagesMutation = useUploadMultipleImages();

  const watchedImages =
    (Form.useWatch("images", { form, preserve: true }) as
      | ProductImage[]
      | undefined) || [];
  const watchedDiscountType = Form.useWatch("discountType", form);
  const watchedTitle = Form.useWatch("title", form);

  const categories = categoriesQuery.data?.data || [];

  const filteredProducts = useMemo(() => {
    const products = productsQuery.data?.data || [];
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return products;

    return products.filter((product) => {
      return (
        product.title?.toLowerCase().includes(searchValue) ||
        product.sku?.toLowerCase().includes(searchValue) ||
        product.category?.name?.toLowerCase().includes(searchValue)
      );
    });
  }, [productsQuery.data?.data, search]);

  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      sku: "",
      images: [],
      sizes: [],
      colors: [{ name: "", hex: "#000000" }],
      fitType: "Regular",
      gender: "Unisex",
      stock: 0,
      discountType: "fixed",
      discountPrice: 0,
      discountPercentage: 0,
      isFeatured: false,
      isNewArrival: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    const percentage =
      product.discountPrice && product.price
        ? Math.round(
            ((product.price - product.discountPrice) / product.price) * 100,
          )
        : 0;

    form.setFieldsValue({
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      category: product.category?._id,
      price: product.price,
      discountType: "fixed",
      discountPrice: product.discountPrice || 0,
      discountPercentage: percentage,
      stock: product.stock || 0,
      images: product.images || [],
      sizes: product.sizes || [],
      colors:
        product.colors && product.colors.length > 0
          ? product.colors.map((color) => ({
              name: color.name,
              hex: color.hex || "#000000",
            }))
          : [{ name: "", hex: "#000000" }],
      fitType: product.fitType || "Regular",
      gender: product.gender || "Unisex",
      material: product.material || "",
      tagsText: product.tags?.join(", ") || "",
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false,
      isActive: product.isActive ?? true,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const validatedValues = await form.validateFields();
      const values: ProductFormValues = {
        ...validatedValues,
        images:
          form.getFieldValue("images") || editingProduct?.images || [],
      };
      const payload = buildPayload(values, categories, editingProduct);

      if (!payload.images || payload.images.length === 0) {
        message.error("Please upload at least one product image.");
        return;
      }

      if (payload.discountPrice && payload.discountPrice >= payload.price) {
        message.error("Discount price must be less than product price.");
        return;
      }

      if (values.discountType === "percentage") {
        const percentage = Number(values.discountPercentage || 0);

        if (percentage < 0 || percentage > 99) {
          message.error("Discount percentage must be between 0 and 99.");
          return;
        }
      }

      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct._id,
          payload,
        });

        message.success("Product updated successfully.");
      } else {
        await createProductMutation.mutateAsync(payload);
        message.success(`Product created successfully. SKU: ${payload.sku}`);
      }

      closeModal();
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        return;
      }

      message.error(
        editingProduct
          ? "Failed to update product."
          : "Failed to create product.",
      );
    }
  };

  const handleDelete = (product: Product) => {
    modal.confirm({
      title: "Disable Product",
      content: `Are you sure you want to disable ${product.title}?`,
      okText: "Disable",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteProductMutation.mutateAsync(product._id);
          message.success("Product disabled successfully.");
        } catch {
          message.error("Failed to disable product.");
        }
      },
    });
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Product",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (_, product) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              overflow: "hidden",
              background: "var(--adm-accent-soft)",
              border: "1px solid var(--adm-border)",
              display: "grid",
              placeItems: "center",
              color: "#e57112",
              fontWeight: 700,
            }}
          >
            {product.images?.[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].url}
                alt={product.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              product.title?.slice(0, 2).toUpperCase()
            )}
          </div>

          <div style={{ lineHeight: 1.3 }}>
            <div style={{ color: "var(--adm-text)", fontWeight: 600 }}>
              {product.title}
            </div>
            <Text type="secondary" style={{ fontSize: 12.5 }}>
              SKU: {product.sku}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      render: (_, product) => (
        <Text type="secondary">{product.category?.name || "-"}</Text>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
      render: (_, product) => (
        <div style={{ lineHeight: 1.4 }}>
          <div style={{ color: "var(--adm-text)", fontWeight: 600 }}>
            {formatPrice(product.discountPrice || product.price)}
          </div>

          {!!product.discountPrice && (
            <Text delete type="secondary" style={{ fontSize: 12 }}>
              {formatPrice(product.price)}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
      render: (stock: number) => (
        <Tag
          color={stock > 0 ? "success" : "error"}
          style={{ borderRadius: 999 }}
        >
          {stock || 0}
        </Tag>
      ),
    },
    {
      title: "Colors",
      dataIndex: "colors",
      render: (_, product) => (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {product.colors && product.colors.length > 0 ? (
            product.colors.slice(0, 4).map((color) => (
              <Tag
                key={`${color.name}-${color.hex}`}
                title={`${color.name}${color.hex ? ` (${color.hex})` : ""}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  margin: 0,
                  borderRadius: 999,
                  background: "var(--adm-wash)",
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: color.hex || "#ffffff",
                    border: "1px solid var(--adm-baseline)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {color.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
    },
    {
      title: "Flags",
      key: "flags",
      render: (_, product) => (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {product.isFeatured && <Tag color="blue">Featured</Tag>}
          {product.isNewArrival && <Tag color="purple">New</Tag>}
          <Tag color={product.isActive ? "success" : "error"}>
            {product.isActive ? "Active" : "Disabled"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (createdAt?: string) => (
        <Text type="secondary">{formatDate(createdAt)}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, product) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => openEditModal(product)}
            />
          </Tooltip>

          <Tooltip title="Disable">
            <Button
              type="text"
              shape="circle"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(product)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const saving =
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    uploadImagesMutation.isPending;

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
            Products
          </Title>

          <Text type="secondary">Create and manage product catalogue.</Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Add Product
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
            placeholder="Search by title, SKU or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ maxWidth: 440 }}
          />

          <Text type="secondary" style={{ fontSize: 13 }}>
            {filteredProducts.length} results
          </Text>
        </div>

        <Table<Product>
          rowKey="_id"
          columns={columns}
          dataSource={filteredProducts}
          loading={productsQuery.isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: [8, 16, 24],
            showTotal: (total, range) =>
              `Showing ${range[0]}–${range[1]} of ${total}`,
          }}
          locale={{ emptyText: "No products found." }}
        />
      </Card>

      {productsQuery.isError && (
        <Text type="danger" style={{ display: "block", marginTop: 16 }}>
          Failed to load products.
        </Text>
      )}

      <Modal
        title={editingProduct ? "Edit Product" : "Create Product"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingProduct ? "Save Changes" : "Create Product"}
        confirmLoading={saving}
        width={900}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Product Title"
            name="title"
            rules={[
              { required: true, message: "Product title is required" },
              { max: 120, message: "Title cannot exceed 120 characters" },
            ]}
          >
            <Input placeholder="Example: Oversized Gym T-Shirt" />
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Form.Item label="SKU" name="sku">
              <Input placeholder="Auto generated on create" disabled />
            </Form.Item>

            <Form.Item label="Slug" name="slug">
              <Input placeholder="Auto generated if empty" />
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Description is required" },
              {
                max: 2000,
                message: "Description cannot exceed 2000 characters",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Product description" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Select
              showSearch
              placeholder="Select category"
              loading={categoriesQuery.isLoading}
              optionFilterProp="label"
              options={categories.map((category) => ({
                label: category.name,
                value: category._id,
              }))}
            />
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14,
            }}
          >
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Price is required" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Discount Type" name="discountType">
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                options={[
                  { label: "Fixed", value: "fixed" },
                  { label: "Percentage", value: "percentage" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Stock"
              name="stock"
              rules={[{ required: true, message: "Stock is required" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          {watchedDiscountType === "percentage" ? (
            <Form.Item label="Discount Percentage" name="discountPercentage">
              <InputNumber
                min={0}
                max={99}
                addonAfter="%"
                style={{ width: "100%" }}
              />
            </Form.Item>
          ) : (
            <Form.Item label="Discount Price" name="discountPrice">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          )}

          <Form.Item
            label="Product Images"
            required
            extra="Upload up to 5 images. The order here matches the color order below."
          >
            <MultiImageUploader
              value={watchedImages}
              onChange={(images) => form.setFieldValue("images", images)}
              upload={async (file) => {
                const response = await uploadImagesMutation.mutateAsync([file]);
                return response.data[0];
              }}
              maxCount={5}
              alt={watchedTitle}
              numbered
            />
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Form.Item label="Sizes" name="sizes">
              <Select
                mode="multiple"
                placeholder="Select sizes"
                options={SIZE_OPTIONS.map((size) => ({
                  label: size,
                  value: size,
                }))}
              />
            </Form.Item>

            <Form.Item label="Fit Type" name="fitType">
              <Select
                options={FIT_TYPE_OPTIONS.map((fitType) => ({
                  label: fitType,
                  value: fitType,
                }))}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Colors"
            extra="Product images and colors are matched in the same order."
          >
            <Form.List name="colors">
              {(fields, { add, remove }) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "64px 1fr 64px 150px 42px",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <div
                        title={`Image ${field.name + 1}`}
                        style={{
                          position: "relative",
                          width: 64,
                          height: 42,
                          overflow: "hidden",
                          borderRadius: 8,
                          border: "1px solid var(--adm-border)",
                          background: "var(--adm-wash)",
                          display: "grid",
                          placeItems: "center",
                          color: "var(--adm-text-3)",
                          fontSize: 10,
                        }}
                      >
                        {watchedImages[field.name]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={watchedImages[field.name].url}
                            alt={
                              watchedImages[field.name].alt ||
                              `Product image ${field.name + 1}`
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          "No image"
                        )}

                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            left: 3,
                            minWidth: 16,
                            height: 16,
                            padding: "0 4px",
                            borderRadius: 999,
                            background: "rgba(0,0,0,0.72)",
                            color: "#fff",
                            fontSize: 10,
                            lineHeight: "16px",
                            textAlign: "center",
                          }}
                        >
                          {field.name + 1}
                        </span>
                      </div>

                      <Form.Item
                        {...field}
                        name={[field.name, "name"]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Color name (optional)" />
                      </Form.Item>

                      <Form.Item
                        noStyle
                        shouldUpdate={(previousValues, currentValues) =>
                          previousValues.colors?.[field.name]?.hex !==
                          currentValues.colors?.[field.name]?.hex
                        }
                      >
                        {({ getFieldValue }) => (
                          <Input
                            type="color"
                            aria-label="Choose color"
                            value={
                              getFieldValue(["colors", field.name, "hex"]) ||
                              "#000000"
                            }
                            onChange={(event) =>
                              form.setFieldValue(
                                ["colors", field.name, "hex"],
                                event.target.value,
                              )
                            }
                            style={{ padding: 4, height: 32 }}
                          />
                        )}
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "hex"]}
                        rules={[
                          {
                            pattern: /^#[0-9a-fA-F]{6}$/,
                            message: "Use hex format, e.g. #e1e1e3",
                          },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="#e1e1e3" maxLength={7} />
                      </Form.Item>

                      <Button danger onClick={() => remove(field.name)}>
                        ×
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add({ name: "", hex: "#000000" })}
                  >
                    Add Color
                  </Button>
                </div>
              )}
            </Form.List>
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Form.Item label="Gender" name="gender">
              <Select
                options={GENDER_OPTIONS.map((gender) => ({
                  label: gender,
                  value: gender,
                }))}
              />
            </Form.Item>

            <Form.Item label="Material" name="material">
              <Input placeholder="Cotton blend, polyester, etc." />
            </Form.Item>
          </div>

          <Form.Item label="Tags" name="tagsText">
            <Input placeholder="gym, oversized, workout" />
          </Form.Item>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Form.Item
              label="Featured"
              name="isFeatured"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="New Arrival"
              name="isNewArrival"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
