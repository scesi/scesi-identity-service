export interface IActionBase<PayloadDTO, Result> {
  execute(payload: PayloadDTO): Promise<Result>;
}
