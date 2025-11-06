// Initialize tableau connector when tableau object is available
(function () {
  // Wait for tableau object to be available
  function initTableauConnector() {
    if (typeof tableau === 'undefined') {
      // Tableau not loaded yet, wait for it
      setTimeout(initTableauConnector, 100);
      return;
    }

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
  }

  // Start initialization
  initTableauConnector();
})();
