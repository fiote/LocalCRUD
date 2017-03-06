window.myApp.controller('tableListController',function($scope,$database) {

	this.db = $database;

	this.favChange = function($event) {
		console.log('a fav changed');
		$database.storeTables();
	}
});