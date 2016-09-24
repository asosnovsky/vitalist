module.exports = function (id, change, callback) {
	if(change.done) {change.done = (change.done === 'true')};
	require('./getList.js')(function(err,data){
		if(!err){
			if(data[id])	{
				['text','done','index','hide'].forEach(function(k){
					if(change[k]!== undefined) {
						data[id][k] = change[k];
					}
				});
				console.log(id,data[id].index);
				require('./updateList')(data,function(err){
					callback(err,data);
				})
			} 	else 	{
				callback("No such id");
			}
		} 	else 	{
			throw "CONNERR: Could not get list";
		}
	});
}