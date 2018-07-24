import { Utils } from '../../utils';

/**
 * Set property of object, array or value
 * @see https://gist.github.com/der-On/cdafe908847e2b882691
 */
export const set = (obj: any | any[], key: string | number, value?: any) => {
  // the key is the value if value is not set
  if (!value) {
    value = key;
  }

  if (Utils.isObject(obj) || Utils.isArray(obj)) {
    obj[key] = value;
  } else {
    obj = value;
  }
  return obj;
};
