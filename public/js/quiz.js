function disableSelect(el){
    if(el.addEventListener){
        el.addEventListener("mousedown",disabler,"false");
    } else {
        el.attachEvent("onselectstart",disabler);
    }
}

function enableSelect(el){
    if(el.addEventListener){
  el.removeEventListener("mousedown",disabler,"false");
    } else {
        el.detachEvent("onselectstart",disabler);
    }
}

function disabler(e){
    if(e.preventDefault){ e.preventDefault(); }
    return false;
}

var disableElements = function(element){
  if(element !== null){
    for(var i = 0; i < element.childNodes.length; i++){
    disableSelect(element.childNodes[i]);
    if(element.childNodes[i].childNodes.length > 0){
      disableElements(element.childNodes[i]);
    }
  }
  }
};



var currentQuestion;

var canvas, ctx;

var bonusPoints = 0;

var answered = false;
var isCorrect = true;

var totalPoints = 0;
var positivePoints = 50;
var negativePoints = 25;
var noAnswerPoints = 0;

var endPosition = 0;
var endParticipants = 0;

var port = 8000;

var pendingInterval;
if(window.document.location.host.replace(/:.*/, '') == 'localhost'){
  port = 8080;
}

var server = 'ws://' + window.document.location.host.replace(/:.*/, '') + ':' + port;
var client = new WebSocket(server);

client.onopen = function(){
  console.log("onOpen");
  if(localStorage.getItem('sessionId')){
    var obj = {
      action:'connectToQuizWithSessionId',
      connectionId:QueryString.id,
      username:QueryString.username,
      sessionId:localStorage.getItem('sessionId')
    };
    client.send(JSON.stringify(obj));
  }else{
    var obj = {
      action:'connectToQuizWithoutSessionId',
      connectionId:QueryString.id,
      username:QueryString.username
    };
    client.send(JSON.stringify(obj));
  }
};

client.onmessage = function(message){
	console.log(message.data);
	var msg = JSON.parse(message.data);

  if(msg.action == 'ok'){
    if(msg.sessionId != null){ //First time the user connects to the quiz
      if(typeof(Storage) !== 'undefined'){
        localStorage.setItem('sessionId', msg.sessionId);
        console.log("New sessionId saved");
        console.log("Connected");
      }else{
        console.log("error localStorage not defined");
      }
    }else if(msg.sessionId == null && msg.username != null){ //User has been connected to the quiz before.
      if(msg.username != QueryString.username){
        alert("You cannot change your username while the quiz is still running. \nYou will be connected as: " + msg.username);
        window.location.replace('quiz.html?id=' + QueryString.id + '&username=' + msg.username);
        totalPoints = msg.points;
      }else{
        console.log("Connected to session");
        totalPoints = msg.points;
      }
    }
  }
  if(msg.action == 'startQuestion'){
    startQuestion();
  }else if(msg.action == 'startPreTimer'){
    currentQuestion = msg;
    startPreTimer();
  }else if(msg.action == 'startPostTimer'){
    endPosition = msg.position;
    endParticipants = msg.totalParticipants;
    startPostTimer(msg.position, msg.totalParticipants);
  }else if(msg.action == 'notStarted'){
    showPendingScreen(msg.title, msg.timeLeft, msg.totalTime);
  }else if(msg.action == 'winner'){
    showWinScreen();
  }else if(msg.action == 'rngWinner'){
    showRngWinScreen();
  }else if(msg.action == 'loser'){
    showLoserScreen();
  } else if(msg.action === 'hello'){
    showPendingScreen(msg.title, msg.timeLeft, msg.totalTime);
  }
};

client.onerror = function(event){
  console.log("onError");
  console.log(event);
};

client.onclose = function(event){
  console.log("onClose");
  console.log(event);
};

function showPendingScreen(title, currentTimeLeft, totalTime){
  if(pendingInterval !== undefined){
    clearInterval(pendingInterval);
  }
  $('#divTopContainer').css({'visibility':'hidden'});
  $('#divBottomContainer').css({'visibility':'hidden'});
  $('#divMiddleContainer').css({'visibility':'hidden'});
  $('#divCountdownContainer').show();

  $('#divCountdownTopTitle').text(title);
  $('#divCountdownTopText').html('<br>Welcome ' + QueryString.username);

  $('#divCountdownCentered').css({'width':$('#divCountdownMid').css('height')});
  $('#divCountdown').knob({
    'min':0,
    'max':totalTime - 1,
    readOnly:true,
    width:$('#divCountdownCentered').width(), //Maybe do this dynamically when resizing
    height:$('#divCountdownCentered').height(),
    thickness:0.1,
    fgColor:'rgba(200, 0, 200, 0.7)',
    bgColor:'rgba(0,0,0,0)',
    inputColor:'#FFFFFF',
    font:'Arial'
  });
  $('#divCountdown').show();

  var timeLeft = currentTimeLeft - 1;
  console.log('currentTimeLeft: ' + currentTimeLeft);
  console.log('totalTime: ' + totalTime);
  $('#divCountdown')
        .val(timeLeft)
        .trigger('change');
  pendingInterval = setInterval(function() {
    if(timeLeft === 0){
      clearInterval(pendingInterval);
      $('#divCountdown').hide();
    }
    timeLeft--;
    $('#divCountdown')
        .val(timeLeft)
        .trigger('change');
  }, 1000);
}

function startPreTimer(){
  disableAnswers();
  $('#divTopContainer').css({'visibility':'visible'});
  $('#divBottomContainer').css({'visibility':'visible'});
  $('#divMiddleContainer').css({'visibility':'visible'});
  $('#divCountdownContainer').hide();

  $('#divQuestionTextTop').text("");
  $('#divQuestionTextBot').text("");

  isAnswerReceived = false;
  isAnswerSend = false;
  $('#divCounter').hide();
  console.log("startPreTimer()");
  $('#divHeader').text("Question " + (currentQuestion.current + 1) + "/" + currentQuestion.total);
  $('#divQuestionTextMid').text(currentQuestion.data.title);
  $('#answer1').text("");
  $('#answer2').text("");
  $('#answer3').text("");
  $('#answer4').text("");

  $('.divAnswerContainer').css({"background-color":"rgba(0,0,0,0.5)"});

  console.log(currentQuestion.data.preTime);

  setProgressColor('rgba(200,0,200,0.5)', 'On your marks');
  var startPreTime = currentQuestion.data.preTime;
  setInterval(function(){
    var remainingTime = startPreTime--;
    if(remainingTime == 4){
      setProgressColor('rgba(255,0,0,0.5)', 'Ready');
    }else if(remainingTime == 3){
      setProgressColor('rgba(255,255,0,0.5)', 'Set');
    }else if(remainingTime == 2){
      setProgressColor('rgba(0,255,0,0.5)', 'Go!');
    }
  }, 1000, 1000);
}

function setProgressColor(color, text){
  ctx.clearRect(0,0,canvas.width, canvas.height);

  var grd = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height * 1.5);
  grd.addColorStop(0, color);
  grd.addColorStop(1,"rgba(0,0,0,0.5)");
  ctx.fillStyle = grd;

  ctx.fillRect(0,0, canvas.width, canvas.height);

  ctx.font = "5vmin 'Myriad Pro', helvetica, sans-serif";
  ctx.fillStyle = '#FFFFFF';
  var mText = ctx.measureText(text);
  ctx.fillText(text, (canvas.width / 2) - (mText.width / 2), (canvas.height / 2) + (ctx.measureText("M").width / 2));
}

function startQuestion(){
  enableAnswers();
  console.log("startQuestion()");
  $('#divQuestionTextMid').text(currentQuestion.data.title);
  $('#answer1').text(currentQuestion.data.answers[0].answer.text);
  $('#answer2').text(currentQuestion.data.answers[1].answer.text);
  $('#answer3').text(currentQuestion.data.answers[2].answer.text);
  $('#answer4').text(currentQuestion.data.answers[3].answer.text);

  startQuestionTimer(currentQuestion.data.questionTime);
}

function startPostTimer(position, totalParticipants){
  disableAnswers();
  console.log("startPostTimer()");
  colorAnswers();
  showAnswerStatus(position, totalParticipants);
}

var timerId;
function startQuestionTimer(duration){
  clearInterval(timerId);

  bonusPoints = 100;
  answered = false;
  isCorrect = false;
  selectedAnswerId = "";

  var colorSplit = (duration / 2);
  var colorCount = 1;
  var counter = 0;
  var r = 0, g = 255, b = 0;
  var bonusProgress = 0;

  var delayMs = 75;
  timerId = setInterval(function(){
    var progress = counter / duration * canvas.width;
    if(!answered){
      bonusProgress = progress;
      ctx.clearRect(0,0,canvas.width, canvas.height);

      var grd = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height * 1.5);
      grd.addColorStop(0, 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ',0.5)');
      grd.addColorStop(1,"rgba(0,0,0,0.5)");
      ctx.fillStyle = grd;

      //ctx.fillStyle = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
      ctx.fillRect(progress, 0, canvas.width - progress, canvas.height);

      bonusPoints -= 100 / (duration * (1000/delayMs));
      ctx.font = "5vmin 'Myriad Pro', helvetica, sans-serif";
      ctx.fillStyle = '#FFFFFF'
      var mText = ctx.measureText("" + Math.round(bonusPoints));
      ctx.fillText("" + Math.round(bonusPoints), (canvas.width / 2) - (mText.width / 2), (canvas.height / 2) + (ctx.measureText("M").width / 2));

      if(counter <= colorSplit * colorCount){
        if(colorCount == 1){
          r += 255 / (colorSplit * (1000/delayMs));
          g += 0;
          b += 0;
        }else if(colorCount == 2){
          r += 0;
          g -= 255 / (colorSplit * (1000/delayMs));
          b += 0;
        }
      }else{
        colorCount += 1;
      }
    }else{
      //ctx.clearRect(0,canvas.height - 5,canvas.width, canvas.height);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bonusProgress, canvas.height - 5, progress - bonusProgress, canvas.height);

    counter += (delayMs/1000);

    if(counter >= duration){
      clearInterval(timerId);
      ctx.clearRect(0,0,canvas.width, canvas.height);
    }
  }, delayMs, 0);
}

function colorAnswers(){
  $("#" + selectedAnswerId).css({'background-color':"rgba(255,0,0,0.5"});
  for(var i = 0; i < currentQuestion.data.answers.length; i++){
    if(currentQuestion.data.answers[i].isCorrect){
      $("#divAnswer" + (i + 1) + "Container").css({'background-color':"rgba(0,255,0,0.5)"})
    }
  }
}

function checkAnswers(){
  for(var i = 0; i < currentQuestion.data.answers.length; i++){
    if(currentQuestion.data.answers[i].isCorrect){
      if($("#divAnswer" + (i + 1) + "Container").children().eq(1).attr('id') == $("#" + selectedAnswerId).children().eq(1).attr('id')){
        isCorrect = true;
      }else{
        isCorrect = false;
      }
    }
  }
}

function calculatePoints(){
  if(!answered) totalPoints += noAnswerPoints;
  else if(isCorrect) totalPoints += (Math.round(bonusPoints) + positivePoints);
  else totalPoints -= negativePoints;
}

function showAnswerStatus(position, totalParticipants){
  if(!answered){
    $("#divQuestionTextTop").css({'color':'white'});
    $("#divQuestionTextTop").text("No answer!");
    $("#divQuestionTextMid").html("Answer: " + noAnswerPoints + "<br>Bonus: " + 0 + '<br>Points: ' + (noAnswerPoints + 0));
    $("#divQuestionTextBot").html('Total points: ' + totalPoints + '<br>Current position: ' + position + '/' + totalParticipants);
  }else if(isCorrect){
    $("#divQuestionTextTop").css({'color':'green'});
    $("#divQuestionTextTop").text("Correct!");
    $("#divQuestionTextMid").html("Answer: +" + positivePoints + "<br>Bonus: +" + Math.round(bonusPoints) + '<br>Points: +' + (positivePoints + Math.round(bonusPoints)));
    $("#divQuestionTextBot").html('Total points: ' + totalPoints + '<br>Current position: ' + position + '/' + totalParticipants);
  }else{
    $("#divQuestionTextTop").css({'color':'red'});
    $("#divQuestionTextTop").text("Wrong!");
    $("#divQuestionTextMid").html("Answer: -" + negativePoints + "<br>Bonus: " + 0 + '<br>Points: -' + (negativePoints + 0));
    $("#divQuestionTextBot").html('Total points: ' + totalPoints + '<br>Current position: ' + position + '/' + totalParticipants);
  }

  console.log(totalPoints);
}

//send also position and total contestants
function sendPointsToServer(username, totalPoints){
  client.send(JSON.stringify({
    action:'updatePoints',
    username:username,
    points:totalPoints
  }));
}

function showWinScreen(){
  $('#divTopContainer').css({'visibility':'hidden'});
  $('#divBottomContainer').css({'visibility':'hidden'});
  $('#divMiddleContainer').css({'visibility':'hidden'});
  $('#divCountdownContainer').show();

  $('#divCountdownTopTitle').text('Winner!');
  $('#divCountdownTopText').html('Congratulations ' + QueryString.username + '!<br>With ' + totalPoints + ' points you finished ' + endPosition + '/' + endParticipants +'.<br>You are the best, well done!');

  $('#divCountdownCentered').html('<img id="imgResultScreen" src="media/winner.gif"></img>');

  $('#divCountdownBot').html('Show this screen at the bar, to claim your prize.<br><br>Thank you for participating.<br>Good game, well played!')
}

function showRngWinScreen(){
  $('#divTopContainer').css({'visibility':'hidden'});
  $('#divBottomContainer').css({'visibility':'hidden'});
  $('#divMiddleContainer').css({'visibility':'hidden'});
  $('#divCountdownContainer').show();

  $('#divCountdownTopTitle').text('RNG Winner!');
  $('#divCountdownTopText').html('Praise RNGesus, for he has chosen you, ' + QueryString.username +'!<br>With ' + totalPoints + ' points you finished ' + endPosition + '/' + endParticipants +'.<br>But points means nothing to RNGesus');

  $('#divCountdownCentered').html('<img id="imgResultScreen" src="media/rng.gif"></img>');

  $('#divCountdownBot').html('Show this screen at the bar, to claim your prize.<br><br>Thank you for participating.<br>Good game, well played!');
}

function showLoserScreen(){
  $('#divTopContainer').css({'visibility':'hidden'});
  $('#divBottomContainer').css({'visibility':'hidden'});
  $('#divMiddleContainer').css({'visibility':'hidden'});
  $('#divCountdownContainer').show();

  $('#divCountdownTopTitle').text('Game is hard');
  $('#divCountdownTopText').html('Sorry ' + QueryString.username + ', but the winner takes it all.<br>With ' + totalPoints + ' points you finished ' + endPosition + '/' + endParticipants +'.<br>Better luck next time');

  $('#divCountdownCentered').html('<img id="imgResultScreen" src="media/axe.gif"></img>');

  $('#divCountdownBot').html('Even though you didnt win, we hope you enjoyed the quiz.<br><br>Thank you for participating.<br>Good game, well played!')
}

function enableAnswers(){
  $('.divAnswerContainer').on('click', function(){
    if(!answered){
      $(this).css({'background-color':"rgba(150,150,150,0.5)"});
      answered = true;
      selectedAnswerId = $(this).attr('id');

      checkAnswers();
      calculatePoints();
      sendPointsToServer(QueryString.username, totalPoints);
    }
  });
}

function disableAnswers(){
  $('.divAnswerContainer').on('click', function(){
    //Do nothing
  });
}

$(document).ready(function(){
  console.log('document.body: ' + document.body);
  disableElements(document.body);

  canvas = $('#canvasTimer').get(0);
  ctx = canvas.getContext('2d');

  canvas.width = $('#canvasTimer').width();
  canvas.height = $('#canvasTimer').height();

  window.addEventListener('resize', resize, false);

  function resize(){
    canvas.width = $('#canvasTimer').width();
    canvas.height = $('#canvasTimer').height();
  }

  //showPendingScreen("Dota 2", 20);
  $('#divCountdownContainer').hide();

  //showWinScreen();
});


var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
  return query_string;
} ();