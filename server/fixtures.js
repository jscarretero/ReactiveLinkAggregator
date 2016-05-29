// Author: Javier Carretero Casado. MIT license 

if (Meteor.isServer) {  /*Not needed, but kept for readability*/

  // ---------------------STARTUP SERVER----------------------------------------
  Meteor.startup(function () {
    // Code to run on server at startup
    if (!Websites.findOne()){
    	console.log("No websites yet. Creating starter data.");
    	Websites.insert({
    		title:"Goldsmiths Computing Department",
    		url:"http://www.gold.ac.uk/computing/",
    		description:"This is where this course was developed.",
    		createdOn:new Date(),
        upVotes: 0,
        votersUp: [],
        downVotes: 0,
        votersDown: []
    	});
    	Websites.insert({
    		title:"University of London",
    		url:"http://www.londoninternational.ac.uk/courses/undergraduate/"+
            "goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route",
    		description:"University of London International Programme.",
    		createdOn:new Date(),
        upVotes: 0,
        votersUp: [],
        downVotes: 0,
        votersDown: []
    	});
    	Websites.insert({
    		title:"Coursera",
    		url:"http://www.coursera.org",
    		description:"Universal access to the world’s best education.",
    		createdOn:new Date(),
        upVotes: 0,
        votersUp: [],
        downVotes: 0,
        votersDown: []
    	});
    	Websites.insert({
    		title:"Google",
    		url:"http://www.google.com",
    		description:"Popular search engine.",
    		createdOn:new Date(),
        upVotes: 0,
        votersUp: [],
        downVotes: 0,
        votersDown: []
    	});
    }
  });

  Meteor.methods(
    {
    requestWebsite: function(url) {
      try {
        var result = HTTP.get(url);

        var title = "title not found...";
        var description = "description not found...";


        var aTitle = result.content.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (aTitle) { title = aTitle[1];}
        //console.log("Title: " + title);

        var aDescription = result.content.match(/<[^>]*meta[^>]*name[^>]*=[^>]*"[^>]*description[^>]*"[^>]*content[^>]*=[^>]*"([^<]+)"/i);
        if (aDescription) {
          description = aDescription[1];
        } else {
          aDescription = result.content.match(/<[^>]*meta[^>]*content[^>]*=[^>]*"([^<]+)"[^>]*name[^>]*=[^>]*"[^>]*description[^>]*"/i);
          if (aDescription) {
            description = aDescription[1];
          }
        }
        //console.log("Description: " + description);

        var answer = {};
        answer["title"] = title;
        answer["description"] = description;
        return answer;

      } catch (e) {
        console.error('Request returned error: ', e);
      }
    }
  });
}
