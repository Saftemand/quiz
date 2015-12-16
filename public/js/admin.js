var server;
$(document).ready(function(){
  if(window.document.location.host.replace(/:.*/, '') == 'localhost'){
    server = 'http://' + window.document.location.host.replace(/:.*/, '') + ':8080';
  }else{
    server = 'http://' + window.document.location.host.replace(/:.*/, '');
  }
	$("#btnSubmit").on('click', function(){
		$.ajax({
		  method: "POST",
		  url: server + '/createQuiz',
		  //data: createDotaQuiz(),
		  //data: createDotaQuiz2(),
		  data: createTestQuiz(),
		  contentType: "application/json; charset=utf-8",
		  success: function(data, status){
		  	console.log(data);
		  },
		  dataType: "json"
		});
	});

  $.getJSON( server + '/getQuizzes', function( data ) {
    $.each( data, function( key, val ) {
      $('#selectQuizzes')
         .append($("<option></option>")
         .attr("value",val._id)
         .attr("quizId", val.connectionId)
         .text(val.title));
    });

    $('#divQuizId').text($('#selectQuizzes').find(":selected").attr('quizId'));
    $('#selectQuizzes').change(function(){
      $('#divQuizId').text($(this).find(":selected").attr('quizId'));
    });
  });

  $('#btnStart').on('click', function(){
    $.ajax({
      method: "POST",
      url: server + '/startQuiz',
      data: JSON.stringify({
        id:$('#selectQuizzes').val(),
        countdown:$('#inputCountdown').val()
      }),
      contentType: "application/json; charset=utf-8",
      success: function(data, status){
        console.log(data);
      },
      dataType: "json"
    });
  });

  $('#btnStop').on('click', function(){
    $.ajax({
      method: "POST",
      url: server + '/stopQuiz',
      data: JSON.stringify({
        id:$('#selectQuizzes').val()
      }),
      contentType: "application/json; charset=utf-8",
      success: function(data, status){
        console.log(data);
      },
      dataType: "json"
    });
  });
 
});

function createDotaQuiz(){
  var questionTime = 10;
  var answerTime = 10;
  var triviaTime = 10;
  var dotaQuiz = new Quiz("HuddupQuiz: Dota2 TI5 - Waxxies");

  var question1 = new Question("What does 'Dota' stand for?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Too easy? Just testing the user interface... Good luck, have fun!", "media/dotaname.jpg");
  question1.answers.push(new AnswerInstance(new Answer("Defense of the Ancients", "http://answer1.url"), true));
  question1.answers.push(new AnswerInstance(new Answer("Defense of the Animals", "http://answer2.url"), false));
  question1.answers.push(new AnswerInstance(new Answer("Drink or take Amphetamines", "http://answer3.url"), false));
  question1.answers.push(new AnswerInstance(new Answer("Ducks of the Apocalypse", "http://answer4.url"), false));
  dotaQuiz.questions.push(question1);

  var question2 = new Question("Which hero is also known as the 'Space-Cow'?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Choo Choo, Space-Cow coming through!", "media/spacecow.jpg");
  question2.answers.push(new AnswerInstance(new Answer("Earthshaker", "http://answer1.url"), false));
  question2.answers.push(new AnswerInstance(new Answer("Bristleback", "http://answer2.url"), false));
  question2.answers.push(new AnswerInstance(new Answer("Elder Titan", "http://answer3.url"), false));
  question2.answers.push(new AnswerInstance(new Answer("Spirit Breaker", "http://answer4.url"), true));
  dotaQuiz.questions.push(question2);

  var question3 = new Question("How many TI finals have Na´Vi reached?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Na`Vi has reached three TI-finals in 2011, 2012 and 2013, winning the first TI in 2011 against Ehome", "media/naviwin.jpg");
  question3.answers.push(new AnswerInstance(new Answer("One", "http://answer1.url"), false));
  question3.answers.push(new AnswerInstance(new Answer("Two", "http://answer2.url"), false));
  question3.answers.push(new AnswerInstance(new Answer("Three", "http://answer3.url"), true));
  question3.answers.push(new AnswerInstance(new Answer("Four", "http://answer4.url"), false));
  dotaQuiz.questions.push(question3);

  var question4 = new Question("Back in the good old Warcraft III days of Dota, each hero had a name.<br>Which hero was known by the name 'Akasha'?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Some names are forgotten while others have stuck with their hero in Dota 2, e.g. Sand King walks around and says 'Crixalis' and y'all know who 'Furion' is right? How about Nortrom, Boush and Mortred?", "media/triviaImg.jpg");
  question4.answers.push(new AnswerInstance(new Answer("Templar Assassin", "http://answer1.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("Enchantress", "http://answer2.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("Phantom Assassin", "http://answer3.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("Queen of Pain", "http://answer4.url"), true));
  dotaQuiz.questions.push(question4);

  var question5 = new Question("Two runes spawn in the river every second minute, but how many different runes are there in total?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Six runes: Bounty, Double Damage, Haste, Illusion, Invisibility and Regeneration", "media/triviaImg.jpg");
  question5.answers.push(new AnswerInstance(new Answer("Four", "http://answer1.url"), false));
  question5.answers.push(new AnswerInstance(new Answer("Five", "http://answer2.url"), false));
  question5.answers.push(new AnswerInstance(new Answer("Six", "http://answer3.url"), true));
  question5.answers.push(new AnswerInstance(new Answer("Seven", "http://answer4.url"), false));
  dotaQuiz.questions.push(question5);

  var question6 = new Question("'Rat-Dota' trended after The International in 2013, but which team was seen as the main utilizers behind this strategy?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Perhaps Alliance didn't invent the playstyle, but they sure did master it. Especially through AdmiralBulldog and his Natures Prophet", "media/ratdota.jpg");
  question6.answers.push(new AnswerInstance(new Answer("Invictus Gaming", "http://answer1.url"), false));
  question6.answers.push(new AnswerInstance(new Answer("Alliance", "http://answer2.url"), true));
  question6.answers.push(new AnswerInstance(new Answer("Evil Geniuses", "http://answer3.url"), false));
  question6.answers.push(new AnswerInstance(new Answer("Na´Vi", "http://answer4.url"), false));
  dotaQuiz.questions.push(question6);

  var question7 = new Question("In the Radiant jungle, there is a warding spot that blocks two neutral camps simultaneously.<br>What is the name of this spot?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "...", "media/magicbush.png");
  question7.answers.push(new AnswerInstance(new Answer("Secret Rock", "http://answer1.url"), false));
  question7.answers.push(new AnswerInstance(new Answer("Magic Rock", "http://answer2.url"), false));
  question7.answers.push(new AnswerInstance(new Answer("Magic Bush", "http://answer3.url"), true));
  question7.answers.push(new AnswerInstance(new Answer("Blocking Bush", "http://answer4.url"), false));
  dotaQuiz.questions.push(question7);

  var question8 = new Question("The gaming organisation Fnatic recently made a return to the competitive Dota scene, picking up the roster of which team?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "The squad consists of kYxY, Mushi, Ohaiyo, Kecik Imba and JoHnNy", "media/fnatic.jpg");
  question8.answers.push(new AnswerInstance(new Answer("Team Malaysia", "http://answer1.url"), true));
  question8.answers.push(new AnswerInstance(new Answer("Team Tinker", "http://answer2.url"), false));
  question8.answers.push(new AnswerInstance(new Answer("Burden United", "http://answer3.url"), false));
  question8.answers.push(new AnswerInstance(new Answer("4 Anchors + Sea Captain", "http://answer4.url"), false));
  dotaQuiz.questions.push(question8);

  var question9 = new Question("For each point of Strength a hero has, their maximum hit points are increased by how much?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "...", "media/triviaImg.jpg");
  question9.answers.push(new AnswerInstance(new Answer("+17", "http://answer1.url"), false));
  question9.answers.push(new AnswerInstance(new Answer("+18", "http://answer2.url"), false));
  question9.answers.push(new AnswerInstance(new Answer("+19", "http://answer3.url"), true));
  question9.answers.push(new AnswerInstance(new Answer("+20", "http://answer4.url"), false));
  dotaQuiz.questions.push(question9);

  var question10 = new Question("TI5 Question?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "TI5 Trivia", "media/snowball.png");
  question10.answers.push(new AnswerInstance(new Answer("...", "http://answer1.url"), false));
  question10.answers.push(new AnswerInstance(new Answer("...", "http://answer2.url"), true));
  question10.answers.push(new AnswerInstance(new Answer("...", "http://answer3.url"), false));
  question10.answers.push(new AnswerInstance(new Answer("...", "http://answer4.url"), false));
  dotaQuiz.questions.push(question10);

  var question11 = new Question("Which item has the highest mana cost?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Mekansm (yes its actually spelled that way, not 'Mekanism') has a manacost of 225, nerfed from 150 in patch 6.82.", "media/snowball.png");
  question11.answers.push(new AnswerInstance(new Answer("Mekansm", "http://answer1.url"), true));
  question11.answers.push(new AnswerInstance(new Answer("Guardian Greeves", "http://answer2.url"), false));
  question11.answers.push(new AnswerInstance(new Answer("Eul's Scepter of Divinity", "http://answer3.url"), false));
  question11.answers.push(new AnswerInstance(new Answer("Dagon", "http://answer4.url"), false));
  dotaQuiz.questions.push(question11);

  var question12 = new Question("At ESL One 2015, Team Secret beat Team Fnatic. In game two, Secret lastpicked Techies as part of a pocket strat, laning him with a synergetic hero - which hero?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Zai and Kurokys suicidal snowball caught the Malaysians by surprise, a truly devastating combo", "media/snowball.png");
  question12.answers.push(new AnswerInstance(new Answer("Tiny", "http://answer1.url"), false));
  question12.answers.push(new AnswerInstance(new Answer("Tusk", "http://answer2.url"), true));
  question12.answers.push(new AnswerInstance(new Answer("Magnus", "http://answer3.url"), false));
  question12.answers.push(new AnswerInstance(new Answer("Pudge", "http://answer4.url"), false));
  dotaQuiz.questions.push(question12);

  return JSON.stringify(dotaQuiz);
}

function createDotaQuiz2(){
  var questionTime = 10;
  var answerTime = 10;
  var triviaTime = 10;
  var dotaQuiz = new Quiz("HuddupQuiz: Dota2 TI5 - Waxxies 2");

  var question1 = new Question("How many towers does each team have in total?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Three towers in each of the lanes and two towers protecting the Ancient.", "media/triviaImg.jpg");
  question1.answers.push(new AnswerInstance(new Answer("9", "http://answer1.url"), false));
  question1.answers.push(new AnswerInstance(new Answer("10", "http://answer2.url"), false));
  question1.answers.push(new AnswerInstance(new Answer("11", "http://answer3.url"), true));
  question1.answers.push(new AnswerInstance(new Answer("12", "http://answer4.url"), false));
  dotaQuiz.questions.push(question1);
  
  var question2 = new Question("In the recent 6.83 patch, which hero was connected with these malicious words: hoho, haha?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "HO HO HA HA HO HO HA HA HO HO HA HA (6.83 Cancer) HO HO HA HA HO HO HA HA HO HO HA HA", "media/hohohaha.png");
  question2.answers.push(new AnswerInstance(new Answer("Sniper", "http://answer1.url"), true));
  question2.answers.push(new AnswerInstance(new Answer("Undying", "http://answer2.url"), false));
  question2.answers.push(new AnswerInstance(new Answer("Troll Warlord", "http://answer3.url"), false));
  question2.answers.push(new AnswerInstance(new Answer("Techies", "http://answer4.url"), false));
  dotaQuiz.questions.push(question2);

  var question3 = new Question("Dying immediately after a buyback is commonly known as a...?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Dieback...", "media/dieback.png");
  question3.answers.push(new AnswerInstance(new Answer("'Rage Quit'", "http://answer1.url"), false));
  question3.answers.push(new AnswerInstance(new Answer("'Dieback'", "http://answer2.url"), true));
  question3.answers.push(new AnswerInstance(new Answer("'Good Game'", "http://answer3.url"), false));
  question3.answers.push(new AnswerInstance(new Answer("'322'", "http://answer4.url"), false));
  dotaQuiz.questions.push(question3);

  var question4 = new Question("How long is the cooldown for Ravage, Tidehunters ultimate ability?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "150 seconds. Which is why Refresher Orb is a late core item. With Octarine Core the cooldown is 122,5 seconds", "media/triviaImg.jpg");
  question4.answers.push(new AnswerInstance(new Answer("120 seconds", "http://answer1.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("130 seconds", "http://answer2.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("140 seconds", "http://answer3.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("150 seconds", "http://answer4.url"), true));
  dotaQuiz.questions.push(question4);

  var question5 = new Question("'322' is the amount of US dollars one player won when he bet $100 on his own team losing. Who was the player behind the 322 scandal?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "...", "media/322.png");
  question5.answers.push(new AnswerInstance(new Answer("Solo", "http://answer1.url"), true));
  question5.answers.push(new AnswerInstance(new Answer("yol", "http://answer2.url"), false));
  question5.answers.push(new AnswerInstance(new Answer("God", "http://answer3.url"), false));
  question5.answers.push(new AnswerInstance(new Answer("Goblak", "http://answer4.url"), false));
  dotaQuiz.questions.push(question5);

  var question6 = new Question("MVP.Hot6 is an all-Korean team, except JerAx, their position 4 support player who is European. Which country is JerAx from?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "...", "media/mvp6.png");
  question6.answers.push(new AnswerInstance(new Answer("Germany", "http://answer1.url"), false));
  question6.answers.push(new AnswerInstance(new Answer("Sweden", "http://answer2.url"), false));
  question6.answers.push(new AnswerInstance(new Answer("Finland", "http://answer3.url"), true));
  question6.answers.push(new AnswerInstance(new Answer("Denmark", "http://answer4.url"), false));
  dotaQuiz.questions.push(question6);

  var question7 = new Question("Which hero has the highest amount of base strength (without items) at level 1?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "That's right, the ", "media/snowball.png");
  question7.answers.push(new AnswerInstance(new Answer("Spirit Breaker", "http://answer1.url"), true));
  question7.answers.push(new AnswerInstance(new Answer("Pudge", "http://answer2.url"), false));
  question7.answers.push(new AnswerInstance(new Answer("Doom", "http://answer3.url"), false));
  question7.answers.push(new AnswerInstance(new Answer("Centaur Warrunner", "http://answer4.url"), false));
  dotaQuiz.questions.push(question7);

  var question8 = new Question("Ti5 question TBD", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Trivia TBD", "media/triviaImg.jpg");
  question8.answers.push(new AnswerInstance(new Answer("Four", "http://answer1.url"), false));
  question8.answers.push(new AnswerInstance(new Answer("Five", "http://answer2.url"), false));
  question8.answers.push(new AnswerInstance(new Answer("Six", "http://answer3.url"), true));
  question8.answers.push(new AnswerInstance(new Answer("Seven", "http://answer4.url"), false));
  dotaQuiz.questions.push(question8);

  var question9 = new Question("In the last moments of the TI3 final, S4 cancelled the TP's of Dendi and Puppey, delaying their return to defending the base, securing Alliance the victory. Thus S4 executed what would later be labelled the Million Dollar...?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "The legendary play is embedded in the headpiece of Alliance's Reminiscense of Dreams set for Puck", "media/s4coil.jpg");
  question9.answers.push(new AnswerInstance(new Answer("Dream Coil", "http://answer1.url"), true));
  question9.answers.push(new AnswerInstance(new Answer("Blackhole", "http://answer2.url"), false));
  question9.answers.push(new AnswerInstance(new Answer("Ravage", "http://answer3.url"), false));
  question9.answers.push(new AnswerInstance(new Answer("RP (Reverse Polarity)", "http://answer4.url"), false));
  dotaQuiz.questions.push(question9);

  var question10 = new Question("Speaking of S4. Which rune has been dubbed the 'S4' rune?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "...", "media/triviaImg.jpg");
  question10.answers.push(new AnswerInstance(new Answer("Invisibility rune", "http://answer1.url"), false));
  question10.answers.push(new AnswerInstance(new Answer("Haste rune", "http://answer2.url"), true));
  question10.answers.push(new AnswerInstance(new Answer("Double Damage rune", "http://answer3.url"), false));
  question10.answers.push(new AnswerInstance(new Answer("Illusion rune", "http://answer4.url"), false));
  dotaQuiz.questions.push(question10);

  var question11 = new Question("For each +1 point of Intelligence a hero has, their maximum mana points are increased by how much?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "No much trivia to say...skål", "media/triviaImg.jpg");
  question11.answers.push(new AnswerInstance(new Answer("+13", "http://answer1.url"), true));
  question11.answers.push(new AnswerInstance(new Answer("+14", "http://answer2.url"), false));
  question11.answers.push(new AnswerInstance(new Answer("+15", "http://answer3.url"), false));
  question11.answers.push(new AnswerInstance(new Answer("+16", "http://answer4.url"), false));
  dotaQuiz.questions.push(question11);

  var question12 = new Question("What prominent player was kicked and replaced by EGM on team No Tidehunter, completing the all-Swedish lineup that later became Alliance?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "EternalEnvy was kicked due to language issues. During his time in No Tidehunter, he played a position 5 support role.", "media/eenth.png");
  question12.answers.push(new AnswerInstance(new Answer("Black^", "http://answer1.url"), false));
  question12.answers.push(new AnswerInstance(new Answer("bOne7", "http://answer2.url"), false));
  question12.answers.push(new AnswerInstance(new Answer("EternaLEnVy", "http://answer3.url"), true));
  question12.answers.push(new AnswerInstance(new Answer("qojqva", "http://answer4.url"), false));
  dotaQuiz.questions.push(question12);

  return JSON.stringify(dotaQuiz);
}

function createTestQuiz(){
  var questionTime = 10;
  var answerTime = 10;
  var triviaTime = 10;
  var dotaQuiz = new Quiz("Test quiz");

  var question1 = new Question("Hvilken by er den tredje største i Danmark?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Odense er Danmarks tredjestørste by med 173.814 indbyggere", "media/triviaImg.jpg");
  question1.answers.push(new AnswerInstance(new Answer("Aarhus", "http://answer1.url"), false));
  question1.answers.push(new AnswerInstance(new Answer("Aalborg", "http://answer2.url"), false));
  question1.answers.push(new AnswerInstance(new Answer("Odense", "http://answer3.url"), true));
  question1.answers.push(new AnswerInstance(new Answer("Herning", "http://answer4.url"), false));
  dotaQuiz.questions.push(question1);
  
  var question2 = new Question("Hvem vandt den grønne point trøje i dette års Tour de France?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Det gjorde Peter Sagan", "media/hohohaha.png");
  question2.answers.push(new AnswerInstance(new Answer("Peter Sagan", "http://answer1.url"), true));
  question2.answers.push(new AnswerInstance(new Answer("Chris Froome", "http://answer2.url"), false));
  question2.answers.push(new AnswerInstance(new Answer("André Greipel", "http://answer3.url"), false));
  question2.answers.push(new AnswerInstance(new Answer("Nairo Quintana", "http://answer4.url"), false));
  dotaQuiz.questions.push(question2);

  var question3 = new Question("Hvilken dansk popgruppe stod bag hittet 'Barbie Girl'?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "pls kill me", "media/dieback.png");
  question3.answers.push(new AnswerInstance(new Answer("Medina", "http://answer1.url"), false));
  question3.answers.push(new AnswerInstance(new Answer("Aqua", "http://answer2.url"), true));
  question3.answers.push(new AnswerInstance(new Answer("Spice Girls", "http://answer3.url"), false));
  question3.answers.push(new AnswerInstance(new Answer("eyeQ", "http://answer4.url"), false));
  dotaQuiz.questions.push(question3);

  var question4 = new Question("Færdiggør denne filmtitel: Gamle Mænd i Nye ...", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "150 seconds. Which is why Refresher Orb is a late core item. With Octarine Core the cooldown is 122,5 seconds", "media/triviaImg.jpg");
  question4.answers.push(new AnswerInstance(new Answer("Sko", "http://answer1.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("Klæder", "http://answer2.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("Tider", "http://answer3.url"), false));
  question4.answers.push(new AnswerInstance(new Answer("Biler", "http://answer4.url"), true));
  dotaQuiz.questions.push(question4);

  var question5 = new Question("Hvilket fodboldhold fra den engelske Premier League har hjemmebane på Anfield Road?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "...", "media/322.png");
  question5.answers.push(new AnswerInstance(new Answer("Liverpool FC", "http://answer1.url"), true));
  question5.answers.push(new AnswerInstance(new Answer("Manchester United", "http://answer2.url"), false));
  question5.answers.push(new AnswerInstance(new Answer("Arsenal", "http://answer3.url"), false));
  question5.answers.push(new AnswerInstance(new Answer("Chelsea", "http://answer4.url"), false));
  dotaQuiz.questions.push(question5);

  var question6 = new Question("Hvad er hovedstaden i Canada?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "...", "media/mvp6.png");
  question6.answers.push(new AnswerInstance(new Answer("Toronto", "http://answer1.url"), false));
  question6.answers.push(new AnswerInstance(new Answer("Vancouver", "http://answer2.url"), false));
  question6.answers.push(new AnswerInstance(new Answer("Ottowa", "http://answer3.url"), true));
  question6.answers.push(new AnswerInstance(new Answer("Québec", "http://answer4.url"), false));
  dotaQuiz.questions.push(question6);

  var question7 = new Question("Hvilken fugl er Danmarks nationalfugl?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "That's right, the ", "media/snowball.png");
  question7.answers.push(new AnswerInstance(new Answer("Knopsvanen", "http://answer1.url"), true));
  question7.answers.push(new AnswerInstance(new Answer("Storken", "http://answer2.url"), false));
  question7.answers.push(new AnswerInstance(new Answer("Svalen", "http://answer3.url"), false));
  question7.answers.push(new AnswerInstance(new Answer("Solsorten", "http://answer4.url"), false));
  dotaQuiz.questions.push(question7);

  var question8 = new Question("Hvilken forfatter har skrevet Kvinden i Buret", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "Trivia TBD", "media/triviaImg.jpg");
  question8.answers.push(new AnswerInstance(new Answer("Elsebeth Egholm", "http://answer1.url"), false));
  question8.answers.push(new AnswerInstance(new Answer("Stieg Larsson", "http://answer2.url"), false));
  question8.answers.push(new AnswerInstance(new Answer("Jussi-Adler Olsen", "http://answer3.url"), true));
  question8.answers.push(new AnswerInstance(new Answer("Leif Davidsen", "http://answer4.url"), false));
  dotaQuiz.questions.push(question8);

  var question9 = new Question("Hvilket land kommer bilen Seat fra?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "The legendary play is embedded in the headpiece of Alliance's Reminiscense of Dreams set for Puck", "media/s4coil.jpg");
  question9.answers.push(new AnswerInstance(new Answer("Spanien", "http://answer1.url"), true));
  question9.answers.push(new AnswerInstance(new Answer("Frankrig", "http://answer2.url"), false));
  question9.answers.push(new AnswerInstance(new Answer("Italien", "http://answer3.url"), false));
  question9.answers.push(new AnswerInstance(new Answer("Tyskland", "http://answer4.url"), false));
  dotaQuiz.questions.push(question9);

  var question10 = new Question("Hvilket flyselskab nedlagde for nylig deres base i Billund?", questionTime, answerTime, triviaTime, "multipleChoiceSingleAnswer", "...", "media/triviaImg.jpg");
  question10.answers.push(new AnswerInstance(new Answer("Vueling", "http://answer1.url"), false));
  question10.answers.push(new AnswerInstance(new Answer("Ryanair", "http://answer2.url"), true));
  question10.answers.push(new AnswerInstance(new Answer("Norwegian", "http://answer3.url"), false));
  question10.answers.push(new AnswerInstance(new Answer("Malaysian Airlines", "http://answer4.url"), false));
  dotaQuiz.questions.push(question10);


  return JSON.stringify(dotaQuiz);
}


function Quiz(title){
  this.title = title;
  this.questions = [];
}
function Question(title, preTime, questionTime, postTime, questionType, triviaText, triviaImg){
  this.title = title;
  this.preTime = preTime;
  this.questionTime = questionTime;
  this.postTime = postTime;
  this.questionType = questionType;
  this.triviaText = triviaText;
  this.triviaImg = triviaImg;
  this.answers = [];
}
function Answer(text, imageUrl){
  this.text = text;
  this.imageUrl = imageUrl;
}
function AnswerInstance(answer, isCorrect){
  this.answer = answer;
  this.isCorrect = isCorrect;
}
