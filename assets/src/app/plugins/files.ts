const fs = require('fs'),
  readline = require('readline');

export const readFileAsArray = (file: string, firstLine = false) => {
  if (!fs.existsSync(file)) return Promise.resolve({ error: `File ${file} not found.` });

  return new Promise((resolve) => {
    const data: string[] = [];
    const readInterface = readline.createInterface({
      input: fs.createReadStream(file),
      console: false,
    });
    readInterface.on('line', (line: string) => {
      if (!line) return;
      data.push(line);
      if (firstLine) {
        readInterface.close();
      }
    });

    readInterface.on('close', function () {
      resolve({ data });
    });
  });
};

export const writeFileFromArray = (file: string, content: string[]) => {
  // if (!fs.existsSync(file)) return Promise.resolve({ error: `File ${file} not found.` });

  return new Promise((resolve) => {
    const data: string = content.join('\n');
    fs.writeFile(file, data, 'utf8', (error: any) => {
      return error ? resolve({ error }) : resolve({ data: 'File written successfully.' });
    });
  });
};
