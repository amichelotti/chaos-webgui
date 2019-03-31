var app = angular.module("jsonReader", []);

app.controller("TempsCtrl", function($scope, $http) {
    // Get data definitions
    
    $http.get("data/temps-data.json").success(function (response)
        {$scope.names = response.sensors;});
}  );
    
  