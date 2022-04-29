import { Route, Request, Response, getPlugin, Restful, utils } from "appbee";

const { get, del, put, post } = Route("Acl", "/acl");
const { handleDelete, handleUpdate, handleCreate } = Restful;

get("/:id?", async (req: Request, res: Response) => {
  const { role } = req.parameters;
  const getAcls = getPlugin("getAcls"),
    { data } = await utils.raa(getAcls(role, req));
  res.status(200).send({ data });
});
post("/", handleCreate("Acl"));

put("/:id", handleUpdate("Acl"));

del("/:id", handleDelete("Acl"));
//End of file
