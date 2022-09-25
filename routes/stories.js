const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middlware/auth')
/* //destructuring - I want to bring in both of 
these at the same time from the same location.  Bringing in multiple items at the same time from the same location. */

const Story = require('../models/Story') //adding the story model

// @desc Show add page
// @route GET /stories/add
router.get('/add', ensureAuth, (req, res) => {  //ensureAuth makes sure they are logged in
    res.render('stories/add') //rendering the add stories page
})

// @desc Proess add form 
// @route POST/stories
router.post('/', ensureAuth, async (req, res) => {  //ensureAuth makes sure they are logged in 
    try {
        req.body.user = req.user.id // adds the user value to the story
        await Story.create(req.body) // populates the fields 
        res.redirect('/dashboard') //once we submit a story, it will send us back to the dashboard.

    } catch (err){
        console.error(err)
        res.render('error/500')
    }
})

// @desc Show all stories
// @route GET /stories/
router.get('/', ensureAuth, async (req, res) => {  //ensureAuth makes sure they are logged in. //asynch is getting the database // only need the '/' and not /stories becuase of our route in app.js
    try{
        const stories = await Story.find({ status: 'public' }) // to show all public stories we have to find the ones with the STATUS public
            .populate('user') // grabbing from the user model to fill in the card
            .sort({ createdAt: 'desc'}) // ability to sort the cards so they are in order of creation date from newest to oldest. 
            .lean() // lean takes it from a mongoose object and turns it into a plain json object so handlebars can use it. 

            res.render('stories/index', { //rending the stories template and passing in the stories object
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
          return res.render('error/404')
          }
      
      res.render('stories/show', {
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
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
      const story = await Story.findOne({
        _id: req.params.id,
      }).lean()
  
      if (!story) {
        return res.render('error/404')
      }

      if (story.user != req.user.id) {
        res.redirect('/stories') // on the off chance that someone tries to edit a story they don't own, they'll get redirected. It's double insurance because theoretically it shouldn't happen. 
    } else {
        res.render('stories/edit', {
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
router.put('/:id', ensureAuth, async (req, res) => {  
  try {
  let story = await Story.findById(req.params.id).lean() // Mongoose method to check for ids. 

  if (!story){ // If there is not a story, return a 404 error. 
    return res.render('error/404')
  }
  // Check Owner of the Story - should be logged in user's ID. If not it will redirect. 
  if (story.user != req.user.id) {
    res.redirect('/stories') 
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
    res.render('stories/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


module.exports = router