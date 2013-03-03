
define(['express','http','fs','module', 'path', 'web','johnny-five','child_process', 'post','userweb'], 
	function (express, http, fs, module, path, Web, five, childProcess, Post, UserWeb) {
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

	}, 300000);

	board = new five.Board();
	console.log(board);

	console.log("Sampler created");

	// HANDLE HARDWARE CODE
	board.on('ready', function(){
		var val = 0;
		button = new five.Button(4);

		board.repl.inject({button: button});

		board.pinMode(12,1);    // pin 12 will feed the switch
		board.digitalWrite(12,1);              // turn on pin 13 LED

		 var sampler = new PulseSampler(board);
		 //sampler.startSampling();
		 console.log("after Sample!!");

		/*******************************/
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
/********************************/
	});

return app;

});

// Pulse Sampler. Takes PIN 13 to blink
var PulseSampler= function(board) {
	console.log("Constructing pulse sampler");
	this.board=board;
	this.lastBeatTime=0;
	this.rate = new Array();                    // 10 element array used to get running average of HRV values
	this.lastBeatTime = 0;  // used to find the time between beats
	this.sampleCounter=0;               // used to determine pulse timing
	this.runningTotal;                // used to keep track of pulses
	this.firstBeat = true;        // used to seed rate array so we startup with reasonable BPM
	this.secondBeat = true;       // used to seed rate array so we startup with reasonable BPM
	this.Pulse= false;
	this.BPM=0;
	this.QS=false;

/********************************/
	this.board.pinMode(13,1);    // pin 13 will blink to your heartbeat!
	this.board.pinMode(0,2);    // Analog Pulse read 

        var that = this;

        // Read the pulse sensor. The parameter is the sample rate in milliseconds. Original value is 1ms
	this.startSampling=startSampling;
	function startSampling() {
		console.log(".");
		
		// Timer 1 makes sure that we take a reading every milisecond
		that.board.analogRead(0,function(Signal){

				that.sampleCounter++;                // keep track of the time with this variable (ISR triggered every 1mS originally, nos it is a parameter)
				var time = new Date().getMilliseconds();
				//  NOW IT'S TIME TO LOOK FOR THE HEART BEAT
				var H = time-that.lastBeatTime;      // monitor the time since the last beat to avoid noise
				if ( (Signal > 520) && (that.Pulse == false) && (H > 500) ){  
					console.log("BPM: "+that.BPM+" QS: "+that.QS+" Signal: "+ Signal+ " _________    Pulse On");

					// signal surges up in value every time there is a pulse    
					that.Pulse = true;                       // set the Pulse flag when we think there is a pulse
					// that.board.digitalWrite(13,1);              // turn on pin 13 LED
					var HRV = time- that.lastBeatTime; // measure time between beats in mS
					that.lastBeatTime = time;       // keep track of time for next pulse
					console.log(".");
					if(that.firstBeat){                      // if it's the first time we found a beat
						that.firstBeat = false;                // clear firstBeat flag
						console.log("first Beat");
						//return;                           // HRV value is unreliable so discard it
					}   
					console.log("fb_______");
					if(that.secondBeat){                     // if this is the second beat
						that.secondBeat = false;               // clear secondBeat flag
						console.log("second Beat");
						for(var i=0; i<=9; i++){          // seed the running total to get a realisitic BPM at startup
							that.rate[i] = HRV;                      
						}
					}                          
					console.log("sb______");
					// keep a running total of the last 10 HRV values
					for(var i=0; i<=8; i++){
						that.rate[i] = that.rate[i+1];          // shift data in the rate array and drop the oldest HRV value 
					}
					that.rate[9] = HRV;                    // add the latest HRV to the rate array
					that.runningTotal = 0;                 // clear the runningTotal variable
					for(var i=0; i<=9; i++){
						that.runningTotal += that.rate[i];        // add up the last 10 HRV values
					}  
					that.runningTotal /= 10;               // average the last 10 HRV values 
					that.BPM = 60000/that.runningTotal;         // how many beats can fit into a minute? that's BPM!
					that.QS = true;                        // set Quantified Self flag when beat is found and BPM gets updated. 
					console.log("__BPM: "+that.BPM+"QS: "+that.QS);
					// QS FLAG IS NOT CLEARED INSIDE THIS ISR
				} 
				else if (Signal < 500 && that.Pulse == true){   // when the values are going down, it's the time between beats
				        console.log("BPM: "+that.BPM+" QS: "+that.QS+" Signal: "+ Signal+ " |            ");
					//that.board.digitalWrite(13,0);               // turn off pin 13 LED
					Pulse = false;                      // reset the Pulse flag so we can do it again!
				}
				else {
					if (that.Pulse == true) {
						console.log("BPM: "+that.BPM+" QS: "+that.QS+" Signal: "+ Signal+ "         |           ");
 					} else {
						console.log("BPM: "+that.BPM+" QS: "+that.QS+" Signal: "+ Signal+ " |                 off ");
					}
				}
		});  // read the Pulse Sensor 

/********************************/
	}

}
