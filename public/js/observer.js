var port = 8000;
if(window.document.location.host.replace(/:.*/, '') == 'localhost'){
  port = 8080;
}
var server = 'ws://' + window.document.location.host.replace(/:.*/, '') + ':' + port;
var client = new WebSocket(server);

client.onopen = function(message){
  var obj = {
    action:'connectToQuizAsObserver',
    connectionId:QueryString.id
  };
    client.send(JSON.stringify(obj));
};

client.onmessage = function(message){

  var msg = JSON.parse(message.data);

  if(msg.action == 'ok'){

  }else if(msg.action == 'wrongId'){
    alert("No quiz is active with the given id");
  }else if(msg.action === 'startPreTimer'){
    var convertedQuestionContent = {
      questionText : msg.data.title,
      secondsBeforeAnswersIsShown : msg.data.preTime,
      answers : [
        {text: msg.data.answers[0].answer.text, isCorrect: msg.data.answers[0].isCorrect},
        {text: msg.data.answers[1].answer.text, isCorrect: msg.data.answers[1].isCorrect},
        {text: msg.data.answers[2].answer.text, isCorrect: msg.data.answers[2].isCorrect},
        {text: msg.data.answers[3].answer.text, isCorrect: msg.data.answers[3].isCorrect}
      ],
      answerTime : msg.data.questionTime,
      questionCount: msg.current + 1,
      totalQuestionCount: msg.total,
      players : PlayerManager.players,
      trivia : {image : msg.data.triviaImg, text : msg.data.triviaText}
    };
    WebSocketCommunicator.newQuestion(convertedQuestionContent);
  } else if(msg.action === 'startQuestion'){
    WebSocketCommunicator.startTime();
  } else if(msg.action === 'startPostTimer'){
    var scores = [];
    for(var i = 0; i < msg.participants.length; i++){
      scores.push({
        name:msg.participants[i].username,
        score:msg.participants[i].points
      });
    }

    WebSocketCommunicator.stopTime(2);
    WebSocketCommunicator.updatePlayers(scores);
    PlayerManager.showTotalScore();
  } else if(msg.action === 'showScoreForLastRound'){
    WebSocketCommunicator.showScoreForLastRound(msg.lastRoundSummary);
  } else if(msg.action === 'updatePlayers'){
    var scores = [];
    for(var i = 0; i < msg.participants.length; i++){
      scores.push({
        name:msg.participants[i].username,
        score:msg.participants[i].points
      });
    }
    WebSocketCommunicator.updatePlayers(scores);
  }else if(msg.action == 'notStarted'){
    var convertedInfo = {
      info : msg.title,
      commercials : [{name: "Waxies", image: "http://epicbars.dk/wp-content/uploads/2014/01/Waxies.jpg"}, {name: "Coca cola", image: "http://cache.ultiworld.com/wordpress/wp-content/uploads/2015/04/coca-cola.jpg"}],
      players : PlayerManager.players
    };
    WebSocketCommunicator.showInfo(convertedInfo); //To set the info at the top, and start the commercials
    WebSocketCommunicator.showPendingScreen(msg.title, msg.connectionId, msg.timeLeft, msg.totalTime);

  }else if(msg.action == 'started'){
    var convertedInfo = {
      info : msg.title,
      commercials : [{name: "Waxies", image: "http://epicbars.dk/wp-content/uploads/2014/01/Waxies.jpg"}, {name: "Coca cola", image: "http://cache.ultiworld.com/wordpress/wp-content/uploads/2015/04/coca-cola.jpg"}],
      players : PlayerManager.players
    };
    WebSocketCommunicator.showInfo(convertedInfo);
  }else if(msg.action == 'showResultScreen'){
    var scores = [];
    for(var i = 0; i < msg.participants.length; i++){
      scores.push({
        name:msg.participants[i].username,
        score:msg.participants[i].points
      });
    }
    WebSocketCommunicator.showResultScreen("Final results",scores);
  }

};

var WebSocketCommunicator = function(){
  var showInfo = function(infoObject){
    InfoManager.sessionId = QueryString.id;
    readInfoFromJSON(infoObject);
    InfoManager.showInfo();
    PlayerManager.showTotalScore();
  };

  var showPendingScreen = function(title, connectionId, currentTimeLeft, totalTime){
    $('#divInnerContainer').hide();
    $('#divPendingResult').show();
    $('#divPendingResultHeader').html(title + '<br>Quiz-ID: ' + connectionId + '<br>Log on at www.quiz-huddup.rhcloud.com');
    $('#divCountdownCentered').css({'width':$('#divPendingResultMid').css('height')});
    $('#divCountdown').knob({
      'min':0,
      'max':totalTime - 1,
      readOnly:true,
      width:$('#divCountdownCentered').width(),
      height:$('#divCountdownCentered').height(),
      thickness:0.1,
      fgColor:'rgba(200, 0, 200, 0.7)',
      bgColor:'rgba(0,0,0,0)',
      inputColor:'#FFFFFF',
      font:'Arial'
    });
    var timeLeft = currentTimeLeft - 1;
    $('#divCountdown')
          .val(timeLeft)
          .trigger('change');

    var interval = setInterval(function() {
      if(timeLeft == 0){
        clearInterval(interval);
        $('#divCountdown').hide();
      }
      timeLeft--;
      $('#divCountdown')
          .val(timeLeft)
          .trigger('change');
    }, 1000);
  };

  var showResultScreen = function(title, participants){
    $('#divInnerContainer').hide();
    $('#divPendingResult').show();
    $('#divPendingResultHeader').html(title);
    $('#divPendingResultMid').css({'height':'100%'});
    $('#divPendingResultMid').html('');

    $('#divPendingResultMid').append('<div class="divPendingResultMidColumn" id="divPendingResultMidColumn1"></div>');
    $('#divPendingResultMid').append('<div class="divPendingResultMidColumn" id="divPendingResultMidColumn2"></div>');
    $('#divPendingResultMid').append('<div class="divPendingResultMidColumn" id="divPendingResultMidColumn3"></div>');
    $('#divPendingResultMid').append('<div class="divPendingResultMidColumn" id="divPendingResultMidColumn4"></div>');

    $.each( participants, function( key, val ) {
      if(key < 25){
        $('#divPendingResultMidColumn1').append('<div id="divPendingResultMidEntry"><div id="divPendingResultMidEntryName">' + (key + 1) + '. ' + val.name + '</div><div id="divPendingResultMidEntryScore">' + val.score + '</div></div>');
      }else if(key < 50){
        $('#divPendingResultMidColumn2').append('<div id="divPendingResultMidEntry"><div id="divPendingResultMidEntryName">' + (key + 1) + '. ' + val.name + '</div><div id="divPendingResultMidEntryScore">' + val.score + '</div></div>');
      }else if(key < 75){
        $('#divPendingResultMidColumn3').append('<div id="divPendingResultMidEntry"><div id="divPendingResultMidEntryName">' + (key + 1) + '. ' + val.name + '</div><div id="divPendingResultMidEntryScore">' + val.score + '</div></div>');
      }else if(key < 100){
        $('#divPendingResultMidColumn4').append('<div id="divPendingResultMidEntry"><div id="divPendingResultMidEntryName">' + (key + 1) + '. ' + val.name + '</div><div id="divPendingResultMidEntryScore">' + val.score + '</div></div>');      
      }
    });
  };

  var newQuestion = function(questionObject){
    $('#divPendingResult').hide();
    $('#divInnerContainer').show();

    readQuestionFromJSON(questionObject);
    QuestionManager.hideTrivia();
    QuestionManager.changeTrivia();
    QuestionManager.hideRightAnswer();
    QuestionManager.hideAnswers();
    QuestionManager.changeQuestion();
    QuestionManager.showQuestionHeader();
    QuestionManager.showQuestionText();
    PlayerManager.showTotalScore();
    QuestionManager.showTimer();
    QuestionManager.changeAnswers();
    QuestionManager.showAnswers();
  };

  var startTime = function(){
    QuestionManager.startTimer();
  };

  var stopTime = function(timeBeforeTriviaShows, timeBeforeTotalScoreShows){
    QuestionManager.stopTimer();
    QuestionManager.showRightAnswer();

    var countDownTrivia = timeBeforeTriviaShows;
    var triviaInterval = setInterval(function(){
      countDownTrivia--;
      if(countDownTrivia === 0){
        QuestionManager.showTrivia();
        clearInterval(triviaInterval);

        var countDownTotalScore = timeBeforeTotalScoreShows;
        var totalScoreInterval = setInterval(function(){
          countDownTotalScore--;
          if(countDownTotalScore === 0){
            PlayerManager.showTotalScore();
            clearInterval(totalScoreInterval);
          }
        }, 1000);
      }
    }, 1000);
  };

  var summary = function(){
    //not implemented yet...
  };

  var updatePlayers = function(playersObject){
    PlayerManager.players = playersObject;
    if(PlayerManager.showingTotalScore){
      PlayerManager.showTotalScore();
    }
  };

  var showScoreForLastRound = function(lastRoundSummary){
    PlayerManager.showScoreForLastRound(lastRoundSummary);
  };

  var readQuestionFromJSON = function(content){
    QuestionManager.questionText = content.questionText;
    QuestionManager.answers = content.answers;
    QuestionManager.questionCount = content.questionCount;
    QuestionManager.totalQuestionCount = content.totalQuestionCount;
    PlayerManager.players = content.players;
    QuestionManager.trivia = content.trivia;
    QuestionManager.answerTime = content.answerTime;
    QuestionManager.secondsBeforeAnswersIsShown = content.secondsBeforeAnswersIsShown;
  };

  var readInfoFromJSON = function(info){
    InfoManager.info = info.info;
    CommercialManager.commercials = info.commercials;
    PlayerManager.players = info.players;
  };

  return {
    showInfo : showInfo,
    newQuestion : newQuestion,
    startTime : startTime,
    stopTime : stopTime,
    updatePlayers : updatePlayers,
    showScoreForLastRound : showScoreForLastRound,
    summary : summary,
    showPendingScreen : showPendingScreen,
    showResultScreen : showResultScreen
  };
}();

var InfoManager = function(){
  this.sessionId = -1;
  this.info = '';

  var showInfo = function(){
    this.changeSessionId();
    var divQuestionInfo = $('#divQuestionInfo')[0];
    divQuestionInfo.style.display = 'block';
    CommercialManager.stopSlideShow();
    CommercialManager.startSlideShow(CommercialManager.commercials);
  };

  var hideInfo = function(){
    var divQuestionInfo = $('#divQuestionInfo')[0];
    divQuestionInfo.style.display = 'none';
  };

  var changeSessionId = function(){
    var questionInfoHeader = $('#questionInfoHeader')[0];
    var text = '';
    if(this.info === ''){
      text = 'Quiz-ID: ' + this.sessionId + ' - Log on at www.quiz-huddup.rhcloud.com';
    } else {
      text = this.info + ' - Quiz-ID: ' + this.sessionId + ' - Log on at www.quiz-huddup.rhcloud.com';
    }

    questionInfoHeader.innerHTML = text;
  };

  return {
    //properties:
    sessionId : sessionId,
    info : this.info,

    //functions:
    showInfo : showInfo,
    hideInfo : hideInfo,
    changeSessionId : changeSessionId
  };
}();

var QuestionManager = function(){
  this.questionText = '';
  this.totalQuestionCount = 0;
  this.questionCount = 0;
  this.answers = [];
  this.trivia = {};
  this.answerTime = 0;
  this.secondsBeforeAnswersIsShown = 0;

  var TimerManager = function(){
    var timerInterval;

    var showTimer = function(duration){
      instantiateTimer();

      var counter = 0;
      var progress = 0;
      var count = (duration+1)*10;

      progress = counter / duration * canvas.width * 0.82;
      drawProgress(progress, Math.floor(--count / 10), this);
    };

    var startTimer = function(duration){
      var delayMs = 100;
      var counter = 0;
      var progress = 0;
      var count = (duration+1)*10;

      timerInterval = setInterval(function(){
        progress = counter / duration * canvas.width * 0.82;
        drawProgress(progress, Math.floor(--count / 10), this);
        counter += (delayMs/1000);
      }, delayMs);
    };

    var stopTimer = function(){
      clearInterval(timerInterval);
      clearCanvas();
    };

    var instantiateTimer = function(){
      canvas = $('#canvasTimer').get(0);
      ctx = canvas.getContext('2d');
      canvas.width = $('#canvasTimer').width();
      canvas.height = $('#canvasTimer').height();
      ctx.fill();
      window.addEventListener('resize', resizeCanvas, false);
    };

    var clearCanvas = function(){
      ctx.clearRect(0,0,canvas.width, canvas.height);
    };

    var drawProgress = function(progressPoint, seconds, interval){
      var time = convertSecondsToTime(seconds);
      clearCanvas();
      var startPoint = 100;
      ctx.fillStyle = 'white';
      var lineWidth = canvas.width * 0.82 - progressPoint;
      var lineHeight = canvas.height * 0.05;

      ctx.fillRect(progressPoint, canvas.height/2, lineWidth, lineHeight);

      ctx.font = "3vmin 'Myriad Pro', helvetica, sans-serif";
      var mText = ctx.measureText(time);
      ctx.fillText(time, (canvas.width * 0.95) - (mText.width / 2), (canvas.height / 2) + (ctx.measureText("M").width / 2));

      if(seconds <= 0){
        clearInterval(timerInterval);
      }
    };

    var convertSecondsToTime = function(seconds){
      var tempMinutes = Math.floor(seconds / 60);
      if(tempMinutes < 10){
        tempMinutes = '0' + tempMinutes;
      }
      var tempSeconds = seconds % 60;
      if(tempSeconds < 10){
        tempSeconds = '0' + tempSeconds;
      }
      return tempMinutes + ':' + tempSeconds;
    };

    var resizeCanvas = function(){
      canvas.width = $('#canvasTimer').width();
      canvas.height = $('#canvasTimer').height();
    };

    return {
      //functions:
      startTimer: startTimer,
      stopTimer: stopTimer,
      showTimer: showTimer
    };
  }();

  var showQuestionText = function(){
    var divMainContent = $('#divMainContent')[0];
    divMainContent.style.display = 'table';
  };

  var hideQuestionText = function(){
    var divMainContent = $('#divMainContent')[0];
    divMainContent.style.display = 'none';
  };

  var showQuestionHeader = function(){
    var divQuestionHeader = $('#divQuestionHeader')[0];
    divQuestionHeader.style.display = 'block';
  };

  var hideQuestionHeader = function(){
    var divQuestionHeader = $('#divQuestionHeader')[0];
    divQuestionHeader.style.display = 'none';
  };

  var showAnswers = function(){
    var countDown = this.secondsBeforeAnswersIsShown;
    var answerInterval = setInterval(function(){
      countDown--;
      if(countDown <= 0){
        for(var i = 0; i<QuestionManager.answers.length; i++){
          var answerParagraph = $('#answer' + (i+1) + '-paragraph')[0];
          answerParagraph.style.opacity = '1';
        }
        clearInterval(answerInterval);
      }
    }, 1000);
  };

  var hideAnswers = function(){
    for(var i = 0; i<this.answers.length; i++){
      var answerParagraph = $('#answer' + (i+1) + '-paragraph')[0];
      answerParagraph.style.opacity = '0';
    }
  };

  var showTrivia = function(){
    var divMainContent = $('#divMainContent')[0];
    divMainContent.style.display = 'none';
    var divTrivia = $('#divTrivia')[0];
    divTrivia.style.display = 'table';

    var obj = new Image();
    obj.src = QuestionManager.trivia.image;

    if (obj.complete) {
      $('#divImgTrivia').show();
    }
  };

  var hideTrivia = function(){
    var divMainContent = $('#divMainContent')[0];
    divMainContent.style.display = 'table';
    $('#divImgTrivia').hide();
    var divTrivia = $('#divTrivia')[0];
    divTrivia.style.display = 'none';
  };

  var showTimer = function(){
    TimerManager.showTimer(this.answerTime);
  };

  var changeQuestion = function(){
    var questionHeaderParagraph = $('#questionHeaderParagraph')[0];
    questionHeaderParagraph.innerHTML = 'Question ' + this.questionCount + '/' + this.totalQuestionCount;
    var questionTextParagraph = $('#questionTextParagraph')[0];
    questionTextParagraph.innerHTML = this.questionText;
  };

  var changeAnswers = function(){
    for(var i = 0; i<this.answers.length; i++){
      var answerParagraph = $('#answer' + (i+1) + '-paragraph')[0];
      answerParagraph.innerHTML = prepareTextForAnswers(i+1, this.answers[i].text);
    }
  };

  var changeTrivia = function(){
    var triviaParagraph = $('#triviaParagraph')[0];
    triviaParagraph.innerHTML = this.trivia.text;
    var triviaImg = $('#triviaImg')[0];
    triviaImg.src = this.trivia.image;
  };

  var prepareTextForAnswers = function(index, text){
    switch(index){
      case 1: return 'A: ' + text;
      case 2: return 'B: ' + text;
      case 3: return 'C: ' + text;
      case 4: return 'D: ' + text;
      default: return text;
    }
  };

  var startTimer = function(){
    TimerManager.startTimer(this.answerTime);
  };

  var stopTimer = function(){
    TimerManager.stopTimer();
  };

  var showRightAnswer = function(){
    var index;
    for(var i = 0; i < this.answers.length; i++){
      if(this.answers[i].isCorrect){
        index = i;
      }
    }

    var divAnswer = $('#divAnswer' + (index+1));
    divAnswer.addClass('right-answer');
  };

  var hideRightAnswer = function(){
    for(var i = 0; i < this.answers.length; i++){
      var divAnswer = $('#divAnswer' + (i+1));
      divAnswer.removeClass('right-answer');
    }
  };

  return {
    //properties:
    questionText : questionText,
    totalQuestionCount : totalQuestionCount,
    questionCount : questionCount,
    answers : answers,
    trivia : trivia,
    answerTime : answerTime,
    secondsBeforeAnswersIsShown : secondsBeforeAnswersIsShown,

    //functions:
    showQuestionText : showQuestionText,
    hideQuestionText : hideQuestionText,
    showQuestionHeader : showQuestionHeader,
    hideQuestionHeader : hideQuestionHeader,
    showAnswers : showAnswers,
    hideAnswers : hideAnswers,
    showTrivia : showTrivia,
    hideTrivia : hideTrivia,
    changeQuestion : changeQuestion,
    changeAnswers : changeAnswers,
    changeTrivia : changeTrivia,
    showTimer : showTimer,
    startTimer : startTimer,
    stopTimer : stopTimer,
    showRightAnswer : showRightAnswer,
    hideRightAnswer : hideRightAnswer
  };
}();

var PlayerManager = function(){
  this.players = [];
  this.showingTotalScore = false;

  var showScoreForLastRound = function(lastRoundSummary){
    //change title:
    var title = '<h1 class="label header">' + 'Q' + lastRoundSummary.questionCount + '/' + lastRoundSummary.totalQuestionCount + ' Score</h1>';
    var divScoreHeader = $('#divScoreHeader')[0];
    divScoreHeader.innerHTML = title;

    //change scores:
    var names = '<ul>';
    var scores = '<ul>';
    
    lastRoundSummary.scores.forEach(function(score, index){
      names += '<li><p class="label">' + (index+1) + ': ' + score.name + '</p></li>';
      scores += '<li><p class="label" style="text-align: right">' + score.scoreLastRound + '</p></li>';
    });

    var scoreNames = $('#scoreNames')[0];
    scoreNames.innerHTML = names;
    var scorePoints = $('#scorePoints')[0];
    scorePoints.innerHTML = scores;

    //update state:
    this.showingTotalScore = false;
  };

  var showTotalScore = function(){
    var title = '<h1 class="label header">Total Score</h1>';
    var divScoreHeader = $('#divScoreHeader')[0];
    divScoreHeader.innerHTML = title;

    var names = '<ul>';
    var scores = '<ul>';

    this.players.forEach(function(player, index){
      names += '<li><p class="label">' + (index+1) + '. '+ player.name + '</p></li>';
      scores += '<li><p class="label" style="text-align: right">' + player.score + '</p></li>';
    });

    names += '</ul>';
    scores += '</ul>';

    var scoreNames = $('#scoreNames')[0];
    scoreNames.innerHTML = names;
    var scorePoints = $('#scorePoints')[0];
    scorePoints.innerHTML = scores;

    this.showingTotalScore = true;
  };

  return {
    players : players,
    showTotalScore : showTotalScore,
    showScoreForLastRound : showScoreForLastRound,
    showingTotalScore : showingTotalScore
  };
}();

var CommercialManager = function(){
  this.commercials = [];
  this.commercialCount = 0;
  var commercialInterval;

  var slideCommercial = function(commercials){
    var imgCommercial = $('#imgCommercial')[0];
    imgCommercial.src = commercials[++commercialCount%commercials.length].image;
  };

  var startSlideShow = function(commercials){
    slideCommercial(commercials);
    commercialInterval = setInterval(function(){
      slideCommercial(commercials);
    }, 3000);
  };

  var stopSlideShow = function(){
    clearInterval(commercialInterval);
  };

  return {
    commercials : commercials,
    startSlideShow: startSlideShow,
    stopSlideShow: stopSlideShow
  };
}();

var QueryString = function () {
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