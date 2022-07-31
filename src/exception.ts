export class TRExceptions {
  public static get notDefinedOutputError() {
    return new Error("`output` column not defined.");
  }
  public static get duplicatedOutputError() {
    return new Error("multiple `output` column defined.");
  }
  public static get notCoveredConditionError() {
    return new Error("Not covered conditions.");
  }
  public static get notMatchedColumnCountError() {
    return new Error("Columns count not matched.");
  }
  public static get duplicatedConditionError() {
    return new Error("Duplicated conditions defined.");
  }
  public static get notCalledAsTaggedError() {
    return new Error("Not called as template tagged literal.");
  }
}
