const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const http = require('http'); // Import the http module
const socketModule = require('./socket');
const app = express();

app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3006;
app.use('/public', express.static('public'));
app.use((req, res, next) => {
  req.io = io; // Assuming you have 'io' available
  next();
});

app.use('/users', userRoutes);
app.use('/task', taskRoutes);

mongoose.connect('mongodb://localhost:27017/Task_Management_App', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', async () => {
  console.log('Connected to MongoDB');
});

const server = http.createServer(app); // Create an HTTP server
const io = socketModule.initializeSocket(server); // Initialize Socket.io with your HTTP server

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
