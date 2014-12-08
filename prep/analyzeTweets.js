var unirest = require('unirest');
var async = require('async');

module.exports = function(tweets){
	
	var page = 10;
	var pageCount = tweets.length/page;
	var start,end;
	var batches = [];
	
	function analyzeTweets(batch,callback){
	
		unirest.post("http://app.intelligentsearchassistant.com/main/analyzeTweet.htm")
			//.header("X-Mashape-Key", "e6jk7742uzmshc1Q6Bmyi2nZstr9p1wHmTNjsnE72AAsdf5FhP")
			.header("Content-Type", "multipart/form-data")
			.field("tweets", batch)
			.field("start", start)
			.field("end", end)
			//.field("endpoints", "sentiment")
			//.field("entities_type", "text")
			//.field("output_format", "json")
			.end(function(result) {
				
				console.log('batch is complete');
				
				if(result.status != 200){
					
						console.log('error analyzing tweets');
						console.log(result.status);
						console.log(result.headers);
						console.log(result.body);
						return;
				} 
				
				var body = JSON.parse(result.body);
				
				if(body.status != 0){
					console.log(result.body);
					return;
				}
				
				var tweet;
				var start = body.object.start;
				var end = body.object.end;
				
				for(var j=start;j<end;j++){
				
					tweet = tweets[j];
					tweet.sentiment = body.object.list[j-start];
					tweet.calculated = true;
					tweet.save(function(){
					
						console.log('tweet saved');
					});
				}
				callback();
		});
		
	}
	
	for(var i=0;i<pageCount;i++){
		
		start = i*page;
		end = (i+1)*page;
		
		if(end >= tweets.length){
			
			end = tweets.length;
		}
		
		var allTweets = "";
		var pageTweets = [];
		
		for(var j=start;j<end;j++){
		
			allTweets += tweets[j].text + "\n";
		}
		
		batches.push(allTweets);
	}
	
	async.mapLimit(batches,4,analyzeTweets,function(){
		console.log('done analyzing');
	});
	
}