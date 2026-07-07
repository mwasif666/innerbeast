"use client";

import { CSSProperties, useEffect } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
  Space,
  Switch,
  Typography,
} from "antd";
import {
  SaveOutlined,
  SettingOutlined,
  ShopOutlined,
  CustomerServiceOutlined,
  ShareAltOutlined,
  SearchOutlined,
  NotificationOutlined,
  TruckOutlined,
} from "@ant-design/icons";

import { useAdminSettings, useUpdateStoreSettings } from "@/hooks/useSettings";
import type { StoreSettingsPayload } from "@/services/settings.service";

const { Title, Text } = Typography;

type SettingsFormValues = StoreSettingsPayload;

const defaultValues: SettingsFormValues = {
  storeName: "Inner Beast",
  storeTagline: "",
  supportEmail: "",
  supportPhone: "",
  whatsappPhone: "",
  address: "",
  currency: {
    code: "PKR",
    symbol: "Rs.",
    position: "before",
  },
  tax: {
    enabled: false,
    label: "Tax",
    rate: 0,
    pricesIncludeTax: false,
  },
  shippingDefaults: {
    country: "Pakistan",
    city: "",
    fallbackRate: 0,
    freeShippingThreshold: 0,
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    x: "",
    threads: "",
    linkedin: "",
  },
  seo: {
    metaTitle: "Inner Beast",
    metaDescription: "",
  },
  announcement: {
    enabled: false,
    text: "",
  },
};

const cardBodyStyle: CSSProperties = {
  padding: 22,
};

const sectionTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 18,
};

const buildPayload = (values: SettingsFormValues): SettingsFormValues => {
  return {
    storeName: values.storeName?.trim() || "Inner Beast",
    storeTagline: values.storeTagline?.trim() || "",
    supportEmail: values.supportEmail?.trim().toLowerCase() || "",
    supportPhone: values.supportPhone?.trim() || "",
    whatsappPhone: values.whatsappPhone?.trim() || "",
    address: values.address?.trim() || "",

    currency: {
      code: values.currency?.code?.trim().toUpperCase() || "PKR",
      symbol: values.currency?.symbol?.trim() || "Rs.",
      position: values.currency?.position || "before",
    },

    tax: {
      enabled: values.tax?.enabled === true,
      label: values.tax?.label?.trim() || "Tax",
      rate: Number(values.tax?.rate || 0),
      pricesIncludeTax: values.tax?.pricesIncludeTax === true,
    },

    shippingDefaults: {
      country: values.shippingDefaults?.country?.trim() || "Pakistan",
      city: values.shippingDefaults?.city?.trim() || "",
      fallbackRate: Number(values.shippingDefaults?.fallbackRate || 0),
      freeShippingThreshold: Number(
        values.shippingDefaults?.freeShippingThreshold || 0,
      ),
    },

    socialLinks: {
      facebook: values.socialLinks?.facebook?.trim() || "",
      instagram: values.socialLinks?.instagram?.trim() || "",
      tiktok: values.socialLinks?.tiktok?.trim() || "",
      youtube: values.socialLinks?.youtube?.trim() || "",
      x: values.socialLinks?.x?.trim() || "",
      threads: values.socialLinks?.threads?.trim() || "",
      linkedin: values.socialLinks?.linkedin?.trim() || "",
    },

    seo: {
      metaTitle: values.seo?.metaTitle?.trim() || "",
      metaDescription: values.seo?.metaDescription?.trim() || "",
    },

    announcement: {
      enabled: values.announcement?.enabled === true,
      text: values.announcement?.text?.trim() || "",
    },
  };
};

const AdminSettingsPage = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<SettingsFormValues>();

  const settingsQuery = useAdminSettings();
  const updateMutation = useUpdateStoreSettings();

  const settings = settingsQuery.data?.data;

  useEffect(() => {
    if (!settings) return;

    form.setFieldsValue({
      ...defaultValues,
      ...settings,
      currency: {
        ...defaultValues.currency,
        ...settings.currency,
      },
      tax: {
        ...defaultValues.tax,
        ...settings.tax,
      },
      shippingDefaults: {
        ...defaultValues.shippingDefaults,
        ...settings.shippingDefaults,
      },
      socialLinks: {
        ...defaultValues.socialLinks,
        ...settings.socialLinks,
      },
      seo: {
        ...defaultValues.seo,
        ...settings.seo,
      },
      announcement: {
        ...defaultValues.announcement,
        ...settings.announcement,
      },
    });
  }, [form, settings]);

  const resetToSavedSettings = () => {
    if (!settings) {
      form.setFieldsValue(defaultValues);
      return;
    }

    form.setFieldsValue({
      ...defaultValues,
      ...settings,
      currency: {
        ...defaultValues.currency,
        ...settings.currency,
      },
      tax: {
        ...defaultValues.tax,
        ...settings.tax,
      },
      shippingDefaults: {
        ...defaultValues.shippingDefaults,
        ...settings.shippingDefaults,
      },
      socialLinks: {
        ...defaultValues.socialLinks,
        ...settings.socialLinks,
      },
      seo: {
        ...defaultValues.seo,
        ...settings.seo,
      },
      announcement: {
        ...defaultValues.announcement,
        ...settings.announcement,
      },
    });
  };

  const submit = async (values: SettingsFormValues) => {
    try {
      await updateMutation.mutateAsync(buildPayload(values));
      message.success("Store settings updated successfully.");
    } catch (error) {
      message.error(
        (error as Error).message || "Store settings could not be updated.",
      );
    }
  };

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
              color: "var(--adm-accent)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            Global configuration
          </div>

          <Title level={2} style={{ color: "var(--adm-text)", margin: "6px 0 0" }}>
            Store Settings
          </Title>

          <Text type="secondary">
            Manage store identity, support details, currency, tax, shipping
            defaults, social links and SEO.
          </Text>
        </div>

        <Space>
          <Button
            onClick={resetToSavedSettings}
            disabled={updateMutation.isPending}
          >
            Reset
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
            onClick={() => form.submit()}
          >
            Save settings
          </Button>
        </Space>
      </div>

      {settingsQuery.isLoading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <Form<SettingsFormValues>
          form={form}
          layout="vertical"
          initialValues={defaultValues}
          onFinish={submit}
        >
          <Row gutter={[18, 18]}>
            <Col xs={24} xl={12}>
              <Card styles={{ body: cardBodyStyle }}>
                <div style={sectionTitleStyle}>
                  <ShopOutlined style={{ color: "var(--adm-accent)" }} />
                  <Title level={4} style={{ color: "var(--adm-text)", margin: 0 }}>
                    Store identity
                  </Title>
                </div>

                <Form.Item
                  label="Store name"
                  name="storeName"
                  rules={[
                    { required: true, message: "Store name is required." },
                  ]}
                >
                  <Input placeholder="Inner Beast" />
                </Form.Item>

                <Form.Item label="Store tagline" name="storeTagline">
                  <Input placeholder="Built for the beast within." />
                </Form.Item>

                <Form.Item label="Address" name="address">
                  <Input.TextArea rows={3} placeholder="Store address" />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} xl={12}>
              <Card styles={{ body: cardBodyStyle }}>
                <div style={sectionTitleStyle}>
                  <CustomerServiceOutlined style={{ color: "var(--adm-accent)" }} />
                  <Title level={4} style={{ color: "var(--adm-text)", margin: 0 }}>
                    Support details
                  </Title>
                </div>

                <Form.Item
                  label="Support email"
                  name="supportEmail"
                  rules={[
                    {
                      type: "email",
                      message: "Enter a valid support email.",
                    },
                  ]}
                >
                  <Input placeholder="support@innerbeast.com" />
                </Form.Item>

                <Form.Item label="Support phone" name="supportPhone">
                  <Input placeholder="+92 300 0000000" />
                </Form.Item>

                <Form.Item label="WhatsApp phone" name="whatsappPhone">
                  <Input placeholder="+92 300 0000000" />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} xl={12}>
              <Card styles={{ body: cardBodyStyle }}>
                <div style={sectionTitleStyle}>
                  <SettingOutlined style={{ color: "var(--adm-accent)" }} />
                  <Title level={4} style={{ color: "var(--adm-text)", margin: 0 }}>
                    Currency & tax
                  </Title>
                </div>

                <Row gutter={14}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Currency code"
                      name={["currency", "code"]}
                      rules={[
                        {
                          required: true,
                          message: "Currency code is required.",
                        },
                      ]}
                    >
                      <Input placeholder="PKR" maxLength={5} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Currency symbol"
                      name={["currency", "symbol"]}
                      rules={[
                        {
                          required: true,
                          message: "Currency symbol is required.",
                        },
                      ]}
                    >
                      <Input placeholder="Rs." maxLength={10} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Symbol position"
                      name={["currency", "position"]}
                    >
                      <Select
                        options={[
                          { value: "before", label: "Before amount" },
                          { value: "after", label: "After amount" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={14}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Tax enabled"
                      name={["tax", "enabled"]}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item label="Tax label" name={["tax", "label"]}>
                      <Input placeholder="Tax" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item label="Tax rate %" name={["tax", "rate"]}>
                      <InputNumber
                        min={0}
                        max={100}
                        precision={2}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Prices include tax"
                  name={["tax", "pricesIncludeTax"]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} xl={12}>
              <Card styles={{ body: cardBodyStyle }}>
                <div style={sectionTitleStyle}>
                  <TruckOutlined style={{ color: "var(--adm-accent)" }} />
                  <Title level={4} style={{ color: "var(--adm-text)", margin: 0 }}>
                    Shipping defaults
                  </Title>
                </div>

                <Row gutter={14}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Default country"
                      name={["shippingDefaults", "country"]}
                    >
                      <Input placeholder="Pakistan" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Default city"
                      name={["shippingDefaults", "city"]}
                    >
                      <Input placeholder="Optional" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Fallback shipping rate"
                      name={["shippingDefaults", "fallbackRate"]}
                    >
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Free shipping threshold"
                      name={["shippingDefaults", "freeShippingThreshold"]}
                    >
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24}>
              <Card styles={{ body: cardBodyStyle }}>
                <div style={sectionTitleStyle}>
                  <ShareAltOutlined style={{ color: "var(--adm-accent)" }} />
                  <Title level={4} style={{ color: "var(--adm-text)", margin: 0 }}>
                    Social links
                  </Title>
                </div>

                <Row gutter={14}>
                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      label="Facebook"
                      name={["socialLinks", "facebook"]}
                    >
                      <Input placeholder="https://facebook.com/..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      label="Instagram"
                      name={["socialLinks", "instagram"]}
                    >
                      <Input placeholder="https://instagram.com/..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item label="TikTok" name={["socialLinks", "tiktok"]}>
                      <Input placeholder="https://tiktok.com/..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      label="YouTube"
                      name={["socialLinks", "youtube"]}
                    >
                      <Input placeholder="https://youtube.com/..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item label="X / Twitter" name={["socialLinks", "x"]}>
                      <Input placeholder="https://x.com/..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      label="Threads"
                      name={["socialLinks", "threads"]}
                    >
                      <Input placeholder="https://threads.net/..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} xl={8}>
                    <Form.Item
                      label="LinkedIn"
                      name={["socialLinks", "linkedin"]}
                    >
                      <Input placeholder="https://linkedin.com/..." />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} xl={12}>
              <Card styles={{ body: cardBodyStyle }}>
                <div style={sectionTitleStyle}>
                  <SearchOutlined style={{ color: "var(--adm-accent)" }} />
                  <Title level={4} style={{ color: "var(--adm-text)", margin: 0 }}>
                    SEO
                  </Title>
                </div>

                <Form.Item label="Meta title" name={["seo", "metaTitle"]}>
                  <Input placeholder="Inner Beast" maxLength={120} />
                </Form.Item>

                <Form.Item
                  label="Meta description"
                  name={["seo", "metaDescription"]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Short store description"
                    maxLength={240}
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} xl={12}>
              <Card styles={{ body: cardBodyStyle }}>
                <div style={sectionTitleStyle}>
                  <NotificationOutlined style={{ color: "var(--adm-accent)" }} />
                  <Title level={4} style={{ color: "var(--adm-text)", margin: 0 }}>
                    Announcement bar
                  </Title>
                </div>

                <Form.Item
                  label="Enable announcement"
                  name={["announcement", "enabled"]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Announcement text"
                  name={["announcement", "text"]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="New customers save 10% with code GET10"
                    maxLength={180}
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {settingsQuery.isError && (
            <Text type="danger" style={{ display: "block", marginTop: 16 }}>
              Store settings could not be loaded.
            </Text>
          )}
        </Form>
      )}
    </div>
  );
};

export default AdminSettingsPage;
