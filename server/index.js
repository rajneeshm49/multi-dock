var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

//Redis connection code below
var redis = require('redis');
var client = redis.createClient(6379, 'redis'); // this creates a new client

client.on('connect', function() {
    console.log('Redis client connected successfully');
});

client.on('error', function (err) {
    console.log('Something went wrong in redis connection ' + err);
});
//using MW
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "dist")));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.post('/', function(req, res) {
    client.set("mykey", req.body.hero, function(err, reply) {
        if(reply) {
            client.get("mykey", function(err, val) {
                return res.json({"success": true, "mykey":val + ' great! Its working'});
            })
        } else {
            return res.json({"success": false, "msg": "couldnt set value in redis"});
        }
        
    })
})

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log("Server is listening on port "+ app.get('port'));
});