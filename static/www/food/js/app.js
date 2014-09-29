/**
 * Created by liaozhisong on 9/22/14.
 */
var app = angular.module('index',['foodControllers','foodServices','foodDirectives']);

//app.config(['$routeProvider',
//    function($routeProvider) {
//        $routeProvider.
//            when('/:category', {
//                templateUrl: 'www/food/partials/food-index.html'
//            }).
//            when('/phones/:name', {
//                templateUrl: 'www/partials/food-detail.html',
//                controller: 'PhoneDetailCtrl'
//            }).
//            otherwise({
//                redirectTo: '/粮食加工篇'
//            });
//    }]);

app.filter('replaceSp', function() {
    return function(val){
        return val.replace(new RegExp("/","gm"),"-");
    };
});