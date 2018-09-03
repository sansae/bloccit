const ApplicationPolicy = require("./application");

module.exports = class CommentPolicy extends ApplicationPolicy {
  /* We load the ApplicationPolicy and define CommentPolicy to inherit from it. Since the create and destroy methods of the parent class meet our needs, we don't need any further code. */
}
