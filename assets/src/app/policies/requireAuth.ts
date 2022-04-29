import { Request, Response, NextFunction } from "appbee";

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { currentUser, url } = req;

  if (!currentUser) {
    console.log(`requireAuth>> Unauthorized operation on '${url}'`);
    return res.status(401).send({ error: "Unauthorized operation" });
  }
  next();
};

export default requireAuth;
