"use client";

import { useEffect, useState } from "react";
import { App, Button, Card, Form, Input, Switch } from "antd";
import { useAdminSettings, useUpdateStoreSettings } from "@/hooks/useSettings";
import { ImageUploader } from "@/components/Admin/ImageUploader";
import { uploadContentImage, UploadedImage } from "@/services/upload.service";

export default function AdminSiteContentPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const settingsQuery = useAdminSettings();
  const updateSettings = useUpdateStoreSettings();
  const settings = settingsQuery.data?.data;
  const [popupImage, setPopupImage] = useState<UploadedImage | null>(null);
  const [iconImage, setIconImage] = useState<UploadedImage | null>(null);

  useEffect(() => {
    if (!settings) return;
    form.setFieldsValue({ seo: settings.seo, popupBanner: settings.popupBanner || { enabled: false } });
    if (settings.popupBanner?.imageUrl) setPopupImage({ url: settings.popupBanner.imageUrl, publicId: settings.popupBanner.imagePublicId || "" });
    if (settings.seo?.siteIconUrl) setIconImage({ url: settings.seo.siteIconUrl, publicId: settings.seo.siteIconPublicId || "" });
  }, [settings, form]);

  const handleIconChange = (image: UploadedImage | null) => {
    setIconImage(image);
    form.setFieldsValue({ seo: { ...form.getFieldValue("seo"), siteIconUrl: image?.url || "", siteIconPublicId: image?.publicId || "" } });
  };

  const handlePopupChange = (image: UploadedImage | null) => {
    setPopupImage(image);
    form.setFieldsValue({ popupBanner: { ...form.getFieldValue("popupBanner"), imageUrl: image?.url || "", imagePublicId: image?.publicId || "" } });
  };

  const submit = async (values: { seo: Record<string, string>; popupBanner: Record<string, unknown> }) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        storeName: settings.storeName,
        storeTagline: settings.storeTagline || "",
        supportEmail: settings.supportEmail || "",
        supportPhone: settings.supportPhone || "",
        whatsappPhone: settings.whatsappPhone || "",
        address: settings.address || "",
        currency: settings.currency,
        tax: settings.tax,
        shippingDefaults: settings.shippingDefaults,
        socialLinks: settings.socialLinks,
        announcement: settings.announcement,
        seo: { ...settings.seo, ...values.seo },
        popupBanner: { ...settings.popupBanner, ...values.popupBanner },
      });
      message.success("SEO and popup settings saved");
    } catch (error) {
      message.error((error as Error).message || "Settings could not be saved");
    }
  };

  return <div style={{ maxWidth: 1100, margin: "0 auto" }}><Form form={form} layout="vertical" onFinish={submit}><Card title="SEO Content" loading={settingsQuery.isLoading} style={{ marginBottom: 18 }}><Form.Item label="Website title" name={["seo", "metaTitle"]}><Input /></Form.Item><Form.Item label="Website description" name={["seo", "metaDescription"]}><Input.TextArea rows={3} /></Form.Item><Form.Item label="Website icon"><ImageUploader value={iconImage} onChange={handleIconChange} upload={async (file) => (await uploadContentImage(file)).data} height={150} hint="Favicon / site icon — square PNG works best" /></Form.Item><Form.Item name={["seo", "siteIconUrl"]} hidden><Input /></Form.Item><Form.Item name={["seo", "siteIconPublicId"]} hidden><Input /></Form.Item></Card><Card title="Home Popup Banner" loading={settingsQuery.isLoading}><Form.Item label="Enable popup" name={["popupBanner", "enabled"]} valuePropName="checked"><Switch /></Form.Item><Form.Item label="Popup image"><ImageUploader value={popupImage} onChange={handlePopupChange} upload={async (file) => (await uploadContentImage(file)).data} height={220} hint="Home popup banner — PNG, JPG, WEBP up to 5MB" /></Form.Item><Form.Item label="Alt text" name={["popupBanner", "altText"]}><Input /></Form.Item><Form.Item name={["popupBanner", "imageUrl"]} hidden><Input /></Form.Item><Form.Item name={["popupBanner", "imagePublicId"]} hidden><Input /></Form.Item></Card><Button type="primary" htmlType="submit" loading={updateSettings.isPending} style={{ marginTop: 18 }}>Save Site Content</Button></Form></div>;
}
