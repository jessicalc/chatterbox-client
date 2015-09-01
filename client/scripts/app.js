$(document).ready(function(){
  $('#chats').on('click', '.username', function(){
    var user = $(this).text();
    app.addFriend(user);
    $('#chats').find('.username:contains(' + user + ')').addClass('friend');
  });

  $('#send').submit(function(event) {
    app.handleSubmit();
    event.preventDefault();
  });  

  $('#roomSelect').on('change', function() {
    var thisRoom = $(this).val();
    if (thisRoom === "newroom") {
      var newRoom = window.prompt("Give me the name of your new room");
      thisRoom = sanitizeString(newRoom);
      if(String(thisRoom) == String(null) || String(thisRoom) == "") { 
        $("#roomSelect").val('default');
        thisRoom = 'default';
      } else {
        $('#roomSelect').prepend('<option value="' + thisRoom + '">' + thisRoom + '</option>');
        $("#roomSelect").val(thisRoom);
      }
    }
    app.switchRooms(thisRoom);
  })
});

// YOUR CODE HERE:
var app = {};

var curTime = 0;
var curRoom = "default";
var friends = {};

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
    if (String(newRooms[key]) != String(undefined)) {
      $('#roomSelect').append('<option value="' + newRooms[key] + '">' + newRooms[key] + '</option>');    
    }
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
        var room = sanitizeString(messages[i]['roomname']);
        if(String(rooms[room]) == String(undefined) && String(room) != String(undefined) && String(room) != "" ) {
          newRooms[room] = room;
          rooms[room] = room;
        }
        if (Date.parse(messages[i]['createdAt']) - curTime > 0) {
          temp.username = sanitizeString(messages[i]['username']);

          if(temp.username == getUsername()) {
            continue;
          }

          temp.text = sanitizeString(messages[i]['text']);
          allChats.unshift(messages[i]);
          if(String(temp.text) != String(undefined) && String(temp.username) != String(undefined)) {
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

var send = function(message, personalMessage) {
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
  if(message.roomname != curRoom && curRoom !== 'default') return;

  var classes = 'username ';
  if(friends[message.username] !== undefined) {
    classes += 'friend';
  }

  var $node = '<div><span class="' + classes + '">' + message.username + '</span><span class="text">' + message.text + '</span></div>';
  $('#chats').prepend($node);
}

var addRoom = function(roomname) {
  $('#roomSelect').append('<option value ="' + sanitizeString(roomname) + '"></option>');
}

var addFriend = function(friend) {
  friends[friend] = friend;
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
  message.roomname = curRoom;
  allChats.unshift(message);

  $('#message').val('');
  app.send(message, true);
  addMessageToUI(message);
}

var switchRooms = function(room) {
  curRoom = room;
  app.clearMessages();
  for(var i = allChats.length - 1; i >= 0; i--) {
    var message = allChats[i];
    if(curRoom === 'default') { 
      addMessageToUI(message); 
    } else if(message['roomname'] === curRoom) { 
      addMessageToUI(message); 
    }
  }
}