import Token from "@/models/token";

export async function authenticator(token) {
  var response = null;
  try {
    if (token === process.env.SYSTEM_BEARER_TOKEN) {
      response = true;
    } else {
      const result = await Token.findOne({ bearer_token: token });
      result === null ? (response = false) : (response = true);
    }
  } catch (error) {
    response = false;
  }
  return response;
}
