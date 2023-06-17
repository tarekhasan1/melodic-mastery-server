// create an express server
const express = require("express");
// const bodyParser = require('body-parser')
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");

// create express server
const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URL;

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
    client.connect();

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
        enrolledClasses: [],
      });
      // console.log(newUser);
      newUser.acknowledged
        ? res.status(200).json({ message: "User successfully created" })
        : res.status(400).json({ error: "Bad Request" });
    });

    // update class status
    app.put("/update-status", async (req, res) => {
      const { id, status } = req.query;
      // Generate a new ObjectId
      const objectId = new ObjectId(id);
      const updatedClass = await classCollection.updateOne(
        { _id: objectId },
        { $set: { status } }
      );
      // console.log(updatedClass);

      updatedClass.acknowledged
        ? res.status(200).json({ message: "Status successfully updated" })
        : res.status(400).json({ error: "Bad Request" });
    });

    // send class approved/denied feedback
    app.put("/send-feedback", async (req, res) => {
      const { id } = req.query;
      // Generate a new ObjectId
      const objectId = new ObjectId(id);
      const updatedClass = await classCollection.updateOne(
        { _id: objectId },
        { $set: { feedback: req.body.message } },
        { upsert: true }
      );
      // console.log(updatedClass);

      updatedClass.acknowledged
        ? res.status(200).json({ message: "Feedback successfully sent" })
        : res.status(400).json({ error: "Bad Request" });
    });

    // update user role
    app.put("/update-role", async (req, res) => {
      const { role, email } = req.query;

      // update the user
      const updatedUser = await userCollection.updateOne(
        { email: email },
        { $set: { role } }
      );

      updatedUser.acknowledged
        ? res.status(200).json({ message: `Added as ${role}` })
        : res.status(400).json({ error: "Bad Request" });
    });

    // update selected class's seat
    app.put("/user/selected-class", async (req, res) => {
      const { email, id } = req.query;
      // update the user
      const updatedUser = await userCollection.updateOne(
        { email: email },
        { $push: { selectedClasses: id } }
      );
    });

    // update unselected class's seat
    app.put("/user/unselected-class", async (req, res) => {
      const { id, email } = req.query;

      // update the user
      const updatedUser = await userCollection.updateOne(
        { email: email },
        { $pull: { selectedClasses: id } }
      );
    });

    // add a class as instructor
    app.post("/add-class", async (req, res) => {
      const { name, email } = req.body;
      console.log(req.body);
      // find existing user
      const existingClass = await classCollection.findOne({ name, email });

      if (existingClass) {
        return res.json({ error: "Class already exist" });
      }

      const newClass = await classCollection.insertOne({
        ...req.body,
        status: "pending",
        enrolledStudents: 0,
      });

      // console.log(newUser);
      newClass.acknowledged
        ? res.status(200).json({ message: "Class successfully added" })
        : res.status(400).json({ error: "Bad Request" });
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
