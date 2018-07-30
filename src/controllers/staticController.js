module.exports = {
  index(req, res, next) {
    res.render("static/index", { title: "Bloccit" });
  },

  about(req, res, next) {
    res.render("static/about", { title: "About Us" });
  }
}
