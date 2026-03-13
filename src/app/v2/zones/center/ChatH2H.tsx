/**
 * ChatH2H.tsx — Chat Humain-Humain en temps reel
 * Sprint F4 — Multi-User MVP
 * WebSocket real-time messaging entre users de la meme org
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  Users,
  Plus,
  Hash,
  User as UserIcon,
  Loader2,
  Bot,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useAuth, getCurrentUserId } from "../../context/AuthContext";
import { api } from "../../api/client";

interface ChatRoom {
  id: number;
  name: string;
  type_room: string;
  member_ids: number[];
  bot_codes: string[];
  created_at: string;
}

interface ChatMsg {
  id: number;
  room_id: number;
  sender_user_id: number | null;
  sender_bot_code: string | null;
  content: string;
  message_type: string;
  created_at: string;
}

const ROOM_ICONS: Record<string, React.ElementType> = {
  department: Hash,
  group: Users,
  dm: UserIcon,
  chantier: MessageSquare,
};

export function ChatH2H() {
  const auth = useAuth();
  const userId = getCurrentUserId();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load rooms
  const loadRooms = useCallback(async () => {
    try {
      const data = await api.getChatRooms();
      setRooms(data.rooms || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Load messages when room changes
  useEffect(() => {
    if (!activeRoom) return;
    (async () => {
      try {
        const data = await api.getChatMessages(activeRoom.id);
        setMessages(data.messages || []);
      } catch {
        setMessages([]);
      }
    })();
  }, [activeRoom]);

  // WebSocket connection
  useEffect(() => {
    if (!activeRoom) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/v1/ws/chat/${activeRoom.id}?user_id=${userId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [activeRoom, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeRoom || !wsRef.current) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      wsRef.current.send(JSON.stringify({
        type: "message",
        content: text,
      }));
    } catch {
      // restore input on failure
      setInput(text);
    } finally {
      setSending(false);
    }

    inputRef.current?.focus();
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const room = await api.createChatRoom(newRoomName, "group");
      setShowNewRoom(false);
      setNewRoomName("");
      loadRooms();
      setActiveRoom(room);
    } catch {
      // handle error
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Room list sidebar */}
      <div className="w-64 border-r flex flex-col bg-muted/30">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Conversations
          </h3>
          <button
            onClick={() => setShowNewRoom(!showNewRoom)}
            className="p-1 hover:bg-accent rounded"
            title="Nouvelle conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* New room form */}
        {showNewRoom && (
          <div className="p-2 border-b">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nom du canal..."
              className="w-full px-2 py-1.5 text-xs border rounded bg-white"
              onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
              autoFocus
            />
          </div>
        )}

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Aucune conversation
            </div>
          ) : (
            rooms.map((room) => {
              const RoomIcon = ROOM_ICONS[room.type_room] || MessageSquare;
              const isActive = activeRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                    isActive && "bg-accent font-medium"
                  )}
                >
                  <RoomIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{room.name}</span>
                  {room.bot_codes.length > 0 && (
                    <Bot className="h-3.5 w-3.5 text-violet-400 ml-auto shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Selectionnez une conversation</p>
              <p className="text-xs mt-1">ou creez-en une nouvelle</p>
            </div>
          </div>
        ) : (
          <>
            {/* Room header */}
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <h3 className="font-semibold text-sm">{activeRoom.name}</h3>
              <Badge variant="secondary" className="text-[9px]">
                {activeRoom.type_room}
              </Badge>
              {activeRoom.member_ids.length > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {activeRoom.member_ids.length} membre{activeRoom.member_ids.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-8">
                  Debut de la conversation
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.sender_user_id === userId;
                const isBot = !!msg.sender_bot_code;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      isMine ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-xl px-3.5 py-2",
                        isMine
                          ? "bg-blue-600 text-white"
                          : isBot
                          ? "bg-violet-50 border border-violet-200"
                          : "bg-muted"
                      )}
                    >
                      {!isMine && (
                        <div className="flex items-center gap-1.5 mb-1">
                          {isBot ? (
                            <Bot className="h-3.5 w-3.5 text-violet-500" />
                          ) : (
                            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span className="text-[9px] font-medium">
                            {msg.sender_bot_code || `User #${msg.sender_user_id}`}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <span
                        className={cn(
                          "text-[9px] block mt-1",
                          isMine ? "text-blue-200" : "text-muted-foreground"
                        )}
                      >
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  disabled={!wsRef.current}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending || !wsRef.current}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
