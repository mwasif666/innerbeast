"use client";

import { useRef, useState } from "react";
import { App, Button, Card, Form, Input, Modal, Space, Switch, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { uploadContentImage, UploadedImage } from "@/services/upload.service";

type Post = { _id: string; title: string; slug: string; summary?: string; body: string; imageUrl?: string; imagePublicId?: string; authorName?: string; isPublished?: boolean; publishedAt?: string };
type Payload = { title: string; slug?: string; summary?: string; body: string; imageUrl?: string; imagePublicId?: string; authorName?: string; isPublished?: boolean };

type EditorProps = { value?: string; onChange?: (value: string) => void };

const BlogTextEditor = ({ value = "", onChange }: EditorProps) => {
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

  return <div><Space wrap style={{ marginBottom: 10 }}><Button onClick={() => insert("<strong>", "</strong>")}>Bold</Button><Button onClick={() => insert("<em>", "</em>")}>Italic</Button><Button onClick={() => insert("<h2>", "</h2>")}>Heading</Button><Button onClick={() => insert("<p>", "</p>")}>Paragraph</Button><Button onClick={() => fileRef.current?.click()}>Add image in middle</Button></Space><input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(event) => insertImage(event.target.files?.[0])} /><textarea ref={areaRef} value={value} onChange={(event) => onChange?.(event.target.value)} rows={12} style={{ width: "100%", border: "1px solid #d9d9d9", borderRadius: 12, padding: 14, fontFamily: "monospace", color: "#111" }} placeholder="Write content. Use toolbar for bold, headings and images." /><div style={{ marginTop: 12, padding: 16, border: "1px solid #eee", borderRadius: 12, background: "#fff", color: "#111" }} dangerouslySetInnerHTML={{ __html: value || "<p>Preview will show here...</p>" }} /></div>;
};

const listPosts = () => api<{ success: boolean; data: Post[] }>("/articles/admin/all");
const createPost = (payload: Payload) => api<{ success: boolean; data: Post }>("/articles/admin", { method: "POST", body: payload });
const updatePost = (id: string, payload: Payload) => api<{ success: boolean; data: Post }>(`/articles/admin/${id}`, { method: "PATCH", body: payload });
const deletePost = (id: string) => api<{ success: boolean }>(`/articles/admin/${id}`, { method: "DELETE" });

export default function AdminBlogsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<Payload>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [image, setImage] = useState<UploadedImage | null>(null);
  const query = useQuery({ queryKey: ["admin", "articles"], queryFn: listPosts });
  const rows = query.data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (values: Payload) => editing ? updatePost(editing._id, values) : createPost(values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "articles"] }); queryClient.invalidateQueries({ queryKey: ["articles"] }); setOpen(false); setEditing(null); form.resetFields(); setImage(null); message.success("Blog saved"); },
    onError: (error) => message.error((error as Error).message || "Blog could not be saved"),
  });
  const deleteMutation = useMutation({ mutationFn: deletePost, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "articles"] }); queryClient.invalidateQueries({ queryKey: ["articles"] }); message.success("Blog deleted"); } });

  const handleImage = async (file?: File) => {
    if (!file) return;
    const response = await uploadContentImage(file);
    setImage(response.data);
    form.setFieldsValue({ imageUrl: response.data.url, imagePublicId: response.data.publicId });
  };

  const columns: ColumnsType<Post> = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    { title: "Status", dataIndex: "isPublished", key: "status", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "Published" : "Draft"}</Tag> },
    { title: "Actions", key: "actions", render: (_, row) => <Space><Button onClick={() => { setEditing(row); setImage(row.imageUrl ? { url: row.imageUrl, publicId: row.imagePublicId || "" } : null); form.setFieldsValue(row); setOpen(true); }}>Edit</Button><Button danger onClick={() => deleteMutation.mutate(row._id)}>Delete</Button></Space> },
  ];

  return <div style={{ maxWidth: 1400, margin: "0 auto" }}><Card title="Blogs" extra={<Button type="primary" onClick={() => { setEditing(null); setImage(null); form.resetFields(); setOpen(true); }}>Add Blog</Button>}><Table rowKey="_id" columns={columns} dataSource={rows} loading={query.isLoading} /></Card><Modal open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} confirmLoading={saveMutation.isPending} title={editing ? "Edit Blog" : "Add Blog"} width={960}><Form form={form} layout="vertical" initialValues={{ isPublished: true }} onFinish={(values) => saveMutation.mutate({ ...values, imageUrl: image?.url || values.imageUrl, imagePublicId: image?.publicId || values.imagePublicId })}><Form.Item label="Cover image"><input type="file" accept="image/*" onChange={(event) => handleImage(event.target.files?.[0])} />{image?.url && <img src={image.url} alt="Preview" style={{ display: "block", width: 180, marginTop: 12, borderRadius: 12 }} />}</Form.Item><Form.Item name="imageUrl" hidden><Input /></Form.Item><Form.Item name="imagePublicId" hidden><Input /></Form.Item><Form.Item label="Title" name="title" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Slug" name="slug"><Input /></Form.Item><Form.Item label="Excerpt" name="summary"><Input.TextArea rows={2} /></Form.Item><Form.Item label="Content editor" name="body" rules={[{ required: true }]}><BlogTextEditor /></Form.Item><Form.Item label="Author" name="authorName"><Input placeholder="Inner Beast" /></Form.Item><Form.Item label="Published" name="isPublished" valuePropName="checked"><Switch /></Form.Item></Form></Modal></div>;
}
