var jsdom 	= require('jsdom');
var request	= require('request');
var fs		= require('fs');

// UNSPLASH DOWNLOADER FOR NODE.JS BY KNOB1
// www.unsplash.com

// config
var unsplash 	= 'http://www.unsplash.com';

// variables
var linkArray 		= new Array()
var page 			= 0;
var lastPage		= undefined;
var maxPage			= 99; // Pages to test if they're available
var photoIndex		= 1;
var maxFileQueue	= 10; // parallel downloads
var fileQueue 		= 0;
var writtenPhoto 	= 1;
var arrayCounter	= 0;

function countPages(){
	// make dest. dir
	fs.mkdir(__dirname+'/photos', function(e){
		if(!e || (e && e.code === 'EEXIST')){

		}
		else {
		    //debug
			console.log(e);
		}
	});

	for(var i = 1; i <=maxPage ; i++){
		pageRequest(i)
	}
}

function pageRequest(page) {
	request('https://unsplash.com/?_=&page='+page, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			if(body.indexOf("grid") > -1){
		    	// Page does exist!
		    	CrawlPage(page)
		    }
		    else {
		    	if(lastPage == undefined){
		    		lastPage = page;
		    	}
		    }
		  }
	})
}

function downloadStarter(){
	if(fileQueue < maxFileQueue && arrayCounter <= linkArray.length){
		downloadImage(linkArray[arrayCounter]);
	}
}

function downloadImage(photoUrl){
	arrayCounter++;
	fileQueue++;
	var file = fs.createWriteStream('./photos/'+photoIndex+'.jpg');
	photoIndex++;
	request.get(unsplash+photoUrl).pipe(file).on('close', function () {
		console.log(writtenPhoto+'.jpg completed!');
		writtenPhoto++;
		fileQueue--;
		downloadStarter();
	});
	downloadStarter();
}

function CrawlPage(page){
	jsdom.env({
	  url: unsplash+'?_=&page='+page,
	  scripts: [
	    'http://code.jquery.com/jquery-1.11.2.min.js'
	  ],
	  done: function (err, window) {
			var $ = window.jQuery;

		 	$('a[href*=download]:odd').each(function(){
		  			linkArray.push($(this).attr('href'));
		    });
		    if(page == lastPage-1){
		    	downloadStarter();
		    	console.log(linkArray.length +' photos found');
		    }
      		window.close();
			}
	  });
	}

countPages();