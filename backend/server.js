require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const connectDB = require('./src/config/db');
const configureSocket = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Connect to Database
connectDB();

// Configure Socket.io
configureSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
