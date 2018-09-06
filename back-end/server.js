var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var messages = [{text:'hello text', owner: 'Tim'}, {text:'other message', owner: 'Jane'}];
var users = [{id:1, firstName: 'a', lastName:'a', email: 'sean.alan.thomas@gmail.com', password: 'a' }];

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
})

var api = express.Router();
var auth = express.Router();

api.get('/messages', (req, res) =>{
    res.json(messages);
})

api.get('/messages/:user', (req, res) =>{
    var user = req.params.user;
    var result = messages.filter(message => message.owner == user);
    res.json(result)
})

api.post('/messages', (req, res) =>{
    messages.push(req.body);
    res.json(req.body);
})

api.get('/users/me', checkAuthenticated, (req, res)=> {
    console.log(req.user);
    console.log(users)
    console.log(users[req.user-1])
    return res.json(users[req.user-1]);
})

api.post('/users/me', checkAuthenticated, (req, res)=> {
     var user = users[req.user-1];

     user.firstName = req.body.firstName;
     user.lastName = req.body.lastName;
     res.json(user);
})


auth.post('/login', (req, res)=>{
    console.log(req.body);
    var user = users.find(user => user.email == req.body.email);
    if(!user) 
        return sendAuthError(res);

    if(user.password == req.body.password)
        return sendToken(user, res);
    else    
        return sendAuthError(res);
})

auth.post('/register', (req, res)=>{
    var index = users.push(req.body) - 1;
    var user = users[index];
    user.id = index;
    sendToken(user, res);
    
})

function sendToken(user, res){
    console.log(user);
    var token = jwt.sign(user.id, '123'); //change the secret later with a config variable, not hardcode
    return res.json({firstName: user.firstName, token:token});
}

function sendAuthError(res){
    return res.json({ success: false, message: 'email or password incorrect'});
}

function checkAuthenticated(req, res, next){
    if(!req.header('authorization'))
        return sendUnathorized(res, 'Unathorized request. Missing authentication header');
    
    var token = req.header('authorization').split(' ')[1];
    var payload = jwt.decode(token, '123');

    if(!payload)
        return sendUnathorized(res, 'Unathorized request. Authentication header invalid');

    req.user = payload;
    next();

}

function sendUnathorized(res, message){
    return res.status(401).send({message: message});
}

app.use('/api', api);
app.use('/auth', auth);

var port = 63145;
app.listen(port);