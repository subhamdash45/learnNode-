const express = require('express');

const app = express()
// Use 3001 so port 3000 can be used by learnMongoose.js (POST /signup).
const port = Number(process.env.PORT) || 3001

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res)=>{
  res.send("Hello World");
})

app.get("/user", (req, res)=>{
  console.log(req.query);
  res.send("User Page");
})

app.get("/user/:id", (req, res)=>{
  console.log(req.params);
  console.log(req.query);
  res.send(`User Page with id ${req.params.id}`);
})

app.post("/user", (req, res)=>{
  console.log("payload:", req.body);
  res.send("User payload received");
})

app.listen(port, () => {
  console.log(`learnExpress.js on http://localhost:${port} (no /signup — use learnMongoose.js on :3000)`);
})