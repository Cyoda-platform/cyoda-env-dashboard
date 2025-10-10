import type { AliasDef, CatalogItem } from "@cyoda/ui-lib/src/types/types";

interface CyodaModellingPopUpAliasTableTableDataRow {
  item: AliasDef;
  isDisableSelect: boolean;
  name: string;
  paths: Array<{
    path: string;
    mapperClass: string;
    mapperParameters: string | undefined;
  }>;
}

interface CyodaModellingPopUpAliasTableDataRow {
  item: CatalogItem;
  name: string;
  // alias?: AliasDef;
  paths: Array<{
    path: string;
    mapperClass: string;
    mapperParameters: string | undefined;
  }>;
}

interface CyodaModellingAliasesTableDataRow {
  name: string;
  alias: AliasDef;
  paths: Array<{
    path: string;
    mapperClass: string;
    mapperParameters: string | undefined;
  }>;
}
