const paginate = (req) => {
    const { page, per } = req.query;
    const offset = (page - 1) * per;
    const limit = per;
  
    return {
      offset,
      limit
    }
  }
  
  module.exports = paginate;