const request = require("request");
const server = require("../../src/server");
var baseUrl = "http://localhost:3000/";

describe("routes : static", () => {
  describe("GET /", () => {
    it("should return status code 200 and have 'Welcome to Bloccit' in the body of the response", (done) => {
      request.get(baseUrl, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(body).toContain("Welcome to Bloccit");
        done();
      });
    });
  });

  describe("GET /marco", () => {
    it("should return status code 200 and polo in body", (done) => {
      request.get(baseUrl + "marco", (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(body).toBe("polo");
        done();
      });
    });
  });
});
