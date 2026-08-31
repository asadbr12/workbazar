"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export default function BookingChat({
  bookingId,
  viewerId,
}: {
  bookingId: string;
  viewerId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/messages`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
      } catch {
        // transient network error, ignore
      }
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: firstLoadRef.current ? "auto" : "smooth" });
    firstLoadRef.current = false;
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setLoading(true);
    setError(null);
    setText("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't send message");
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setText(body);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="font-semibold text-gray-900">Chat</h2>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-4 text-center text-sm text-gray-400">
            No messages yet — say hello!
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === viewerId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-0.5 text-[10px] ${mine ? "text-blue-100" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      {error && <p className="px-4 pb-1 text-xs text-red-600">{error}</p>}
      <form onSubmit={send} className="flex gap-2 border-t border-gray-200 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          maxLength={1000}
          className="input"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
