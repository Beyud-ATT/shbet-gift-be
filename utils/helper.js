const jwt = require("jsonwebtoken");

function parseQuery(queryString) {
  const queryObj = { ...queryString };
  const excludeFields = ["pageSize", "pageIndex", "sort", "fields"];
  excludeFields.forEach((field) => delete queryObj[field]);

  const query = Object.keys(queryObj).reduce((prev, curr) => {
    const operatorMatch = curr.match(/^(.+)\[(gte|gt|lte|lt|regex)\]$/);
    if (operatorMatch) {
      const [, field, operator] = operatorMatch || [];
      if (operator === "regex") {
        return {
          ...prev,
          [field]: { $regex: new RegExp(queryObj[curr], "i") },
        };
      }
      if (operator !== "regex") {
        return {
          ...prev,
          [field]: { [`$${operator}`]: queryObj[curr] },
        };
      }
      return { ...prev, [field]: queryObj[curr] };
    }
    return { ...prev, [curr]: queryObj[curr] };
  }, {});

  return query;
}

function hashData(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function isPromotionActive() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  return day === month;
}

function signToken(data) {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

module.exports = { parseQuery, hashData, isPromotionActive, signToken };
