$(document).ready(function(){
  $('#chats').on('click', '.username', function(){
    var user = $(this).text();
    app.addFriend(user);
  });

  $('#send').submit(function(event) {
    app.handleSubmit();
    event.preventDefault();
  });  

  $('#roomSelect').on('change', function() {
    app.switchRooms($(this).val());
  })
});

// YOUR CODE HERE:
var app = {};

var curTime = 0;

app.init = function() {
  app.send = send;
  app.fetch = fetch;
  app.server = "https://api.parse.com/1/classes/chatterbox";
  app.clearMessages = clearMessages;
  app.addMessageToUI = addMessageToUI;
  app.addRoom = addRoom;
  app.addFriend = addFriend;
  app.handleSubmit = handleSubmit;
  app.switchRooms = switchRooms;
  setInterval(function(){
    app.fetch();
  }, 200);
}

var rooms = {};

var newRooms = {};

var allChats = [];

// write a function to pass the roomnames to the selectbox

var updateRooms = function(room) {
  for (var key in newRooms) {
    if (newRooms[key] != undefined)
      $('#roomSelect').append('<option value="' + newRooms[key] + '">' + newRooms[key] + '</option>');    
  }
};

var fetch = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    success: function(data) {
      var messages = data.results;
      var temp = {};
      for (var i = messages.length - 1; i >= 0; i--) {
        // console.log(messages[i])
        var room = messages[i]['roomname'];
        if(rooms[room] === undefined && room !== undefined && room != "" ) {
          newRooms[room] = room;
          rooms[room] = room;
        }

        if (Date.parse(messages[i]['createdAt']) - curTime > 0) {
          temp.username = sanitizeString(messages[i]['username']);
          temp.text = sanitizeString(messages[i]['text']);
          allChats.unshift(messages[i]);
          if(temp.text !== undefined && temp.username !== undefined) {
            addMessageToUI(temp);
          }
        } else {
          break;
        }
      }
      updateRooms(room);
      newRooms = {};
      curTime = new Date();
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

var clearMessages = function() {
  $('#chats').empty();
}

// validate our strings against XSS attacks
var addMessageToUI = function(message) {
  var $node = '<div><span class="username">' + message.username + '</span><span class="text">' + message.text + '</span></div>';
  $('#chats').prepend($node);
}

var addRoom = function(roomname) {
  $('#roomSelect').append('<option value ="' + sanitizeString(roomname) + '"></option>');
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
  addMessageToUI(message);

  $('#message').val('');
  app.send(message);
}

var switchRooms = function(room) {
  app.clearMessages();

  for(var i = 0; i < allChats.length; i++) {
    var message = allChats[i];
    if(message['roomname'] === room) addMessageToUI(message);
  }
}