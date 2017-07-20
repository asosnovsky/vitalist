var fs = require('fs');
module.exports = function (ndata,callback) {
	log.database('Updating list.json', __dirname)
	fs.writeFile(__dirname+'/list.json',JSON.stringify(ndata),function(err){
		if(!err)	{
			callback(null);
		}	else 	{
			callback(true);
			throw "Could not write new file.";
		}
	});
}