module.exports = function (entry,callback) {
	require('./getList.js')(function(err,data){
		if(!err){
			Object.keys(data).forEach(function(id, i){
				data[id].index = i + 1;
			})
			var id = (Object.keys(data).length + '-' + Math.random().toString(29).substr(4,5));
			data[id] = {
				index: 0,
				id 	 : id,
				text :entry,
				date_added: Date.now(),
				done :false
			};
			var ndata = {};
			Object.keys(data).sort(function(a,b){
				return data[a].index - data[b].index;
			}).forEach(function(id){
				ndata[id] = data[id];
			});
			require('./updateList')(ndata,function(error){
				callback(error,ndata);
			})
		} 	else 	{
			callback(err,null)
		}
	})
}