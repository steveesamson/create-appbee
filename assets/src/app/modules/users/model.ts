import { Model, Request, Record, utils, getPlugin } from 'appbee';

export const Users: Model = {
  schema: {
    id: 'objectId',
    streamId: 'string',
    email: 'string',
    fullName: 'string',
    password: 'string',
    title: 'string',
    profession: 'string',
    gender: 'string',
    avatar: 'string',
    followers: 'integer',
    following: 'integer',
    posts: 'integer',
    tots: 'integer',
    status: 'string',
    role: 'string',
    subscription: 'object',
    joinedAt: 'string',
  },
  excludes: ['password'],
  uniqueKeys: ['id', 'streamId', 'email'],
  insertKey: 'id',
  orderBy: 'id',
  postCreate(req: Request, params: Record) {
    const { id, fullName, title, streamId } = params;
    const createBucket = getPlugin('createBucket');
    createBucket(req, { recordId: id, type: 'profile', meta: `${fullName}||${title}||${streamId}` });
  },
  postDestroy(req: Request, param: Record) {
    const destroyBucket = getPlugin('destroyBucket');
    const { id: recordId } = param;
    destroyBucket(req, { where: { recordId } });
  },
};
