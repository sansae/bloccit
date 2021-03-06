const express = require("express");
const router = express.Router();
const validation = require("./validation");
const helper = require("../auth/helpers");

const postController = require("../controllers/postController");

router.get("/topics/:topicId/posts/new", postController.new);

/* The middleware function chain starts by making sure the user is authenticated, then validates the attributes coming in with the request, and finally calls the controller action. */
router.post("/topics/:topicId/posts/create", helper.ensureAuthenticated, validation.validatePosts, postController.create);

router.get("/topics/:topicId/posts/:id", postController.show);

/* like create, destroy needs to ensure that user is authenticated before it can perform a deletion */
router.post("/topics/:topicId/posts/:id/destroy", helper.ensureAuthenticated, postController.destroy);

router.get("/topics/:topicId/posts/:id/edit", postController.edit);

router.post("/topics/:topicId/posts/:id/update", helper.ensureAuthenticated, validation.validatePosts, postController.update);

module.exports = router;
