import { v4 as uuidv4 } from "uuid";

export const generateTraceNumber = () => {
  const uuid = uuidv4();
  return uuid.toUpperCase().replace(/-/g, "");
};
