import { Request, Response, NextFunction, utils, AppConfig } from 'appbee';

const logger = (req: Request, res: Response, next: NextFunction) => {
  const { mountRestOn } = utils.getConfig('application') as AppConfig;
  req.url.startsWith(`${mountRestOn}/`) &&
    console.log(`Logger: ${req.method}(${req.url}) @ - `, new Date().toDateString());
  next();
};

export default logger;
