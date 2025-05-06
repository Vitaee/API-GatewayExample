const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Dummy data
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

app.use(express.json());

app.get('/users/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});


app.get('/users', (req, res) => {
  res.json(users);
});


app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


app.listen(port, () => {
  console.log(`🟢 user-service listening on port ${port}`);
});
