var makeList = require('./makeList.js'),
	fs		 = require('fs');

module.exports = function (callback) {
	console.log('FUNCTION => db.add', __dirname);
	fs.readFile(__dirname + '/list.json', 'utf8', function(err,data){
		if(err && err.code === "ENOENT")	{
			makeList(function(merr,data){
				if(!merr){
					callback(null,sort(data));
				}
			});
		}	else if(!err) 	{
			console.log('FUNCTION => db.add -> Success');
			callback(null,sort(JSON.parse(data)));
		}	else 	{
			console.log('FUNCTION => db.add -> Error', err);
			callback(err);
		}
	});

	function sort(dt) {
		console.log('FUNCTION => db.add.sort');
		var ndt = {};
		Object.keys(dt).sort(function(a,b){
			return dt[a].index - dt[b].index;
		}).forEach(function(id){
			ndt[id] = dt[id];
		});
		Object.keys(ndt).forEach(function(id, i){
			ndt[id].index = i + 1;
		});
		return ndt;
	}
}