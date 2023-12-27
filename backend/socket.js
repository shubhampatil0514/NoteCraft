const socketIo = require('socket.io');

const initializeSocket = (server) => {
  const io = socketIo(server);
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  return io;
};

module.exports = { initializeSocket };
