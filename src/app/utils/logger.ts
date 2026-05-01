import kunsul from "kunsul";

export const logger = {
  debug: kunsul.createLogger({ KUNSUL_OPTIONS: { prefix: "DEBUG-EBEXTRACTOR" } }),
};
