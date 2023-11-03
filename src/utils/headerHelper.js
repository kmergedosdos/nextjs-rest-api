import { BEARER_HEADER } from "./constants";

export const headerHelper = (headerArr, type) => {
  var response = null;
  headerArr.forEach((element) => {
    switch (type) {
      case BEARER_HEADER:
        if (element.includes("Bearer")) {
          response = element.replace("Bearer ", "");
        }
        break;
      default:
        break;
    }
  });
  return response;
};
