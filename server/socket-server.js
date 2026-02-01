const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.SOCKET_PORT || 4000;

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*' },
});

// In-memory history per room (dev-only)
const history = {}; // { room: [msg, ...] }

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', ({ room }) => {
    if (!room) return;
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  socket.on('leave', ({ room }) => {
    if (!room) return;
    socket.leave(room);
    console.log(`${socket.id} left ${room}`);
  });

  socket.on('history', ({ room }) => {
    const msgs = history[room] || [];
    socket.emit('history', { room, messages: msgs });
  });

  socket.on('message', (msg) => {
    if (!msg || !msg.room) return;
    history[msg.room] = history[msg.room] || [];
    history[msg.room].push(msg);
    // broadcast to room
    io.to(msg.room).emit('message', msg);
  });

  // When a client creates a new public request, broadcast to all workers/customers
  socket.on('create_request', (req) => {
    if (!req) return;
    console.log('New request created', req.id);
    // keep a simple global recent requests list
    history['__requests__'] = history['__requests__'] || [];
    history['__requests__'].unshift(req);
    // emit to all connected clients
    io.emit('request:created', req);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(PORT, () => console.log(`Socket server listening on ${PORT}`));