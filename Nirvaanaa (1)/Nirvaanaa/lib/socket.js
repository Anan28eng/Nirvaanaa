const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join admin room for admin-specific updates
    socket.on('join-admin', () => {
      socket.join('admin');
      console.log('Admin joined:', socket.id);
    });

    // Join user-specific room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log('User joined:', userId);
    });

    // Handle cart updates
    socket.on('cart-updated', (data) => {
      socket.broadcast.to(`user-${data.userId}`).emit('cart-changed', data);
    });

    // Handle wishlist updates
    socket.on('wishlist-updated', (data) => {
      socket.broadcast.to(`user-${data.userId}`).emit('wishlist-changed', data);
    });

    // Handle product updates for admin
    socket.on('product-updated', (data) => {
      socket.broadcast.to('admin').emit('product-changed', data);
    });

    // Handle KPI updates
    socket.on('kpi-updated', (data) => {
      socket.broadcast.to('admin').emit('kpi-changed', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

const emitToAdmin = (event, data) => {
  if (io) {
    io.to('admin').emit(event, data);
  }
};

// Broadcast to all connected clients
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToAdmin,
  emitToAll,
};
