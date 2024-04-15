
import Base64 from 'crypto-js/enc-base64';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Utf8 from 'crypto-js/enc-utf8';
import * as CryptoJS from 'crypto-js';

// -----------------------------------------------------------------------------------------------------
// @ AUTH UTILITIES
//
// Methods are derivations of the Auth0 Angular-JWT helper service methods
// https://github.com/auth0/angular2-jwt
// -----------------------------------------------------------------------------------------------------


export class AuthUtils {
  /**
   * Constructor
   */
  constructor() { }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Is token expired?
   *
   * @param token
   * @param offsetSeconds
   */
  static isTokenExpired(token: string, offsetSeconds?: number): boolean {
    // Return if there is no token
    if (!token || token === '' || token == null) {
      return true;
    }
    // Get the expiration date
    const date = this._getTokenExpirationDate(token);
    // console.log(date);

    offsetSeconds = offsetSeconds || 0;

    if (date === null) {
      return true;
    }

    // Check if the token is expired
    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }


  // /**
  //  * Is token expired?
  //  *
  //  * @param token
  //  * @param offsetSeconds
  //  */
  // static refreshJwtToken(token: string): string {
  //     // Return if there is no token
  //     // Verify the token
  //     if (this._verifyJWTToken(token)) {
  //         return this._generateJWTToken();
  //     }

  //     // Invalid token
  //     return null
  // }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Base64 decoder
   * Credits: https://github.com/atk
   *
   * @param str
   * @private
   */
  private static _b64decode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';

    str = String(str).replace(/=+$/, '');

    if (str.length % 4 === 1) {
      throw new Error(
        '\'atob\' failed: The string to be decoded is not correctly encoded.'
      );
    }

    /* eslint-disable */
    for (
      // initialize result and counters
      let bc = 0, bs: any, buffer: any, idx = 0;
      // get next character
      (buffer = str.charAt(idx++));
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer &&
        (
          (bs = bc % 4 ? bs * 64 + buffer : buffer),
          // and if not first of each 4 characters,
          // convert the first 8 bits to one ascii character
          bc++ % 4
        )
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    /* eslint-enable */

    return output;
  }

  /**
   * Base64 unicode decoder
   *
   * @param str
   * @private
   */
  private static _b64DecodeUnicode(str: any): string {
    return decodeURIComponent(
      Array.prototype.map
        .call(this._b64decode(str), (c: any) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }

  /**
   * URL Base 64 decoder
   *
   * @param str
   * @private
   */
  private static _urlBase64Decode(str: string): string {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0:
        {
          break;
        }
      case 2:
        {
          output += '==';
          break;
        }
      case 3:
        {
          output += '=';
          break;
        }
      default:
        {
          throw Error('Illegal base64url string!');
        }
    }
    return this._b64DecodeUnicode(output);
  }

  /**
   * Decode token
   *
   * @param token
   * @private
   */
  private static _decodeToken(token: string): any {
    // Return if there is no token
    if (!token) {
      return null;
    }

    // Split the token
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('The inspected token doesn\'t appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.');
    }

    // Decode the token using the Base64 decoder
    const decoded = this._urlBase64Decode(parts[1]);

    if (!decoded) {
      throw new Error('Cannot decode the token.');
    }

    return JSON.parse(decoded);
  }

  /**
   * Get token expiration date
   *
   * @param token
   * @private
   */
  private static _getTokenExpirationDate(token: string): Date | null {
    // Get the decoded token
    const decodedToken = this._decodeToken(token);

    // Return if the decodedToken doesn't have an 'exp' field
    if (!decodedToken.hasOwnProperty('exp')) {
      return null;
    }

    // Convert the expiration date
    const date = new Date(0);
    date.setUTCSeconds(decodedToken.exp);

    return date;
  }

  /**
   * Return base64 encoded version of the given string
   *
   * @param source
   * @private
   */
  static _base64url(source: any): string {
    // Encode in classical base64
    let encodedSource = Base64.stringify(source);

    // Remove padding equal characters
    encodedSource = encodedSource.replace(/=+$/, '');

    // Replace characters according to base64url specifications
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');

    // Return the base64 encoded string
    return encodedSource;
  }

  /**
   * Generates a JWT token using CryptoJS library.
   *
   * This generator is for mocking purposes only and it is NOT
   * safe to use it in production frontend applications!
   *
   * @private
   */
  static _generateJWTToken(userName: string, url): string {
    // Define token header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    // Calculate the issued at and expiration dates
    const date = new Date();
    const iat = Math.floor(date.getTime() / 1000);
    const exp = Math.floor((date.getTime() + 60 * 60 * 1000) / 1000);

    // Define token payload
    const payload = {
      iat: iat,
      iss: userName,
      exp: exp
    };

    // Stringify and encode the header
    const stringifiedHeader = Utf8.parse(JSON.stringify(header));
    const encodedHeader = this._base64url(stringifiedHeader);

    // Stringify and encode the payload
    const stringifiedPayload = Utf8.parse(JSON.stringify(payload));
    const encodedPayload = this._base64url(stringifiedPayload);

    // Sign the encoded header and mock-api
    let signature: any = encodedHeader + '.' + encodedPayload;
    signature = HmacSHA256(signature, url);
    signature = this._base64url(signature);

    // Build and return the token
    return encodedHeader + '.' + encodedPayload + '.' + signature;
  }

  /**
   * Verify the given token
   *
   * @param token
   * @private
   */
  static _verifyJWTToken(token: string, key: string): boolean {
    // Split the token into parts
    const parts = token.split('.');
    const header = parts[0];
    const payload = parts[1];
    const signature = parts[2];

    // Re-sign and encode the header and payload using the secret
    const signatureCheck = this._base64url(HmacSHA256(header + '.' + payload, key));

    // Verify that the resulting signature is valid
    return (signature === signatureCheck);
  }

  /*
   * Encrypt a derived hd private key with a given pin and return it in Base64 form
   */
  static encryptAES = (text, key) => {
    return CryptoJS.AES.encrypt(text, key).toString();
  };


  /**
   * Decrypt an encrypted message
   * @param encryptedBase64 encrypted data in base64 format
   * @param key The secret key
   * @return The decrypted content
   */
  static decryptAES = (encryptedBase64, key) => {
    if (encryptedBase64 != null) {
      const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
      if (decrypted) {
        try {
          const str = decrypted.toString(CryptoJS.enc.Utf8);
          if (str.length > 0) {
            return str;
          } else {
            return null;
          }
        } catch (e) {
          return null;
        }
      }
      return null;
    }
    return null;
  };

}
