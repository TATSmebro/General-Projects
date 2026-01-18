const USER_STATUSES = require('../../constants/database/user_status');
const USER_TYPES = require('../../constants/database/user_types');
const { User, TeamMember } = require('../../models');
const TokenService = require('../../services/token/token_service');
const { loginValidator } = require('./validators');
const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNPROCESSABLE_ENTITY, FORBIDDEN } = require('../../constants/http/status_codes');

const AuthController = {
  index: (req, res) => {
    res.json({ user: req.user });
  },

  login: async (req, res) => {
    const matched = loginValidator(req.body, res).validate()
    if (!matched) return;

    const user = await User.findOne({ where: { email: req.body.email }, include: [{ model: TeamMember }] });

    if (!user || !(await user.validPassword(req.body.password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return
    }

    if (user.status == USER_STATUSES.INVITED) {
      res.status(403).json({ message: 'User is not yet activated!' });
      return
    }

    if (user.status == USER_STATUSES.INACTIVE) {
      res.status(403).json({ message: 'User is inactive!' });
      return
    }

    if (user.user_type == USER_TYPES.TEAM_MEMBER) {
      res.json({
        message: 'Login successful',
        user: user,
        token: TokenService.generateToken(user.id)
      });
      return
    }

    res.status(401).json({ message: 'Invalid user' });
  },

  activate: async (req, res) => {
    const verification_token = req.query.token;

    if (!verification_token) {
      res.status(UNPROCESSABLE_ENTITY).json({ message: 'Token is required.' });
      return
    }

    const user = await User.findOne({ where: { verification_token: verification_token } });
    if (!user) {
      res.status(NOT_FOUND).json({ message: 'Invalid token.' });
      return
    }

    if (user.status == USER_STATUSES.ACTIVE) {
      res.status(FORBIDDEN).json({ message: 'User is already activated!' });
      return
    }

    if (user.status == USER_STATUSES.INACTIVE) {
      res.status(FORBIDDEN).json({ message: 'User is inactive!' });
      return
    }

    if (user.status == USER_STATUSES.INVITED) {
      user.status = USER_STATUSES.ACTIVE;
      user.verification_token = null;
      user.verified_at = new Date(Date.now()).toISOString()
      await user.save();
      res.json({ message: 'User activated successfully!' });
      return
    }

    res.status(401).json({ message: 'Invalid user' });
  }
}

module.exports.AuthController = AuthController;