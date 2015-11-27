var app = angular.module("jsonReader", []);

app.controller("TempsCtrl", function($scope, $http) {
    // Get data definitions
    $http.get("data/temps-def.json").
      success(function(def, status, headers, config) {
        console.log("Success on JSON data definitions request");
        
        // Get data values
        $http.get("data/temps-data.json").
          success(function(data, status, headers, config) {
          console.log("Success on JSON data values request");
          // Get the array content
          $scope.temps = data[def.arrayName];
          }).
          error(function(data, status, headers, config) {
            // log error
            console.log("Error on JSON data values request");
          });
      }).
      error(function(data, status, headers, config) {
        // log error
        console.log("Error on JSON data definitions request");
      });
});