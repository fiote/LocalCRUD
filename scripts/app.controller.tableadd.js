window.myApp.controller('tableAddController',function($scope,$timeout,$database,$routeParams) {
	var name = $routeParams.name;
	
	this.mode = (name) ? 'edit' : 'add';
	this.origName = name || '';

	this.fieldTypes = [
		{'code':'string','label':'String'},
		{'code':'int','label':'Integer'},
		{'code':'money','label':'Money'},
		{'code':'date','label':'Date'},
		{'code':'flag','label':'Flag (Y/N)'}
	];

	this.tempName = this.origName;

	this.tempfields = [];

	if (this.origName) {
		var t = $database.getTableByName(this.origName);
		this.tempfields = JSON.parse(JSON.stringify(t.fields));
	}

	this.addField = function() {
		this.tempfields.push({'type':'string'});
	};

	this.removeField = function(index) {
		this.tempfields.splice(index,1);
		this.forceOneField();
	};

	this.forceOneField = function() {
		if (!this.tempfields.length) this.addField();
	};

	this.canMove = function(index,dir) {
		var index2 = index+dir;
		if (index2 < 0) return false;
		if (index2 > this.tempfields.length-1) return false;
		return index2;		
	}

	this.moveField = function(index,dir) {
		var index2 = this.canMove(index,dir);
		if (index2 === false) return;
		
		var f1 = this.tempfields[index];
		var f2 = this.tempfields[index2];
		this.tempfields[index] = f2;
		this.tempfields[index2] = f1;
	};

	this.keyPress = function(index,event) {
		if (event.keyCode == 13) {
			if (index >= 0) {
				if (index == this.tempfields.length-1) this.addField();
				this.focusField(index+1);
			} else {
				this.saveTable();
			}
		}
	};

	this.focusField = function(index) {
		$timeout(function() {
			$('tr[row-index='+index+'] input[name="name"]').focus();
		},100);
	};

	this.saveTable = function() {		
		var ret = $database.saveTable(this.tempName,this.tempfields,this.origName);
		if (ret.status) {
			var word = (this.origName) ? 'updated' : 'created';
			return swal({title:'Nice!',text:'Table '+word+' successfully!',type:'success'},function() { location.href = '/#!/tableView/'+ret.name; });			
		} else {
			if (ret.error == 'need_name') {
				$('input[name=table-name]').focus();
				return swal({title:'Ops!',text:'You must provide a name for the table.',type:'error'});			
			}
			if (ret.error == 'need_fields') {
				this.forceOneField();
				return swal({title:'Ops!',text:'You must add a least one field.',type:'error'},function() { this.focusField(0); }.bind(this));
			}
			if (ret.error == 'table_exists') {
				$('input[name=table-name]').focus();
				return swal({title:'Ops!',text:'There is already a table with that name.',type:'error'});							
			}
			if (ret.error == 'pk_used') {
				return swal({title:'Ops!',text:'-PK- is reserved name and can not be used as a column.',type:'error'});					
			}
		}
	};

	this.forceOneField();
});