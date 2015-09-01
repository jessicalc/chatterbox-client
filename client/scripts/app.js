$(document).ready(function(){
  $('#chats').on('click', '.username', function(){
    var user = $(this).text();
    app.addFriend(user);
  });

  $('#send').submit(function(event) {
    app.handleSubmit();
    event.preventDefault();
  })  

});

// YOUR CODE HERE:
var app = {};

app.init = function() {
  app.send = send;
  app.fetch = fetch;
  app.server = "https://api.parse.com/1/classes/chatterbox";
  app.clearMessages = clearMessages;
  app.addMessage = addMessage;
  app.addRoom = addRoom;
  app.addFriend = addFriend;
  app.handleSubmit = handleSubmit;
}

var fetch = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    dataType: 'jsonp',
    contentType: 'application/jsonp',
    success: function(data) {
      console.log(data);
    },
    error: function(data) {
      console.log(data);  
    }
  });
}

var send = function(message) {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      console.log('message sent');
    },
    error: function(data) {
      console.log('message failed');  
    }
  });
}

var clearMessages = function() {
  $('#chats').empty();
}

// validate our strings against XSS attacks
var addMessage = function(text) {
  var userNameParam = window.location.search;
  var startIdx = userNameParam.indexOf('username') + 9;

  var username = "";
  for(var i = startIdx; i < userNameParam.length; i++) {
    var character = userNameParam[i];
    if(character === "#") break;

    username += userNameParam[i];
  }

  var message = {};
  message.username = username;
  message.text = text;

  var $node = '<div><span class="username">' + message.username + '</span><span class="text">' + message.text + '</span></div>';
  $('#chats').append($node);

  app.send(message);
}

var addRoom = function(roomName) {
  $('#roomSelect').append('<option value ="' + roomName + '"></option>');
}

var addFriend = function(friend) {
  console.log('yay!');
}

var handleSubmit = function() {
  var message = $('#message').val();
  app.addMessage(message);
}

// file:///Users/student/Documents/chatterbox-client/client/index.html?message=dff&submit=Submit&username=anonymous# 

//slice it from _.indexOf(url, "username") to 9