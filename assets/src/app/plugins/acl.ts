import { Request, Record, Params, Models, utils } from 'appbee';

const Robaac = function (cans: any[]) {
  const acl: { can: Params; permissions: any[] } = {
      can: {},
      permissions: [],
    },
    normalizeRoles = function () {
      (cans || []).forEach((operation) => {
        if (typeof operation === 'string') {
          acl.permissions.push(operation);
          acl.can[operation] = function () {
            return true;
          };
        } else if (typeof operation === 'object') {
          acl.permissions.push(operation.name);
          acl.can[operation.name] = new Function('param', `return  ${operation.when};`);
        }
      });
    };

  normalizeRoles();

  return {
    can: function (operation: string, options = {}) {
      // Check if this role has this operation
      if (acl.can[operation] && acl.can[operation](options)) {
        return true;
      }

      return false;
    },
  };
};

const userRoles = (userRole: string, req: Request) => {
  const roleModel = Models.getRoles(req);

  // console.log("getRoles, user: ", user);
  return new Promise((r, j) => {
    let roles: string[] = [],
      retrieveRole = async (_data: Params): Promise<Record> => {
        const { data: role, error } = await utils.raa(roleModel.find(_data));
        // console.log('role: ', role);
        if (error) {
          j(error);
        }
        if (role && role.parent) {
          roles.push(role.parent);
          return retrieveRole({ role: role.parent });
        }
        r(roles);
      };
    roles.push(userRole);
    retrieveRole({ role: userRole });
  });
};

const userPriviledges = (
  userRole: string,
  roles: string[],
  req: Request,
  // enabled: boolean = false,
): Promise<Record> => {
  const aclModel = Models.getAcl(req);

  return new Promise((r, j) => {
    let priviledges: Record[] = [];
    const retrievePriviledge = async (_data: Params) => {
      const { data: prvs, error } = await utils.raa(aclModel.find(_data));
      if (error) {
        return j(error);
      }
      if (priviledges.length < 1) {
        if (_data.role === userRole) {
          priviledges = prvs;
        } else {
          priviledges = prvs.map((p: Record) => ({ ...p, inherited: 1, role: userRole }));
        }
      } else {
        let idx = -1;

        prvs.forEach((pr: Record) => {
          let existsInChild = priviledges.find((p: Record, index: number) => {
            idx = index;
            return p.resource === pr.resource && p.action === pr.action;
          });

          if (existsInChild) {
            // priviledges[idx] = { ...pr, ...existsInChild, inherited: 1, role: userRole };
            priviledges[idx] = { ...existsInChild, role: userRole };
          } else {
            priviledges = [...priviledges, { ...pr, inherited: 1, role: userRole }];
          }
        });
      }

      if (roles.length) {
        // const load = enabled ? { role: roles.shift(), enabled: 2 } : { role: roles.shift() };
        retrievePriviledge({ role: roles.shift() });
      } else {
        r(priviledges);
      }
    };
    if (roles.length) {
      // const load = enabled ? { role: roles.shift(), enabled: 2 } : { role: roles.shift() };
      retrievePriviledge({ role: roles.shift() });
    }
  });
};

export const getAcls = async (userRole: string, req: Request) => {
  const { data: _roles } = await utils.raa(userRoles(userRole, req));

  if (_roles && _roles.length) {
    // console.log('_roles: ', _roles);
    const { data: privs } = await utils.raa(userPriviledges(userRole, _roles, req));
    return privs;
  }
  return [];
};

// export const getPriviledges = (priviledges: Params[]) => {

export const getPriviledges = async (userRole: string, req: Request) => {
  const { data: acls, error } = await utils.raa(getAcls(userRole, req));
  if (acls) {
    // console.log('acls: ', acls);
    const filteredAcls = acls.filter((p: any) => p.enabled === 2);

    return filteredAcls.map((o: Params) =>
      o.conditions ? { name: `${o.action}_${o.resource}`, when: o.conditions } : `${o.action}_${o.resource}`,
    );
  }
  return { error };
};
// const whiteListedResources = ['/auth/signin', '/auth/signup', '/auth/signout'];

export const aclCan = async (req: Request) => {
  const { currentUser, parameters, path, method } = req;
  // console.log('Visiting path: ', req);
  //
  const mtd = method.toLowerCase();

  const { role, id } = currentUser;

  const resource = path.split('/').filter((_: string) => !!_)[0];
  const { data: cans } = await utils.raa(getPriviledges(role, req));

  // console.log('cans: ', cans);
  // console.log(`Visiting path:${path}, resource: ${resource}, role: ${role}`);

  if (cans && resource) {
    const options = { ...parameters, sessionUser: id };
    const rBack = Robaac(cans);

    const res =
      rBack.can(`manage_*`, options) ||
      (mtd === 'post'
        ? rBack.can(`manage_${resource}`, options) || rBack.can(`create_${resource}`, options)
        : mtd === 'get'
        ? rBack.can(`manage_${resource}`, options) || rBack.can(`view_${resource}`, options)
        : mtd === 'put'
        ? rBack.can(`manage_${resource}`, options) || rBack.can(`edit_${resource}`, options)
        : mtd === 'delete'
        ? rBack.can(`manage_${resource}`, options) || rBack.can(`delete_${resource}`, options)
        : false);

    // console.log(`Role:${role} can ${mtd}_*? ${res}`);
    return res;
  }
  return false;
};
