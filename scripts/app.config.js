window.myApp = angular.module("myApp", ["ngRoute"]);

window.myApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "templates/main.html"
    })
    .when("/tableAdd/:name?", {
        templateUrl : "templates/table-add.html",
        controller: "tableAddController as TActrl"
    })
    .when("/tableList", {
        templateUrl : "templates/table-list.html",
        controller: "tableListController as TLctrl"
    })
    .when("/tableView/:name", {
        templateUrl: "templates/table-view.html",
        controller: "tableViewController as TVctrl"
    })
    .otherwise({
        templateUrl: "templates/404.html"
    })
});
