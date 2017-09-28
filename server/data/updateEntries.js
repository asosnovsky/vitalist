const allowedFields = ['text','done','index','hide','rating'];
module.exports = function(changes, callback) {
	var errs = {};
	var errsHappened = false;
	const tId = Math.random().toString(36).substr(2,6) + Date.now();
	log.database(`[${tId}] Updating list with`, changes)
	log.database(`[${tId}] Getting list`)
	require('./getList.js')(function(errG,data){
		if(!errG)	{
			var ids =[];
			log.database(`[${tId}] Got list`)
			log.database(`[${tId}] Updating rows`)
			Object.keys(changes).forEach(function(id,index){
				if(data[id])	{
					log.database(`[${tId}] Updating row ${id}`, JSON.stringify(data[id]))
					allowedFields.forEach(function(k){
						if(changes[id][k]!== undefined) {
							log.database(`[${tId}] Updating row ${id} ${k} ${changes[id][k]}`)
							if(k==='done') { 
								changes[id][k] = (changes[id][k] === 'true' || changes[id][k] === true);
								if(changes[id][k]) {
									changes[id].time_done = Date.now();
								}
							}
							log.database(`[${tId}] Updating row ${id} ${k}; ${data[id][k]} is set to ${changes[id][k]}`)
							data[id][k] = changes[id][k];
							changes[id].last_change = Date.now();
						}
					});
					log.database(`[${tId}] Updated row ${id}`, JSON.stringify(data[id]))
				}	else	{
					errs[id] = 'No such Id';
					errsHappened = true;
				}
			});
			log.database(`[${tId}] Done update`, errs)
			require('./updateList')(data,function(err){
				if(err) {
					console.warn(err);
					errs["UPLIST"] = err;
					errsHappened = true;
				}
				require('./getList.js')(function (errG2, data2) {
					if(errG2) {
						errs["GET2LIST"] = errG2;
						errsHappened = true;
					}
					callback(errsHappened ? errs : null,data2);
				})
			});
		}	else	{
			log.database(`[${tId}] Error getting list ${errG.stack}`)
			callback({"GETLIST": errG},null);
		}
	});
}