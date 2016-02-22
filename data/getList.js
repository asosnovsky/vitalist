var makeList = require('./makeList.js'),
	fs		 = require('fs');

module.exports = function (callback) {
	fs.readFile('./data/list.json', 'utf8', function(err,data){
		if(err && err.code === "ENOENT")	{
			makeList(function(merr,data){
				if(!merr){
					callback(null,sort(data));
				}
			});
		}	else if(!err) 	{
			callback(null,sort(JSON.parse(data)));
		}	else 	{
			callback(err);
		}
	});

	function sort(dt) {
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