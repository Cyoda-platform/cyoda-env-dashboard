/* tslint:disable */
export default class Instance {
  public name: string | string[] = '';
  public errorDesc='';
  public isSuccess: boolean | string='';
  public isSolveLoading=false;

  private _importFn: any = undefined;
  private _solveProblemFn: any = undefined;


  constructor(name: string | string[]) {
    this.name = name;
  }

  public setImport(importFn: any) {
    this._importFn = importFn;
    return this;
  }

  public setSolveProblemFn(solveProblemFn: any) {
    this._solveProblemFn = solveProblemFn;
    return this;
  }

  public async doImport() {
    try {
      await this._importFn();
      this.isSuccess=true;
    } catch (e) {
      this.isSuccess=false;
      this.errorDesc=e.response.data.message || 'Error when we try to do import';
    }
  }

  public async doSolveProblem(){
    try {
      this.isSolveLoading=true;
      const result=await this._solveProblemFn(this.errorDesc);
      if(result) {
        this.isSuccess = true;
      }
    } catch (e) {
      this.isSuccess=false;
      this.errorDesc=e.response.data.message;
    } finally {
      this.isSolveLoading=false;
    }
  }
}
