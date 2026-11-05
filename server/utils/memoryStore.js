/**
 * Lightweight in-memory store used when MongoDB is unavailable.
 * Provides collection-like access so the rest of the app keeps working
 * for local demo/testing without a live database.
 */
const collections = new Map();

class MemoryCollection {
  constructor() {
    this.docs = [];
    this._id = 0;
  }

  _nextId() {
    return (++this._id).toString();
  }

  async create(data) {
    const id = this._nextId();
    const doc = { ...data, _id: id, id };
    this.docs.push(doc);
    return { ...doc };
  }

  async find(filter = {}) {
    let result = this.docs.slice();
    if (filter) {
      if (typeof filter === 'function') {
        result = result.filter(filter);
      } else {
        const keys = Object.keys(filter);
        result = result.filter((doc) => keys.every((k) => {
          if (filter[k] instanceof RegExp) {
            return filter[k].test(String(doc[k] || ''));
          }
          return doc[k] === filter[k];
        }));
      }
    }
    return result.map((d) => ({ ...d }));
  }

  async findOne(filter = {}) {
    if (typeof filter === 'function') {
      const docs = await this.find();
      return docs.find(filter) || null;
    }
    const docs = await this.find(filter);
    return docs[0] || null;
  }

  async findByIdAndUpdate(id, update, opts = {}) {
    const key = String(id);
    const doc = await this.findOne((d) => d._id === key || d.id === key);
    if (!doc) return null;
    const set = update.$set || update;
    const updated = { ...doc, ...set, updatedAt: new Date() };
    const idx = this.docs.findIndex((d) => d._id === key || d.id === key);
    this.docs[idx] = updated;
    return opts.new === false ? doc : updated;
  }

  async findById(id) {
    const key = String(id);
    return this.findOne((d) => d._id === key || d.id === key);
  }

  async updateOne(filter, update) {
    const doc = await this.findOne(filter);
    if (!doc) return { modifiedCount: 0 };
    const idx = this.docs.findIndex((d) => d._id === doc._id);
    const set = update.$set || update;
    this.docs[idx] = { ...this.docs[idx], ...set, updatedAt: new Date() };
    return { modifiedCount: 1 };
  }

  async findByIdAndUpdate(id, update, opts = {}) {
    const doc = await this.findById(id);
    if (!doc) return null;
    const set = update.$set || update;
    const updated = { ...doc, ...set, updatedAt: new Date() };
    const idx = this.docs.findIndex((d) => d._id === doc._id);
    this.docs[idx] = updated;
    return opts.new === false ? doc : updated;
  }

  async deleteOne(filter) {
    const doc = await this.findOne(filter);
    if (!doc) return { deletedCount: 0 };
    this.docs = this.docs.filter((d) => d._id !== doc._id);
    return { deletedCount: 1 };
  }

  async countDocuments(filter = {}) {
    return (await this.find(filter)).length;
  }

  async aggregate(pipeline) {
    // Very limited aggregate support: only $match + $group + $count used by this app
    let data = this.docs.slice();
    for (const stage of pipeline) {
      if (stage.$match) {
        const keys = Object.keys(stage.$match);
        data = data.filter((d) => keys.every((k) => d[k] === stage.$match[k]));
      } else if (stage.$group) {
        const groups = new Map();
        const idExpr = stage.$group._id;
        for (const d of data) {
          const key = idExpr && idExpr.startsWith('$') ? d[idExpr.slice(1)] : idExpr;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(d);
        }
        const out = [];
        for (const [key, items] of groups) {
          const row = { _id: key, count: items.length };
          if (stage.$group.count) row.count = stage.$group.count;
          out.push(row);
        }
        data = out;
      } else if (stage.$count) {
        return [{ [stage.$count]: data.length }];
      }
    }
    return data;
  }
}

export const getCollection = (name) => {
  if (!collections.has(name)) collections.set(name, new MemoryCollection());
  return collections.get(name);
};

export const memoryDb = {
  getCollection,
};
