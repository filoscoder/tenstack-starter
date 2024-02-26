/**
 * @description hide password content with '*'
 * @param {object} bodyData
 * @returns bodyData with formatted 'password'
 */
export const hidePassword = <T extends Object>(bodyData: T): T => {
  if (bodyData.hasOwnProperty("password")) {
    // @ts-ignore
    bodyData.password = "********";
  }
  if (bodyData.hasOwnProperty("panel_id")) {
    // @ts-ignore
    bodyData.panel_id = "********";
  }

  return bodyData;
};
