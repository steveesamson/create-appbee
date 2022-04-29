import { Route, Request, Response, appState, Record } from 'appbee';

const { get } = Route('Resources', '/resources');

get('/:name?', (req: Request, res: Response) => {
  const { resources } = appState();
  const { name, search } = req.parameters;
  if (name) {
    return res.status(200).send({ data: resources.find((r: Record) => r.name === name) });
  }
  if (search) {
    return res
      .status(200)
      .send({ data: resources.filter((r: Record) => r.name.toLowerCase().indexOf(search.toLowerCase()) >= 0) });
  }

  res.status(200).send({ data: resources });
});
