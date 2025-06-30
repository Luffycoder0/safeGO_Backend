const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

dotenv.config({ path: './config.env' });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

//////////////////////////////////////////
// Database
//////////////////////////////////////////
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connected Successfully'))
  .catch((err) => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });

//////////////////////////////////////////
// Create HTTP + Socket server
//////////////////////////////////////////
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

//////////////////////////////////////////
// Socket.io
//////////////////////////////////////////
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('driverStatusUpdated', (data) => {
    console.log('Driver update received:', data);
    io.emit('dashboardUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

//////////////////////////////////////////
// Start the server
//////////////////////////////////////////
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  server.close(() => {
    process.exit(1);
  });
});
