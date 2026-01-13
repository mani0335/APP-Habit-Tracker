const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'users.json');

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

app.get('/users', (req, res) => {
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

app.post('/users', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  const users = readUsers();
  const exists = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const newUser = {
    id: Date.now().toString(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    password: password ?? null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  // broadcast to connected SSE clients
  const payload = JSON.stringify(newUser);
  clients.forEach((c) => {
    try {
      c.res.write(`event: user-registered\ndata: ${payload}\n\n`);
    } catch (e) {
      // ignore individual client errors
    }
  });

  res.status(201).json(newUser);
});

app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  let users = readUsers();
  const exists = users.some((u) => u.id === id);
  if (!exists) return res.status(404).json({ error: 'Not found' });
  users = users.filter((u) => u.id !== id);
  writeUsers(users);
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`User API listening on ${port}`));
