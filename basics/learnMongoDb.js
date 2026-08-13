require('dotenv').config();
const { MongoClient } = require('mongodb');

// Set MONGODB_URI in .env (not committed) or export it in the shell.
// In URIs, @ in the password must be encoded as %40.
const url = process.env.MONGODB_URI;
if (!url) {
  throw new Error('Missing MONGODB_URI. Copy .env.example to .env and set your connection string.');
}

const client = new MongoClient(url);

const dbName = 'HelloWorld';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('User');

  // const findResult = await collection.find({}).toArray();
  // console.log('Found documents =>', findResult);

  // const data = {
  //   name: 'Rahul',
  //   age: 30,
  //   city: 'Bhubaneswar',
  //   pin: '751001'
  // }
  // const data2 = {
  //   name: 'Chandan',
  //   age: 28,
  //   city: 'Cuttack',
  //   pin: '753001'
  // } 
  // const insertResult = await collection.insertMany([data, data2]);
  // console.log('Inserted document =>', insertResult.insertedIds);
  // // the following code examples can be pasted here...

  // return 'done. inserted id =>' + insertResult.insertedId;

  // const filteredDoc = await collection.countDocuments({name: 'Rahul'});
  // console.log('Filtered document =>', filteredDoc);

  // const deletedDoc = await collection.deleteOne({name: 'Rahul'});
  // // console.log('Deleted document =>', deletedDoc.deletedCount);
  // console.log('Deleted document =>', deletedDoc);

  // const updatedDoc = await collection.updateOne({name: 'Rahul'}, {$set: {age: 32}});
  // console.log('Updated document =>', updatedDoc);
  // return 'done. updated id =>' + updatedDoc.upsertedId;

  // const updatedDoc = await collection.updateOne({name: 'Chandan'}, {$set: {age: 27, pin: '753002'}});
  // console.log('Updated document =>', updatedDoc);
  // return 'done. updated id =>' + updatedDoc.upsertedId;

  const filteredDoc = await collection
    .find({ age: { $gt: 27 }, name: 'Subham Dash' }, {projection: { name: 1, age: 1}}).sort({age: 1})
    .toArray();
  console.log('Filtered document =>', filteredDoc);

}


main()
  .then((result) => console.log(result))
  .catch((err) => console.error(err))
  .finally(() => client.close());

