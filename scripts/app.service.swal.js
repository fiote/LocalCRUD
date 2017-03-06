window.myApp.service('$swal', function() {
	
	this.confirm = function(customTitle,customMsg,callback) {
		swal({
			title: customTitle || "Are you sure?",
			text: customMsg || "There is no going back!",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes!",
			cancelButtonText: "No...",
			closeOnConfirm: false,
			closeOnCancel: false
		}, function(flag) {
			if (flag) callback();
			swal.close();
		});
	};

});