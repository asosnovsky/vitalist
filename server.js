//-----------------------------------------
//	Requirements
//-----------------------------------------
/*Packages*/
var express 	= require('express'),
	url 		= require('url'),
	bodyParser 	= require('body-parser');

/*Modules*/
var db 	= require('./data');

/*Variables*/
var PORT = {
	app 	: 2121,
	server 	: 2122
};

//-----------------------------------------
//	Apllication
//-----------------------------------------
var app 	= express();
	app.use(express.static(__dirname));

app.listen(PORT.app);
console.log('app active on', PORT.app);
//-----------------------------------------
//	Server
//-----------------------------------------
var server 	= express();
	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({ extended: true }));

function resHandler(res, exterr) {
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Methods', 'GET,POST');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	return function(err,data){
		if(err && !data){
			res.status(400).send(err);
		}	else if(err)	{
			res.status(202).json({err:err,data:Object.keys(data).map(function(k){return data[k]})});
		}	else if(exterr) {
			res.status(exterr.status).send(exterr.err)
		}	else	{
			res.status(200).json({err:err,data:Object.keys(data).map(function(k){return data[k]})});
		}
	};
}

server.get('/get',function (req,res) {
	console.log(req,res)
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

server.listen(PORT.server);
console.log('server active on', PORT.server);
