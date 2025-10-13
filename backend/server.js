const express = require('express');
const cors = require('cors');
const http = require('http');
const routes = require('./src/routes');
const path = require('path');
const { initializeSocket } = require('./src/socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set('io', io);

// API routes
app.use('/api', routes);

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO initialized`);
});