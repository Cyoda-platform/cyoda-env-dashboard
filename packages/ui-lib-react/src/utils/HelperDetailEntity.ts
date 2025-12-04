/**
 * Helper for Entity Detail operations
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperDetailEntity.ts
 */

import { HelperFormat } from './HelperFormat';
import type { Entity } from '@cyoda/http-api-react';

export default class HelperDetailEntity {
  /**
   * Filter data by 'presented' field and apply sorting
   */
  public static filterData(datas: Entity[]): Entity[] {
    const dataFiltered = datas.filter((el) => {
      const hasPresented = 'presented' in el;
      const presentedValue = (el as any).presented;
      return hasPresented ? presentedValue : true;
    });
    return this.applySorting(dataFiltered);
  }

  /**
   * Sort entities: LEAF with short values first, then LEAF with long values, then non-LEAF
   */
  public static applySorting(data: Entity[]): Entity[] {
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

