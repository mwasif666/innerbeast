"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Empty, Input, Spin, Typography } from "antd";
import { ReloadOutlined, SearchOutlined, SendOutlined } from "@ant-design/icons";
import { connectRealtimeSocket } from "@/services/realtime.service";
import {
  getSupportInbox,
  getSupportThread,
  sendSupportReply,
  setSupportStatus,
  SupportConversation,
  SupportMessage,
} from "@/services/support.service";

const { Text } = Typography;

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
] as const;

const STATUS_META: Record<
  SupportConversation["status"],
  { label: string; dot: string }
> = {
  open: { label: "Open", dot: "#22c55e" },
  pending: { label: "Pending", dot: "#f59e0b" },
  closed: { label: "Closed", dot: "var(--adm-text-4)" },
};

const initials = (name?: string) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "G";
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const clockTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "";

const dayLabel = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
};

const relativeTime = (iso?: string) => {
  if (!iso) return "";
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
};

type ThreadRow =
  | { kind: "day"; key: string; label: string }
  | { kind: "system"; key: string; text: string }
  | {
      kind: "group";
      key: string;
      admin: boolean;
      name: string;
      time: string;
      messages: SupportMessage[];
    };

const GROUP_WINDOW_MS = 5 * 60000;

const buildThreadRows = (messages: SupportMessage[], customerName: string) => {
  const rows: ThreadRow[] = [];
  let lastDay = -1;

  messages.forEach((message, index) => {
    const key = message._id || `msg-${index}`;
    const stamp = message.createdAt ? new Date(message.createdAt) : null;
    const day = stamp ? startOfDay(stamp) : lastDay;

    if (stamp && day !== lastDay) {
      rows.push({ kind: "day", key: `day-${key}`, label: dayLabel(message.createdAt) });
      lastDay = day;
    }

    if (message.senderType === "system") {
      rows.push({ kind: "system", key, text: message.message });
      return;
    }

    const admin = message.senderType === "admin";
    const previous = rows[rows.length - 1];
    const closeInTime =
      previous?.kind === "group" &&
      (!message.createdAt ||
        !previous.messages[previous.messages.length - 1]?.createdAt ||
        new Date(message.createdAt).getTime() -
          new Date(previous.messages[previous.messages.length - 1].createdAt as string).getTime() <
          GROUP_WINDOW_MS);

    if (previous?.kind === "group" && previous.admin === admin && closeInTime) {
      previous.messages.push(message);
      previous.time = clockTime(message.createdAt) || previous.time;
      return;
    }

    rows.push({
      kind: "group",
      key,
      admin,
      name: message.name || (admin ? "Support" : customerName),
      time: clockTime(message.createdAt),
      messages: [message],
    });
  });

  return rows;
};

const AdminSupportPage = () => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<SupportConversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [active, setActive] = useState<SupportConversation | null>(null);
  const [reply, setReply] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const activeIdRef = useRef("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages?.length, activeId, threadLoading]);

  const submitReply = async () => {
    const text = reply.trim();
    if (!activeId || !text || sending) return;

    setSending(true);
    try {
      const response = await sendSupportReply(activeId, text);
      setActive(response.data);
      setReply("");
      loadList();
    } catch (replyError) {
      setError((replyError as Error).message || "Reply could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (nextStatus: SupportConversation["status"]) => {
    if (!activeId || active?.status === nextStatus) return;
    try {
      const response = await setSupportStatus(activeId, nextStatus);
      setActive(response.data);
      loadList();
    } catch (statusError) {
      setError((statusError as Error).message || "Conversation status could not be updated.");
    }
  };

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.customerName, item.customerEmail, item.customerPhone, item.lastMessage]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(query)),
    );
  }, [items, search]);

  const threadRows = useMemo(
    () => buildThreadRows(active?.messages || [], active?.customerName || "Customer"),
    [active],
  );

  const activeStatus = active ? STATUS_META[active.status] : null;

  return (
    <>
      <style>{`
        .sup-wrap { display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 18px; height: calc(100vh - 148px); min-height: 520px; }
        .sup-panel { display: flex; flex-direction: column; min-height: 0; background: var(--adm-panel-bg); border: 1px solid var(--adm-border); border-radius: 16px; overflow: hidden; }
        .sup-side-head { padding: 14px 14px 12px; border-bottom: 1px solid var(--adm-border); display: grid; gap: 10px; }
        .sup-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .sup-pill { padding: 3px 11px; border-radius: 999px; font-size: 12px; font-weight: 600; color: var(--adm-text-2); background: transparent; border: 1px solid var(--adm-border); cursor: pointer; transition: all .15s; }
        .sup-pill:hover { color: var(--adm-text); border-color: var(--adm-baseline); }
        .sup-pill.on { color: var(--adm-accent); background: var(--adm-accent-soft); border-color: var(--adm-accent-border); }
        .sup-list { flex: 1; overflow-y: auto; min-height: 0; }
        .sup-item { display: flex; align-items: center; gap: 11px; width: 100%; padding: 11px 12px; text-align: left; background: transparent; border: 0; border-left: 2px solid transparent; cursor: pointer; transition: background .15s; }
        .sup-item:hover { background: var(--adm-wash); }
        .sup-item.on { background: var(--adm-accent-soft); border-left-color: var(--adm-accent); }
        .sup-item + .sup-item { border-top: 1px solid var(--adm-border); }
        .sup-ava { flex: 0 0 auto; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: rgba(229,113,18,0.16); color: var(--adm-accent); font-size: 13px; font-weight: 700; }
        .sup-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; }
        .sup-thread-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; border-bottom: 1px solid var(--adm-border); }
        .sup-status { display: flex; gap: 6px; }
        .sup-scroll { flex: 1; overflow-y: auto; min-height: 0; padding: 16px 18px 10px; }
        .sup-day { display: flex; align-items: center; gap: 12px; margin: 14px 0 12px; color: var(--adm-text-3); font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
        .sup-day::before, .sup-day::after { content: ""; flex: 1; border-top: 1px solid var(--adm-border); }
        .sup-sys { text-align: center; margin: 10px 0; color: var(--adm-text-3); font-size: 12px; }
        .sup-group { display: flex; flex-direction: column; margin-bottom: 14px; }
        .sup-group.admin { align-items: flex-end; }
        .sup-group.customer { align-items: flex-start; }
        .sup-who { margin: 0 6px 3px; font-size: 11px; font-weight: 600; color: var(--adm-text-3); }
        .sup-bubble { max-width: min(68%, 560px); padding: 8px 13px; font-size: 14px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; border-radius: 15px; margin-top: 2px; }
        .sup-bubble.admin { background: var(--adm-accent); color: #fff; }
        .sup-bubble.customer { background: var(--adm-wash); border: 1px solid var(--adm-border); color: var(--adm-text); }
        .sup-group.admin .sup-bubble:last-of-type { border-bottom-right-radius: 5px; }
        .sup-group.customer .sup-bubble:last-of-type { border-bottom-left-radius: 5px; }
        .sup-when { margin: 4px 6px 0; font-size: 10.5px; color: var(--adm-text-4); }
        .sup-composer { display: flex; align-items: flex-end; gap: 10px; padding: 12px 14px; border-top: 1px solid var(--adm-border); }
        .sup-empty { flex: 1; display: grid; place-items: center; }
        @media (max-width: 960px) {
          .sup-wrap { grid-template-columns: 1fr; height: auto; }
          .sup-list { max-height: 300px; }
          .sup-thread-pane { height: 72vh; min-height: 440px; }
        }
      `}</style>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Support chat error"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="sup-wrap">
        <section className="sup-panel">
          <div className="sup-side-head">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 800, color: "var(--adm-text)", fontSize: 15 }}>
                Inbox
                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "var(--adm-text-3)" }}>
                  {items.length}
                </span>
              </div>
              <Button
                size="small"
                type="text"
                icon={<ReloadOutlined spin={listLoading} />}
                onClick={() => loadList()}
                aria-label="Refresh inbox"
              />
            </div>
            <Input
              allowClear
              size="middle"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, message…"
              prefix={<SearchOutlined style={{ color: "var(--adm-text-4)" }} />}
            />
            <div className="sup-pills">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`sup-pill ${status === filter.value ? "on" : ""}`}
                  onClick={() => setStatus(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sup-list">
            <Spin spinning={listLoading && !items.length}>
              {!visibleItems.length ? (
                <div style={{ padding: "44px 16px" }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      search
                        ? "No conversations match your search"
                        : error
                          ? "Inbox could not be loaded"
                          : "No messages yet"
                    }
                  />
                </div>
              ) : (
                visibleItems.map((item) => {
                  const meta = STATUS_META[item.status];
                  const unread = item.unreadForAdmin || 0;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      className={`sup-item ${activeId === item._id ? "on" : ""}`}
                      onClick={() => setActiveId(item._id)}
                    >
                      <span className="sup-ava">{initials(item.customerName)}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "var(--adm-text)",
                              fontWeight: unread ? 800 : 600,
                              fontSize: 13.5,
                            }}
                          >
                            {item.customerName || "Customer"}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--adm-text-4)", flex: "0 0 auto" }}>
                            {relativeTime(item.lastMessageAt)}
                          </span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                          <span className="sup-dot" style={{ background: meta.dot }} title={meta.label} />
                          <span
                            style={{
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: 12.5,
                              color: unread ? "var(--adm-text)" : "var(--adm-text-3)",
                              fontWeight: unread ? 600 : 400,
                            }}
                          >
                            {item.lastMessage || item.customerEmail || "Guest"}
                          </span>
                          {unread > 0 && (
                            <span
                              style={{
                                flex: "0 0 auto",
                                minWidth: 18,
                                height: 18,
                                padding: "0 5px",
                                borderRadius: 999,
                                display: "grid",
                                placeItems: "center",
                                background: "var(--adm-accent)",
                                color: "#fff",
                                fontSize: 10.5,
                                fontWeight: 700,
                              }}
                            >
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </Spin>
          </div>
        </section>

        <section className="sup-panel sup-thread-pane">
          {threadLoading && !active ? (
            <div className="sup-empty">
              <Spin />
            </div>
          ) : !active ? (
            <div className="sup-empty">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Select a conversation to start replying" />
            </div>
          ) : (
            <>
              <div className="sup-thread-head">
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <span className="sup-ava">{initials(active.customerName)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--adm-text)",
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {active.customerName || "Customer"}
                      </span>
                      {activeStatus && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "1px 9px",
                            borderRadius: 999,
                            border: "1px solid var(--adm-border)",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--adm-text-2)",
                          }}
                        >
                          <span className="sup-dot" style={{ background: activeStatus.dot }} />
                          {activeStatus.label}
                        </span>
                      )}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12.5 }}>
                      {[active.customerEmail, active.customerPhone].filter(Boolean).join(" · ") || "Guest customer"}
                    </Text>
                  </div>
                </div>

                <div className="sup-status">
                  {(Object.keys(STATUS_META) as SupportConversation["status"][]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`sup-pill ${active.status === value ? "on" : ""}`}
                      onClick={() => changeStatus(value)}
                    >
                      {STATUS_META[value].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sup-scroll" ref={scrollRef}>
                {threadRows.map((row) => {
                  if (row.kind === "day") {
                    return (
                      <div key={row.key} className="sup-day">
                        {row.label}
                      </div>
                    );
                  }

                  if (row.kind === "system") {
                    return (
                      <div key={row.key} className="sup-sys">
                        {row.text}
                      </div>
                    );
                  }

                  return (
                    <div key={row.key} className={`sup-group ${row.admin ? "admin" : "customer"}`}>
                      <div className="sup-who">{row.name}</div>
                      {row.messages.map((message, index) => (
                        <div key={message._id || `${row.key}-${index}`} className={`sup-bubble ${row.admin ? "admin" : "customer"}`}>
                          {message.message}
                        </div>
                      ))}
                      {row.time && <div className="sup-when">{row.time}</div>}
                    </div>
                  );
                })}
              </div>

              <form
                className="sup-composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitReply();
                }}
              >
                <Input.TextArea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write a reply…"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  onPressEnter={(event) => {
                    if (!event.shiftKey) {
                      event.preventDefault();
                      submitReply();
                    }
                  }}
                  style={{ borderRadius: 12 }}
                />
                <Button
                  htmlType="submit"
                  type="primary"
                  icon={<SendOutlined />}
                  loading={sending}
                  disabled={!reply.trim()}
                  style={{ height: 40, borderRadius: 11 }}
                >
                  Send
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default AdminSupportPage;
