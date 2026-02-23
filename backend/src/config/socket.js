const socketio = require('socket.io');
const jwt = require('jsonwebtoken');

const configureSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: '*', // In production, restrict to frontend URL
            methods: ['GET', 'POST']
        }
    });

    // Socket authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log(`User connected to socket: ${socket.user.id}`);

        // Join a room for a specific match/conversation
        socket.on('joinRoom', ({ matchId }) => {
            socket.join(matchId);
            console.log(`User ${socket.user.id} joined room ${matchId}`);
        });

        // Handle sending a message
        socket.on('sendMessage', (data) => {
            // data contains the populated Message document from the DB
            io.to(data.matchId).emit('newMessage', data);

            // Also emit a notification to the specific user if they are online
            // but not in the room (can use a separate 'user_rooms' map logic)
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.id}`);
        });
    });

    return io;
};

module.exports = configureSocket;
