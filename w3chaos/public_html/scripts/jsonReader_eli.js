var app = angular.module("jsonReader", []);

app.controller("PowerSupply", function($scope, $http) {
  
        
        // Get data values
        $http.get("data/temps-data_eli.json").success(function(response)
            {$scope.names = response.attribute_value_descriptions;});
});