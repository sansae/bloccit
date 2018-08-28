const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("Post", () => {
  /* before each test, instantiate a new Topic obj so we can use it to perform our Post spec tests; since a Post's parent is a Topic, we must create a Topic obj first */
  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;
    /* sync clears the *test* db after each spec test */
    sequelize.sync({ force: true }).then((res) => {
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user;

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
          this.post = topic.posts[0];
          done();
        })
      })
    });
  });

  describe("#create()", () => {
    it("should create a post object with a title, body, and assigned topic and user", (done) => {
      Post.create({
        title: "Pros of Cryosleep during the long journey",
        body: "1. Not having to answer the 'are we there yet?' question.",
        topicId: this.topic.id,
        userId: this.user.id
      })
      .then((post) => {
        /* these two expectations check to make sure we save the post successfully. */
        expect(post.title).toBe("Pros of Cryosleep during the long journey");
        expect(post.body).toBe("1. Not having to answer the 'are we there yet?' question.");
        expect(post.topicId).toBe(this.topic.id);
        expect(post.userId).toBe(this.user.id);
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should not create a post with missing title, body, or assigned topic", (done) => {
      Post.create({
        title: "Pros of Cryosleep during the long journey"
      })
      /* the code in this block will not be evaluated since the validation error will skip it. Instead, we'll catch the error in the catch block below and set the expectations there */
      .then((post) => {
        done();
      })
      .catch((err) => {
        expect(err.message).toContain("Post.body cannot be null");
        expect(err.message).toContain("Post.topicId cannot be null");
        done();
      });
    });
  }); // end #create suite

  describe("#setTopic()", () => {
    it("should associate a topic and a post together", (done) => {
      Topic.create({
        title: "Challenges of interstellar travel",
        description: "1. The Wi-Fi is terrible"
      })
      .then((newTopic) => {
        /* We confirm the association of the topic and post objects created in the  beforeEach call. */
        expect(this.post.topicId).toBe(this.topic.id);

        /* We call setTopic on post and associate it with the new topic, newTopic */
        this.post.setTopic(newTopic)
        .then((post) => {
          /* We confirm the new association. */
          expect(post.topicId).toBe(newTopic.id);
          done();
        });
      });
    });
  });

  describe("#getTopic()", () => {
    it("should return the associated topic", (done) => {
      this.post.getTopic()
      .then((associatedTopic) => {
        expect(associatedTopic.title).toBe("Expeditions to Alpha Centauri");
        done();
      });
    });
  });

  describe("#setUser()", () => {
    it("should associate a post and a user together", (done) => {
      User.create({
        email: "ada@example.com",
        password: "password"
      })
      .then((newUser) => {
        expect(this.post.userId).toBe(this.user.id);

        this.post.setUser(newUser)
        .then((post) => {
          expect(this.post.userId).toBe(newUser.id);
          done();
        });
      })
    });
  });

  describe("#getUser", () => {
    it("should return the associated topic", (done) => {
      this.post.getUser()
      .then((associatedUser) => {
        expect(associatedUser.email).toBe("starman@tesla.com");
        done();
      });
    });
  });
});
