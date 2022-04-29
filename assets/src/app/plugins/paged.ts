import { Record, utils } from 'appbee';
const LIMIT = 500;
export const pagedModel = (model: any, params: Record, handler: (data: Record[] | null, next: () => void) => void) => {
  let offset = 0;
  const start = async () => {
    const { data, error, recordCount } = await utils.raa(model.find({ ...params, offset, limit: LIMIT }));
    if (error) {
      return handler(null, null);
    }
    const nxt = offset + LIMIT > recordCount ? null : start;
    // console.log("debug: ", offset, recordCount, nxt);
    offset += LIMIT;
    handler(data, nxt);
  };
  return {
    start,
  };
};
