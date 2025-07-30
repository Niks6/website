const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://golu:golu1234@cluster0.i7alpbh.mongodb.net/";
const client = new MongoClient(uri);

app.get('/api/data', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('gupta-electronics');
    const collection = database.collection('products');
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});