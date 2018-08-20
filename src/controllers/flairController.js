const flairQueries = require("../db/queries.flairs.js");

module.exports = {
  index(req, res, next) {
    flairQueries.getAllFlairs((err, flairs) => {
      if (err) {
        res.redirect(500, "static/index");
      } else {
        res.render("flairs/index", {flairs});
      }
    })
  },

  new(req, res, next) {
    res.render("flairs/new");
  },

  create(req, res, next) {
    let newFlair = {
      name: req.body.name,
      color: req.body.color
    };

    flairQueries.addFlair(newFlair, (err, flair) => {
      if (err) {
        res.redirect(500, "/flairs/new");
      } else {
        res.redirect(303, `/flairs/${flair.id}`);
      }
    })
  },

  show(req, res, next) {
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if (err || flair == null) {
        res.redirect(404, "/");
      } else {
        res.render("flairs/show", {flair});
      }
    });
  },

  edit(req, res, next) {
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if (err || flair == null) {
        res.redirect(404, "/");
      } else {
        res.render("flairs/edit", {flair});
      }
    });
  },

  update(req, res, next) {
    let updatedFlair = {
      name: req.body.name,
      color: req.body.color
    };

    flairQueries.updateFlair(req.params.id, updatedFlair, (err, flair) => {
      if (err) {
        res.redirect(500, `/flairs/${flair.id}/edit`);
      } else {
        res.redirect(303, `/flairs/${flair.id}`);
      }
    });
  },

  destroy(req, res, next) {
    flairQueries.deleteFlair(req.params.id, (err, flair) => {
      if (err) {
        res.redirect(500, `/flairs/${flairs.id}`);
      } else {
        res.redirect(303, `/flairs`);
      }
    });
  },
}
