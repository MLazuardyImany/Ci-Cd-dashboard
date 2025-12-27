import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to build updates
  subscribeToBuild(buildId, callback) {
    if (this.socket) {
      this.socket.emit('subscribe-build', buildId);
      this.socket.on('build-status', callback);
      this.socket.on('build-logs', callback);
    }
  }

  // Unsubscribe from build updates
  unsubscribeFromBuild(buildId) {
    if (this.socket) {
      this.socket.emit('unsubscribe-build', buildId);
      this.socket.off('build-status');
      this.socket.off('build-logs');
    }
  }

  // Listen to global build events
  onBuildCreated(callback) {
    if (this.socket) {
      this.socket.on('build-created', callback);
    }
  }

  onBuildCompleted(callback) {
    if (this.socket) {
      this.socket.on('build-completed', callback);
    }
  }

  onBuildCancelled(callback) {
    if (this.socket) {
      this.socket.on('build-cancelled', callback);
    }
  }

  // Remove listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();