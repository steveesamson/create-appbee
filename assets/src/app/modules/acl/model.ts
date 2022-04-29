import { Model } from 'appbee';
export const Acl:Model = {
  schema: {
    id: 'objectId',
    role: 'string',
    resource: 'string',
    action: 'string',
    conditions: 'string',
    enabled: 'int',
  },
  uniqueKeys: ['id'],
  insertKey: 'id',
  orderBy: 'resource',
};
