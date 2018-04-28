var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
var convertToObjectId = require('mongodb').ObjectID;

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

/* POST Create New page */
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
    // Get the users collection
    const collection = db.collection('user');
    // Find some users
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      // console.log("Found the following records");
      console.log(docs)
      callback(docs);
    });
  }

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
      findDocuments(db, function(viewData) {
        res.render('view', { title: 'View my data', userData : viewData} )
        // console.log(viewData)
        client.close();
      });
    });
  });

/* Delete data in View page. */
router.get('/delete/:deleteid', function(req, res, next) {
  var deleteid = convertToObjectId(req.params.deleteid);

  // Delete function
  const removeContact = function(db, callback) {
    // Get the user collection
    const collection = db.collection('user');
    // Delete document where _id is deleteid
    collection.deleteOne({ _id : deleteid }, function(err, result) {
      assert.equal(err, null);
      console.log("successfully deleted")
      callback(result);
      
    });    
  }

  // Connect Mongo to delete
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
      removeContact(db, function() {
        client.close();
        res.redirect('/view')
      });
  });

});

/* Update data */

  // Get data
  router.get('/update/:updatedid', (req, res, next) =>{
    var updatedid = convertToObjectId(req.params.updatedid);
    
    // Find user with a Query Filter (https://github.com/mongodb/node-mongodb-native)
    const findDocuments = function(db, callback) {
      // Get the user collection
      const collection = db.collection('user');
      // Find some users
      collection.find({ _id : updatedid }).toArray(function(err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        callback(docs);
      });
    }

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
      findDocuments(db, function(viewData) {
        res.render('update', { title: 'Update my data', userData : viewData} )
        console.log(viewData)
        client.close();
      });
    });
  })

  // Update data in db 
  router.post("/update/:updatedid", (req, res, next) => {
    var updateid = convertToObjectId(req.params.updatedid);
    var myData = {
      "name" : req.body.name,
      "phone" : req.body.phone
    }

    // Update a document (https://github.com/mongodb/node-mongodb-native)
    const updateDocument = function(db, callback) {
      const collection = db.collection('user');
      collection.updateOne({ _id : updateid }
        , { $set: myData }, function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Updated the document with the field a equal to 2");
        callback(result);
      });  
    }

    // Connect to Mongo to update - Use connect method to connect to the server
    MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      updateDocument(db, function() {
          client.close();
          res.redirect("/view")
        });
      });   
  })


module.exports = router;
