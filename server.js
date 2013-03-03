
define(['express','http','fs','module', 'path', 'web','johnny-five','child_process', 'post','userweb'], 
	function (express, http, fs, module, path, Web, five, childProcess, Post, UserWeb) {
		var app = express();
	// INIT BOARD
	var board,button,streamer;
	var up = false;

	app.configure(function(){
		app.use(express.bodyParser());
		app.use(express.static(path.dirname(module.uri) + '/photos'));
		app.use(express.static(path.dirname(module.uri) + '/templates'));
	});

	console.log('uri is: ' +  path.dirname(module.uri));

	app.get('/', function(req, res) {
		console.log('req on root');
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write("Hello gorra!");
		res.end();
	});

	var webi = new Web();

	app.get('/album', webi.draw);

	var userWeb = new UserWeb();

	app.get('/user', userWeb.draw);

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
    }, 300000 );

	var postMe = new Post();
	app.post('/api/remove', postMe.deleteFile);


return app;

});


