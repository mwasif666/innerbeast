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

import { useCategories } from "@/hooks/useCategories";
import {
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/hooks/useAdminProducts";
import { useUploadMultipleImages } from "@/hooks/useUploads";
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
  sku: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images?: ProductImage[];
  sizes?: string[];
  colorsText?: string;
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

const buildPayload = (values: ProductFormValues): ProductPayload => {
  const colors = parseCommaValues(values.colorsText).map((color) => ({
    name: color,
    hex: "",
  }));

  const tags = parseCommaValues(values.tagsText).map((tag) =>
    tag.toLowerCase(),
  );

  return {
    title: values.title,
    slug: values.slug || undefined,
    sku: values.sku,
    description: values.description,
    category: values.category,
    price: Number(values.price),
    discountPrice: Number(values.discountPrice || 0),
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

  const watchedImages = Form.useWatch("images", form) || [];

  const products = productsQuery.data?.data || [];
  const categories = categoriesQuery.data?.data || [];

  const filteredProducts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return products;

    return products.filter((product) => {
      return (
        product.title?.toLowerCase().includes(searchValue) ||
        product.sku?.toLowerCase().includes(searchValue) ||
        product.category?.name?.toLowerCase().includes(searchValue)
      );
    });
  }, [products, search]);

  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      images: [],
      sizes: [],
      fitType: "Regular",
      gender: "Unisex",
      stock: 0,
      discountPrice: 0,
      isFeatured: false,
      isNewArrival: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    form.setFieldsValue({
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      category: product.category?._id,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      stock: product.stock || 0,
      images: product.images || [],
      sizes: product.sizes || [],
      colorsText: product.colors?.map((color) => color.name).join(", ") || "",
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

  const handleImagesUpload = async (files: File[]) => {
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      message.error("Only image files are allowed.");
      return;
    }

    const overSizedImage = validImages.find(
      (file) => file.size / 1024 / 1024 >= 5,
    );

    if (overSizedImage) {
      message.error("Each image must be smaller than 5MB.");
      return;
    }

    try {
      const response = await uploadImagesMutation.mutateAsync(validImages);

      const currentImages = form.getFieldValue("images") || [];
      const uploadedImages = response.data.map((image) => ({
        url: image.url,
        publicId: image.publicId,
        alt: form.getFieldValue("title") || "",
      }));

      form.setFieldsValue({
        images: [...currentImages, ...uploadedImages].slice(0, 5),
      });

      message.success("Images uploaded successfully.");
    } catch {
      message.error("Failed to upload images.");
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    const currentImages = form.getFieldValue("images") || [];

    form.setFieldsValue({
      images: currentImages.filter((image) => image.url !== imageUrl),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildPayload(values);

      if (!payload.images || payload.images.length === 0) {
        message.error("Please upload at least one product image.");
        return;
      }

      if (payload.discountPrice && payload.discountPrice >= payload.price) {
        message.error("Discount price must be less than product price.");
        return;
      }

      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct._id,
          payload,
        });

        message.success("Product updated successfully.");
      } else {
        await createProductMutation.mutateAsync(payload);
        message.success("Product created successfully.");
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
              background: "rgba(96,165,250,0.12)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              placeItems: "center",
              color: "#93c5fd",
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
            <div style={{ color: "#fff", fontWeight: 600 }}>
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
          <div style={{ color: "#fff", fontWeight: 600 }}>
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
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 7,
            }}
          >
            Catalog management
          </div>

          <Title level={2} style={{ margin: 0, color: "#fff" }}>
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
            prefix={
              <SearchOutlined style={{ color: "rgba(255,255,255,0.4)" }} />
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
          scroll={{ x: 1100 }}
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
        width={860}
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
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <Form.Item
              label="SKU"
              name="sku"
              rules={[{ required: true, message: "SKU is required" }]}
            >
              <Input placeholder="IB-TSHIRT-001" />
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
              placeholder="Select category"
              loading={categoriesQuery.isLoading}
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

            <Form.Item label="Discount Price" name="discountPrice">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Stock"
              name="stock"
              rules={[{ required: true, message: "Stock is required" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item label="Product Images" required>
            <Upload
              accept="image/*"
              multiple
              maxCount={5}
              showUploadList={false}
              beforeUpload={(file, fileList) => {
                handleImagesUpload(fileList as File[]);
                return Upload.LIST_IGNORE;
              }}
              disabled={uploadImagesMutation.isPending}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadImagesMutation.isPending}
              >
                {uploadImagesMutation.isPending
                  ? "Uploading..."
                  : "Upload Images"}
              </Button>
            </Upload>

            <Form.Item name="images" hidden>
              <Input />
            </Form.Item>

            {watchedImages.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                {watchedImages.map((image) => (
                  <div
                    key={image.url}
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ height: 92, background: "#111" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.alt || "Product image"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    <Button
                      block
                      danger
                      type="text"
                      size="small"
                      onClick={() => handleRemoveImage(image.url)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Item>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
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

            <Form.Item label="Colors" name="colorsText">
              <Input placeholder="Black, White, Grey" />
            </Form.Item>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <Form.Item label="Fit Type" name="fitType">
              <Select
                options={FIT_TYPE_OPTIONS.map((fitType) => ({
                  label: fitType,
                  value: fitType,
                }))}
              />
            </Form.Item>

            <Form.Item label="Gender" name="gender">
              <Select
                options={GENDER_OPTIONS.map((gender) => ({
                  label: gender,
                  value: gender,
                }))}
              />
            </Form.Item>
          </div>

          <Form.Item label="Material" name="material">
            <Input placeholder="Cotton blend, polyester, etc." />
          </Form.Item>

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
