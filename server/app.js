import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import chalk from 'chalk';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import passport from 'passport';
import cors from './config/corsConfig.js';
import './config/mongodb.js';
import { displayStartupMessage } from './config/start.js';
import passportConfig from './config/passport.js';
import promMid from 'express-prometheus-middleware';
import userRoutes from './Router/user.js';

// Initialize Express and HTTP server
displayStartupMessage();
const app = express();


const PORT = process.env.PORT || 5000;
app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}));

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


// CORS setup
app.use(cors);

// Initialize session middleware
app.use(session({
  secret: 'mysecretkey',  // Replace with your secret key
  resave: false,          // Avoid resaving unchanged sessions
  saveUninitialized: true, // Save new (but unmodified) sessions
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // Session cookie valid for 1 day
}));


//Passport.js Authentication setUp
app.use(passport.initialize());
passportConfig(passport); // Passport config

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const Logtime = new Date().toLocaleString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const methodColor = req.method === 'GET' ? chalk.green :
                        req.method === 'POST' ? chalk.blue :
                        req.method === 'PUT' ? chalk.yellow :
                        req.method === 'DELETE' ? chalk.red : chalk.white;
    
    const statusColor = res.statusCode >= 500 ? chalk.red :
                        res.statusCode >= 400 ? chalk.yellow :
                        res.statusCode >= 300 ? chalk.cyan :
                        res.statusCode >= 200 ? chalk.green : chalk.white;

    console.log(
      `\n${chalk.bgWhite.black(' LOG ')} ${methodColor(req.method)} ${chalk.bold(req.path)} ` +
      `\nStatus: ${statusColor(res.statusCode)} ` +
      `\nTime: ${chalk.gray(Logtime)} ` +
      `\nDuration: ${chalk.magenta(duration + 'ms')}\n`
    );
  });

  next();
});


app.use('/user', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send("Server is live.... ");
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err); // Log the error to the console
  const statusCode = err.status || 500; // Use the error status if available, otherwise use 500
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode
    }
  });
});

app.use((req, res, next) => {
  res.status(404).json({ title: '404', message: 'Page Not Found' });
});

// Start the server
app.listen(PORT ,() => {
  console.log(`Click to Connect: http://localhost:${PORT}/`);
});
