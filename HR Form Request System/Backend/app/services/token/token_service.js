const jwt = require('jsonwebtoken');

const TokenService = {
  generateToken: (payload, expiresIn) => {
    let config = {}
    if (expiresIn) {
      config = { expiresIn }
    }
    return jwt.sign(
      {
        data: payload
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      })

  },

  verifyToken: async (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
    
  }
}

module.exports = TokenService;