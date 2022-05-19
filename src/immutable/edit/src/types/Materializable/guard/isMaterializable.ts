import { Materializable } from "..";
import { MATERIALIZE_PROXY } from "../../../symbol/MATERIALIZE_PROXY";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMaterializable(v: any): v is Materializable<any> {
  return typeof v === "object" && MATERIALIZE_PROXY in v;
}
