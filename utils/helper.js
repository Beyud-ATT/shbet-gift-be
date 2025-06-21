function parseQuery(queryString) {
  const queryObj = { ...queryString };
  const exludeFields = ["pageIndex", "pageSize", "sort", "limit", "fields"];
  exludeFields.forEach((field) => delete queryObj[field]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|regex)\b/g,
    (match) => `$${match}`,
  );

  const parsedQuery = JSON.parse(queryStr);
  const query = Object.keys(parsedQuery).reduce((prev, curr) => {
    if (parsedQuery[curr].$regex !== undefined) {
      return {
        ...prev,
        [curr]: {
          $regex: new RegExp(parsedQuery[curr].$regex, "i"),
        },
      };
    }
    return {
      ...prev,
      [curr]: parsedQuery[curr],
    };
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

module.exports = { parseQuery, hashData, isPromotionActive };
