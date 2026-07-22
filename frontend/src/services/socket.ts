import { Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private ws: WebSocket | null = null;
  private userId: number | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private subscribedRooms: Set<string> = new Set();

  connect(userId: number, rooms: string[] = []) {
    if (this.ws && this.userId === userId && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.userId = userId;
    rooms.forEach(r => this.subscribedRooms.add(r));

    const roomsParam = Array.from(this.subscribedRooms).join(',');
    const wsUrl = `ws://${window.location.host}/ws/${userId}?rooms=${encodeURIComponent(roomsParam)}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        this.subscribedRooms.forEach((room) => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: 'subscribe', room }));
          }
        });
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event) {
            this.emitEvent(data.event, data.payload);
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse payload:', err);
        }
      };
    } catch (err) {
      console.warn('[WebSocket] Connection failed, falling back to polling:', err);
    }
  }

  subscribeRoom(room: string) {
    this.subscribedRooms.add(room);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', room }));
    }
  }

  unsubscribeRoom(room: string) {
    this.subscribedRooms.delete(room);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', room }));
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emitEvent(event: string, payload: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((cb) => cb(payload));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
