import { getCookie } from "cookies-next";
import { xorDecode, xorEncode } from "./simpleObfuscator";

export const IndexDbIdEncoder = async (id: string): Promise<string> => {
  const usid = await getCookie("usid");
  const decodedUsid = usid && xorDecode(decodeURIComponent(usid));
  const d = decodedUsid
    ? `${id}|ebextractor|${decodedUsid}`
    : `${id}|ebextractor|GUEST`;
  return xorEncode(d);
};
export const IndexDbIdDecoder = async (
  id: string,
): Promise<{ full: string; id: string }> => {
  const d = {
    full: xorDecode(id),
    id: xorDecode(id).split("|ebextractor|")[0],
  };
  return d;
};
