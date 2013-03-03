
define(['express','http','fs','module', 'path', 'web','johnny-five','child_process'], 
	function (express, http, fs, module, path, Web, five, childProcess) {
		var app = express();
	// INIT BOARD
	var board,button,streamer;

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
	}, 300000 );


	board = new five.Board();
	console.log(board);

	console.log("Sampler created");

	// HANDLE HARDWARE CODE
	board.on('ready', function(){
			var val = 0;
			button = new five.Button(4);

			board.repl.inject({
button: button
});

			var sampler = new PulseSampler(board);
			setInterval(function(){
				sampler.sample();
				},3000);
			console.log("after Sample!!");

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

// Pulse Sampler. Takes PIN 13 to blink
var PulseSampler= function(board) {
	console.log("Constructing pulse sampler");
	this.board=board;
	this.sampleCounter=0;
	this.lastBeatTime=0;
	this.rate;                    // 10 element array used to get running average of HRV values
	this.lastBeatTime = 0;  // used to find the time between beats
	this.sampleCounter;               // used to determine pulse timing
	this.runningTotal;                // used to keep track of pulses
	this.firstBeat = true;        // used to seed rate array so we startup with reasonable BPM
	this.secondBeat = true;       // used to seed rate array so we startup with reasonable BPM
	this.Pulse= false;

	board.pinMode(13,1);    // pin 13 will blink to your heartbeat!
	board.pinMode(A0,2);    // pin 13 will blink to your heartbeat!

	this.sample=sample;
	function sample() {
		console.log(".");
		/*
		// Timer 1 makes sure that we take a reading every milisecond
		analogRead(A0,function(Signal){

		this.sampleCounter++;                // keep track of the time with this variable (ISR triggered every 1mS

		//  NOW IT'S TIME TO LOOK FOR THE HEART BEAT
		vat H = this.sampleCounter-this.lastBeatTime;      // monitor the time since the last beat to avoid noise
		if ( (Signal > 520) && (Pulse == false) && (H > 500) ){  
		// signal surges up in value every time there is a pulse    
		this.Pulse = true;                       // set the Pulse flag when we think there is a pulse
		digitalWrite(13,1);              // turn on pin 13 LED
		HRV = sampleCounter - lastBeatTime; // measure time between beats in mS
		lastBeatTime = sampleCounter;       // keep track of time for next pulse
		if(firstBeat){                      // if it's the first time we found a beat
		firstBeat = false;                // clear firstBeat flag
		return;                           // HRV value is unreliable so discard it
		}   
		if(secondBeat){                     // if this is the second beat
		secondBeat = false;               // clear secondBeat flag
		for(var i=0; i<=9; i++){          // seed the running total to get a realisitic BPM at startup
		rate[i] = HRV;                      
		}
		}                          
		// keep a running total of the last 10 HRV values
		for(int i=0; i<=8; i++){
		rate[i] = rate[i+1];          // shift data in the rate array and drop the oldest HRV value 
		}
		rate[9] = HRV;                    // add the latest HRV to the rate array
		runningTotal = 0;                 // clear the runningTotal variable
		for(var i=0; i<=9; i++){
		runningTotal += rate[i];        // add up the last 10 HRV values
		}  
		runningTotal /= 10;               // average the last 10 HRV values 
		BPM = 60000/runningTotal;         // how many beats can fit into a minute? that's BPM!
		QS = true;                        // set Quantified Self flag when beat is found and BPM gets updated. 
		// QS FLAG IS NOT CLEARED INSIDE THIS ISR
		} 
		if (Signal < 500 && Pulse == true){   // when the values are going down, it's the time between beats
		digitalWrite(13,0);               // turn off pin 13 LED
		Pulse = false;                      // reset the Pulse flag so we can do it again!
		}
		});  // read the Pulse Sensor 
		 */
	}

}
