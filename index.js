const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port =process.env.PORT|| 3000;
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2gqzmaz.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', (req, res) => {
  res.send('Server is runing');
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const event = client.db('event');
    const eventCollection = event.collection('events');


    app.get('/events', async (req, res) => {
        const cursor = eventCollection.find();
      const result = await cursor.toArray();
      res.send(result)

    })
    app.get('/events/:id', async (req, res) => {
      const id = req.params.id;
      const event={_id:new ObjectId(id)}
        const cursor = eventCollection.findOne(event);
      const result = await cursor;
      res.send(result)

    })

    app.post('/events', async (req, res) => {
    
      const event = req.body
      const result = await eventCollection.insertOne(event);
      res.send(result)
    })

    app.post('/events/join/:id', async (req, res) => {
      const id = req.params.id;
      const user = req.body;
       try {
         await eventCollection.updateOne(
           { _id: new ObjectId(id) },
           { $push: { joinedUsers: user } }
         );

         res.send({ success: true, message: 'Joined successfully' });
       } catch (err) {
         res.status(500).send({ success: false, message: 'Server error' });
       }

    })

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
