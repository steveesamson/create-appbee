import { Route, Restful } from 'appbee';

const { get, del, put, post } = Route('Roles', '/roles');

const { handleDelete, handleGet, handleUpdate, handleCreate } = Restful;

get('/:id?', handleGet('Roles'));
post('/', handleCreate('Roles'));
put('/:id', handleUpdate('Roles'));
del('/:id', handleDelete('Roles'));
