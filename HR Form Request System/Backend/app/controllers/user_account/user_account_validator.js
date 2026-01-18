const { Validator } = require('../../core/validator')

const createUserAccountFormValidator = (body, res) => {
    const rules = {
        username: 'required',
        password: 'required',
        role_id: 'required',
        first_name: 'required',
        last_name: 'required',
    }
    return new Validator(body, rules, res);
}

const updatePasswordFormValidator = (body, res) => {
    const rules = {
        current_password: 'required',
        new_password: 'required',
        confirm_password: 'required'
    }

    return new Validator(body, rules, res)
}
module.exports = {
    createUserAccountFormValidator,
    updatePasswordFormValidator,
}
