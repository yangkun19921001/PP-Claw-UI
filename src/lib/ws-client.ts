import type { WSEvent, WSOutgoing } from "@/types/api";

type WSCallback = (event: WSEvent) => void;

export class WSClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<WSCallback>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionId: string;
  private url: string;
  private pendingQueue: WSOutgoing[] = [];

  constructor(sessionId = "ui:direct", base = "ws://127.0.0.1:18791") {
    this.sessionId = sessionId;
    this.url = `${base}/api/v1/chat/ws?session_id=${encodeURIComponent(sessionId)}`;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.flushQueue();
    };

    this.ws.onmessage = (e) => {
      try {
        const event: WSEvent = JSON.parse(e.data);
        this.listeners.forEach((cb) => cb(event));
      } catch {}
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.pendingQueue = [];
    this.ws?.close();
    this.ws = null;
  }

  send(msg: WSOutgoing) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      this.pendingQueue.push(msg);
    }
  }

  sendMessage(content: string, media?: string[]) {
    this.send({
      type: "message",
      content,
      session_id: this.sessionId,
      media,
    });
  }

  onEvent(cb: WSCallback) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private flushQueue() {
    while (this.pendingQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const msg = this.pendingQueue.shift()!;
      this.ws!.send(JSON.stringify(msg));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }
}
