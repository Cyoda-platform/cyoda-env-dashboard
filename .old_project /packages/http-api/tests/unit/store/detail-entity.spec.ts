import detailEntity, {useDetailEntityStore} from "../../../src/stores/detail-entity";
import {createPinia, setActivePinia} from "pinia";

describe('appModule', () => {
  let detailEntityStore;

  beforeEach(() => {
    setActivePinia(createPinia())
    detailEntityStore = useDetailEntityStore();
    detailEntityStore.clearAddEditableItem();
  });

  it('should add an editable item to the state', () => {
    detailEntityStore.addEditableItem({columnPath: 'column1', value: 'new value'});

    expect(detailEntityStore.changedFields).toEqual([{columnPath: 'column1', value: 'new value'}]);
  });

  it('should not add duplicate editable items to the state', () => {
    const data = {columnPath: 'column1', value: 'new value'};
    detailEntityStore.addEditableItem(data);
    detailEntityStore.addEditableItem(data);

    expect(detailEntityStore.changedFields).toEqual([data]);
  });

  it('should clear editable items from the state', () => {
    detailEntityStore.addEditableItem({columnPath: 'column1', value: 'new value'});
    detailEntityStore.clearAddEditableItem();

    expect(detailEntityStore.changedFields).toEqual([]);
  });
});
