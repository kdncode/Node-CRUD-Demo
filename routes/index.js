var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
var praseToObjectId = require('mongodb').ObjectID;

const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017'

// Db name 
const dbName = 'contact'

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET New page. */
router.get('/new', (req, res, next) => {
  res.render("new", { title : "Add New Data"} )
})

/* POST New page */
router.post('/new', (req, res, next) => {
  var myData = {
    "name" : req.body.name,
    "phone" : req.body.phone
  }

const insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection("user");
    // Insert some documents
    collection.insert(myData, function(err, result) {
      assert.equal(err, null);
      console.log("Inserted 3 documents into the collection");
      callback(result);
    });
}; 

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  insertDocuments(db, function() {
    client.close();
  });
});

res.redirect('/new');
});

/* Get View page */
router.get('/view', function(req, res, next) {

  // Find All Documents from https://github.com/mongodb/node-mongodb-native
  const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('user');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs)
      callback(docs);
    });
  }

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

      findDocuments(db, function(viewData) {
        res.render('view', { title: 'View my data', userData : viewData} )
        console.log(viewData)
        client.close();
      });
    });
  });


module.exports = router;
