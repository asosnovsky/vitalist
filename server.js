//-----------------------------------------
//	Requirements
//-----------------------------------------

/*Packages*/
var express 	= require('express'),
	url 		= require('url'),
	bodyParser 	= require('body-parser'),
	fs 			= require('fs'),
	util 		= require('util'),
	clc 		= require('cli-color');

/*Log Configuration*/
var log_file 	= fs.createWriteStream(__dirname + '/logs/'+ (new Date().getTime()) +'debug.log', {flags : 'w'});
console.log = function() {
  log_file.write(util.format.apply(null, arguments) + '\n');
  process.stdout.write(util.format.apply(null,arguments) + '\n');
};

/*Modules*/
var db 	= require('./data');

//-----------------------------------------
//	Host
//-----------------------------------------
var host = express();

//-----------------------------------------
//	Apllication
//-----------------------------------------
var app 	= express.Router();
	app.use(function(req){
		console.log(clc.white('[Client]') + '> ' + clc.green('call on ') + req.url);
		express.static(__dirname).apply(null,arguments);
	});

//-----------------------------------------
//	Server
//-----------------------------------------
var server 	= express.Router();
	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({ extended: true }));

function resHandler(res, exterr) {
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Methods', 'GET,POST');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	console.log(clc.cyan('[Server]') + '> ' + clc.green('call on ') + res.req.url);
	console.log(clc.blue('  Params  : ') + JSON.stringify(res.req.body))
	return function(err,data){
		console.log(clc.red('TEST|> '), arguments);
		if(err) console.log(clc.blue('  Error   : ') + err);
		if(err && !data){
			res.status(400).send(err);
		}	else if(err)	{
			console.log(clc.blue('  Returned: ') + Object.keys(data).length + ' items');
			res.status(202).json({err:err,data:Object.keys(data).map(function(k){return data[k]})});
		}	else if(exterr) {
			res.status(exterr.status).send(exterr.err)
		}	else	{
			console.log(clc.blue('  Returned: ') + Object.keys(data).length + ' items');
			res.status(200).json({err:err,data:Object.keys(data).map(function(k){return data[k]})});
		}
	};
}

server.get('/get',function (req,res) {
	db.get(resHandler(res));
}).post('/add',function (req,res) {
	if(req.body.entry && req.body.entry.constructor === String)	{
		db.add(req.body.entry,resHandler(res));
	} 	else 	{
		resHandler(res,{status:400,err: 'Invalid Entry'});
	}
}).post('/update',function (req,res) {
	db.updateM(req.body, resHandler(res))
});

//-----------------------------------------
//	Host-Port
//-----------------------------------------

host.use('/',app);
host.use('/db',server);
host.use(function(req,res){
	res.status(404).send('Forbidden')
})

var PORT = null,
	HOST = null;
if(!require('./config.js')) {
	console.log(clc.red('No Config file!'));
}	else 	{
	PORT = require('./config.js').PORT || null;
	HOST = require('./config.js').HOST || null;
}

var HOST = host.listen(PORT, HOST,function(){
	console.log('Server running on http://%s:%s',HOST.address().address,HOST.address().port);
});
