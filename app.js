/* required dependencies */
var request = require('request');
var express = require('express');

/* app instance */
var app = express();

/* app configurations */
app.use(express.logger());
app.use(express.bodyParser());

/* redirects to GitHub Repo of the module */
app.get('/', function(req, res) {
  res.redirect('https://github.com/prikha/slack-github');
});

/* config variables */
var url = process.env.URL;

/* returns genarated message to send using request payload by GitHub */
var message = function(event) {
  var pull_request = event.pull_request;
  return '<'+event.pull_request.url+'|[#'+event.number+']> '+pull_request.title;
}

var closedPR = function(event){
  return (event.action == 'closed' && event.pull_request.merged.toString() == "true");
}

/*
triggers on a POST request by GitHub webhook
and send message to slack-channel, according to commit detail
*/
app.post('/', function(req, res) {

  /* works only, if url config var is there */
  if(url)
  {
    console.log("Responding to event '%s'", req.headers['x-github-event'])
    if (req.headers['x-github-event'] === 'ping') {
      return res.status(200).json({value: 'pong'});
    }

    if(closedPR(req.body)) {
      var options = {};
      options.url     = url;
      options.method  = 'POST';
      options.body    = {};
      options.json    = true;
      options.body['text'] = message(req.body)

      request(options, function (err, response, body) {
        var headers = response.headers;
        var statusCode = response.statusCode;
        res.send(statusCode);
      });
    } else {
      res.send(200)
    }
  }
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("express server listening on " + port);
});
