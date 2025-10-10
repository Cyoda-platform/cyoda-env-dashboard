import ScriptTransformer from "./ScriptTransformer.mjs";
import ImportTransformer from "./ImportTransformer.mjs";
import ComponentTransformer from "./ComponentTransformer.mjs";

export default [
  ...ScriptTransformer,
  ...ImportTransformer,
  ...ComponentTransformer,
]
