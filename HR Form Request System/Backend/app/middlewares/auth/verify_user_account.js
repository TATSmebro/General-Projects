const TokenService = require("../../services/token/token_service")
const { UNAUTHORIZED, FORBIDDEN } = require("../../constants/http/status_codes");
const { UserAccount} = require("../../models/");
const authenticateUser = async (req, res, next) => {
    const authorizationHeader = req.headers['Authorization'] || req.headers['authorization'];
    if (!authorizationHeader) {
        res.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
        return
    }
    
    try {
        const decoded = await TokenService.verifyToken(authorizationHeader.split(' ')[1]);
        
        const user = await UserAccount.findByPk(decoded.data);
        if (!user) {
          return res.status(FORBIDDEN).send({ message: 'Invalid token!' });
        }
        req.user = user;
        next()
    } catch (error) {
        return res.status(UNAUTHORIZED).send({ message: 'Unauthorized!', error });
    }

}

module.exports = authenticateUser