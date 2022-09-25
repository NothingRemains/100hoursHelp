const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comments = require("../models/Comments");
const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

/* //destructuring - I want to bring in both of 
these at the same time from the same location.  Bringing in multiple items at the same time from the same location. */

const Story = require('../models/Story') //adding the story model


// @desc Show all stories
// @route GET /stories/
router.get('/', ensureAuth, async (req, res) => {  //ensureAuth makes sure they are logged in. //asynch is getting the database // only need the '/' and not /stories becuase of our route in app.js
    try{
        const stories = await Story.find({ status: 'public' }) // to show all public stories we have to find the ones with the STATUS public
            .populate('user') // grabbing from the user model to fill in the card
            .sort({ createdAt: 'desc'}) // ability to sort the cards so they are in order of creation date from newest to oldest. 
            .lean() // lean takes it from a mongoose object and turns it into a plain json object so handlebars can use it. 

            res.render('community.ejs', { 
                stories,
            })
    } catch (err) {
        console.error(err)
        res.render('error/500')

    }
})

// @desc Show Single Story
// @route GET /stories/:id
router.get('/:id', ensureAuth, async (req,res) => {
  try {
      let story = await Story.findById(req.params.id)
          .populate('user')
          .lean()
      
      if (!story) {
          return res.render('/error/404')
          }
      
      res.render('show.ejs', {
          story
      })
      } catch (err) {
          console.error(err)
          res.render('error/404')
      }
})

// @desc Show edit page
// @route GET /stories/edit/:id
//using findOne makes sure we find the one and get one result back
//telling the method here to look inside the route, look inside the request and find the parameter of id.
router.get('/edit/:_id', ensureAuth, async (req, res) => {
    try {
      const story = await Story.findOne({
        _id: req.params.id,
      }).lean()
  
      if (!story) {
        return res.render('error/404')
      }

      if (story.user != req.user.id) {
        res.redirect('/community') // on the off chance that someone tries to edit a story they don't own, they'll get redirected. It's double insurance because theoretically it shouldn't happen. 
    } else {
        res.render('edit/:_id', {
          story,
        })
      }
    } catch (err) {
      console.error(err)
      return res.render('error/500')
    }
  })




// @desc Update Story
// @route PUT /stories/:id
router.put('/:_id', ensureAuth, async (req, res) => {  
  try {
  let story = await Story.findById(req.params.id).lean() // Mongoose method to check for ids. 

  if (!story){ // If there is not a story, return a 404 error. 
    return res.render('error/404')
  }
  // Check Owner of the Story - should be logged in user's ID. If not it will redirect. 
  if (story.user != req.user.id) {
    res.redirect('/community') 
} else { // If it passess the checks, we're using another mongoose method to find the one story and to perform an update operation on it. 
      story = await Story.findOneAndUpdate({_id: req.params.id}, req.body, { //Finding the story by the id and replacing the content of the body with the request.
        new: true,  // For some reason if we try to update a story that doesn't exist it will create a new one.
        runValidators: true // Running validation through the story schema again to make sure it follows all the rules we expect it to follow to make sure nothing malicious enters the database. 
      })

      res.redirect('/dashboard') // When we're done - go back to the dashboard. 
  }
  } catch (err){
  console.log(errr)
  res.render('error/500')
}
})

// @desc Delete Story
// @route DELETE /stories/add
router.delete('/:id', ensureAuth, async (req, res) => {  

  try{
    await Story.remove({_id: req.params.id }) // .remove is another Mongoose Method. 
    res.redirect('/dashboard') // Redirect to the dashboard when we are done. 
  } catch (err) {
    console.log(err)
    return res.render('error/500')
  }
})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    // Note we're also making sure the status is public here
    const stories = await Story.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()
    // Using the index page we already built and passing in different information
    res.render('community', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


module.exports = {
  getDashboard: async (req, res) => {
    try {
    // Explanation for below lines
    // Post is from the model - use the post model, look in the post collection, find the user by id. 
      const stories = await Post.find({ user: req.user.id });
      // Show that user's data on the profile.ejs page. It will pass their posts and user information through. 
      res.render("dashboard.ejs", { stories: stories, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getCommunity: async (req, res) => {
    try {
      // Explanation for below lines
      // .lean is just mongoose
      // Post is from our model, telling it to find posts and sort them by the createdAt desc from the database
      const stories = await Post.find().sort({ createdAt: "desc" }).lean();
      // res.render is just show the feed.ejs view/page and to show the posts stored in our database. 
      res.render("community.ejs", { stories: stories });
    } catch (err) {
      console.log(err);
    }
  },
  getAddPage: async (req, res) => {
    try {
      res.render("add.ejs");
    } catch (err){
      console.log(err);
    }
  },
  getStory: async (req, res) => {
    try {
      const story = await Story.findById(req.params.id);
      const comments = await Comments.find({post: req.params.id}).sort({ createdAt: "asc" }).lean();
      res.render("community.ejs", { story: story, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
// @desc Proess add form 
// @route POST/stories
  createStory: async (req, res) => {
    try {
        await Story.create({
          title: req.body.title,
          body: req.params.body,
          user: req.user.id,
        });
      res.redirect('/dashboard') //once we submit a story, it will send us back to the dashboard.
      console.log("Post has been added!");
    } catch (err) {
      console.error(err)
      res.render('error/500')
  }},
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      // Render (or show) the profile page
      res.redirect("/dashboard");
    } catch (err) {
      // if there is an error for some reason, it will still render the profile page. 
      res.redirect("/dashboard");
    }
  },
};