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
      as: "votes"
    });
  };

  Post.prototype.getPoints = function(){
    if (this.votes.length === 0) return 0;

    // The map function transforms the array.  this.votes is an array of Vote objects. map turns it into an array of  values. The reduce function goes over all values, reducing them until one is left, the total.
    return this.votes
      .map((v) => { return v.value })
      .reduce((prev, next) => { return prev + next });
  };
  
  return Post;
};
