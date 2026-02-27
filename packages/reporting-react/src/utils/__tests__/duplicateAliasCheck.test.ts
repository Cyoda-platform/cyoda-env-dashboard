/**
 * Test for duplicate alias name validation logic
 * This matches the logic from Vue ConfigEditorAlertAliasSameName.vue
 */

describe('Duplicate Alias Name Check', () => {
  it('should detect when alias name matches column fullPath', () => {
    const configDefinition = {
      colDefs: [
        { fullPath: 'creationDate', alias: 'creationDate' },
        { fullPath: 'status', alias: 'status' },
      ],
      aliasDefs: [
        { name: 'creationDate', paths: ['someOtherPath'] },
      ],
    };

    const columns = (configDefinition.colDefs || []).map((el: any) => el.fullPath);
    const aliasDefs = configDefinition.aliasDefs || [];
    const duplicateAliasNames = aliasDefs
      .filter((el: any) => columns.includes(el.name))
      .map((el: any) => el.name);

    expect(duplicateAliasNames).toEqual(['creationDate']);
    expect(duplicateAliasNames.length > 0).toBe(true);
  });

  it('should NOT detect duplicates when alias name does not match any column fullPath', () => {
    const configDefinition = {
      colDefs: [
        { fullPath: 'creationDate', alias: 'creationDate' },
        { fullPath: 'status', alias: 'status' },
      ],
      aliasDefs: [
        { name: 'customAlias', paths: ['someOtherPath'] },
      ],
    };

    const columns = (configDefinition.colDefs || []).map((el: any) => el.fullPath);
    const aliasDefs = configDefinition.aliasDefs || [];
    const duplicateAliasNames = aliasDefs
      .filter((el: any) => columns.includes(el.name))
      .map((el: any) => el.name);

    expect(duplicateAliasNames).toEqual([]);
    expect(duplicateAliasNames.length > 0).toBe(false);
  });

  it('should NOT detect duplicates when aliasDefs is empty', () => {
    const configDefinition = {
      colDefs: [
        { fullPath: 'creationDate', alias: 'creationDate' },
      ],
      aliasDefs: [],
    };

    const columns = (configDefinition.colDefs || []).map((el: any) => el.fullPath);
    const aliasDefs = configDefinition.aliasDefs || [];
    const duplicateAliasNames = aliasDefs
      .filter((el: any) => columns.includes(el.name))
      .map((el: any) => el.name);

    expect(duplicateAliasNames).toEqual([]);
    expect(duplicateAliasNames.length > 0).toBe(false);
  });

  it('should detect multiple duplicates', () => {
    const configDefinition = {
      colDefs: [
        { fullPath: 'creationDate', alias: 'creationDate' },
        { fullPath: 'status', alias: 'status' },
        { fullPath: 'owner', alias: 'owner' },
      ],
      aliasDefs: [
        { name: 'creationDate', paths: ['path1'] },
        { name: 'status', paths: ['path2'] },
        { name: 'customAlias', paths: ['path3'] },
      ],
    };

    const columns = (configDefinition.colDefs || []).map((el: any) => el.fullPath);
    const aliasDefs = configDefinition.aliasDefs || [];
    const duplicateAliasNames = aliasDefs
      .filter((el: any) => columns.includes(el.name))
      .map((el: any) => el.name);

    expect(duplicateAliasNames).toEqual(['creationDate', 'status']);
    expect(duplicateAliasNames.length > 0).toBe(true);
  });
});

