var server;
$(document).ready(function(){
  if(window.document.location.host.replace(/:.*/, '') == 'localhost'){
    server = 'http://' + window.document.location.host.replace(/:.*/, '') + ':8080';
  }else{
    server = 'http://' + window.document.location.host.replace(/:.*/, '');
  }
  $('#btnEnter').on('click', function(){
		if(typeof(Storage) !== 'undefined'){
			if(localStorage.getItem('sessionId')){
				connectWithSessionId(localStorage.getItem('sessionId'));
			}else{
				connectWithoutSessionId();
			}
		}
	});
});

function connectWithSessionId(sessionId){
	if(checkUserInput()){
		$.ajax({
		  	method: "GET",
		  	url: server + '/connectToQuiz/' + $('#inputId').val() + '/' + $('#inputNickname').val() + '/' + sessionId,
		  	success: function(data, status){
		  		console.log(data);
		  		if(data.action == 'ok' && data.sessionId != null){	//You are given a new sessionId since the one you tried to connect with is no longer active!
		  			if(typeof(Storage) !== 'undefined'){
		  				localStorage.setItem('sessionId', data.sessionId);
			  			window.location.replace('quiz.html?id=' + $('#inputId').val() + '&username=' + $('#inputNickname').val());
		  			}else{
		  				console.log("error localStorage not defined");
		  			}
		  		}else if(data.action == 'ok' && data.username != null){
		  			if(data.username != $('#inputNickname').val()){
		  				alert("You cannot change your username while the quiz is still running. \n You will be connected as: " + data.username);
		  			}
			  		window.location.replace('quiz.html?id=' + $('#inputId').val() + '&username=' + data.username);
		  		}else if(data.action == 'wrongConnectionId'){
		  			alert("wrong id");
		  		}else if(data.action == 'usernameTaken'){
		  			alert("username taken");
		  		}
		  	},
		  	dataType: "json"
		});
	}else{
		alert('Your username can only contain letters and numbers. No spacing is allowed.');
	}
}

function connectWithoutSessionId(){
	if(checkUserInput()){
		$.ajax({
		  	method: "GET",
		  	url: server + '/connectToQuiz/' + $('#inputId').val() + '/' + $('#inputNickname').val(),
		  	success: function(data, status){
		  		console.log(data);
		  		if(data.action == 'ok'){
		  			if(typeof(Storage) !== 'undefined'){
		  				localStorage.setItem('sessionId', data.sessionId);
			  			window.location.replace('quiz.html?id=' + $('#inputId').val() + '&username=' + $('#inputNickname').val());
		  			}else{
		  				console.log("error localStorage not defined");
		  			}
		  		}else if(data.action == 'wrongConnectionId'){
		  			alert("wrong id");
		  		}else if(data.action == 'usernameTaken'){
		  			alert("username taken");
		  		}
		  	},
		  	dataType: "json"
		});
	}else{
		alert('Your username can only contain letters and numbers. No spacing is allowed.');
	}
}

var usernameRegex = /^[a-zA-Z0-9]+$/;
function checkUserInput(){
	return $('#inputNickname').val().match(usernameRegex) ? true : false;
}
