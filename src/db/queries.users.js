const User = require("./models").User;
const Post = require("./models").Post;
const Comment = require("./models").Comment;
// const Favorite = require("./models").Favorite;
const bcrypt = require("bcryptjs");

module.exports = {
  createUser(newUser, callback) {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getUser(id, callback) {
    let result = {};

    User.findById(id)
    .then((user) => {
      if(!user) {
        callback(404);
      } else {
        result["user"] = user;

        Post.scope({method: ["lastFiveFor", id]}).all()
        .then((posts) => {
          result["posts"] = posts;

          Comment.scope({method: ["lastFiveFor", id]}).all()
          .then((comments) => {
            result["comments"] = comments;

            User.scope({method: ["allFavoritedPosts", id]}).all()
            .then((favorites) => {
              let userFavorites = JSON.parse(JSON.stringify(favorites));
              let favoritePostsId = [];

              userFavorites[0].favorites.forEach((favorite) => {
                favoritePostsId.push(favorite.postId);
              });

              var allFavorites = [];
              Post.findAll()
              .then((allPosts) => {
                allPosts.forEach((thisPost) => {
                  if (favoritePostsId.includes(thisPost.id)) {
                    allFavorites.push({id: thisPost.id, title: thisPost.title, topicId: thisPost.topicId});
                  }
                })

                result["allFavorites"] = allFavorites;
                callback(null, result);
              })
            })
          })
          .catch((err) => {
            callback(err);
          })
        })
      }
    })
  },

  // getFavorites(userId, callback) {
    // User.scope({method: [
    //   "allFavoritedPosts", userId
    // ]}).all()
    // .then((favorites) => {
    //   callback(null, favorites);
    // })
    // .catch((err) => {
    //   callback(err);
    // })
//
    // Favorite.findAll({
    //   where: { userId: userId }
    // })
    // .then((favorites) => {
    //   callback(null, favorites);
    // })
    // .catch((err) => {
    //   callback(err);
    // })
  // },
}
