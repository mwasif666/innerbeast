"use client";

import { useEffect, useRef, useState } from "react";
import { App, Image, Upload } from "antd";
import type { UploadProps } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  LoadingOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import { UploadedImage } from "@/services/upload.service";

export type GalleryImage = {
  url: string;
  publicId?: string;
  alt?: string;
};

const DEFAULT_MAX_MB = 5;

const validateImage = (
  file: File,
  maxSizeMb: number,
  notifyError: (text: string) => void,
): boolean => {
  if (!file.type.startsWith("image/")) {
    notifyError("Please upload a valid image file.");
    return false;
  }

  if (file.size / 1024 / 1024 >= maxSizeMb) {
    notifyError(`Image must be smaller than ${maxSizeMb}MB.`);
    return false;
  }

  return true;
};

const dropZoneBaseStyle: React.CSSProperties = {
  padding: "26px 16px",
  borderRadius: 14,
  background: "var(--adm-wash)",
};

const overlayButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "none",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  color: "#ffffff",
  fontSize: 15,
  background: "rgba(255,255,255,0.16)",
  backdropFilter: "blur(2px)",
  transition: "background 0.15s ease",
};

const OverlayButton = ({
  icon,
  title,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  danger?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      ...overlayButtonStyle,
      background: danger ? "rgba(229,68,68,0.9)" : overlayButtonStyle.background,
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.background = danger
        ? "#ef4444"
        : "#e57112";
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.background = danger
        ? "rgba(229,68,68,0.9)"
        : "rgba(255,255,255,0.16)";
    }}
  >
    {icon}
  </button>
);

const DropZoneContent = ({
  uploading,
  hint,
  compact,
}: {
  uploading: boolean;
  hint?: string;
  compact?: boolean;
}) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        fontSize: compact ? 26 : 34,
        color: uploading ? "var(--adm-accent)" : "var(--adm-accent)",
        lineHeight: 1,
        marginBottom: 8,
      }}
    >
      {uploading ? <LoadingOutlined /> : <InboxOutlined />}
    </div>

    <div
      style={{
        color: "var(--adm-text)",
        fontWeight: 600,
        fontSize: compact ? 13 : 14,
      }}
    >
      {uploading ? "Uploading..." : "Click or drag image to upload"}
    </div>

    {!compact && (
      <div
        style={{
          color: "var(--adm-text-3)",
          fontSize: 12,
          marginTop: 4,
        }}
      >
        {hint || "PNG, JPG, WEBP - up to 5MB"}
      </div>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/* Single image uploader                                               */
/* ------------------------------------------------------------------ */

type ImageUploaderProps = {
  value?: UploadedImage | null;
  onChange?: (image: UploadedImage | null) => void;
  upload: (file: File) => Promise<UploadedImage>;
  height?: number;
  maxSizeMb?: number;
  hint?: string;
  disabled?: boolean;
};

export const ImageUploader = ({
  value,
  onChange,
  upload,
  height = 190,
  maxSizeMb = DEFAULT_MAX_MB,
  hint,
  disabled,
}: ImageUploaderProps) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (!validateImage(file as File, maxSizeMb, message.error)) {
      return Upload.LIST_IGNORE;
    }

    setUploading(true);

    try {
      const uploaded = await upload(file as File);
      onChange?.(uploaded);
      message.success("Image uploaded successfully.");
    } catch {
      message.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }

    return Upload.LIST_IGNORE;
  };

  if (value?.url) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 320,
          height,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--adm-border)",
          background: "var(--adm-wash)",
        }}
        className="ib-image-uploader__preview"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value.url}
          alt="Uploaded image"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        <div
          className="ib-image-uploader__overlay"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: "rgba(4,4,4,0.55)",
            opacity: 0,
            transition: "opacity 0.15s ease",
          }}
        >
          <OverlayButton
            icon={<EyeOutlined />}
            title="Preview"
            onClick={() => setPreviewOpen(true)}
          />
          {!disabled && (
            <Upload
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={beforeUpload}
              disabled={uploading}
            >
              <OverlayButton
                icon={uploading ? <LoadingOutlined /> : <SwapOutlined />}
                title="Replace"
                onClick={() => {}}
              />
            </Upload>
          )}
          {!disabled && (
            <OverlayButton
              icon={<DeleteOutlined />}
              title="Remove"
              danger
              onClick={() => onChange?.(null)}
            />
          )}
        </div>

        <Image
          style={{ display: "none" }}
          src={value.url}
          preview={{
            visible: previewOpen,
            src: value.url,
            onVisibleChange: (visible) => setPreviewOpen(visible),
          }}
        />

        <style>{`
          .ib-image-uploader__preview:hover .ib-image-uploader__overlay { opacity: 1; }
        `}</style>
      </div>
    );
  }

  return (
    <Upload.Dragger
      accept="image/*"
      multiple={false}
      showUploadList={false}
      beforeUpload={beforeUpload}
      disabled={disabled || uploading}
      style={{
        ...dropZoneBaseStyle,
        minHeight: Math.min(height, 170),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DropZoneContent uploading={uploading} hint={hint} />
    </Upload.Dragger>
  );
};

/* ------------------------------------------------------------------ */
/* Multiple image uploader                                             */
/* ------------------------------------------------------------------ */

type MultiImageUploaderProps = {
  value?: GalleryImage[];
  onChange?: (images: GalleryImage[]) => void;
  upload: (file: File) => Promise<UploadedImage>;
  maxCount?: number;
  maxSizeMb?: number;
  alt?: string;
  numbered?: boolean;
  disabled?: boolean;
};

export const MultiImageUploader = ({
  value,
  onChange,
  upload,
  maxCount = 5,
  maxSizeMb = DEFAULT_MAX_MB,
  alt,
  numbered,
  disabled,
}: MultiImageUploaderProps) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const images = value || [];
  const valueRef = useRef<GalleryImage[]>(images);

  useEffect(() => {
    valueRef.current = value || [];
  }, [value]);

  const appendImage = async (file: File) => {
    if (valueRef.current.length >= maxCount) {
      message.error(`You can upload maximum ${maxCount} images.`);
      return;
    }

    if (!validateImage(file, maxSizeMb, message.error)) return;

    setUploading(true);

    try {
      const uploaded = await upload(file);
      const next = [
        ...valueRef.current,
        { url: uploaded.url, publicId: uploaded.publicId, alt: alt || "" },
      ].slice(0, maxCount);
      valueRef.current = next;
      onChange?.(next);
    } catch {
      message.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const replaceImageAt = async (index: number, file: File) => {
    if (!validateImage(file, maxSizeMb, message.error)) return;

    setUploading(true);

    try {
      const uploaded = await upload(file);
      const next = [...valueRef.current];
      next[index] = {
        url: uploaded.url,
        publicId: uploaded.publicId,
        alt: alt || next[index]?.alt || "",
      };
      valueRef.current = next;
      onChange?.(next);
      message.success("Image replaced.");
    } catch {
      message.error("Failed to replace image.");
    } finally {
      setUploading(false);
    }
  };

  const removeImageAt = (index: number) => {
    const next = valueRef.current.filter((_, current) => current !== index);
    valueRef.current = next;
    onChange?.(next);
  };

  const canAddMore = images.length < maxCount;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))",
          gap: 12,
        }}
      >
        {images.map((image, index) => (
          <div
            key={image.url + index}
            className="ib-multi-uploader__tile"
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--adm-border)",
              background: "var(--adm-wash)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt || `Image ${index + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {numbered && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  borderRadius: 999,
                  background: "var(--adm-accent)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: "20px",
                  textAlign: "center",
                }}
              >
                {index + 1}
              </span>
            )}

            <div
              className="ib-multi-uploader__overlay"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                background: "rgba(4,4,4,0.55)",
                opacity: 0,
                transition: "opacity 0.15s ease",
              }}
            >
              <OverlayButton
                icon={<EyeOutlined />}
                title="Preview"
                onClick={() => setPreviewSrc(image.url)}
              />
              {!disabled && (
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    void replaceImageAt(index, file as File);
                    return Upload.LIST_IGNORE;
                  }}
                  disabled={uploading}
                >
                  <OverlayButton
                    icon={
                      uploading && replaceIndex === index ? (
                        <LoadingOutlined />
                      ) : (
                        <SwapOutlined />
                      )
                    }
                    title="Replace"
                    onClick={() => setReplaceIndex(index)}
                  />
                </Upload>
              )}
              {!disabled && (
                <OverlayButton
                  icon={<DeleteOutlined />}
                  title="Remove"
                  danger
                  onClick={() => removeImageAt(index)}
                />
              )}
            </div>
          </div>
        ))}

        {canAddMore && (
          <Upload.Dragger
            accept="image/*"
            multiple
            showUploadList={false}
            beforeUpload={(file) => {
              void appendImage(file as File);
              return Upload.LIST_IGNORE;
            }}
            disabled={disabled || uploading}
            style={{
              ...dropZoneBaseStyle,
              aspectRatio: "1 / 1",
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: 0,
            }}
          >
            <DropZoneContent uploading={uploading} compact />
          </Upload.Dragger>
        )}
      </div>

      <div
        style={{
          marginTop: 10,
          color: "var(--adm-text-3)",
          fontSize: 12,
        }}
      >
        {images.length}/{maxCount} images - PNG, JPG, WEBP up to {maxSizeMb}MB
      </div>

      <Image
        style={{ display: "none" }}
        src={previewSrc || ""}
        preview={{
          visible: !!previewSrc,
          src: previewSrc || "",
          onVisibleChange: (visible) => {
            if (!visible) setPreviewSrc(null);
          },
        }}
      />

      <style>{`
        .ib-multi-uploader__tile:hover .ib-multi-uploader__overlay { opacity: 1; }
      `}</style>
    </div>
  );
};

export default ImageUploader;
