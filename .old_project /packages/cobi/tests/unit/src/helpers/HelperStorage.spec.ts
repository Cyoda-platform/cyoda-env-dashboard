import HelperStorage from "../../../../src/helpers/HelperStorage";

describe('HelperStorage class', () => {
  let helperStorage;

  beforeEach(() => {
    helperStorage = HelperStorage.ints();
    window.localStorage.clear();
  });

  it('should set an item in local storage', () => {
    const itemName = 'testItem';
    const itemValue = { key: 'value' };
    helperStorage.set(itemName, itemValue);

    const storedValue = JSON.parse(window.localStorage.getItem(itemName));
    expect(storedValue).toEqual(itemValue);
  });

  it('should get an item from local storage', () => {
    const itemName = 'testItem';
    const itemValue = { key: 'value' };
    window.localStorage.setItem(itemName, JSON.stringify(itemValue));

    const retrievedValue = helperStorage.get(itemName);
    expect(retrievedValue).toEqual(itemValue);
  });

  it('should return default value if item does not exist in local storage', () => {
    const itemName = 'nonExistentItem';
    const defaultValue = 'default';

    const retrievedValue = helperStorage.get(itemName, defaultValue);
    expect(retrievedValue).toEqual(defaultValue);
  });

  it('should clear all items from local storage', () => {
    const item1 = 'item1';
    const item2 = 'item2';
    window.localStorage.setItem(item1, 'value1');
    window.localStorage.setItem(item2, 'value2');

    helperStorage.clear();

    expect(window.localStorage.getItem(item1)).toBeNull();
    expect(window.localStorage.getItem(item2)).toBeNull();
  });

  it('should delete a specific item from local storage', () => {
    const itemName = 'itemToDelete';
    window.localStorage.setItem(itemName, 'value');

    helperStorage.deleteByKey(itemName);

    expect(window.localStorage.getItem(itemName)).toBeNull();
  });
});
