/**
 * @description hide password content with '*'
 * @param {object} bodyData
 * @returns bodyData with formatted 'password'
 */
export const hidePassword = (bodyData: Record<string, any>) => {
  if (bodyData.hasOwnProperty("password")) {
    bodyData.password = "********";
  }

  return bodyData;
};
