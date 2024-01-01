const express = require('express')
const app = express()
const cors=require('cors')
require("dotenv").config();
const { auth } = require('express-openid-connect');
// const { requiresAuth } = require('express-openid-connect');

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);
const port = process.env.PORT || 5000;


//middleware
app.use(express.json());
app.use(cors());

// USERNAME:aryanagarwal858
//PASSWORD:644QYTwT0vVdB9ez



// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.SECRET,
//   baseURL:process.env.BASEURL,
//   clientID:process.env.CLIENTID,
//   issuerBaseURL: process.env.ISSUER
// };

// // auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));

// // req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

// app.get('/profile', requiresAuth(), (req, res) => {
//   res.send(JSON.stringify(req.oidc.user));
// });


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mern-job-portal.1lmqlws.mongodb.net/?retryWrites=true&w=majority`;
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
    // Send a ping to confirm a successful connection
    //create db
    const db=client.db("mernJobPortal");
    const jobCollections=db.collection("demoJobs");

    //post all jobs
    app.post("/post-job",async(req,res)=>{
      const body=req.body;
      body.createAt=new Date();
      // console.log(body);
      const result=await jobCollections.insertOne(body);
      if(result.insertedId){
        return res.status(200).send(result);
      }
      else{
        return res.status(404).send({
          message:"can not insert! try again later",
          status:false
        })
      }
    })
    //get all jobs
    app.get("/all-jobs",async(req,res)=>{
      const jobs=await jobCollections.find({}).toArray();
      res.send(jobs);
    })

    //get single job using id
    app.get("/all-jobs/:id",async(req,res)=>{
      const id=req.params.id;
      const job=await jobCollections.findOne({
        _id:new ObjectId(id)
      })
      res.send(job)

    })

    //get jobs by email
    app.get("/myJobs/:email",async(req,res)=>{
      // console.log(req.params.email)
      const jobs=await jobCollections.find({postedBy:req.params.email}).toArray();
      res.send(jobs);
    })

    // delete a job
    app.delete("/job/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)}
      const result=await jobCollections.deleteOne(filter);
      res.send(result);
      
    })

    //update a job
    app.patch("/update-job/:id",async(req,res)=>{
      const id=req.params.id;
      const jobData=req.body;
      const filter={_id:new ObjectId(id)};
      const options={upsert:true};
      const updateDoc={
        $set:{
         ...jobData
        },
      };
      const result=await jobCollections.updateOne(filter,updateDoc,options);
      res.send(result);

    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello develop!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})