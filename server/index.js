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
