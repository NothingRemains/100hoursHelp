const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const storiesController = require("../controllers/stories")
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/dashboard", ensureAuth, storiesController.getDashboard);
router.get("/community", ensureAuth, storiesController.getCommunity);
router.get("/add", ensureAuth, storiesController.getAddPage);
router.post("/add", ensureAuth, storiesController.createStory);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);


module.exports = router;
