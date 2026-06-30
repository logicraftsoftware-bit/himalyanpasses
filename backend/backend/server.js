import 'dotenv/config';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import app from './app.js';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Create HTTP server and attach socket.io with CORS + transports set
    const httpServer = createServer(app);
    const io = new IOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      path: '/socket.io',
    });

    // Attach io to app so route handlers can emit events
    app.locals.io = io;

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      socket.on('joinDashboard', () => {
        socket.join('dashboard');
        console.log('Socket joined dashboard:', socket.id);
      });

      socket.on('leaveDashboard', () => {
        socket.leave('dashboard');
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', socket.id, reason);
      });
    });

    // ✅ Important: listen on all interfaces
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
