// create an express server
const express = require("express");
// const bodyParser = require('body-parser')
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

// create express server
const app = express();
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://melodicmastery:QgtVXwZo1kT3EXPU@cluster0.ro4rymx.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create a collection for user
    const userCollection = client.db("MelodicMasteryDB").collection("users");
    // create a collection for classes
    const classCollection = client.db("MelodicMasteryDB").collection("classes");

    app.get("/", (req, res) => {
      res.status(200).json({ message: "welcome to server" });
    });

    // get all classes
    app.get("/classes", async (req, res) => {
      const allClasses = await classCollection.find().toArray();
      // console.log(allClasses);

      allClasses.length > 0
        ? res.status(200).json(allClasses)
        : res.status(404).json({ error: "data not found" });
    });

    // get all users
    app.get("/users", async (req, res) => {
      const allUsers = await userCollection.find().toArray();
      // console.log(allUsers);

      allUsers.length > 0
        ? res.status(200).json(allUsers)
        : res.status(404).json({ error: "data not found" });
    });

    // get single user
    app.get("/single-user", async (req, res) => {
      const user = await userCollection.findOne({ email: req.query?.email });
      // console.log(user);

      user
        ? res.status(200).json(user)
        : res.status(404).json({ error: "data not found" });
    });

    // create an user
    app.post("/create-user", async (req, res) => {
      const { name, image, email, role } = req.body;
      // find existing user
      const existingUser = await userCollection.findOne({ email });

      if (existingUser) {
        return res.json({ message: "User already exist" });
      }

      const newUser = await userCollection.insertOne({
        name,
        image,
        email,
        role,
        selectedClasses: [],
      });
      // console.log(newUser);
      newUser.acknowledged
        ? res.status(200).json({ message: "User successfully created" })
        : res.status(400).json({ error: "Bad Request" });
    });

    // update selected class's seat
    app.put("/user/selected-class", async (req, res) => {
      const { email, id } = req.query;
      // update the user
      const updatedUser = await users.updateOne(
        { email: email },
        { $push: { selectedClasses: id } }
      );
    });

    // update unselected class's seat
    app.put("/user/unselected-class", async (req, res) => {
      const { id, email } = req.query;

      // update the user
      const updatedUser = await users.updateOne(
        { email: email },
        { $pull: { selectedClasses: id } }
      );
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
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

module.exports = app;
