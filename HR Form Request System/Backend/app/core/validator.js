const { make } = require('simple-body-validator');

class Validator {
  constructor(body, rules, res) {
    this.body = body;
    this.rules = rules;
    this.res = res;
  }

  validate() {
    const validator = make(this.body, this.rules);
    if (!validator.validate()) {
      if (this.res != null){
        this.res.status(422).json({ message: 'Validation failed', errors: validator.errors().messages });
      }
      return false;
    } else {
      return true;
    }
  }
}

module.exports.Validator = Validator;