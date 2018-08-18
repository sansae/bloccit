const Post = require("./models").Post;
const Topic = require("./models").Topic;

module.exports = {
  addPost(newPost, callback) {
    return Post.create({
      title: newPost.title,
      body: newPost.body,
      topicId: newPost.topicId
    })
    .then((post) => {
      callback(null, post);
    })
    .catch((err) => {
      callback(err);
    });
  },

  getPost(id, callback) {
    return Post.findById(id)
    .then((post) => {
      callback(null, post);
    })
    .catch((err) => {
      callback(err);
    });
  },

  deletePost(id, callback) {
    return Post.destroy({
      where: {id}
    })
    .then((post) => {
      callback(null, post);
    })
    .catch((err) => {
      callback(err);
    })
  },

  updatePost(id, updatedPost, callback) {
    return Post.findById(id)
    .then((post) => {
      if (!post) {
        return callback("post not found");
      }

      post.update(updatedPost, {
        fields: Object.keys(updatedPost)
      })
      .then(() => {
        callback(null, post);
      })
      .catch((err) => {
        callback(err);
      });
    })
    .catch((err) => {
      callback(err);
    });
  },
}
