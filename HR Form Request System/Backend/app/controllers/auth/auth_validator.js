const { Validator } = require("../../core/validator");

const loginValidator = (body, res) => {
  const rules = {
    email: 'required|email',
    password: 'required'
  }
  return new Validator(body, rules, res);
}

module.exports.loginValidator = loginValidator;
