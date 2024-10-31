const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const startSyncing = require('./config/sync.js');
const { initializeBlockchain } = require('./config/blockchain');

// load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();
// Blockchain
initializeBlockchain();
// 
startSyncing();

// Create Express instance
const app = express();

// Express setup
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
  );
  next();
});
app.use(express.static('build'));

// Route files
const swapRouter = require('./routes/swapRouter.js');

// Dev middleware Morgan
app.use(morgan('dev'));

// Mount routers
app.use('/api/v1/swap', swapRouter);

// Handling other routes
app.get('*', (req, res) => {
  // res.send('Server is running!');
  res.sendFile(`${__dirname}/build/index.html`);
});

// access env vars
const PORT = 3000;

const server = app.listen(
  PORT,
  console.log(
    `The server is running on port ${PORT}`
  )
);

/**
 * Error handler.
 * Sends 400 for Mongoose validation errors.
 * 500 otherwise.
 * Do all error handling here.
 */
app.use((err, req, res, next) => {
  console.log('Async error handler');

  if (err.name === 'ValidationError') {
    return res.status(400).json(err.errors);
  }
  if (err.name === 'CastError') {
    return res.status(404).json(err.errors);
  } else {
    console.log(err);
  }

  return res.status(500).json(err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('UNHANDLE');
  console.log(`Error: ${err.message}`);
  //close server and exit process
  server.close(() => process.exit(1));
});
