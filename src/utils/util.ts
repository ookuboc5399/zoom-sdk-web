// Common utility functions for the Zoom SDK Web application
import { KJUR } from 'jsrsasign';

export function generateVideoToken(
  sdkKey: string,
  sdkSecret: string,
  topic: string,
  passWord: string = '',
  userIdentity: string = '',
  sessionKey: string = ''
): string {
  let signature = '';
  try {
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      app_key: sdkKey,
      iat,
      exp,
      tpc: topic,
      pwd: passWord,
      user_identity: userIdentity,
      session_key: sessionKey,
    };
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);
  } catch (e) {
    console.error(e);
  }
  return signature;
}

export function isShallowEqual(objA: any, objB: any): boolean {
  if (objA === objB) {
    return true;
  }
  if (!objA || !objB) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }
  return true;
}

export function formatTime(time: number): string {
  return new Date(time).toISOString().slice(11, 19);
}
