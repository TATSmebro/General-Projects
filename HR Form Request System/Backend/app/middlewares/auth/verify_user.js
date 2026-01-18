const TokenService = require("../../services/token/token_service");
const { User, TeamMember } = require("../../models");
const { UNAUTHORIZED, FORBIDDEN } = require("../../constants/http/status_codes");
const USER_STATUSES = require("../../constants/database/user_status");

const verifyUser = async(req, res, next) => {
  const authorizationHeader = req.headers['Authorization'] || req.headers['authorization'];
  if (!authorizationHeader) {
    res.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return
  }
  try {
    const decoded = await TokenService.verifyToken(authorizationHeader.split(' ')[1]);
    
    const user = await User.findByPk(decoded.data, { include: [TeamMember]});
    if (!user) {
      return res.status(FORBIDDEN).send({ message: 'Invalid token!' });
    }

    if (user.status == USER_STATUSES.INVITED) {
      return res.status(FORBIDDEN).send({ message: 'User is not yet activated!' });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(UNAUTHORIZED).send({ message: 'Unauthorized!', error });
  }
};

module.exports = verifyUser;