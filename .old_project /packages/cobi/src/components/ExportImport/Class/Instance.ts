/* tslint:disable */
export default class Instance {
  public name: string | string[] = "";
  public errorDesc: string[] = [];
  public isSuccess: boolean | string = "";
  public isSolveLoading = false;

  private _importFn: any = undefined;
  private _solveProblemFn: any = undefined;
  private _solveProblemMessageFn: any = undefined;

  constructor(name: string | string[]) {
    this.name = name;
  }

  public setImportFn(importFn: any) {
    this._importFn = importFn;
    return this;
  }

  public setSolveProblemFn(solveProblemFn: any) {
    this._solveProblemFn = solveProblemFn;
    return this;
  }

  public setSolveProblemMessageFn(solveProblemMessageFn: any) {
    this._solveProblemMessageFn = solveProblemMessageFn;
    return this;
  }

  public getSolveProblemMessage() {
    return this._solveProblemMessageFn(this.errorDesc);
  }

  public async doImport() {
    try {
      const { data } = await this._importFn();
      if (data.success) {
        this.isSuccess = true;
      } else {
        this.isSuccess = false;
        this.errorDesc = data.errors;
      }
    } catch (e: any) {
      this.isSuccess = false;
      this.errorDesc = [e.response.data.message || "Error when we try to do import"];
    }
  }

  public async doSolveProblem() {
    try {
      this.isSolveLoading = true;
      const { data } = await this._solveProblemFn(this.errorDesc);
      if (data.success) {
        this.isSuccess = true;
      } else {
        this.isSuccess = false;
        this.errorDesc = data.errors;
      }
    } catch (e: any) {
      this.isSuccess = false;
      this.errorDesc = [e.response.data.message];
    } finally {
      this.isSolveLoading = false;
    }
  }
}
