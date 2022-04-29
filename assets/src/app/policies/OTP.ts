/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/5/14.
 */
import { Request, Response, NextFunction, Models } from "appbee";
const otp = function () {
  return Math.floor(Math.random() * 89999 + 10000);
};

const OTPPolicy = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.parameters;
  const Otp = Models.getOtp(req);
  await Otp.destroy({ where: { userId } });
  req.parameters.pin = otp();
  next();
};

export default OTPPolicy;
