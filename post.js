
define (['fs','underscore','jquery'], function (fs, _, $){
	var Post = function Post(){

		this.deleteFile = function (req,res){
			var image;
			console.log(req);
			if (req) {
				image = req.body.photo;
			}
			
			fs.unlink('photos/' + image, function (err) {
			  if (err) {
			  	console.log('file not exist');
			  	res.send('404');
			  } else {
			  console.log('successfully deleted' + image);
			  res.send('200');
			}
			});
			
			console.log('album called');		  
		};
	};

	return Post;
});