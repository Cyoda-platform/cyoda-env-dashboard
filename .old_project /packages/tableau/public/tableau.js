(function () {
  // Create the connector object
  const myConnector = tableau.makeConnector();

  // Define the schema
  myConnector.getSchema = function (schemaCallback) {
    const { tableauColumns, tableauTableAlias } = JSON.parse(
      tableau.connectionData
    );
    const tableInfo = {
      id: "cyoda",
      alias: tableauTableAlias,
      columns: tableauColumns,
    };

    schemaCallback([tableInfo]);
  };

  // Download the data
  myConnector.getData = function (table, doneCallback) {
    const { tableauData } = JSON.parse(tableau.connectionData);
    table.appendRows(tableauData);
    doneCallback();
  };

  tableau.registerConnector(myConnector);
})();
