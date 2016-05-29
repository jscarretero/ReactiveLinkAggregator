// Author: Javier Carretero Casado. MIT license

if (Meteor.isClient) {  // Actually this is not needed, but kept for readability

	// ----------------------------ROUTING----------------------------------------
	Router.configure( {layoutTemplate: 'WebLayout'} );

	Router.route("/", function() {
		this.render('my_navbar', {
	    to:"navigation"
	  });
	  this.render('website_list', {
	    to:"main"
	  });
		this.render('website_form', {
			to:"extra"
		});
	});

	Router.route('/link/:_id', function ()
	{
		this.render('my_navbar', {
	    to:"navigation"
	  });
		this.render('comments_template', {
			to: "main",
			data: Websites.findOne({_id: this.params._id})
		});
	});



	// --------------------------INFINISCROLL-------------------------------------
	Session.set("itemsLimit", 8);
	lastScrollTop = 0;

	$(window).scroll(function(event){
		if($(window).scrollTop() + $(window).height() > $(document).height() - 100){
		  var scrollTop = $(this).scrollTop();
		  if (scrollTop > lastScrollTop) {
		   Session.set("itemsLimit", Session.get("itemsLimit") + 4);
		  }

		  lastScrollTop = scrollTop;
		}
	})

	// -------------------------ACCOUNTS CONFIG-----------------------------------
	Accounts.ui.config ( { passwordSignupFields: "USERNAME_AND_EMAIL"} );

	// -------------------------TEMPLATE HELPERS----------------------------------
	Template.website_list.helpers (
	 {
		websites: function(){
			return Websites.find( {} , { sort: {upVotes: -1},
															   limit: Session.get("itemsLimit")
														   	 } );
		}
	});

	Template.website_item.helpers (
	 {
		getUser: function(user_id){
		  var user = Meteor.users.findOne({_id:user_id});
		  if (user){
		    return user.username;
		  } else {
		    return "n/a";
		  }
		},

		formatDate: function(date) {
			//I am using moment.js package (look for it in atmosphere)
			//return moment(date).format('MMMM Do YYYY, h:mm a');
			if (!date) return "n/a";
			return moment().to(date);
		},

		upBtnClass: function() {
			var userId_ = Meteor.userId();

			if (!userId_ || _.include(this.votersUp, userId_)) {
				return "disabled";
			} else {
				return "";
			}
		},

		downBtnClass: function() {
			var userId_ = Meteor.userId();

			if (!userId_ || _.include(this.votersDown, userId_)) {
				return "disabled";
			} else {
				return "";
			}
		}
	});

	Template.commentItemTemplate.helpers (
		{
			getUser: function(user_id){
				var user = Meteor.users.findOne({_id:user_id});
				if (user){
					return user.username;
				} else {
					return "n/a";
				}
			}
		}
	);

	Template.comments_template.helpers(
		{
			relatedComments: function() {
				//console.log(this._id);
				return Comments.find({linkId: this._id}, {sort: {createdOn:1}});
			}
		}
	);

	// ---------------------------TEMPLATE EVENTS---------------------------------
	Template.website_list.events (
		{
			'click .js-show-website-form': function(event)
			{
				//event.preventDefault();
				$("#website_form").modal('show');
			}
		}
	);

	Template.website_item.events (
	{
		"click .js-upvote": function(event)
		{
			event.preventDefault(); // prevent the button from reloading the page
			var website_id = this._id;

			//This should run in server-side... FIX ME
			if (Meteor.user()) {
				var userId_ = Meteor.user()._id;

				// Check that the user has not voted before (using underscore.js _)
				var website_item = Websites.findOne({_id: website_id});
				if (website_item && ! _.include(website_item.votersUp, userId_))  {
					Websites.update({_id: website_id}, {$inc: {upVotes: 1},
						                                  $addToSet: {votersUp: userId_}});
				} else {
					console.log("Cannot vote several times for the same website");
				}
			} else {
				console.log("Need to log in");
			}
			//return false; // (depracated, using e.preventDefault() instead)
		},

		"click .js-downvote": function(event)
		{
			event.preventDefault(); // prevent the button from reloading the page
			var website_id = this._id;

			//This should run in client-side...FIX ME
			if (Meteor.user()) {
				var userId_ = Meteor.user()._id;

				// Check that the user has not voted before (using underscore.js _)
				var website_item = Websites.findOne({_id: website_id});
				if (website_item && ! _.include(website_item.votersDown, userId_)) {
					Websites.update({_id: website_id},{$inc: {downVotes: 1},
					 																	 $addToSet: {votersDown: userId_}});
				} else {
					console.log("Cannot vote several times for the same website");
				}
			} else {
				console.log("Need to log in");
			}
			//return false; // (depracated, using e.preventDefault() instead)
		},
	});

	Template.website_form.events (
		{
			'blur #url': function(event)
			{
				var url = event.currentTarget.value;
				if (url && url != "" && url.search("http://") == -1 &&
				    url.search("https://") == -1) {
							url = "http://" + url;
				}
				$("#stateHeader").html("PLEASE WAIT FOR DATA TO AUTOFILL...")
				Meteor.call("requestWebsite", url, function(error, result){
					if (error) {
				  	console.log("error", error);
					}
					if (result) {
						$('#title').val(result.title);
						$('#description').val(result.description);
						$("#stateHeader").html("Website form")
					}
				});
			},

			'submit .js-save-website-form': function(event)
			{
				event.preventDefault(); // prevent the button from reloading the page

				var url = event.target.url.value;
				var title = event.target.title.value;
				var description = event.target.description.value;

				if (url && url != "" && title && title != "") {
					if (Meteor.user())
					{
						if (url.search("http://") == -1 && url.search("https://") == -1) {
							url = "http://" + url;
						}
						Websites.insert( {
							title: title,
							url: url,
							description: description,
							createdOn: new Date(),
							createdBy: Meteor.user()._id,
							upVotes: 0,
			        votersUp: [],
			        downVotes: 0,
			        votersDown: []
						});
					} else {
						console.log("You are not signed in, cannot add websites");
					}
				} else {
					console.log("Please, fill all fields");
				}

				$("#website_form").modal('hide');
				//return false; // (depracated, using e.preventDefault() instead)
			}
		}
	);

	Template.submitCommentTemplate.events (
		{
			'submit .js-add-comment-form': function(event)
			{
				//console.log(this.linkId);
				event.preventDefault();
				var comment = event.target.comment.value;
				if (comment && comment != "")
				{
					if (Meteor.user()) {
						Comments.insert( {
							text: comment,
							createdBy : Meteor.userId(),
							createdOn : new Date(),
							linkId: this.linkId
						});
						$("#comment").val(""); //clear text area

					} else {
						console.log("You are not signed in, cannot comment")
					}
				} else {
					console.log("Please, fill all fields");
				}
			}
		}
	);
}
