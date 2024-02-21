/**
 * @description hide password content with '*'
 * @param {object} bodyData
 * @returns bodyData with formatted 'password'
 */
export const hidePassword = <T extends Object>(bodyData: T): T => {
  if (bodyData.hasOwnProperty("password")) {
    // if ("password" in bodyData) {
    // @ts-ignore
    bodyData.password = "********";
  }

  return bodyData;
};
