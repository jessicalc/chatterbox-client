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
  app.addMessageToUI = addMessageToUI;
  app.addRoom = addRoom;
  app.addFriend = addFriend;
  app.handleSubmit = handleSubmit;
}

var fetch = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    success: function(data) {
      var messages = data.results;
      console.log(messages);
      var temp = {};
      for (var i = 0; i < messages.length; i++) {
        temp.username = sanitizeString(messages[i]['username']);
        temp.text = sanitizeString(messages[i]['text']);
        addMessageToUI(temp);
      }
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

var sanitizeString = function(string) {
  return html_sanitize(string);
}

var displayPosts = function(data) {
  console.log(data);
}

var clearMessages = function() {
  $('#chats').empty();
}

// validate our strings against XSS attacks
var addMessageToUI = function(message) {
  var $node = '<div><span class="username">' + message.username + '</span><span class="text">' + message.text + '</span></div>';
  $('#chats').append($node);
}

var addRoom = function(roomName) {
  $('#roomSelect').append('<option value ="' + sanitizeString(roomName) + '"></option>');
}

var addFriend = function(friend) {
  console.log('yay!');
}

var getUsername = function() {
  var userNameParam = window.location.search;
  var startIdx = userNameParam.indexOf('username') + 9;

  var username = "";
  for(var i = startIdx; i < userNameParam.length; i++) {
    var character = userNameParam[i];
    if(character === "#") break;

    username += userNameParam[i];
  }
  return username;
}

var handleSubmit = function() {
  var message = {};

  message.text = sanitizeString($('#message').val());
  message.username = getUsername();
  app.addMessageToUI(message);

  app.send(message);
}

setInterval(app.fetch, 1000);