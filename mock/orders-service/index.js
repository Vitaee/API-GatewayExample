const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Dummy data
const orders = [
  { id: 1001, total: 49.99 },
  { id: 1002, total: 19.95 },
];

app.use(express.json());

app.get('/orders/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'order-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.get('/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find(o => o.id === id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});



app.listen(port, () => {
  console.log(`🟢 order-service listening on port ${port}`);
});
