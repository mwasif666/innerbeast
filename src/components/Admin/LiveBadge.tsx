"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, List, Popover, Space, Tag, Typography } from "antd";
import { BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { connectRealtimeSocket } from "@/services/realtime.service";

const { Text } = Typography;

type Notice = { id: string; event: string; text: string; date: string; seen?: boolean };

const LiveBadge = () => {
  const [items, setItems] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [live, setLive] = useState(false);
  const unread = useMemo(() => items.filter((item) => !item.seen).length, [items]);

  useEffect(() => {
    const socket = connectRealtimeSocket();
    const addNotice = (event: string, payload: Record<string, unknown> = {}) => {
      if (event === "realtime:connected") return;
      setSyncing(true);
      window.setTimeout(() => setSyncing(false), 1000);
      setItems((current) => [
        {
          id: `${event}-${Date.now()}`,
          event,
          text: String(payload.orderNumber || payload.action || "Data changed"),
          date: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 10));
    };
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.onAny(addNotice);
    if (socket.connected) setLive(true);
    return () => socket.offAny(addNotice);
  }, []);

  const content = (
    <div style={{ width: 320 }}>
      <Space style={{ marginBottom: 10 }}>
        <Tag color={live ? "green" : "default"}>{live ? "Live" : "Offline"}</Tag>
        {syncing && <Tag color="blue">Typing / syncing...</Tag>}
      </Space>
      <List
        size="small"
        dataSource={items}
        locale={{ emptyText: "No live updates yet." }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<Space><span>{item.event}</span>{item.seen && <CheckCircleOutlined />}</Space>}
              description={<><div>{item.text}</div><Text type="secondary">{new Date(item.date).toLocaleString()}</Text></>}
            />
          </List.Item>
        )}
      />
    </div>
  );

  const handleOpen = (value: boolean) => {
    setOpen(value);
    if (value) setItems((current) => current.map((item) => ({ ...item, seen: true })));
  };

  return (
    <Popover open={open} onOpenChange={handleOpen} content={content} trigger="click" placement="bottomRight">
      <Badge count={unread} size="small"><Button shape="circle" icon={<BellOutlined />} /></Badge>
    </Popover>
  );
};

export default LiveBadge;
