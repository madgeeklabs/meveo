
define(['express','http','fs','module', 'path', 'web','johnny-five','child_process'], 
	function (express, http, fs, module, path, Web, five, childProcess) {
		var app = express();
	// INIT BOARD
	var board,button,streamer;

	app.configure(function(){
		app.use(express.bodyParser());
		app.use(express.static(path.dirname(module.uri) + '/photos'));
	});

	console.log('uri is: ' +  path.dirname(module.uri));

	app.get('/', function(req, res) {
		console.log('req on root');
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write("Hello gorra!");
		// res.write('<ol>');
		// videosArray.forEach(function (element) {
		// 	res.write('<li>' + element.name + '<a href=graphs/' + element.name + '.txt> Grafica </a> || <a href=' + element.name + '.txt> Datos </a> </li>');
		// });
		// res.write('</ol>');
		res.end();
	});

	var webi = new Web();

	app.get('/album', webi.draw);

	setInterval(function(){
		streamer = childProcess.exec('streamer -f jpeg -o ./photos/image' + new Date().getTime() + '.jpeg'), 
		function (error, stdout, stderr) {
			if (error) {
				console.log(error.stack);
				console.log('Error code: '+error.code);
				console.log('Signal received: '+error.signal);
			}
			console.log('Child Process STDOUT: '+stdout);
			console.log('Child Process STDERR: '+stderr);
		}

		streamer.on('exit', function (code) {
			console.log('Child process exited with exit code ' + code);
		});
    }, 10000 );



board = new five.Board();
console.log(board);

// HANDLE HARDWARE CODE
board.on('ready', function(){
	var val = 0;
	button = new five.Button(4);

	board.repl.inject({
		button: button
	});

	button.on("down", function(){
		streamer = childProcess.exec('streamer -f jpeg -o ./photos/image' + new Date().getTime() + '.jpeg'), 
		function (error, stdout, stderr) {
			if (error) {
				console.log(error.stack);
				console.log('Error code: '+error.code);
				console.log('Signal received: '+error.signal);
			}
			console.log('Child Process STDOUT: '+stdout);
			console.log('Child Process STDERR: '+stderr);
		}

		streamer.on('exit', function (code) {
			console.log('Child process exited with exit code ' + code);
		});
	});

	button.on("hold", function(){
		console.log("HOLD!!!!");
	});

	this.pinMode(13,1);
	
	this.loop(450, function() {
		this.digitalWrite(13,(val = val ? 0 : 1 ));
	});
});

return app;

});


