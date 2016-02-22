var fs 		= require('fs');

module.exports = function(callback) {
	console.log("getting `csv`...");
	var fdata = {};
	var data = fs.readFileSync('./data/list.csv','utf8')
		.split('\r').map(function(d,i) {
			var id = (i + '-' + Math.random().toString(29).substr(4,5));
			fdata[id] = {
				index : i,
				id 	  : id,
				text  : d.split(',')[1],
				done  : (d.split(',')[0].replace(/\n/g,'')==='(Done)')
			};
		});

	console.log('writing `json`...');
	fs.writeFile('./data/list.json',JSON.stringify(fdata),function(err){
		if(!err)	{
			callback(null, fdata);
			console.log('Succesfully recreated list.');
		}	else 	{
			callback(true);
			console.error('Failed at recreating list.');
			throw "Failed at remaking list."
		}
	});
}