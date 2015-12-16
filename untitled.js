Db Question object

function Quiz(title){
	this.title = title;
	this._id = new ObjectId();
	this.questions = [];
}
function Question(title, duration, questionType, imageUrl){
	this.title = title;
	this._id = new ObjectId();
	this.duration = duration;
	this.questionType = questionType;
	this.imageUrl = imageUrl;
	this.answers = [];
}
function Answer(text, imageUrl){
	this.text = text;
	this._id = new ObjectId();
	this.imageUrl = imageUrl;
}
function AnswerInstance(answer, isCorrect){
	this.answer = answer;
	this._id = new ObjectId();
	this.isCorrect = isCorrect;
}

example:
var dotaQuiz = new Quiz("The International 2015 - Waxxies");

var question1 = new Question("Who won last year?", 30, "multipleChoiceSingleAnswer");
question1.answers.push(new AnswerInstance(new Answer("Dota2Team1", "http://answer1.url"), true));
question1.answers.push(new AnswerInstance(new Answer("Dota2Team2", "http://answer2.url"), false));
question1.answers.push(new AnswerInstance(new Answer("Dota2Team3", "http://answer3.url"), false));
question1.answers.push(new AnswerInstance(new Answer("Dota2Team4", "http://answer4.url"), false));
dotaQuiz.questions.push(question1);

var question2 = new Question("Who will win today?", 28, "multipleChoiceSingleAnswer");
question2.answers.push(new AnswerInstance(new Answer("Dota2Team1", "http://answer1.url"), false));
question2.answers.push(new AnswerInstance(new Answer("Dota2Team2", "http://answer2.url"), false));
question2.answers.push(new AnswerInstance(new Answer("Dota2Team3", "http://answer3.url"), true));
question2.answers.push(new AnswerInstance(new Answer("Dota2Team4", "http://answer4.url"), false));
dotaQuiz.questions.push(question2);

console.log(dotaQuiz);

{
	title:"Quiz1",
	id:0,
	questions:[
		{
			title:"Question1",
			id:0,
			duration:30,
			questionType:"multipleChoiceSingleAnswer | setInOrder",
			imageUrl:"http://question1.jpg"
			answers:[
				{
					answer:{
						text:"Answer 1",
						id:0,
						imageUrl:"http://answer1.jpg"
					},
					id:0,
					isCorrect:true
				},
				{
					answer:{
						text:"Answer 2",
						id:1,
						imageUrl:"http://answer2.jpg"
					},
					id:1,
					isCorrect:true
				},
				{
					answer:{
						text:"Answer 3",
						id:2,
						imageUrl:"http://answer3.jpg"
					},
					id:2,
					isCorrect:true
				},
				{
					answer:{
						text:"Answer 4",
						id:3,
						imageUrl:"http://answer4.jpg"
					},
					id:3,
					isCorrect:true
				},
			]
		}
	]
}


Runtime User object
function userAnswer(isCorrect, timeLeft){
	this.isCorrect = isCorrect;
	this.timeLeft = timeLeft;
}

{
	username:"user1",
	answers:[
		{
			id:0,
			isCorrect:true,
			timeLeft:10
		},
		{
			id:1,
			isCorrect:false,
			timeLeft:2
		}
	]
}