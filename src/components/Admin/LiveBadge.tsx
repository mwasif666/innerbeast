"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, List, Popover, Space, Tag, Typography, message } from "antd";
import { BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { connectRealtimeSocket } from "@/services/realtime.service";

const { Text } = Typography;

type Notice = { id: string; event: string; text: string; date: string; seen?: boolean };

const beep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.02;
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
};

const LiveBadge = () => {
  const [items, setItems] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [live, setLive] = useState(false);
  const [msg, holder] = message.useMessage();
  const unread = useMemo(() => items.filter((item) => !item.seen).length, [items]);

  useEffect(() => {
    const socket = connectRealtimeSocket();
    const addNotice = (event: string, payload: Record<string, unknown> = {}) => {
      if (event === "realtime:connected") return;
      setSyncing(true);
      window.setTimeout(() => setSyncing(false), 1000);
      const text = String(payload.orderNumber || payload.action || "Data changed");
      setItems((current) => [{ id: `${event}-${Date.now()}`, event, text, date: new Date().toISOString() }, ...current].slice(0, 10));
      beep();
      msg.info(`${event}: ${text}`);
    };
    const onConnect = () => setLive(true);
    const onDisconnect = () => setLive(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.onAny(addNotice);
    if (socket.connected) setLive(true);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.offAny(addNotice);
    };
  }, [msg]);

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
    <>
      {holder}
      <Popover open={open} onOpenChange={handleOpen} content={content} trigger="click" placement="bottomRight">
        <Badge count={unread} size="small"><Button shape="circle" icon={<BellOutlined />} /></Badge>
      </Popover>
    </>
  );
};

export default LiveBadge;
