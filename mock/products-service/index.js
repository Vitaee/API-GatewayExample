const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Dummy data
const products = [
  { id: 101, name: 'Widget' },
  { id: 102, name: 'Gadget' },
];

app.use(express.json());

app.get('/products/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'product-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});



app.listen(port, () => {
  console.log(`🟢 product-service listening on port ${port}`);
});
