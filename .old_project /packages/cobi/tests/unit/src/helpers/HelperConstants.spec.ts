import HelperConstants from "../../../../src/helpers/HelperConstants";

describe('HelperConstants', () => {
  it('should have defined constants', () => {
    expect(HelperConstants.LOGIN).toBeDefined();
    expect(HelperConstants.LOGOUT).toBeDefined();
    expect(HelperConstants.NEWTASKS).toBeDefined();
    expect(HelperConstants.MAX_FILE_SIZE_KB).toBeDefined();
    expect(HelperConstants.MIN_FILE_SIZE_FOR_EDIT_KB).toBeDefined();
  });

  describe('getDataSourceConfigDialogRequestKey', () => {
    it('should generate the correct key', () => {
      const id = '123';
      const expectedKey = `data-source-config-dialog-request:${id}`;
      const generatedKey = HelperConstants.getDataSourceConfigDialogRequestKey(id);

      expect(generatedKey).toBe(expectedKey);
    });
  });
});
