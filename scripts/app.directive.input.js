window.myApp.directive('directiveInput', function($timeout) {
	return {
    	templateUrl:'directives/input.html',
        scope: {field:'=field', ctrl:'=ctrl', addclass:'=addclass'},
    	link: function(scope, element, attr) {
    		$timeout(function() {
    			var $dir = $(element);
        		$dir.find('.isInt').mask('#');
				$dir.find('.isMoney').mask("#,##0.00",{reverse:true});    			
                $dir.find('.isDate').mask("00/00/0000", {clearIfNotMatch: true});
    		});
        },
    	///controller: 'navbarController as NBctrl'
  	};
});