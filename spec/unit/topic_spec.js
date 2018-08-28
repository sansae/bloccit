const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("Topic", () => {
  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;

    sequelize.sync({ force: true }).then((res) => {
      //after sync, database should be empty

      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user; // store the user

        Topic.create({
          title: "Expeditions to Alpha Centauri",
          description: "A compilation of reports from recent visits to the star system.",

          posts: [{
            title: "",
            body: "",
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

  /* test that when calling Topic.create with valid arguments, that a topic object is created and stored in the database */
  describe("#create", () => {
    it("should create a topic object and store it in the database", (done) => {
      Topic.all()
      .then((topics) => {
        expect(topics.length).toBe(1);

        Topic.create({
          title: "Space X",
          description: "A New Beginning"
        })
        .then((topic) => {
          Topic.all()
          .then((topics) => {
            const topicCountAfterCreate = topics.length;
            expect(topicCountAfterCreate).toBe(2);
            expect(topic.title).toBe("Space X");
            expect(topic.description).toBe("A New Beginning");
            done();
          });
        });
      });
    });
  });

  describe("#getPosts", () => {
    it("should return an array of Post objects that are associated with a topic", (done) => {
      Post.create({
        title: "Anyone Like Mysteries?",
        body: "Mystery films are by far my favorite.",
        topicId: this.topic.id
      })
      .then((post) => {
        expect(post.title).toBe("Anyone Like Mysteries?");

        Post.create({
          title: "I love Action",
          body: "My favorite are action films.",
          topicId: this.topic.id
        })
        .then((post) => {
          expect(post.title).toBe("I love Action");

          this.topic.getPosts()
          .then((posts) => {
            expect(posts.length).toBe(2);
            expect(posts[0].body).toBe("Mystery films are by far my favorite.");
            expect(posts[1].body).toBe("My favorite are action films.");
            done();
          });
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });
});
