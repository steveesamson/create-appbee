import { Route, Restful, Request } from 'appbee';
const { get, post, put, del } = Route('Otp', '/otp');

const { handleGet, handleCreate, handleDelete, handleUpdate } = Restful;

const preCreate = (req: Request) => {
  return { createdAt: new Date() };
};

post('/', handleCreate('Otp', preCreate));
get('/:id?', handleGet('Otp'));
put('/:id', handleUpdate('Otp'));
del('/:id', handleDelete('Otp'));
