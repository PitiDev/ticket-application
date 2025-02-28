const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('joinTicket', (ticketId) => {
            socket.join(`ticket-${ticketId}`);
        });

        socket.on('leaveTicket', (ticketId) => {
            socket.leave(`ticket-${ticketId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
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