import { Request, Response, NextFunction, getPlugin, utils } from "appbee";

const requireAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { currentUser, url, path, method } = req;
  if (!currentUser) {
    console.log(`requireAccess>> Unauthorized operation on '${url}'`);
    return res.status(401).send({ error: "Unauthorized operation" });
  }
  const aclCan = getPlugin("aclCan");
  const { data: canProceed } = await utils.raa(aclCan(req));

  if (!canProceed) {
    console.log(
      `requireAccess>> Unauthorized operation '${method}' '${path}' on  '${url}' by '${currentUser.streamId}'`
    );
    return res.status(401).send({ error: "Unauthorized operation" });
  }

  next();
};

export default requireAccess;
