const { Server } = require('socket.io');

let io;

const SOCKET_DISABLED = process.env.DISABLE_SOCKET === 'true' || process.env.NODE_ENV === 'production';

const initSocket = (server) => {
  if (SOCKET_DISABLED) {
    console.warn('[lib/socket] Socket.io is disabled in this environment.');
    // provide a minimal stub so imports don't break
    io = null;
    return {
      toString: () => '[socket-disabled]',
    };
  }

  const origin = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || 'https://nirvaanaa.in';

  io = new Server(server, {
    cors: {
      origin,
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
