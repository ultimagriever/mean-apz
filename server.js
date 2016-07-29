var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var env = require('dotenv');
var ObjectID = mongodb.ObjectID;

env.config({ silent: true });

var app = express();
app.use(express.static(__dirname + "/public")); // Set application root as /public
app.use(bodyParser.json()); // Set request and response data format as JSON

var db; // Create outside database connection callback

var options = {
  options: {
    server: {
      auto_reconnect: true,
      socketOptions: {
        connectTimeoutMS: 3600000,
        keepAlive: 3600000,
        socketTimeoutMS: 3600000
      }
    }
  }
}

mongodb.MongoClient.connect(process.env.MONGODB_URI, options, function(error, database) {
    if (error) {
        console.error(error);
        process.exit(1);
    }

    db = database;
    console.log("Database connection ready");

    // Initialize app
    var server = app.listen(process.env.PORT || 8080, function() {
        var port = server.address().port;
        console.log("App now running on port", port);
    });
});

// Routes defined below.
app.get('/route-name', (request, response) => {
  console.log('GET /route-name');
});

const EMPLOYEE_COLLECTION = "employees";

function handleError(response, reason, message, code) {
  console.log("ERROR: " + reason);
  response.status(code || 500).json({"error": message});
}

// GET /employees
app.get('/employees', function(request, response) {
    db.collection(EMPLOYEE_COLLECTION).find({}).toArray(function(error, docs) {
        if (error) {
            handleError(response, error.message, "Failed to get employees"); // 500 Internal Server Error
        } else {
            response.status(200).json(docs); // 200 OK
        }
    });
});

// POST /employees
app.post('/employees', function(request, response) {
    console.log('POST /employees');
    var newEmployee = request.body;

    newEmployee.createDate = new Date();

    if (!(request.body.name || request.body.age)) {
        handleError(response, "Invalid user input", "Must provide name and age.", 400); // 400 Bad Request
    }

    db.collection(EMPLOYEE_COLLECTION).insertOne(newEmployee, function(error, doc) {
        if (error) {
            handleError(response, error.message, "Failed to create employee");
        } else {
            response.status(201).json(doc.ops[0]); // 201 Created
        }
    });
});

// GET /employees/:id
app.get('/employees/:id', function(request, response) {
    db.collection(EMPLOYEE_COLLECTION).findOne({ _id: new ObjectID(request.params.id) }, function(error, doc) {
        if (error) {
            handleError(response, error.message, "Failed to get employee"); // 500 Internal Server Error
        } else {
            response.status(200).json(doc); // 200 OK
        }
    });
});

// PUT /employees/:id
app.put('/employees/:id', function(request, response) {
    var updateDoc = request.body;

    delete updateDoc._id;

    db.collection(EMPLOYEE_COLLECTION).updateOne({ _id: new ObjectID(request.params.id) }, updateDoc, function(error, doc) {
        if (error) {
            handleError(response, error.message, "Failed to update employee data"); // 500 Internal Server Error
        } else {
            response.status(204).end(); // 204 No Content
        }
    });
});

// DELETE /employees/:id
app.delete('/employees/:id', function(request, response) {
    db.collection(EMPLOYEE_COLLECTION).deleteOne({ _id: new ObjectID(request.params.id) }, function(error, result) {
        if (error) {
            handleError(response, error.message, "Failed to delete employee"); // 500 Internal Server Error
        } else {
            response.status(204).end(); // 204 No Content
        }
    });
});
