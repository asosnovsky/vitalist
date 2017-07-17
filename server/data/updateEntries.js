module.exports = function(changes, callback) {
	var errs = {};
	require('./getList.js')(function(errG,data){
		if(!errG)	{var ids =[];
			Object.keys(changes).forEach(function(id,index){
				if(data[id])	{
					Object.keys(data[id]).forEach(function(k){
						if(changes[id][k]!== undefined) {
							if(k==='done') 
								{ 
									changes[id][k] = (changes[id][k] === 'true');
									if(changes[id][k])
									{
										changes[id].time_done = Date.now();
									}
								}
							data[id][k] = changes[id][k];
							changes[id].last_change = Date.now();
						}
					});
				}	else	{errs[id] = 'No such Id';}
			});
			require('./updateList')(data,function(err){
				if(err) {
					console.warn(err);
					errs["UPLIST"] = err;
				}
				require('./getList.js')(function (errG2, data2) {
					if(errG2) {errs["GET2LIST"] = errG2;}
					callback(errs,data2);
				})
			});
		}	else	{
			callback({"GETLIST": errG},null);
		}
	});
}