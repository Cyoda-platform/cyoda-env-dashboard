import HelperFormat from '../helpers/HelperFormat';
import {Entity} from '../types/types';

export default class HelperDetailEntity {
  public static filterData(datas: Entity[]) {
    const dataFiltered = datas.filter((el) => {
      if ('presented' in el) {
        return el.presented;
      }
      return true;
    })
    return this.applySorting(dataFiltered);
  }

  public static applySorting(data: Entity[]) {
    const dataLeafShort = data.filter((el) => {
      return el.type === 'LEAF' && HelperFormat.isShortDetailTreeItem(el.value);
    });

    const dataLeafLong = data.filter((el) => {
      return el.type === 'LEAF' && !HelperFormat.isShortDetailTreeItem(el.value);
    });
    const dataNotLeaf: Entity[] = [];
    const dataLeafShortLong = [...dataLeafShort, ...dataLeafLong];
    data.forEach((el) => {
      if (dataLeafShortLong.indexOf(el) === -1) {
        dataNotLeaf.push(el);
      }
    });
    return [...dataLeafShort, ...dataLeafLong, ...dataNotLeaf];
  }
}
