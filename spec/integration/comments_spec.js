const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";
const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Comment = require("../../src/db/models").Comment;

describe("routes : comments", () => {
  beforeEach((done) => {
    this.user;
    this.topic;
    this.post;
    this.comment;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user;  // store user

        Topic.create({
          title: "Expeditions to Alpha Centauri",
          description: "A compilation of reports from recent visits to the star system.",
          posts: [{
            title: "My first visit to Proxima Centauri b",
            body: "I saw some rocks.",
            userId: this.user.id
          }]
        }, {
          include: {
            model: Post,
            as: "posts"
          }
        })
        .then((topic) => {
          this.topic = topic;
          this.post = this.topic.posts[0];

          Comment.create({
            body: "ay caramba!!!!!",
            userId: this.user.id,
            postId: this.post.id
          })
          .then((comment) => {
            this.comment = comment;
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });
  });// end beforeEach

  // define crud actions for comment in guest context (i.e. users who are not signed in)
  describe("guest attempting to perform CRUD actions for Comment", () => {
    // ensure there is no user signed in
    beforeEach((done) => {
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          // flag to indicate mock auth to destroy any session
          userId: 0
        }
      }, (err, res, body) => {
        done();
      });
    });

    // write a test to ensure a user who is not signed in is not able to create a comment
    describe("POST /topics/:topicId/posts/:postId/comments/create", () => {
      it("should not create a new comment", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
          form: {
            body: "This comment is amazing!"
          }
        };

        // Make sure the comment was not created by querying the database of it.
        request.post(options, (err, res, body) => {
          Comment.findOne({
            where: { body: "This comment is amazing!" }
          })
          .then((comment) => {
            expect(comment).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {
      it("should not delete the comment with the associated ID", (done) => {
        Comment.all()
        .then((comments) => {
          const commentCountBeforeDelete = comments.length;

          expect(commentCountBeforeDelete).toBe(1);

          request.post(
            `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`, (err, res, body) => {
              Comment.all()
              .then((comments) => {
                expect(err).toBeNull();
                expect(comments.length).toBe(commentCountBeforeDelete);
                done();
              });
            }
          );
        });
      });
    });
  });// end guest user context

  // define comment crud actions for context of signed in user
  describe("signed in user performing CRUD actions for Comment", () => {
    beforeEach((done) => {
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          role: "member",
          userId: this.user.id
        }
      }, (err, res, body) => {
        done();
      });
    });

    describe("POST /topics/:topicId/posts/:postId/comments/create", () => {
      it("should create a new comment and redirect", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
          form: {
            body: "This comment is amazing!"
          }
        };

        request.post(options, (err, res, body) => {
          Comment.findOne({
            where: { body: "This comment is amazing!" }
          })
          .then((comment) => {
            expect(comment).not.toBeNull();
            expect(comment.body).toBe("This comment is amazing!");
            expect(comment.id).not.toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {
      it("should delete the comment with the associated ID", (done) => {
        Comment.all()
        .then((comments) => {
          const commentCountBeforeDelete = comments.length;

          expect(commentCountBeforeDelete).toBe(1);

          request.post(
           `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
            (err, res, body) => {
            expect(res.statusCode).toBe(302);
            Comment.all()
            .then((comments) => {
              expect(err).toBeNull();
              expect(comments.length).toBe(commentCountBeforeDelete - 1);
              done();
            })
          });
        })
      });
    });

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {
      it("should not delete another member user's comment", (done) => {
        User.create({
          email: "brucelee@gmail.com",
          password: "dragon"
        })
        .then((user) => {
          expect(user.email).toBe("brucelee@gmail.com");
          expect(user.id).toBe(2);

          request.get({
            url: "http://localhost:3000/auth/fake",
            form: {
              role: "member",
              userId: user.id
            }
          }, (err, res, body) => {
            done();
          });

          Comment.all()
          .then((comments) => {
            const commentCountBeforeDelete = comments.length;

            expect(comments[0].body).toBe("ay caramba!!!!!");
            expect(commentCountBeforeDelete).toBe(1);

            request.post(
             `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
              (err, res, body) => {
              Comment.all()
              .then((comments) => {
                expect(err).toBeNull();
                expect(comments.length).toBe(commentCountBeforeDelete);
                done();
              });
            });
          });
        });
      });

      it("should allow admin users to delete a member user's comment", (done) => {
        User.create({
          email: "administrator@gmail.com",
          password: "theman"
        })
        .then((user) => {
          expect(user.email).toBe("administrator@gmail.com");
          expect(user.id).toBe(2);

          request.get({
            url: "http://localhost:3000/auth/fake",
            form: {
              role: "admin",
              userId: user.id
            }
          }, (err, res, body) => {
            done();
          });

          Comment.all()
          .then((comments) => {
            const commentCountBeforeDelete = comments.length;

            expect(comments[0].body).toBe("ay caramba!!!!!");
            expect(commentCountBeforeDelete).toBe(1);

            request.post(
             `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
              (err, res, body) => {
              Comment.all()
              .then((comments) => {
                expect(err).toBeNull();
                expect(comments.length).toBe(commentCountBeforeDelete - 1);
                done();
              });
            });
          });
        });
      });
    });
  });// end context for signed in user
});
