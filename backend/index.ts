import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import estimateRouter from './routes/estimate.ts';
import { errorHandler } from './middleware/error.ts';
import { swaggerMiddleware } from './swagger.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Global middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Basic rate limiting
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// API routes
app.use('/api', estimateRouter);

// Docs
app.use('/docs', swaggerMiddleware);

// Error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`✅ API ready at http://localhost:${port}`);
  console.log(`📘 Docs at http://localhost:${port}/docs`);
});