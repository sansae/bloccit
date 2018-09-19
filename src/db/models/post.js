'use strict';
module.exports = (sequelize, DataTypes) => {
  var Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});

  Post.associate = function(models) {
    // associations can be defined here
    Post.belongsTo(models.Topic, {
      foreignKey: "topicId",
      onDelete: "CASCADE",
    });

    Post.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });

    Post.hasMany(models.Comment, {
      foreignKey: "postId",
      as: "comments",
    });

    Post.hasMany(models.Vote, {
      foreignKey: "postId",
      as: "votes",
    });

    Post.hasMany(models.Favorite, {
      foreignKey: "postId",
      as: "favorites"
    });

    Post.afterCreate((post, callback) => {
      return models.Favorite.create({
        userId: post.userId,
        postId: post.id
      });
    });

    Post.afterCreate((post, callback) => {
      return models.Vote.create({
        value: 1,
        postId: post.id,
        userId: post.userId
      })
    });
  };

  Post.prototype.getPoints = function() {
    if (!this.votes || this.votes.length === 0) return 0;

    // The map function transforms the array.  this.votes is an array of Vote objects. map turns it into an array of  values. The reduce function goes over all values, reducing them until one is left, the total.
    return this.votes
      .map((v) => { return v.value })
      .reduce((prev, next) => { return prev + next });
  };

  Post.prototype.hasUpvoteFor = function(userId) {
    var numberOfVotes = 0;

    return this.getVotes({
      where: {
        userId: userId,
        value: 1
      }
    })
  };

  Post.prototype.hasDownvoteFor = function(userId) {
    var numberOfVotes = 0;

    return this.getVotes({
      where: {
        userId: userId,
        value: -1
      }
    })
  };

  Post.prototype.getFavoriteFor = function(userId) {
    return this.favorites.find((favorite) => { return favorite.userId == userId });
  };

  return Post;
};
