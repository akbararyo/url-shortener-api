// url-shortener-api/src/server.ts
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config'; 
import { customAlphabet } from 'nanoid';

import Link from './models/Link'; 

const app = express();
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 7);

// --- Middleware ---
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] })); // ✅ Use this line // Allows your Next.js app to talk to this API
app.use(express.json());

// --- Routes ---

// 1. CREATE Route (POST /api/shorten)
app.post('/api/shorten', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL. Must start with http(s).' });
  }

  try {
    const slug = nanoid();
    const newLink = new Link({ url, slug });
    await newLink.save(); // Save to MongoDB
    res.status(201).json({ slug: newLink.slug });
  } catch (error) {
    res.status(500).json({ error: 'Server error during link creation.' });
  }
});

// 2. REDIRECT/READ/UPDATE Route (GET /:slug)
app.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    // UPDATE: Find and Increment visit count
    const link = await Link.findOneAndUpdate(
      { slug },
      { $inc: { visitCount: 1 } },
      { new: true }
    );

    if (!link) {
      return res.status(404).send('URL not found.');
    }

    // READ and Redirect
    res.redirect(link.url);

  } catch (error) {
    res.status(500).send('Redirection error.');
  }
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.error("FATAL: MONGO_URI is not defined.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`[Express] Server running on port ${PORT}`));
  })
  .catch(err => console.error('[MongoDB] Connection error:', err));