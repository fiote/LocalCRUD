window.myApp.controller('tableViewController',function($routeParams,$database,$swal,$timeout,$rootScope,$scope,$format) {
	var name = $routeParams.name;

	this.getTable = function() {
		this.table = $database.getTableByName(name);
		if (!this.table) return location.href = '/#!/TableNotFound';
		if ($scope && !$scope.$$phase) $scope.$apply();
	};

	this.row = {};

	this.editTable = function($event) {
		$($event.currentTarget).blur();		
		location.href = '/#!/tableAdd/'+name;
	};

	this.emptyTable = function($event) {	
		$($event.currentTarget).blur();
		$swal.confirm('Delete All Rows','Are you sure?',function() {
			$database.emptyTable(name);
		});
	};

	this.deleteTable = function($event) {		
		$($event.currentTarget).blur();
		$swal.confirm('Delete Table','Are you sure?',function() {
			$database.deleteTable(name);
		});
	};

	this.showAddRow = function($event,row) {
		this.row = row || {};
		$($event.currentTarget).blur();
		$('#modal-table').modal();
		$('#modal-table').modal('show');
	};

	this.saveRow = function() {
		var ret = $database.saveRow(name,this.row);
		if (ret.status) {
			$('#modal-table').modal('hide');
			this.getTable();
		} else {
			if (ret.error == 'duplicated') {
				$('#modal-table [placeholder="'+ret.field+'"]').focus();
				return swal({title:'Ops!',text:'There is already a row with this ['+ret.field+'].',type:'error'});
			}
		}
	};

	this.editCell = function(row,field,$event) {
		var $td = $($event.currentTarget);
		this.row = row;
		this.field = field;
		this.row.edit = field.name;
		this.refresh();
		setTimeout(function() { this.getCurrentInput().focus(); }.bind(this),10);
	};

	this.keyDown = function($event) {
		var row = this.row;
		var field = this.field;
		if ($event.keyCode == 13) this.blurInput($event);		
		if ($event.keyCode == 9) {
			setTimeout(function() {
				var next = $database.getNextRowField(name,row,field);
				if (next.row && next.field) this.editCell(next.row,next.field,$event);
			}.bind(this),100);

			return;
			this.ignoreNextBlur = true;
			var row = this.row;
			this.blurInput();
			this.blurInput($event);

		}
	};

	this.getCurrentInput = function() {
		return $('tr[row-pk='+this.row.pk+']').find('input:visible');
	}

	this.changeInput = function() {
		setTimeout(function() {
			var $input = this.getCurrentInput();
			$input.blur();
		}.bind(this),10);
	}

	this.blurInput = function($event) {
		console.log('BLUR');
		if (!this.row || !this.field) return;

		var $input = this.getCurrentInput();
		console.log($input.val(),$input.prop('checked'));

		if (this.field.tag == 'input') {
			var newvlr = $input.val();	
			if (this.field.isMoney) newvlr = parseFloat(newvlr.replace(/[^0-9.]/g,'')).toFixed(2);
		}
		if (this.field.tag == 'checkbox') {
			var newvlr = $input.prop('checked');
		}
	
		console.log(this.row.edit,newvlr);

		this.row[this.row.edit] = newvlr;

		if ($event && this.ignoreNextBlur) return this.ignoreNextBlur = false;
		if ($event) { this.row.edit = null; this.row = null; this.field = null; }

		this.refresh();
	};

	this.refresh = function() {
		$database.storeTables();
		this.getTable();	
		$timeout(function() { if ($scope && !$scope.$$phase) $scope.$apply(); });
	};

	this.isEdit = function(row,field) {
		return (this.row == row && this.row.edit == field.name);
	};

	this.deleteRow = function(index,$event) {
		$($event.currentTarget).blur();
		$swal.confirm('Delete Row','Are you sure?',function() {
			$database.deleteRow(name,index);		
			$timeout(function() {
				this.getTable();				
			}.bind(this));
		}.bind(this));
	};

	this.getTable();
});