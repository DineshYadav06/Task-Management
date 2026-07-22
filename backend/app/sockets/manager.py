import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Enterprise real-time connection manager handling room-based broadcasting
    for Organizations, Workspaces, Projects, and personal notification feeds.
    """
    def __init__(self):
        # Room ID -> List of connected WebSocket instances
        self.active_rooms: Dict[str, List[WebSocket]] = {}
        # User ID -> List of user's personal active WebSockets
        self.user_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int, rooms: List[str] = None):
        """Accept connection and register user into specified rooms."""
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

        if rooms:
            for room in rooms:
                if room not in self.active_rooms:
                    self.active_rooms[room] = []
                self.active_rooms[room].append(websocket)
        logger.info(f"WebSocket connected for User {user_id} across rooms {rooms}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove disconnected WebSocket from all registered maps."""
        if user_id in self.user_connections and websocket in self.user_connections[user_id]:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

        for room, connections in list(self.active_rooms.items()):
            if websocket in connections:
                connections.remove(websocket)
                if not connections:
                    del self.active_rooms[room]
        logger.info(f"WebSocket disconnected for User {user_id}")

    async def broadcast_to_room(self, room: str, event: str, payload: Any):
        """Send live JSON payload to all connections in a room."""
        if room not in self.active_rooms:
            return
        
        message = {"event": event, "payload": payload, "room": room}
        disconnected_sockets = []
        for connection in self.active_rooms[room]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected_sockets.append(connection)
        
        for dead_sock in disconnected_sockets:
            for r in self.active_rooms.values():
                if dead_sock in r:
                    r.remove(dead_sock)

    async def send_personal_notification(self, user_id: int, event: str, payload: Any):
        """Send direct personal notification to a specific user's connected sessions."""
        if user_id not in self.user_connections:
            return
        
        message = {"event": event, "payload": payload}
        disconnected_sockets = []
        for connection in self.user_connections[user_id]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected_sockets.append(connection)
        
        for dead_sock in disconnected_sockets:
            if dead_sock in self.user_connections.get(user_id, []):
                self.user_connections[user_id].remove(dead_sock)


socket_manager = WebSocketManager()
