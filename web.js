
define (['fs','underscore','text!templates/family-interface.html','jquery'], function (fs, _, template, $){
	var Web = function Web(){

		this.draw = function (req,res){
			var elements = [];
			
			fs.readdir('photos', function (err, files) {
				if (err){
					console.log(err);
					throw err;	
				}

				res.send(_.template(template, {datas : files}));
			});
			
			console.log('album called');
			// res.send(_.template(template));
		  
		};
	};

	return Web;
});
