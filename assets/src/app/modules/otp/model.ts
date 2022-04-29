import { Model, Models, Request, Params, BeeQueueType, utils, appState } from 'appbee';

const updateUserTots = async (req: Request, args: Params) => {
  const Users = Models.getUsers(req);
  const { error, data } = await utils.raa(Users.update(args, { opType: '$inc' }));
  if (!error && data) {
    Users.publishUpdate(req, Array.isArray(data) ? data[0] : data);
  }
};

export const Otp: Model = {
  schema: {
    id: 'objectId',
    pin: 'string',
    userId: 'string', //streamId
    createdAt: 'timestamp',
  },
  uniqueKeys: ['id'],
  insertKey: 'id',
  orderBy: 'id',
};
