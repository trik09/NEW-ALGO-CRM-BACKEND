const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const process  = require("process");
const ticketModel = require('./models/ticket.model');
const { default: mongoose } = require('mongoose');
const cronjob = require("./Crone-Job/MonthlyMarginCron")

dotenv.config();
connectDB();

const app = express(); // add cores permission for localhost and http://admin.quikservtechnologies.com
// --------------------

// // CORS Configuration - Only allow specific origins
// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://admin.quikservtechnologies.com',
//   'https://admin.quikservtechnologies.com'
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true, // Allow cookies to be sent
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));


// -----------------------
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all domains
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware (for debugging)
app.use('/api/auth', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify({ ...req.body, password: req.body.password ? '***' : undefined }));
  }
  next();
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/device',require('./routes/device.route'));
app.use('/api/task',require('./routes/task.route'));
app.use('/api/qstClient',require('./routes/qstClient.route'));
app.use('/api/employee',require('./routes/employee.route'));
app.use('/api/ticketCloser',require('./routes/ticketCloser.route'));
app.use('/api/technician',require('./routes/technician.route'));
//app.use('/api/issueFound',require('./routes/issueFound.route'));
//app.use('/api/resolution',require('./routes/resolution.route'));
app.use('/api/project',require('./routes/project.route'));
app.use('/api/ticket',require('./routes/ticket.route')); 
app.use('/api/dashboard',require('./routes/maindashboard.routes'))
app.use('/api/ticketStatus',require('./routes/ticketStatus.route'));
//app.use('/api/customerCharge',require('./routes/CustomerChargeRate.route'));
//app.use('/api/bankStatement',require('./routes/BankSatemant.routes')); 
//app.use('/api/state',require('./routes/state.route'));    

app.use('/api', require('./utils/S3Utils'))  // this is used for presigned URL


app.get('/health', (req, res) => res.send('API health is OK'));

// setInterval(() => {
//   const used = process.memoryUsage();
//   console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
// }, 5000);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


cronjob;
