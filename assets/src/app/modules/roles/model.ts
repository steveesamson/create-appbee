import { Model } from 'appbee';

export const Roles: Model = {
  schema: {
    id: 'objectId',
    name: 'string',
    role: 'string',
    parent: 'string',
  },
  uniqueKeys: ['id', 'name', 'role'],
  insertKey: 'id',
  orderBy: 'name',
};
