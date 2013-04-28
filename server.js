define(['express','http','fs','module', 'path', 'web','gpio','child_process', 'post','userweb'], 
function (express, http, fs, module, path, Web, five, childProcess, Post, UserWeb) {

	var app = express();
	var player,streamer,gpio,gpio17;
	var up = false;

	// To block webcam untill current capture finishes
	var blockWebcam = false;  

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

	var postMe = new Post();
	app.post('/api/remove', postMe.deleteFile);

	//HANDLE HARDWARE CODE (gpio)
	var gpio = require("gpio");
	var gpio17 = gpio.export(4, {
		direction: "in",
		ready: function() {
			gpio17.on("change", function(val){
				if (val ==1 && !blockWebcam)
				{
					blockWebcam = true;

					player = childProcess.exec('aplay foto.wav',
						function(error,stdout,stderr){
							if (error) {
								console.log(error.stack);
								console.log('player: Error code: '+error.code);
							}
							console.log('player Child Process STDOUT: '+stdout);
							console.log('player Child Process STDERR: '+stderr);
						});
					player.on('exit', function (code) {

						console.log("Say Cheese!");	
						streamer = childProcess.exec('streamer -f jpeg -o ./photos/image' + new Date().getTime() + '.jpeg', 
							function (error, stdout, stderr) {
								if (error) {
									console.log(error.stack);
									console.log('Error code: '+error.code);
									console.log('Signal received: '+error.signal);
								}
								console.log('Child Process STDOUT: '+stdout);
								console.log('Child Process STDERR: '+stderr);
							
								// Now we can take the next picture
								blockWebcam = false;
							});

						streamer.on('exit', function (code) {
							console.log('Child process exited with exit code ' + code);
							});
						});
				}
			});
		}
	});

	return app;

});


