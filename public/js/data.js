var socket = io.connect();
	socket.on('welcome', handleWelcome);
	socket.on('data', handleData);


function handleWelcome(data){
	console.dir(data);	
}
function handleData(data){
	console.dir(data);	
}