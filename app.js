var five = require('johnny-five'),board,button;

board = new five.Board();

console.log(board);

board.on('ready', function(){
	var val = 0;
	button = new five.Button(4);

	board.repl.inject({
		button: button
	});

	button.on("down", function(){
		console.log('down');
	});

	button.on("hold", function(){
		console.log("HOLD!!!!");
	});

	this.pinMode(13,1);
	
	this.loop(450, function() {
		this.digitalWrite(13,(val = val ? 0 : 1 ));
	});
});
