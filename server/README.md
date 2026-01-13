Run the simple users API for local development.

Install dependencies and start:

```bash
cd server
npm install
npm start
```

The API endpoints:
- `GET /users` — returns all users
- `POST /users` — create user (body: `{ name, email, password }`)
- `DELETE /users/:id` — delete user

By default the server listens on port `4000`.
