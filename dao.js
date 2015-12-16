//lololol
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
  
//var connection_string = 'localhost:27017/quiz';

var connection_string = '127.0.0.1:27017/quiz';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

var db;
Dao = function(callback){
  console.log('connecting to mongodb://' + connection_string);
  MongoClient.connect('mongodb://' + connection_string, function(error, mongoDb){
    if(error){
      console.error("Error! You must start MongoDB first!");
      process.exit(1);
    }else{
	  console.log("Connected to mongodb/quiz");
      db = mongoDb;
      callback();
    }
  });
};
exports.Dao = Dao;

function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateConnectionId(){
  //console.log('generateConnectionId()');
  return getRandomInt(1000, 10000);
}

Dao.prototype.createQuiz = function(body, callback){
  var newQuiz = body;
  newQuiz._id = new ObjectID();
  newQuiz.dateCreated = new Date();
  newQuiz.connectionId = generateConnectionId();
  for(var i = 0; i < newQuiz.questions.length; i++){
    newQuiz.questions[i]._id = new ObjectID();
    for(var j = 0; j < newQuiz.questions[i].answers.length; j++){
      newQuiz.questions[i].answers[j]._id = new ObjectID();
      newQuiz.questions[i].answers[j].answer._id = new ObjectID();
    }
  }
  db.collection('quizzes', function(error, foundCollection){
    if(error) callback(error);
    else{
      foundCollection.insert(newQuiz, function(){
        callback(null, newQuiz);
      });
    }
  });
};

Dao.prototype.getQuizzes = function(callback){
  db.collection('quizzes', function(error, foundCollection){
    if(error) callback(error);
    else{ 
      foundCollection.find().toArray(function(error, result){
        if(error){
          callback(result);
        }else{
          callback(null, result);
        }
      });
    }
  });
}

Dao.prototype.getQuizById = function(id, callback){
  db.collection('quizzes', function(error, foundCollection){
    if(error) callback(error);
    else{
      foundCollection.findOne({'_id':new ObjectID(id)}, function(error, result){
        if(error) callback(error);
        else callback(null, result);
      });
    }
  });
}

Dao.prototype.getUser = function(username, callback){
  db.collection('users', function(error, foundCollection){
    if(error) callback(error);
    else{
      foundCollection.findOne({'usernameUpperCase':username.toUpperCase()}, function(error, result){
        if(error) callback(error);
        else callback(null, result);
      }); 
    } 
  });
};

Dao.prototype.getUsers = function(callback){
  db.collection('users', function(error, foundCollection){
    if(error) callback(error);
    else{
      foundCollection.find().toArray(function(error, results){
        if(error) callback(error);
        else callback(null, results);
      });
    } 
  });
};

Dao.prototype.createUser = function(newUser, callback){
  db.collection('users', function(error, foundCollection){
    if(error) callback(error);
    else{
      newUser.createdAt = new Date();
      newUser.usernameUpperCase = newUser.username.toUpperCase();
      foundCollection.insert(newUser, function(){
        callback(null, newUser);
      });
    }
  });
};
