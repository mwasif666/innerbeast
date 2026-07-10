"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Space } from "antd";
import {
  ConfigurableEditorWithAuth,
  defaultEditorConfig,
  EditorProvider,
} from "eddyter";
import { uploadContentImage } from "@/services/upload.service";

type EditorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const apiKey =
  process.env.NEXT_PUBLIC_EDDYTER_API_KEY ||
  process.env.NEXT_PUBLIC_EDITOR_API_KEY ||
  "";

const FallbackHtmlEditor = ({
  value = "",
  onChange,
  notice,
}: EditorProps & { notice?: string }) => {
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const insert = (before: string, after = "") => {
    const el = areaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || "text";
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange?.(next);
    window.setTimeout(() => el?.focus(), 0);
  };

  const insertImage = async (file?: File) => {
    if (!file) return;
    const res = await uploadContentImage(file);
    const html = `<p><img src="${res.data.url}" alt="" style="max-width:100%;border-radius:16px;" /></p>`;
    const el = areaRef.current;
    const start = el?.selectionStart ?? value.length;
    const next = `${value.slice(0, start)}${html}${value.slice(start)}`;
    onChange?.(next);
  };

  return (
    <div>
      {notice && (
        <Alert
          showIcon
          type="warning"
          style={{ marginBottom: 12 }}
          message={notice}
          description="This HTML editor is available until Eddyter is ready."
        />
      )}
      <Space wrap style={{ marginBottom: 10 }}>
        <Button onClick={() => insert("<strong>", "</strong>")}>Bold</Button>
        <Button onClick={() => insert("<em>", "</em>")}>Italic</Button>
        <Button onClick={() => insert("<h2>", "</h2>")}>Heading</Button>
        <Button onClick={() => insert("<p>", "</p>")}>Paragraph</Button>
        <Button onClick={() => fileRef.current?.click()}>Add image in middle</Button>
      </Space>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(event) => insertImage(event.target.files?.[0])}
      />
      <textarea
        ref={areaRef}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        rows={12}
        style={{
          width: "100%",
          border: "1px solid #d9d9d9",
          borderRadius: 12,
          padding: 14,
          fontFamily: "monospace",
          color: "#111",
        }}
        placeholder="Write content. Use toolbar for bold, headings and images."
      />
      <div
        style={{
          marginTop: 12,
          padding: 16,
          border: "1px solid #eee",
          borderRadius: 12,
          background: "#fff",
          color: "#111",
        }}
        dangerouslySetInnerHTML={{ __html: value || "<p>Preview will show here...</p>" }}
      />
    </div>
  );
};

export default function EddyterBlogEditor({ value = "", onChange }: EditorProps) {
  const [initialContent, setInitialContent] = useState(value || "<p></p>");
  const [revision, setRevision] = useState(0);
  const [authError, setAuthError] = useState("");
  const emittedValueRef = useRef(value);

  useEffect(() => {
    if (value !== emittedValueRef.current) {
      emittedValueRef.current = value;
      setInitialContent(value || "<p></p>");
      setRevision((current) => current + 1);
    }
  }, [value]);

  const handleChange = (html: string) => {
    emittedValueRef.current = html;
    onChange?.(html);
  };

  if (!apiKey || authError) {
    const notice = authError
      ? `Eddyter authentication failed: ${authError}`
      : "Add NEXT_PUBLIC_EDDYTER_API_KEY to enable the Eddyter rich text editor.";
    return <FallbackHtmlEditor value={value} onChange={onChange} notice={notice} />;
  }

  return (
    <div style={{ border: "1px solid #d9d9d9", borderRadius: 12, overflow: "hidden" }}>
      <EditorProvider
        defaultFontFamilies={defaultEditorConfig.defaultFontFamilies}
        enableLinkPreview={false}
      >
        <ConfigurableEditorWithAuth
          key={revision}
          apiKey={apiKey}
          initialContent={initialContent}
          onChange={handleChange}
          onAuthError={setAuthError}
          toolbar={{ mode: "static" }}
          editor={{ maxHeight: 620 }}
          style={{ minHeight: 360 }}
        />
      </EditorProvider>
    </div>
  );
}
