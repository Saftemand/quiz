var WebSocketServer = require('ws').Server;
var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var Dao = require('./dao').Dao;
var Quiz = require('./quiz').Quiz;
var cors = require('cors');


var dao = new Dao(function (){
  //createQuiz();
});



var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server = app.listen(port, ipaddress, function() {
  console.log('Quiz http server running on: ' + ipaddress + ':' + port);
});

app.post('/createQuiz', function(req, res){
	console.log('/createQuiz');
	dao.createQuiz(req.body, function(error, result){
		if(error) res.status(400).send(error);
		else res.status(200).send(result);
	});
});

app.get('/',function(req,res){
  res.redirect('http://' + req.headers.host + '/start.html');
});

//Admin methods
app.get('/getQuizzes', function(req, res){
  console.log("getQuizzes");
  dao.getQuizzes(function(error, result){
    if(error){
      res.status(200).send({response:'error'});
    }else{
      res.status(200).send(result);
    } 
  });
});

app.post('/startQuiz', function(req, res){
  startQuiz(req.body.id, req.body.countdown);
  res.status(200).send({response:'ok'});
});

app.post('/stopQuiz', function(req, res){
  res.status(200).send({response:'not implemented'});
});

//Participant methods
app.get('/connectToQuiz/:connectionId/:username', function(req, res){
  console.log("connectWithoutSessionId");
  var id = req.params.connectionId;
  var username = req.params.username;
  console.log('logging in perhaps...1');
  res.status(200).send(getResponseObjectWithoutSessionId(id, username));
});

app.get('/connectToQuiz/:connectionId/:username/:sessionId', function(req, res){
  console.log('connectWithSessionId');
  var id = req.params.connectionId;
  var username = req.params.username;
  var sessionId = req.params.sessionId;
  console.log('logging in perhaps...2');
  res.status(200).send(getResponseObjectWithSessionId(id, username, sessionId));
});

function usernameTaken(username, connectionId){
  //TODO check the quiz with the given connectionId.
  if(activeQuiz.usernameTaken(username)){
    return true;
  }else{
    return false;
  }
}

function getUsernameForSessionId(sessionId){
  return activeQuiz.getUsernameForSessionId(sessionId);
}

function generateSessionId() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
}

function getResponseObjectWithSessionId(id, username, sessionId){
  console.log('getting response with');
  if(!activeQuiz) return {action:'error'};
  var usernameForSession = getUsernameForSessionId(sessionId);
  if(activeQuiz.getConnectionId() == id && usernameForSession){
    return {action:'ok', username:usernameForSession, points:activeQuiz.getPointsForUsername(usernameForSession)};
  }else if(activeQuiz.getConnectionId() == id && usernameForSession === null && usernameTaken !== null){
    console.log("create new sessionId and redirect user");
    var sessionId = generateSessionId();
    activeQuiz.addSessionId(username, sessionId);
    return {action:'ok', sessionId:sessionId};
  }else if(activeQuiz.getConnectionId() != id){
    console.log('connectionId: ' + activeQuiz.getConnectionId());
    console.log('id: ' + id);
    return {action:'wrongConnectionId'};
  }else if(usernameTaken(username, id)){
    return {action:'usernameTaken'};
  }
}

function getResponseObjectWithoutSessionId(id, username){
  console.log('getting response without');
  if(!activeQuiz) return {action:'error'};
  if(activeQuiz.getConnectionId() == id && !usernameTaken(username, id)){
    var sessionId = generateSessionId();
    activeQuiz.addSessionId(username, sessionId);
    return {action:'ok', sessionId:sessionId};
  }else if(activeQuiz.getConnectionId() != id){
    console.log('connectionId: ' + activeQuiz.getConnectionId());
    console.log('id: ' + id);
    return {action:'wrongConnectionId'};
  }else if(usernameTaken(username, id)){
    return {action:'usernameTaken'};
  }
}

function getResponseObjectForObserver(id){
  if(!activeQuiz) return {action:'error'};

  if(activeQuiz.getConnectionId() == id){
    return {action:'ok'};
  }else{
    return {action:'wrongId'};
  }
}

var activeQuiz;
function startQuiz(id, countdown){
  activeQuiz = new Quiz(id, dao, function(error){
    console.log(error);
    if(error) console.log("No quiz exists with the given id!");
    else{
      console.log(activeQuiz.getTitle());
      console.log(activeQuiz.getConnectionId());
      console.log("#questions: " + activeQuiz.numberOfQuestions());
      activeQuiz.start(countdown);
    }
  });
}

console.log("Starting websocketServer...");
var wss = new WebSocketServer({
  server:server
});

wss.on('connection', function connection(ws) {
  console.log("New connection");
  ws.on('message', function incoming(message) {
    console.log('received:');
    console.log(message);
    var msg = JSON.parse(message);
    if(msg.action == "connectToQuizWithSessionId"){
        var response = getResponseObjectWithSessionId(msg.connectionId, msg.username, msg.sessionId);
        if(response.action == 'ok' && response.username !== null){
          activeQuiz.addParticipant(ws, response.username);
        }
        ws.send(JSON.stringify(response));
    }else if(msg.action == 'connectToQuizWithoutSessionId'){
      var response = getResponseObjectWithoutSessionId(msg.connectionId, msg.username);
      if(response.action == 'ok'){
        activeQuiz.addParticipant(ws, msg.username);
      }
      ws.send(JSON.stringify(response));        
    }else if(msg.action == 'updatePoints'){
      activeQuiz.setPointsForUsernameAndUpdateScoreboard(msg.username, msg.points);
    } else if(msg.action === 'connectToQuizAsObserver'){
      var response = getResponseObjectForObserver(msg.connectionId);
      if(response.action == 'ok'){
        activeQuiz.addObserver(ws);
      }
      ws.send(JSON.stringify(response));
    }
  });

  ws.on('close', function close(){
    console.log("onclose");
    if(activeQuiz){
      activeQuiz.removeParticipant(ws);
      activeQuiz.removeObserver(ws);
    }
  });

  ws.on('error', function error(){
    console.log("onError");
  });

});

wss.on('error', function error(er){
  console.log("onError");
  console.log(er);
});
