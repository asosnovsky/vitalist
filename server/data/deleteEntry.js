module.exports = function (rowId, callback) {
	require('./getList.js')(function(err,data){
		if(!err){
			callback(err, data)
			data[rowId].deleted = new Date();
			require('./updateList')(data,function(error){
				callback(error,data);
			})
		} 	else 	{
			callback(err,null)
		}
	})
}