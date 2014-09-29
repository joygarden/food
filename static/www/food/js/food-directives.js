/**
 * Created by liaozhisong on 9/23/14.
 */



angular.module('foodDirectives', [])
    .controller('DataController', function (Food, $scope) {
        $scope.curFood = {pregnant:{}};
        $scope.panel = 0;
        $scope.category = '粮食加工篇';
        var promise = Food.query(); // 同步调用，获得承诺接口
        promise.then(function (data) {  // 调用承诺API获取数据 .resolve
            $scope.categories = data.categories;
        }, function (data) {  // 处理错误 .reject
            $scope.categories = {error: '查询失败！'};
        });
        Food.list($scope.category).then(function (data) {
            $scope.foods = data.foods;
        });
    })
    .directive('foodCategories', function () {
        return {
            restrict: 'E',
            controller: function (Food, $scope) {
                $scope.setCategory = function (category) {
                    $scope.panel = 0;
                    $scope.category = category;
                    Food.list($scope.category).then(function (data) {
                        $scope.foods = data.foods;
                    });
                };
                $scope.isSet = function (category) {
                    return $scope.category == category;
                };
            },
            templateUrl: "www/food/partials/food-categories.html"
        };
    })
    .directive('foodList', function () {
        return {
            restrict: 'E',
            controller: function (Food, $scope) {
                $scope.findFood = function (name) {
                    $scope.panel = 1;
                    Food.find(name).then(function (data) {
                        $scope.curFood = data.food;
                    });
                };
            },
            templateUrl: "www/food/partials/food-list.html"
        };
    })
    .directive('foodDetail', function () {
        return {
            restrict: 'E',
            templateUrl: "www/food/partials/food-detail.html"
        };
    });