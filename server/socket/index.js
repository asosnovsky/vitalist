
const db = require('../data');

const toArray = data => Object.keys(data).map(function(k){return data[k]})

module.exports = (expressApp) => {
	var io = require('socket.io').listen(expressApp);

	io.on('connection', function(socket){
		log.socket('a user connected');
		db.get((error, data) => {
			if(error) {
				io.emit('error', error)
			}else{
				log.socket('emitting data due to `connected`')
				socket.emit('data', toArray(data))
			}
		})
		socket.on('update', (changes) => {
			log.socket('recieving `update`', changes)
			db.updateM(changes, (error, data) => {
				if(error) {
					log.socket('emitting error due to `change`', {
						error, 
						changes
					})
					io.emit('error', error)
				}else{
					log.socket('emitting data due to `change`', changes)
					io.emit('data', toArray(data))
				}
			})
		})
		socket.on('add', (newRow) => {
			log.socket('recieving `add`', newRow)
			db.add(newRow, (error, data) => {
				if(error) {
					log.socket('emitting error due to `add`', {error, newRow})
					io.emit('error', error)
				}else{
					log.socket('emitting data due to `add`', newRow)
					io.emit('data', toArray(data))
				}
			})
		})
	});
}
