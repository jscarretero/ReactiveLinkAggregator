// Author: Javier Carretero Casado. MIT license 

//-----------------------SHARED MONGODB COLLECTION------------------------------
Websites = new Mongo.Collection("websites");
Comments = new Mongo.Collection("comments");

//--------------MONGODB COLLECTION SECURITY SETTINGS----------------------------

Websites.allow(
  {
    insert: function(userId, doc) {
      //console.log(doc);
      if (!Meteor.user()) return false;
      if (doc.createdBy != userId) return false;

      doc.upVotes = 0;
      doc.votersUp = [];
      doc.downVotes = 0;
      doc.votersDown = [];
      //We should be checking other properties here

      //console.log(doc);

      // Refine to only allow 100 inserts per session
      return true;
    },

    remove: function(userId, doc) {
      return false; //by now
    },

    update: function(userId, doc) {
      if (!Meteor.user()) return false;

      //We should be checking other properties here
      return true;

    }
  }
);

Comments.allow(
  {
    insert: function(userId, doc) {
      if (!Meteor.user()) return false;
      if (doc.createdBy != userId) return false;

      //console.log(doc);
      //We should be checking other properties here (like the linkId is valid)
      //(or like date is valid, or fields are not empty)
      return true;
    },
    remove: function(userId, doc) {
      return false; //by now
    },
    update: function(userId, doc) {
      return false; //by now
    }
  }
);

Meteor.users.deny({
  update: function() {
    return true;
  }
})
