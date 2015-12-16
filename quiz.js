var quiz;
var activeQuestion = 0;
var participants = [];
var sessionIds = [];
var observers = [];
var quizStarted = false;
var startCountdown = 0;
var totalTime = 0;
var scoreboard = [];

Quiz = function(id, dao, callback){
	dao.getQuizById(id, function(error, result){
		if(error || !result) callback("error");
		else{
			quiz = null;
			activeQuestion = 0;
			participants = [];
			sessionIds = [];
			quizStarted = false;
			startCountdown = 0;
			totalTime = 0;
			scoreboard = [];

			clearTimeout(timeout1);
			clearTimeout(timeout2);
			clearTimeout(timeout3);
			clearInterval(startInterval);

			quiz = result;
		 	callback(null);
		}
	});
};
exports.Quiz = Quiz;

var startInterval;

var updatePendingTimer = function(){
	participants.forEach(function(participant){
		participant.ws.send(JSON.stringify({action: 'hello', title:quiz.title, timeLeft:startCountdown, totalTime:totalTime}));
	});
};

Quiz.prototype.start = function(seconds){
	clearInterval(startInterval);
	console.log("Starting " + quiz.title);
	startCountdown = seconds;
	totalTime = seconds;

	startInterval = setInterval(function(){
		console.log(startCountdown);
		startCountdown--;
		if(startCountdown === 0){
			clearInterval(startInterval);
			quizStarted = true;
			console.log(quiz.title + " started...");
			handleQuestion();
		}
		if(startCountdown != 0 && startCountdown % 5 === 0){
			updatePendingTimer();
		}
	}, 1000, 0);
};

var timeout1, timeout2, timeout3;
function handleQuestion(){
	clearTimeout(timeout1);
	clearTimeout(timeout2);
	clearTimeout(timeout3);
	broadcastPreTimer();
	timeout1 = setTimeout(function(){
		broadcastQuestion();
		timeout2 = setTimeout(function(){
			broadcastPostTimer();
			timeout3 = setTimeout(function(){
				if(++activeQuestion == quiz.questions.length){
					stopQuizAndNotifyParticipantsOfFinalResult();
				}else{
					//stopQuizAndNotifyParticipantsOfFinalResult();
					handleQuestion();
				}
			}, quiz.questions[activeQuestion].postTime * 1000);
		}, quiz.questions[activeQuestion].questionTime * 1000);
	}, quiz.questions[activeQuestion].preTime * 1000);
}

function stopQuizAndNotifyParticipantsOfFinalResult(){
	console.log("stopQuizAndNotifyParticipantsOfFinalResult");
	sessionIds.sort(function(a, b){
		return b.points - a.points;
	});
	var winner = sessionIds[0].username;

	var rngWinner;
	//console.log('rand: ' + randomWithRange(1, sessionIds.length));
	if(sessionIds.length > 2 && participants.length > 2){
		rngWinner = sessionIds[randomWithRange(1, sessionIds.length)].username;
	}
	for(var i = 0; i < participants.length; i++){
		if(participants[i].username == winner){
			participants[i].ws.send(JSON.stringify({
				action:'winner'
			}));
		}else if(participants[i].username == rngWinner){
			participants[i].ws.send(JSON.stringify({
				action:'rngWinner'
			}));
		}else{
			participants[i].ws.send(JSON.stringify({
				action:'loser'
			}));
		}
	}

	for(var i = 0; i < observers.length; i++){
		if(observers[i].ws.readyState == 1){
			observers[i].ws.send(JSON.stringify({action: 'showResultScreen', participants: sessionIds, rngWinner:rngWinner}));
		}
	}
}

function randomWithRange(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

Quiz.prototype.numberOfQuestions = function(){
	if(quiz) return quiz.questions.length;
	else return 0;
};

Quiz.prototype.getTitle = function(){
	if(quiz) return quiz.title;
	else return "";
};

Quiz.prototype.getConnectionId = function(){
	if(quiz) return quiz.connectionId;
	else return 0;
};

Quiz.prototype.getDbId = function(){
	if(quiz) return quiz._id;
	else return 0;
};

Quiz.prototype.addParticipant = function(ws, username){
	var participant = {
		username:username,
		score: 0,
		ws:ws
	};
	participants.push(participant);

	console.log(participant.username + " joined " + quiz.title);

	if(!quizStarted){
		ws.send(JSON.stringify({action:'notStarted', title:quiz.title, timeLeft:startCountdown, totalTime:totalTime}));
	}

	notifyObservers();

	console.log('username: ' + participant.username);

	//activeQuestion = 0;
	//handleQuestion();
};

function notifyObservers(){
	for(var i = 0; i < observers.length; i++){
		if(observers[i].ws.readyState == 1){
			observers[i].ws.send(JSON.stringify({action: 'updatePlayers', participants: sessionIds}));
		}
	}
}

Quiz.prototype.addSessionId = function(username, sessionId){
	console.log("quiz.addSessionId");
	var obj = {
		username:username,
		sessionId:sessionId,
		points:0
	};
	sessionIds.push(obj);
};

Quiz.prototype.getUsernameForSessionId = function(sessionId){
	console.log("quiz.getUsernameForSessionId: " + sessionId);
	for(var i = 0; i < sessionIds.length; i++){
		if(sessionIds[i].sessionId == sessionId){
			console.log("= " + sessionIds[i].username);
			return sessionIds[i].username;
		}
	}
	console.log("= " + null);
	return null;
};

Quiz.prototype.getPointsForUsername = function(username){
	console.log("quiz.getPointsForUsername: " + username);
	for(var i = 0; i < sessionIds.length; i++){
		if(sessionIds[i].username == username){
			console.log("= " + sessionIds[i].points);
			return sessionIds[i].points;
		}
	}
	console.log("= " + null);
	return null;
};

Quiz.prototype.setPointsForUsernameAndUpdateScoreboard = function(username, points){
	console.log('quiz.setPointsForUsername: ' + username + ' points: ' + points);
	for(var i = 0; i < sessionIds.length; i++){
		if(sessionIds[i].username == username){
			sessionIds[i].points = points;
			console.log("Success. " + username + ' now has ' + points + ' points');
		}
	}

	sessionIds.sort(function(a, b){
		return b.points - a.points;
	});

	for(var i = 0; i < sessionIds.length; i++){
		console.log(i + '. ' + sessionIds[i].username);
	}
};

Quiz.prototype.removeParticipant = function(ws){
	for(var i = 0; i < participants.length; i++){
		if(participants[i].ws == ws){
			console.log(participants[i].username + " left " + quiz.title);
			participants.splice(i, 1);

			notifyObservers();
			return;
		}
	}
	console.log("Error - user could not be removed!");
};

Quiz.prototype.updateParticipantsScore = function(username, score){
	var found = false;
	for(var i = 0; i < participants.length && !found; i++){
		if(participants[i].username === username){
			participants[i].score = score;
			found = false;
		}
	}
};

Quiz.prototype.usernameTaken = function(username){
	for(var i = 0; i < participants.length; i++){
		if(participants[i].username == username){
			return true;
		}
	}
	return false;
};

Quiz.prototype.addObserver = function(ws){
	observers.push({ws:ws});

	console.log("New observer joined quiz");
	if(!quizStarted){
		ws.send(JSON.stringify({action:'notStarted', title:quiz.title, connectionId:quiz.connectionId, timeLeft:startCountdown, totalTime:totalTime}));
	} else {
		ws.send(JSON.stringify({action:'started', title:quiz.title, connectionId:quiz.connectionId}));
	}
};

Quiz.prototype.removeObserver = function(ws){
	for(var i = 0; i < observers.length; i++){
		if(observers[i].ws == ws){
			console.log("An observer disconnected from the quiz!");
			observers.splice(i, 1);
			return;
		}
	}
	console.log("Error - observer could not be removed!");
};

function getPositionForUsername(username){
	for(var i = 0; i < sessionIds.length; i++){
		if(sessionIds[i].username == username){
			return i + 1;
		}
	}
}

function broadcastPreTimer(){
	if(!quiz) return;
	for(var i = 0; i < participants.length; i++){
		if(participants[i].ws.readyState == 1){
			participants[i].ws.send(JSON.stringify({action:'startPreTimer', data:quiz.questions[activeQuestion], current:activeQuestion, total:quiz.questions.length}));
		}
	}
	for(var i = 0; i < observers.length; i++){
		if(observers[i].ws.readyState == 1){
			observers[i].ws.send(JSON.stringify({action: 'startPreTimer', data:quiz.questions[activeQuestion], current:activeQuestion, total:quiz.questions.length}));
		}
	}
}

function broadcastQuestion(){
	if(!quiz) return;
	for(var i = 0; i < participants.length; i++){
		if(participants[i].ws.readyState == 1){
			participants[i].ws.send(JSON.stringify({action:'startQuestion'}));
		}
	}
	for(var i = 0; i < observers.length; i++){
		if(observers[i].ws.readyState == 1){
			observers[i].ws.send(JSON.stringify({action: 'startQuestion'}));
		}

	}
}

function broadcastPostTimer(){
	if(!quiz) return;
	for(var i = 0; i < participants.length; i++){
		participants[i].ws.send(JSON.stringify({
			action:'startPostTimer',
			position:getPositionForUsername(participants[i].username),
			totalParticipants:sessionIds.length
		}));
	}

	for(var i = 0; i < observers.length; i++){
		if(observers[i].ws.readyState == 1){
			//TODO
			observers[i].ws.send(JSON.stringify({action: 'startPostTimer', participants: sessionIds}));
		}
	}
}

