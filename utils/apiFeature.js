const { parseQuery } = require("./helper");

class APIFeature {
  constructor(model, queryString) {
    this.model = model;
    this.queryString = queryString;
    this.mongoFilter = { _id: { $ne: null } };
  }

  filter() {
    const query = parseQuery(this.queryString);

    this.mongoFilter = { ...this.mongoFilter, ...query };
    this.query = this.model.find(this.mongoFilter);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const pageIndex = this.queryString.pageIndex || 1;
    const pageSize = this.queryString.pageSize || 10;
    const skip = (pageIndex - 1) * pageSize;

    this.query = this.query.skip(skip).limit(pageSize);

    return this;
  }

  async aggregateCount() {
    const query = parseQuery(this.queryString);

    const count = await this.model.aggregate([
      {
        $match: { ...this.mongoFilter, ...query },
      },
    ]);

    return count.length;
  }
}

module.exports = APIFeature;
