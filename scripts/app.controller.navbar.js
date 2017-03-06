window.myApp.controller('navbarController',function($scope,$rootScope,$timeout,$database,$swal) {    
	this.db = $database;

    this.clearTables = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$($event.currentTarget).blur();

		$swal.confirm('Delete ALL Tables','Are you sure?',function() {
			$database.dropAll();
			location.href = '/#!/';
		});
    };

    this.checkHelpers = function(url) {
    	if (!url) url = '';
    	$timeout(function() {
    		var $li = $('#li-table-add');
    		if (this.db.tables.length || url.indexOf('tableAdd') >= 0) {
				$li.tooltip('hide');
			} else {
				$li.tooltip({'placement':'left','title':'Click here to create a new table!','trigger':'manual'}).tooltip('show');
			}
		}.bind(this));
    };

	$scope.$on('$locationChangeStart', function($event,next) {    	
    	this.checkHelpers(next);
	}.bind(this));

    $rootScope.$on('tables-changed',function() {
    	this.checkHelpers();
		if ($scope && !$scope.$$phase) $scope.$apply();
    }.bind(this));

    this.checkHelpers(location.href);
});