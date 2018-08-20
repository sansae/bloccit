const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/flairs";
const sequelize = require("../../src/db/models/index").sequelize;
const Flair = require("../../src/db/models").Flair;

describe("routes : flairs", () => {
  beforeEach((done) => {
    this.flair;
    sequelize.sync({ force: true }).then((res) => {
      Flair.create({
        name: "Flash",
        color: "red"
      })
      .then((flair) => {
        this.flair = flair;
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("GET /flairs", () => {
    it("should return status code 200 and all flairs", (done) => {
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(err).toBeNull();
        expect(body).toContain("Flairs");
        expect(body).toContain("Flash");
        done();
      });
    });
  });

  describe("GET /flairs/new", () => {
    it("should render a new flair form", (done) => {
      request.get(`${base}/new`, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(err).toBeNull();
        expect(body).toContain("New Flair");
        done();
      });
    });
  });

  describe("POST /flairs/create", () => {
    it("should create a new flair and redirect to show page", (done) => {
      const options = {
        url: `${base}/create`,
        form: {
          name: "The Hulk",
          color: "green"
        }
      };

      request.post(options, (err, res, body) => {
        Flair.findOne({where: {name: "The Hulk"}})
        .then((flair) => {
          expect(res.statusCode).toBe(303);
          expect(err).toBeNull();
          expect(flair.name).toBe("The Hulk");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });
  });

  describe("GET /flairs/:id", () => {
    it("should render a view with the selected flair", (done) => {
      request.get(`${base}/${this.flair.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(res.statusCode).toBe(200);
        expect(this.flair.name).toBe("Flash");
        expect(this.flair.color).toBe("red");
        done();
      });
    });
  });

  describe("GET /flairs/:id/edit", () => {
    it("should render a view with an edit flair form", (done) => {
      request.get(`${base}/${this.flair.id}/edit`, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(err).toBeNull();
        expect(body).toContain("Edit Flair");
        expect(body).toContain("Flash");
        done();
      });
    });
  });

  describe("POST /flairs/:id/update", () => {
    it("should update the flair with the given values and redirect to show form", (done) => {
      const options = {
        url: `${base}/${this.flair.id}/update`,
        form: {
          name: "Omega Red",
          color: "red"
        }
      };

      request.post(options, (err, res, body) => {
        expect(err).toBeNull();

        Flair.findOne({
          where: { id: this.flair.id }
        })
        .then((flair) => {
          expect(flair.name).toBe("Omega Red");
          done();
        });
      });
    });
  });

  describe("POST /flairs/:id/destroy", () => {
    it("should delete the selected flair and redirect to the index page", (done) => {
      Flair.all()
      .then((flairs) => {
        expect(flairs.length).toBe(1);

        request.post(`${base}/${this.flair.id}/destroy`, (err, res, body) => {
          Flair.all()
          .then((flairs) => {
            expect(flairs.length).toBe(0);
            expect(err).toBeNull();
            done();
          })
        })
      })
    })
  })
});
