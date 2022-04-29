import { Route, Request, Response, Models, getPlugin, utils } from "appbee";

const { get, post } = Route("Auth", "/auth");

get("/spinx", utils.getCaptcha);
post("/reset", async (req: Request, res: Response) => {
  const { id, password } = req.parameters;
  const Users = Models.getUsers(req);
  const { error, data } = await utils.raa(Users.update({ id, password }));

  if (error) {
    console.error(error.sqlMessage || error);
    return res.status(500).json({ error: "Store connection error" });
  }
  Users.publishUpdate(req, data);

  res.status(201).json({ data });
});

post("/signup", async (req: Request, res: Response) => {
  const { email, avatar, password, streamId, title, fullName } = req.parameters;

  const Users = Models.getUsers(req);

  const { error, data } = await utils.raa(
    Users.create({
      streamId,
      fullName,
      email,
      avatar,
      title,
      password,
      status: "Active",
      role: "user",
      followers: 0,
      following: 0,
      posts: 0,
      tots: 0,
      joinedAt: new Date(),
    })
  );

  if (error) {
    console.error(error.sqlMessage || error);
    return res.status(500).json({ error: "Store connection error" });
  }
  Users.publishCreate(req, data);

  res.status(201).json({ data });
});

post("/signin", async (req: Request, res: Response) => {
  const { streamIdOrEmail, password } = req.parameters;

  const Users = Models.getUsers(req);

  const isEmail = streamIdOrEmail.indexOf("@") > 0;
  const param = isEmail
    ? { email: streamIdOrEmail.trim().toLowerCase() }
    : { streamId: streamIdOrEmail };

  const { data: user, error } = await utils.raa(
    Users.find({ ...param, relax_exclude: 1, status: "Active" })
  );

  if (!user) {
    return res.status(400).json({ error: "Invalid login credentials." });
  }
  // console.log('debug: ', data, error);
  if (error) {
    console.error(error.sqlMessage || error);
    return res.status(500).json({ error: "Store connection error" });
  }

  const { password: storedPassword, tuFa } = user;
  delete user.password;
  const passwordMatches = await utils.Encrypt.verify(password, storedPassword);

  if (!passwordMatches) {
    return res.status(400).json({ error: "Invalid login credentials." });
  }

  const getPriviledges = getPlugin("getPriviledges");

  const { data: cans } = await utils.raa(getPriviledges(user.role, req));
  const payload = {
    id: user.id,
    avatar: user.avatar,
    email: user.email,
    fullName: user.fullName,
    streamId: user.streamId,
    role: user.role,
  };
  const token = utils.Token.sign(payload);

  res.status(200).json({ data: { ...payload, token, cans } });
});

post("/cans/:role", async (req: Request, res: Response) => {
  const { role } = req.parameters;

  const getPriviledges = getPlugin("getPriviledges");
  const { data } = await utils.raa(getPriviledges(role, req));

  res.status(200).send({ data });
});
get("/sessionuser", async (req: Request, res: Response) => {
  const { currentUser } = req;
  if (!currentUser) {
    return res.status(200).json({ data: null });
  }
  const Users = Models.getUsers(req);
  const { id } = currentUser;
  const { data: user, error } = await utils.raa(
    Users.find({ id, status: "Active" })
  );
  if (error || !user) {
    return res.status(200).json({ data: null });
  }
  const payload = {
    id: user.id,
    avatar: user.avatar,
    email: user.email,
    fullName: user.fullName,
    streamId: user.streamId,
    role: user.role,
  };
  const jwt = utils.Token.sign(payload);
  req.session = {
    jwt,
  };
  res.status(200).json({ data: { ...payload } });
});

get("/signout", (req: Request, res: Response) => {
  req.session = null;
  res.status(200).json({ data: true });
});

get("/verify/:streamId", async (req: Request, res: Response) => {
  const { streamId } = req.parameters;

  const Users = Models.getUsers(req);

  const { data, error } = await utils.raa(Users.find({ streamId }));

  if (error) {
    return res
      .status(404)
      .json({ error: `User with streamId '${streamId}' not found.` });
  }

  res.status(200).json({ data });
});
get("/exists/:streamIdOrEmail", async (req: Request, res: Response) => {
  const { streamIdOrEmail } = req.parameters;

  const Users = Models.getUsers(req);
  const isEmail = streamIdOrEmail.indexOf("@") > 0;
  const param = isEmail
    ? { email: streamIdOrEmail.trim().toLowerCase() }
    : { streamId: streamIdOrEmail };

  const { error, data: user } = await utils.raa(Users.find({ ...param }));

  if (error) {
    return res.status(404).json({
      error: `Error while retrieving detail for '${streamIdOrEmail}'.`,
    });
  }
  if (user) {
    const { id, streamId, email, fullName } = user;
    return res.status(200).json({ data: { id, streamId, email, fullName } });
  }
  return res
    .status(404)
    .json({ error: `User '${streamIdOrEmail}' was not found.` });
});
