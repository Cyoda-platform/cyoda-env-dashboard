import HelperDictionary from "../../../../src/helpers/HelperDictionary";

describe('HelperDictionary', () => {
  it('should return label for valid key in statuses', () => {
    const key = 'Assigned';
    const expectedLabel = 'Assigned';

    const result = HelperDictionary.getLabel('statuses', key);

    expect(result).toEqual(expectedLabel);
  });

  it('should return empty string for invalid key in types', () => {
    const key = 10;

    const result = HelperDictionary.getLabel('types', key);

    expect(result).toEqual('');
  });

  it('should return label for valid key in priorities', () => {
    const key = 1;
    const expectedLabel = 'Amber';

    const result = HelperDictionary.getLabel('priorities', key);

    expect(result).toEqual(expectedLabel);
  });

  it('should return empty string for invalid dictionary name', () => {
    const key = 'SomeInvalidKey';

    const result = HelperDictionary.getLabel(key, 'SomeKey');

    expect(result).toEqual('');
  });

  it('should return collection element set mode config type options', () => {
    const expectedOptions = [
      { value: 'APPEND', label: 'Append' },
      { value: 'OVERRIDE', label: 'Override' },
      { value: 'REPLACE', label: 'Replace' },
    ];

    const result = HelperDictionary.collectionElementSetModeConfigTypeOptions();

    expect(result).toEqual(expectedOptions);
  });
});
