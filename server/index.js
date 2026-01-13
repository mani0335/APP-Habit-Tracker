const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'users.json');

// MongoDB client - optional. If `MONGO_URI` is present we'll persist to Atlas.
const MONGO_URI = process.env.MONGO_URI || null;
let mongoClient = null;
let usersCollection = null;

async function initMongo() {
  if (!MONGO_URI) return;
  try {
    mongoClient = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect();
    const db = mongoClient.db();
    usersCollection = db.collection('users');
    // ensure index on email for uniqueness check (non-unique here, we handle conflict in app)
    await usersCollection.createIndex({ email: 1 });
    console.log('Connected to MongoDB');
  } catch (e) {
    console.error('MongoDB connection error:', e.message || e);
    mongoClient = null;
    usersCollection = null;
  }
}

function readUsers() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

app.get('/users', async (req, res) => {
  if (usersCollection) {
    try {
      const docs = await usersCollection.find({}).sort({ createdAt: -1 }).toArray();
      return res.json(docs.map((d) => ({ ...d })));
    } catch (e) {
      console.error('Error fetching users from MongoDB', e.message || e);
      return res.status(500).json([]);
    }
  }
  const users = readUsers();
  res.json(users);
});

// Server-Sent Events (SSE) - allows admin UI to receive live updates
const clients = [];

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  // send a comment to keep connection alive
  res.write(': connected\n\n');

  req.on('close', () => {
    const idx = clients.findIndex((c) => c.id === clientId);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });

  const normalizedEmail = String(email).trim().toLowerCase();

  if (usersCollection) {
    try {
      const exists = await usersCollection.findOne({ email: normalizedEmail });
      if (exists) return res.status(409).json({ error: 'User already exists' });

      const newUser = {
        id: Date.now().toString(),
        name: String(name).trim(),
        email: normalizedEmail,
        password: password ?? null,
        createdAt: new Date().toISOString(),
      };

      await usersCollection.insertOne(newUser);

      // broadcast to connected SSE clients
      const payload = JSON.stringify(newUser);
      clients.forEach((c) => {
        try {
          c.res.write(`event: user-registered\ndata: ${payload}\n\n`);
        } catch (e) {
          // ignore individual client errors
        }
      });

      return res.status(201).json(newUser);
    } catch (e) {
      console.error('MongoDB insert error', e.message || e);
      return res.status(500).json({ error: 'server error' });
    }
  }

  // fallback to file storage
  const users = readUsers();
  const exists = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const newUser = {
    id: Date.now().toString(),
    name: String(name).trim(),
    email: normalizedEmail,
    password: password ?? null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  const payload = JSON.stringify(newUser);
  clients.forEach((c) => {
    try {
      c.res.write(`event: user-registered\ndata: ${payload}\n\n`);
    } catch (e) {}
  });

  res.status(201).json(newUser);
});

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  if (usersCollection) {
    try {
      const result = await usersCollection.deleteOne({ id: id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok: true });
    } catch (e) {
      console.error('MongoDB delete error', e.message || e);
      return res.status(500).json({ error: 'server error' });
    }
  }

  let users = readUsers();
  const exists = users.some((u) => u.id === id);
  if (!exists) return res.status(404).json({ error: 'Not found' });
  users = users.filter((u) => u.id !== id);
  writeUsers(users);
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;

initMongo().then(() => {
  app.listen(port, () => console.log(`User API listening on ${port}`));
}).catch((e) => {
  console.error('Failed to initialize Mongo (continuing with file storage):', e.message || e);
  app.listen(port, () => console.log(`User API listening on ${port}`));
});

process.on('SIGINT', async () => {
  try {
    if (mongoClient) await mongoClient.close();
  } catch (e) {}
  process.exit(0);
});
