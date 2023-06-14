// create an express server
const express = require("express");
// const bodyParser = require('body-parser')
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");


// create express server
const app = express();
app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://melodicmastery:QgtVXwZo1kT3EXPU@cluster0.ro4rymx.mongodb.net/?retryWrites=true&w=majority";

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

     // create a collection for user
     const userCollection = client.db("MelodicMasteryDB").collection("users");
     // create a collection for classes
     const classCollection = client
         .db("MelodicMasteryDB")
         .collection("classes");


        app.get("/", (req, res) => {
            res.status(200).json({ message: "welcome to server" });
        });


        app.use((req, res, next) => {
            res.status(404).json({
                message: "Not Found",
            });
        });

        // server error handling
        app.use((err, req, res, next) => {
            console.log(err.stack);
            res.status(500).send("something broke");
        });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

module.exports = app;
