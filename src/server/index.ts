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

// GET /api/restaurants/stream
// Streams restaurant details to the client as newline-delimited JSON (NDJSON).
// Rather than waiting for all fetches to complete, each result is written to the
// response as soon as it arrives, letting the client render cards progressively.
// Concurrency is capped at 5 so we don't flood the upstream restaurant API.
//
// Chunk shape emitted over the stream:
//   { type: 'start',      total: number }                            — sent once at the start
//   { type: 'restaurant', data: RestaurantDetails, processed, total } — one per successful fetch
//   { type: 'error',      id: number, processed, total }             — one per failed fetch
//   { type: 'complete',   total: number }                            — sent once when all done
app.get('/api/restaurants/stream', async (req: Request, res: Response) => {
  // NDJSON keeps the connection open; each JSON object is terminated by a newline.
  // no-cache prevents proxies from buffering chunks before they reach the client.
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');

  // Track whether the client disconnected mid-stream so we can stop processing early.
  let closed = false;
  req.on('close', () => { closed = true; });

  try {
    // Tell the client how many restaurants to expect so it can show a total in the UI.
    res.write(JSON.stringify({ type: 'start', total: list.length }) + '\n');

    let processed = 0;

    // limitConcurrency keeps exactly 5 upstream fetches in-flight at any time,
    // yielding each outcome (success or error) as it settles.
    for await (const outcome of limitConcurrency(list, 5, item => fetchRestaurantDetails(item.id))) {
      // Stop writing if the client already closed the connection.
      if (closed) break;
      processed++;

      if (outcome.error) {
        // The fetch failed (e.g. 404 / timeout). Errors are already logged to the
        // external logging service inside fetchRestaurantDetails, so just notify the client.
        res.write(JSON.stringify({ type: 'error', id: outcome.item.id, processed, total: list.length }) + '\n');
      } else {
        // Successful fetch — stream the full restaurant details to the client immediately.
        res.write(JSON.stringify({ type: 'restaurant', data: outcome.result, processed, total: list.length }) + '\n');
      }
    }

    if (!closed) {
      // Signal that the stream is finished so the client can finalise its UI.
      res.write(JSON.stringify({ type: 'complete', total: list.length }) + '\n');
      res.end();
    }
  } catch (err) {
    // If headers haven't been sent yet we can still return a proper HTTP error.
    // Otherwise the stream is already open and we just close it cleanly.
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
