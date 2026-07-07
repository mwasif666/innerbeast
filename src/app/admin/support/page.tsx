"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Empty, Input, List, Select, Space, Tag, Typography } from "antd";
import {
  getSupportInbox,
  getSupportThread,
  sendSupportReply,
  setSupportStatus,
  SupportConversation,
} from "@/services/support.service";

const { Text, Title } = Typography;

const AdminSupportPage = () => {
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState<SupportConversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [active, setActive] = useState<SupportConversation | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const loadList = async () => {
    const response = await getSupportInbox(status);
    setItems(response.data || []);
    if (!activeId && response.data?.[0]?._id) setActiveId(response.data[0]._id);
  };

  const loadThread = async (id: string) => {
    if (!id) return;
    const response = await getSupportThread(id);
    setActive(response.data);
  };

  useEffect(() => {
    loadList();
  }, [status]);

  useEffect(() => {
    loadThread(activeId);
  }, [activeId]);

  const handleReply = async (event: FormEvent) => {
    event.preventDefault();
    const text = reply.trim();
    if (!activeId || !text) return;

    setLoading(true);
    try {
      const response = await sendSupportReply(activeId, text);
      setActive(response.data);
      setReply("");
      loadList();
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (nextStatus: SupportConversation["status"]) => {
    if (!activeId) return;
    const response = await setSupportStatus(activeId, nextStatus);
    setActive(response.data);
    loadList();
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
          <div>
            <Title level={3} style={{ margin: 0 }}>Support Inbox</Title>
            <Text type="secondary">Customer messages and order questions.</Text>
          </div>
          <Space>
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 140 }}
              options={[
                { label: "All", value: "all" },
                { label: "Open", value: "open" },
                { label: "Pending", value: "pending" },
                { label: "Closed", value: "closed" },
              ]}
            />
            <Button onClick={loadList}>Refresh</Button>
          </Space>
        </Space>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
        <Card styles={{ body: { padding: 0 } }}>
          <List
            dataSource={items}
            locale={{ emptyText: <Empty description="No messages yet" /> }}
            renderItem={(item) => (
              <List.Item
                onClick={() => setActiveId(item._id)}
                style={{ cursor: "pointer", padding: 16, background: activeId === item._id ? "#f5f5f5" : "transparent" }}
              >
                <List.Item.Meta
                  title={<Space><span>{item.customerName || "Customer"}</span><Tag>{item.status}</Tag></Space>}
                  description={<Text type="secondary" ellipsis>{item.lastMessage || item.customerEmail || "Guest"}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>

        <Card>
          {!active ? <Empty description="Select a conversation" /> : (
            <div style={{ display: "grid", gap: 16 }}>
              <Space style={{ justifyContent: "space-between", width: "100%" }} wrap>
                <div>
                  <Title level={4} style={{ margin: 0 }}>{active.customerName || "Customer"}</Title>
                  <Text type="secondary">{active.customerEmail || active.customerPhone || "Guest customer"}</Text>
                </div>
                <Space>
                  <Button onClick={() => changeStatus("open")}>Open</Button>
                  <Button onClick={() => changeStatus("pending")}>Pending</Button>
                  <Button danger onClick={() => changeStatus("closed")}>Close</Button>
                </Space>
              </Space>

              <div style={{ height: 420, overflowY: "auto", background: "#f7f8fa", borderRadius: 16, padding: 16 }}>
                {(active.messages || []).map((message, index) => {
                  const admin = message.senderType === "admin";
                  return (
                    <div key={message._id || index} style={{ display: "flex", justifyContent: admin ? "flex-end" : "flex-start", marginBottom: 12 }}>
                      <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: 16, background: admin ? "#111" : "#fff", color: admin ? "#fff" : "#111" }}>
                        <div style={{ fontSize: 11, opacity: 0.55 }}>{message.name || message.senderType}</div>
                        <div>{message.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleReply} style={{ display: "flex", gap: 12 }}>
                <Input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply..." />
                <Button htmlType="submit" type="primary" loading={loading}>Send</Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminSupportPage;
