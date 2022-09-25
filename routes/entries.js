const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const entriesController = require("../controllers/entries");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, entriesController.getStory);

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

router.put("/likePost/:id", entriesController.likePost);

router.delete("/deletePost/:id", entriesController.deletePost);

module.exports = router;