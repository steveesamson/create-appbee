import { PolicyConfig } from "appbee";

const policies: PolicyConfig = {
  "*": true, //Global
  post: {
    "*": ["requireAccess"],
    "/users/:id?": false,
  },
  put: {
    "*": ["requireAccess"],
  },
  get: {
    "*": ["requireAccess"],
  },
  delete: {
    "*": ["requireAccess"],
  },
};

export default policies;
