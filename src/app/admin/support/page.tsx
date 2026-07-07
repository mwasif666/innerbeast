"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, Empty, Input, List, Select, Space, Spin, Tag, Typography } from "antd";
import { connectRealtimeSocket } from "@/services/realtime.service";
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
  const [listLoading, setListLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeIdRef = useRef("");

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadList = useCallback(async (nextActiveId = activeIdRef.current) => {
    setListLoading(true);
    setError("");

    try {
      const response = await getSupportInbox(status);
      const conversations = response.data || [];

      setItems(conversations);

      if (!nextActiveId && conversations[0]?._id) {
        setActiveId(conversations[0]._id);
        return;
      }

      if (
        nextActiveId &&
        conversations.length > 0 &&
        !conversations.some((conversation) => conversation._id === nextActiveId)
      ) {
        setActiveId(conversations[0]._id);
        return;
      }

      if (!conversations.length) {
        setActive(null);
      }
    } catch (listError) {
      setError((listError as Error).message || "Support inbox could not be loaded.");
    } finally {
      setListLoading(false);
    }
  }, [status]);

  const loadThread = useCallback(async (id: string) => {
    if (!id) return;

    setThreadLoading(true);
    setError("");

    try {
      const response = await getSupportThread(id);
      setActive(response.data);
    } catch (threadError) {
      setError((threadError as Error).message || "Support conversation could not be loaded.");
      setActive(null);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadThread(activeId);
  }, [activeId, loadThread]);

  useEffect(() => {
    const socket = connectRealtimeSocket();
    const refreshSupport = (payload?: { conversationId?: string }) => {
      loadList(payload?.conversationId || activeIdRef.current);

      if (payload?.conversationId && payload.conversationId === activeIdRef.current) {
        loadThread(payload.conversationId);
      }
    };

    socket.on("chat:changed", refreshSupport);
    const interval = window.setInterval(() => loadList(), 15000);

    return () => {
      socket.off("chat:changed", refreshSupport);
      window.clearInterval(interval);
    };
  }, [loadList, loadThread]);

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
    } catch (replyError) {
      setError((replyError as Error).message || "Reply could not be sent.");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (nextStatus: SupportConversation["status"]) => {
    if (!activeId) return;
    try {
      const response = await setSupportStatus(activeId, nextStatus);
      setActive(response.data);
      loadList();
    } catch (statusError) {
      setError((statusError as Error).message || "Conversation status could not be updated.");
    }
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
            <Button onClick={() => loadList()} loading={listLoading}>Refresh</Button>
          </Space>
        </Space>
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Support chat error"
          description={error}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
        <Card styles={{ body: { padding: 0 } }}>
          <Spin spinning={listLoading}>
            <List
              dataSource={items}
              locale={{ emptyText: <Empty description={error ? "Inbox could not be loaded" : "No messages yet"} /> }}
              renderItem={(item) => (
                <List.Item
                  onClick={() => setActiveId(item._id)}
                  style={{ cursor: "pointer", padding: 16, background: activeId === item._id ? "#f5f5f5" : "transparent" }}
                >
                  <List.Item.Meta
                    title={(
                      <Space>
                        <Badge count={item.unreadForAdmin || 0} size="small">
                          <span style={{ paddingRight: item.unreadForAdmin ? 10 : 0 }}>
                            {item.customerName || "Customer"}
                          </span>
                        </Badge>
                        <Tag>{item.status}</Tag>
                      </Space>
                    )}
                    description={<Text type="secondary" ellipsis>{item.lastMessage || item.customerEmail || "Guest"}</Text>}
                  />
                </List.Item>
              )}
            />
          </Spin>
        </Card>

        <Card>
          {threadLoading ? <Spin /> : !active ? <Empty description="Select a conversation" /> : (
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
