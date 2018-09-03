const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";
const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("routes : posts", () => {
  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;

    sequelize.sync({ force: true }).then((res) => {
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user;

        Topic.create({
          title: "Winter Games",
          description: "Post your Winter Games stories",
          posts: [{
            title: "Snowball Fighting",
            body: "So much snow!",
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
          this.post = topic.posts[0];
          done();
        })
      })
    });
  });

  // define the guest user context
  // guests simply visit the site, and are not signed in, and as such, their access privileges should only include the ability to see topics and posts
  describe("guest user performing CRUD actions for Post resource", () => {
    // since guests need not be authenticated, our beforeEach should just create a post (and its parent topic); this will set us up for our tests where a guest can see only the topic and post
    beforeEach((done) => {
      this.user;
      this.topic;
      this.post;

      User.create({
        email: "aerospace@nasa.com",
        password: "reachforthestars"
      })
      .then((user) => {
        this.user = user;

        // tests failed after creating comment resource; not sure why
        // console.log showed the this.user was "member" when this spec file was executed and the new() controller method was called
        // created this mock authentication for guest user to pass the two failed tests
        request.get({
          url: "http://localhost:3000/auth/fake",
          form: {
            role: "guest"
          }
        }, (err, res, body) => {
          done();
        });

        Topic.create({
          title: "Best Shooting Games?",
          description: "A place for recommending your favorite shooters",
          posts: [{
            title: "Gears of War",
            body: "The illest 3rd person shooter ever. Highly rec'ed",
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
          this.post = topic.posts[0];
          done();
        })
      })
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should redirect to topics show view with associated topic id", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Posts");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should not create a new post", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite thing to do besides watching paint dry!"
          }
        }

        request.post(options, (err, res, body) => {
          Post.findOne({
            where: { title: "Watching snow melt" }
          })
          .then((post) => {
            // no post should be returned
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a show view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull;
          expect(res.statusCode).toBe(200);
          expect(body).toContain("Gears of War");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should not delete the post with the associated id", (done) => {
        expect(this.post.id).toBe(2);

        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
          Post.findById(2)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).not.toBeNull();
            expect(post.id).toBe(2);
            expect(post.title).toBe("Gears of War");
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should not render an edit form for the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("Edit Post");
          // confirm redirect to topic show with associated id
          expect(body).toContain("Gears of War");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should not update the post with the given values", (done) => {
        // confirm post title
        expect(this.post.title).toBe("Gears of War");

        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Gears of War Series",
            body: "My favorite is Gears 3"
          }
        };

        request.post(options, (err, res, body) => {
          Post.findOne({
            where: { id: this.post.id }
          })
          .then((post) => {
            // confirm title of post is unchanged
            expect(post.title).toBe("Gears of War");
            done();
          });
        });
      });
    });
  });// end guest user context

  // define the member user context
  describe("member user performing CRUD actions for Post resource", () => {
    // mock authenticate as a member user
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

    describe("GET /topics/:topicId/posts/new", () => {
      it("should render a new post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should not create a new post that fails validations", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "a",
            body: "b"
          }
        };

        request.post(options, (err, res, body) => {
          Post.findOne({
            where: {title: "a"}
          })
          .then((post) => {
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      it("should create a new post and redirect to show page", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite thing to do besides watching paint dry!"
          }
        };

        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "Watching snow melt"}})
          .then((post) => {
            expect(post).not.toBeNull();
            expect(post.topicId).not.toBeNull();
            expect(post.title).toBe("Watching snow melt");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });// end create

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a show view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull;
          expect(res.statusCode).toBe(200);
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    // member should not be able to see edit form, update, or destroy

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should not delete the post with the associated id", (done) => {
        expect(this.post.id).toBe(1);

        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
          Post.findById(1)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).not.toBeNull();
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should not render an edit form for the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("Edit Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should not update the post with the given values", (done) => {
        // confirm post title
        expect(this.post.title).toBe("Snowball Fighting");

        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I love watching them melt slowly."
          }
        };

        request.post(options, (err, res, body) => {
          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            // confirm that the title did not change
            expect(post.title).toBe("Snowball Fighting");
            done();
          });
        });
      });
    });
  });// end member user context

  // define the owner user context
  describe("owner user performing CRUD actions for Post resource", () => {
    beforeEach((done) => {
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          role: "owner",
          userId: this.user.id,
          topicId: this.topic.id
        }
      }, (err, res, body) => {
        done();
      });
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should not render a new post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("New Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should not create a new post", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite thing to do besides watching paint dry!"
          }
        }

        request.post(options, (err, res, body) => {
          Post.findOne({
            where: { title: "Watching snow melt" }
          })
          .then((post) => {
            // no post should be returned
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });// end create

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a show view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull;
          expect(res.statusCode).toBe(200);
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should delete the post with the associated id", (done) => {
        expect(this.post.id).toBe(1);

        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
          Post.findById(1)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).toBeNull();
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should render an edit form for the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should return status code 302 and update the post with the given values", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I love watching them melt slowly."
          }
        };

        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(302);

          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowman Building Competition");
            expect(post.body).toBe("I love watching them melt slowly.");
            done();
          });
        });
      });
    });
  })// end owner user context

  // define the admin user context
  describe("admin user performing CRUD actions for Post resource", () => {
    beforeEach((done) => {
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          role: "admin",
          userId: this.user.id,
          topicId: this.topic.id
        }
      }, (err, res, body) => {
        done();
      });
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should render a new post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {
      it("should not create a new post that fails validations", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "a",
            body: "b"
          }
        };

        request.post(options, (err, res, body) => {
          Post.findOne({
            where: {title: "a"}
          })
          .then((post) => {
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      it("should create a new post and redirect to show page", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite thing to do besides watching paint dry!"
          }
        };

        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "Watching snow melt"}})
          .then((post) => {
            expect(post).not.toBeNull();
            expect(post.topicId).not.toBeNull();
            expect(post.title).toBe("Watching snow melt");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a show view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull;
          expect(res.statusCode).toBe(200);
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should delete the post with the associated id", (done) => {
        expect(this.post.id).toBe(1);

        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
          Post.findById(1)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).toBeNull();
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should render an edit form for the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should return status code 302 and update the post with the given values", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I love watching them melt slowly."
          }
        };

        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          expect(res.statusCode).toBe(302);

          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowman Building Competition");
            expect(post.body).toBe("I love watching them melt slowly.");
            done();
          });
        });
      });
    });
  });
});
