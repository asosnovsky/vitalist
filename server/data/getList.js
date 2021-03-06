var makeList = require('./makeList.js'),
	fs		 = require('fs');

module.exports = function (callback) {
	log.database('FUNCTION => db.get', __dirname);
	fs.readFile(__dirname + '/list.json', 'utf8', function(err,data){
		if(err && err.code === "ENOENT")	{
			makeList(function(merr,data){
				if(!merr){
					callback(null,sort(data));
				}
			});
		}	else if(!err) 	{
			log.database('FUNCTION => db.get -> Success');
			callback(null,sort(JSON.parse(data)));
		}	else 	{
			log.database('FUNCTION => db.get -> Error', err);
			callback(err);
		}
	});

	function sort(dt) {
		log.database('FUNCTION => db.get.sort');
		var ndt = {};
		Object.keys(dt)
		.sort(function(a,b){
			return dt[a].index - dt[b].index;
		})
		.filter(function(id){
			return !dt[id].hide 
		})
		.forEach(function(id){
			ndt[id] = dt[id];
		});
		Object.keys(ndt).forEach(function(id, i){
			ndt[id].index = i + 1;
		});
		return ndt;
	};
}