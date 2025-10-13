import { io } from 'socket.io-client';
import { useNotificationStore } from '~/stores/notifications';
import { useToast } from '~/composables/useToast';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const toast = useToast();

  // Determine the socket URL from API base
  const apiBase = config.public.apiBase || 'http://localhost:9000/api';
  const socketUrl = apiBase.replace('/api', '');

  console.log('Connecting to Socket.IO server at:', socketUrl);

  const socket = io(socketUrl, {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id);

    // Join user room if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      socket.emit('joinUser', user.id);
      console.log('Joined user room for user:', user.id);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  // Listen for notification events
  socket.on('notification', (notification) => {
    console.log('Received notification:', notification);

    const notificationStore = useNotificationStore();

    // Add notification to store
    notificationStore.addNotification(notification);

    // Show toast notification
    toast.info(notification.title, {
      description: notification.message,
      duration: 5000,
    });

    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch((e) => console.log('Could not play notification sound:', e));
    } catch (e) {
      console.log('Notification sound not available');
    }
  });

  // Listen for ticket assigned events
  socket.on('ticketAssigned', (data) => {
    console.log('Ticket assigned:', data);
    // Additional handling if needed
  });

  // Listen for ticket updated events
  socket.on('ticketUpdated', (ticket) => {
    console.log('Ticket updated:', ticket);
    // Additional handling if needed
  });

  // Auto-connect when plugin loads
  if (process.client) {
    const userData = localStorage.getItem('user');
    if (userData) {
      socket.connect();
    }
  }

  return {
    provide: {
      socket,
      socketConnect: () => {
        if (!socket.connected) {
          socket.connect();
        }
      },
      socketDisconnect: () => {
        if (socket.connected) {
          socket.disconnect();
        }
      },
      socketJoinUser: (userId: number) => {
        socket.emit('joinUser', userId);
      },
      socketLeaveUser: (userId: number) => {
        socket.emit('leaveUser', userId);
      },
    },
  };
});
