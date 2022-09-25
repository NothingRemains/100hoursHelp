const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const entriesController = require("../controllers/entries");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, entriesController.getStory);

// ** CHANGE BY NOTHINGREMAINS: changed post route to /add
router.post('/add', ensureAuth, entriesController.createStory)

router.put("/likePost/:id", entriesController.likePost);

router.delete("/deletePost/:id", entriesController.deletePost);

module.exports = router;