import express, { Request, Response } from 'express';
import path from 'path';
import { list } from './restaurants';
import { fetchRestaurantDetails } from './api';
import { limitConcurrency } from './concurrency';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../../public')));

// Example API route
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express!' });
});

// Streaming endpoint - sends chunks every 0.3 seconds for 5 seconds
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/x-ndjson'); // newline-delimited JSON
  res.setHeader('Cache-Control', 'no-cache');

  let counter = 0;
  const maxDuration = 3000; // 3 seconds
  const interval = 100; // 0.1 seconds
  const startTime = Date.now();

  const intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    counter++;

    const chunk = {
      type: 'progress',
      progress: counter,
    };

    res.write(JSON.stringify(chunk) + '\n');

    // Check if we've exceeded the max duration
    if (elapsed >= maxDuration) {
      clearInterval(intervalId);
      const conclusionChunk = {
        type: 'conclusion',
        conclusion: `Streaming completed after ${counter} updates`,
      };
      res.write(JSON.stringify(conclusionChunk) + '\n');
      res.end();
    }
  }, interval);
});

// Streams restaurant details progressively, fetching with concurrency of 5
app.get('/api/restaurants/stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');

  let closed = false;
  req.on('close', () => { closed = true; });

  try {
    res.write(JSON.stringify({ type: 'start', total: list.length }) + '\n');

    let processed = 0;

    for await (const outcome of limitConcurrency(list, 5, item => fetchRestaurantDetails(item.id))) {
      if (closed) break;
      processed++;

      if (outcome.error) {
        res.write(JSON.stringify({ type: 'error', id: outcome.item.id, processed, total: list.length }) + '\n');
      } else {
        res.write(JSON.stringify({ type: 'restaurant', data: outcome.result, processed, total: list.length }) + '\n');
      }
    }

    if (!closed) {
      res.write(JSON.stringify({ type: 'complete', total: list.length }) + '\n');
      res.end();
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream failed' });
    } else {
      res.end();
    }
  }
});

// Serve index.html for root route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
