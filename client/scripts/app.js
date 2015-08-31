// YOUR CODE HERE:
var app = {};

app.init = function() {
  app.send = send;
  app.fetch = fetch;
  app.server = "https://api.parse.com/1/classes/chatterbox";
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