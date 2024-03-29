import { Utils } from './utils';

interface Options {
  crossDomain?: boolean;
}

export class HttpService {

  /**
   * Set header for each xhr and jquery request
   * @param name Header name
   * @param value Hander value
   */
  public static setRequestHeaderEachRequest(name: string, value: string) {
    this._requestHeadersEachRequest.push({
      name,
      value,
    });
  }

  /**
   * Load JSON-encoded data from the server using a GET HTTP request.
   * @param url A string containing the URL to which the request is sent.
   * @param data A plain object or string that is sent to the server with the request.
   * @see https://api.jquery.com/jquery.getjson/
   */
  public static getJSON(url: string, data?: any) {
    return this.fetch(url, 'GET', data, 'json');
  }

  /**
   * Load data from the server using a HTTP POST request.
   * @param url A string containing the URL to which the request is sent.
   * @param data A plain object or string that is sent to the server with the request.
   * @param dataType The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).
   * @see https://api.jquery.com/jquery.post/
   */
  public static post(url: string, data?: any, dataType?: string) {
    return this.fetch(url, 'POST', data, dataType);
  }

  public static delete(url: string, data?: any, dataType?: string) {
    return this.fetch(url, 'DELETE', data, dataType);
  }

  public static put(url: string, data?: any, dataType?: string) {
    return this.fetch(url, 'PUT', data, dataType);
  }

  /**
   * Load data from the server using a HTTP GET request.
   * @param url A string containing the URL to which the request is sent.
   * @param data A plain object or string that is sent to the server with the request.
   * @param dataType The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).
   * @see https://api.jquery.com/jquery.get/
   */
  public static get(url: string, data?: any, dataType?: string) {
    return this.fetch(url, 'GET', data, dataType);
  }

  /**
   *
   * @param dataType The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).
   */
  public static parseDataType(dataType: string) {
    const headers: {'Content-Type'?: string; 'Accept'?: string} = {};
    let contentType = 'multipart/form-data';
    let accept = '*/*';
    switch (dataType) {
      case 'script':
        contentType = 'application/javascript';
        break;
      case 'json':
        contentType = 'application/json';
        accept = 'application/json, text/javascript';
        break;
      case 'xml':
        contentType = 'application/xml';
        accept = 'application/xml, text/xml';
        break;
      case 'text':
        contentType = 'text/plain';
        accept = 'text/plain';
        break;
      case 'html':
        contentType = 'text/html';
        accept = 'text/html';
        break;
      case 'form':
        contentType = 'multipart/form-data';
        break;
    }
    if (contentType) {
      headers['Content-Type'] = contentType;
      // tslint:disable-next-line:no-string-literal
      headers['Accept'] = accept;
    }
    return headers;
  }

  /**
   * Start an XMLHttpRequest() and return a Promise
   *
   * @memberOf Barba.Utils
   * @param url
   * @param xhrTimeout Time in millisecond after the xhr request goes in timeout
   */
  public static xhr(url: string, xhrTimeout = 5000, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', dataType?: string, data?: any): Promise<string | any> {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.onreadystatechange = () => {
        if (req.readyState === 4) {
          if (req.status === 200) {
            if (typeof(dataType) === 'string' && (dataType === 'json' || dataType.includes('json'))) {
              try {
                resolve(JSON.parse(req.responseText));
              } catch (error) {
                // If json can't be parsed
                return resolve(req.responseText);
              }
            }
            return resolve(req.responseText);
          } else {
            return reject(req);
          }
        }
      };

      req.ontimeout = () => {
        return reject(new Error('xhr: Timeout exceeded'));
      };

      req.open('GET', url);
      req.timeout = xhrTimeout;

      // headers
      for (const header of this._requestHeadersEachRequest) {
        req.setRequestHeader(header.name, header.value);
      }
      if (dataType) {
        const dataTypeHeader = this.parseDataType(dataType);
        if ( dataTypeHeader['Content-Type']) {
          req.setRequestHeader('Content-Type', dataTypeHeader['Content-Type']);
        }
        if ( dataTypeHeader.Accept) {
          req.setRequestHeader('Accept', dataTypeHeader.Accept);
        }
      }

      req.send(method !== 'GET' && data ? JSON.stringify(data) : data);
    });
  }

  public static fetch(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data: any = {}, dataType?: string, headers: any = {}, options: Options = {}) {
    if (fetch) {
      let body;
      // headers
      for (const header of this._requestHeadersEachRequest) {
        headers[header.name] = header.value;
      }
      if (dataType) {
        headers = Utils.concat(headers, this.parseDataType(dataType));
      }

      if (!options.crossDomain && !headers['X-Requested-With'] ) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
      }

      if (method === 'GET' && data) {
        url = url + '?' + new URLSearchParams(data);
      } else if (data) {
        if (dataType === 'form') {
          body = new URLSearchParams(data);
        } else {
          body = JSON.stringify(data);
        }
      }
      // console.debug('method', method);
      // console.debug('body', body);
      // console.debug('headers', headers);
      return fetch(url, {
        credentials: 'same-origin',
        method,
        body,
        headers,
      })
      .then((response) => {
        if (typeof(dataType) === 'string' && (dataType === 'json' || dataType.includes('json'))) {
          return response.json();
        }
        return response.text();
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    }

    // Fallback
    return this.xhr(url, undefined, 'GET', dataType, data);
  }

  /**
   * Header name value pair to send on each request
   */
  protected static _requestHeadersEachRequest: {name: string, value: string}[] = [];
}
