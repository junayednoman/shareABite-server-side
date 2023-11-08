const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = 5000;

// middlewares
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('This server is running')
})


// ========================== ********** MONGO DB CODE START ******** =======================

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r8yk5up.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const foodCollection = client.db("shareABite").collection("foods");
        const foodRequestCollection = client.db("shareABite").collection("foodRequests");

        // apis for foods

        app.post('/foods', async (req, res) => {
            const food = req.body;
            const result = await foodCollection.insertOne(food);
            res.send(result);
        })

        app.get('/foods', async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query);
            res.send(result);
        })

        app.get('/my-foods', async (req, res) => {
            const email = req.query?.email;
            let query = {};
            if (req.query?.email) {
                query = { donor_email: email }
            }
            const result = await foodCollection.find(query).toArray();
            res.send(result);
        })

        app.delete('/my-foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.deleteOne(query)
            res.send(result)
        })

        // api for updating food item
        app.put('/food/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const foodData = req.body;

            const updateData = {
                $set: {
                    food_name: foodData.food_name,
                    food_image: foodData.food_image,
                    pickup_location: foodData.pickup_location,
                    quantity: foodData.quantity,
                    additional_notes: foodData.additional_notes,
                }
            }
            const result = await foodCollection.updateOne(filter, updateData, options)
            res.send(result);
        })

        app.patch('/foods/:id', async (req, res) => {
            const foodData = req.body;
            const id = req.params.id;

            const filter = { _id: new ObjectId(id) };
            const updateData = {
                $set: {
                    food_status: foodData.food_status
                }
            }
            const result = await foodCollection.updateOne(filter, updateData)
            res.send(result);

        })

        // insert food request data to database
        app.post('/food-request', async (req, res) => {
            const foodData = req.body;
            const result = await foodRequestCollection.insertOne(foodData)
            res.send(result)
        })
        app.get('/food-request/:id', async (req, res) => {
            const id = req.params.id;
            const query = { food_id: id }
            const result = await foodRequestCollection.findOne(query)
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// ========================== **** MONGO DB CODE END ***** =======================


app.listen(port, () => {
    console.log('server running from port: ', port)
})