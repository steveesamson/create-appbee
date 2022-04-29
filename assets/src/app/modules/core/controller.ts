import { unlink } from 'fs';
import { basename, join } from 'path';
import { Route, Request, Response, appState, getPlugin } from 'appbee';

const { post } = Route('Core', '/core');

post('/despace', async (req: Request, res: Response) => {
  const {
    spaces: { cdnBaseUrl = '' },
  } = appState();

  const { parameters } = req;
  // console.log('parameters:', parameters);
  const { file: handle } = parameters; //file is array.

  if (!handle) {
    return res.status(200).json({ error: 'Error while removing file - No file specified' });
  }
  if (Array.isArray(handle) && !handle.length) {
    return res.status(200).json({ error: 'Error while removing file - No file specified' });
  }

  const file = Array.isArray(handle) ? handle[0] : handle;

  if (file.startsWith('/tmp/')) {
    const { BASE_DIR } = appState();
    const isProd = process.env.NODE_ENV === 'production';
    const targetDir = join(BASE_DIR, isProd ? '/../public/tmp' : '/../../public/tmp');
    const name = basename(file);
    const targetFile = `${targetDir}/${name}`;
    unlink(targetFile, (e) => {});
    res.status(200).json({ data: `File at ${file} scheduled for delete.` });
  } else if (cdnBaseUrl && file.indexOf(cdnBaseUrl) >= 0) {
    const dropS3File = getPlugin('dropS3File');
    dropS3File(parameters);
    res.status(200).json({ data: `File at ${file} scheduled for delete.` });
  }
});
post('/upload', async (req: Request, res: Response) => {
  const {
    files: { file },
  } = req;

  const { BASE_DIR } = appState();
  const isProd = process.env.NODE_ENV === 'production';
  const targetDir = join(BASE_DIR, isProd ? '/../public/tmp' : '/../../public/tmp');
  const name = basename(file.path);
  const { data } = await file.renameTo(`${targetDir}`, name);
  if (data) {
    res.status(200).json({ data: `/tmp/${name}` });
  } else {
    res.status(200).json({ error: `Error while uploading '${file.name}'` });
  }
});
