import { getUid, setUid } from "../../../../src/helpers/HelperEntityMappingConfigId";

describe('UID Functions', () => {
  beforeEach(() => {
    setUid(1);
  });

  it('should return incremented uid', () => {
    const result1 = getUid();
    const result2 = getUid();

    expect(result1).toEqual(2);
    expect(result2).toEqual(3);
  });

  it('should set uid to the provided value', () => {
    setUid(10);
    const result = getUid();

    expect(result).toEqual(11);
  });
});
