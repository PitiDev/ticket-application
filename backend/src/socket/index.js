const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join user-specific room for notifications
        socket.on('joinUser', (userId) => {
            socket.join(`user-${userId}`);
            console.log(`User ${userId} joined their notification room`);
        });

        // Leave user room
        socket.on('leaveUser', (userId) => {
            socket.leave(`user-${userId}`);
            console.log(`User ${userId} left their notification room`);
        });

        // Join ticket-specific room
        socket.on('joinTicket', (ticketId) => {
            socket.join(`ticket-${ticketId}`);
            console.log(`Socket ${socket.id} joined ticket-${ticketId}`);
        });

        // Leave ticket room
        socket.on('leaveTicket', (ticketId) => {
            socket.leave(`ticket-${ticketId}`);
            console.log(`Socket ${socket.id} left ticket-${ticketId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = {
    initializeSocket,
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    }
};