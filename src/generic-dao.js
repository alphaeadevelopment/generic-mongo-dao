/* eslint-disable no-unused-vars */
import { MongoClient } from 'mongodb';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import generate from 'shortid';

const getReturnObject = obj => merge({ id: obj._id }, omit(obj, ['_id'])); // eslint-disable-line no-underscore-dangle

const operateOnCollection = (url, collection, dbname) => (fn) => {
  const self = this;
  return new Promise((res, rej) => {
    MongoClient.connect(url)
      .then((client) => {
        const db = client.db(dbname);
        const coll = db.collection(collection);
        console.log(`connecting to ${url}, collection: ${collection}`);
        try {
          fn.call(self, coll)
            .then((d) => {
              res(d);
              client.close();
            })
            .catch((e) => {
              rej(e);
              client.close();
            });
        }
        catch (e) {
          rej(e);
          client.close();
        }
      })
      .catch(e => rej(e));
  });
};

export default (model) => {
  const collection = model.collectionName;
  const dbname = process.env.MONGO_DATABASE_NAME || 'test';
  const url = process.env.MONGODB_URL || `mongodb://localhost:27017/${dbname}`;
  const doOperation = operateOnCollection(url, collection, dbname);
  console.log('creating dao for %s : %s : %s', url, dbname, collection);
  return ({
    add: (obj) => {
      const { id, ...withoutId } = obj;
      const idToUse = id || generate();
      const s = { ...withoutId, _id: idToUse };
      return doOperation(
        coll => coll.insert(s)
          .then((r) => {
            console.log(r);
            console.log('x', r.ops[0]);
            const rr = getReturnObject(r.ops[0]);
            console.log('returning', rr);
            return rr;
          }),
      );
    },

    getOne: id => new Promise((res, rej) => {
      doOperation(
        (coll) => {
          const query = { _id: Number(id) };
          console.log('getOne query: %s', JSON.stringify(query, null, 2));
          return coll.findOne(query);
        })
        .then((r) => {
          console.log(r);
          const obj = r;
          res(r && getReturnObject(r));
        })
        .catch(e => rej(e));
    }),

    findOneByQuery: q => new Promise((res, rej) => {
      doOperation(
        (coll) => {
          return coll.findOne(q);
        })
        .then((r) => {
          console.log(r);
          res(r && getReturnObject(r));
        })
        .catch(e => rej(e));
    }),

    findManyByQuery: q => doOperation(
      (coll) => {
        const rv = coll.find(q).batchSize(30).project({ _id: 1, company: 1 }).toArray();
        console.log(rv);
        return rv;
      })
      .then((r) => {
        console.log(r);
        return (r && r.map(d => getReturnObject(d)));
      }),
  });
};
