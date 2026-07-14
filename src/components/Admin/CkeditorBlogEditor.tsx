"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

type EditorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const CkeditorBlogEditorClient = dynamic(
  () => import("./CkeditorBlogEditorClient"),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 24, border: "1px solid #d9d9d9", borderRadius: 8 }}>
        <Spin /> Loading editor...
      </div>
    ),
  }
);

export default function CkeditorBlogEditor(props: EditorProps) {
  return <CkeditorBlogEditorClient {...props} />;
}
