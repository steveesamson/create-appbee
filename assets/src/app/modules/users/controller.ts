import { Route, Restful, } from 'appbee';

const { get, del, put } = Route('Users', '/users');

const { handleDelete, handleGet, handleUpdate } = Restful;

get('/:id?', handleGet('Users'));
put('/:id', handleUpdate('Users'));
del('/:id', handleDelete('Users'));

