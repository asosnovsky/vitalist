var fs = require('fs');
module.exports = function (ndata,callback) {
	fs.writeFile('./data/list.json',JSON.stringify(ndata),function(err){
		if(!err)	{
			callback(null);
		}	else 	{
			callback(true);
			throw "Could not write new file.";
		}
	});
}