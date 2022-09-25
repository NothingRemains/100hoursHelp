const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const storiesController = require("../controllers/stories");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, storiesController.getStory);

router.post("/:id", upload.single("file"), storiesController.createStory);

router.put("/likePost/:id", storiesController.likePost);

router.delete("/deletePost/:id", storiesController.deletePost);

module.exports = router;