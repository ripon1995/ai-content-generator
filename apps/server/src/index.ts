import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Welcome API endpoint
app.get('/api/welcome', (req: Request, res: Response) => {
res.json({
    message: 'Welcome to AI Content Generator API! 🚀',
    status: 'Server is running',
    timestamp: new Date().toISOString()
});
});

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK' });
  });

  app.listen(PORT, () => {
    console.log('Welcome... server started');
  });