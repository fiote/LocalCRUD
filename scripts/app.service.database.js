window.myApp.service('$database', function($rootScope,$format) {
	
	var data = localStorage.getItem('acrud-tables');
	this.tables = (data) ? JSON.parse(data) : [];
    this.tables.sort(function(a,b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : +1; });
    
    this.tables.forEach(function(t) { 
    	delete t.$$hashKey; 
    	t.rows.forEach(function(r) { delete r.$$hashKey; });
    });

	this.getTableByName = function(name) {
		for (var i = 0; i < this.tables.length; i++) {
			var t = this.tables[i];
			if (t.name == name) return this.fixTable(t);
		}
	};

	this.fixTable = function(table) {
		var oFields = {};
		table.fields.forEach(function(f) {
			var k = f.type.charAt(0).toUpperCase() + f.type.slice(1).toLowerCase();		
			oFields[f.name] = f;						
			f['is'+k] = true;

			if (f.isString || f.isInt || f.isMoney || f.isDate) f.tag = 'input';
			if (f.isFlag) f.tag = 'checkbox';
		});
		table.rows.forEach(function(r) {
			for (atr in r) {
				var v = r[atr];
				var f = oFields[atr];
				if (f) {
					if (f.isMoney) v = $format.asMoney(v);
					if (f.isFlag) v = $format.asFlag(v);
					r['_'+atr] = v;
				}
			}
		});
		return table;
	};

	this.saveTable = function(name,fields,origName) {
		name = (name) ? name.trim() : '';
		if (!name) return {'status':0,'error':'need_name'};

		var pkname = false;

		fields = fields.filter(function(f) { 
			var name = (f.name) ? f.name.trim() : '';
			if (name.toLowerCase() == 'pk') pkname = true;
			if (name) return true;
		});

		if (pkname) return {'status':0,'error':'pk_used'};

		if (!fields.length) return {'status':0,'error':'need_fields'};

		var t = this.getTableByName(name);
		if (t && name != origName) return {'status':0,'error':'table_exists'};

		if (origName) {
			t = this.getTableByName(origName);
			t.name = name;

			var all = {};
			var oFields = {};
			
			t.fields.forEach(function(f,i) {
				if (!f.name) return;
				if (!all[f.name]) all[f.name] = {before:-1,after:-1};
				if (!oFields[f.name]) { f.index = i;  oFields[f.name] = f; }
				all[f.name].before = i;
			});

			fields.forEach(function(f,i) { 
				if (!f.name) return;
				if (!all[f.name]) all[f.name] = {before:-1,after:-1};
				if (!oFields[f.name]) { f.index = i; oFields[f.name] = f; }
				all[f.name].after = i;
			});

			var removed = [];
			var included = [];

			for (var fname in all) {
				var flags = all[fname];
				if (flags.before >= 0 && flags.after < 0) removed.push(oFields[fname]);
				if (flags.before < 0 && flags.after >= 0) included.push(oFields[fname]);
			}

			included.forEach(function(fi) {
				removed.forEach(function(fr) {
					if (fr.index == fi.index && (fr.type == fi.type || fi.type == 'string')) {
						t.rows.forEach(function(r) {
							r[fi.name] = r[fr.name];
							delete r[fr.name];
						})
					}
				})
			});

			t.fields = fields;
		} else {
			this.tables.push({'name':name,'fields':fields,'rows':[]});
		}

		this.storeTables();		
		return {'status':1,'name':name};
	};

	this.saveRow = function(name,row) {
		var table = this.getTableByName(name);

		var duplicated = null;
		var existing = (row.pk) ? true : false;
		
		table.fields.forEach(function(f) {
			
			var v = row[f.name];
			if (f.type == 'int') v = parseInt(v.toString().replace(/\D/g,''));
			if (f.type == 'money') v = parseFloat(v.toString().replace(/[^0-9.]+/g,''));
			if (f.type == 'string') v = (v) ? v.toString().trim() : '';
			row[f.name] = v;

			if (f.unique) {
				table.rows.forEach(function(r) {
					if (r[f.name] == v) duplicated = f.name;
				});
			}
		});

		if (duplicated) return {'status':0,'error':'duplicated','field':duplicated};

		if (!row.pk) {
			var pkmax = 0;
			table.rows.forEach(function(r) { if (r.pk > pkmax) pkmax = r.pk; });
			row.pk = pkmax+1;
			table.rows.push(row);
		} 
		this.storeTables();

		return {'status':1};
	};

	this.deleteRow = function(name,index) {
		var table = this.getTableByName(name);
		table.rows.splice(index,1);
		this.storeTables();
	};

	this.storeTables = function() {
		localStorage.setItem('acrud-tables',JSON.stringify(this.tables));
		$rootScope.$emit('tables-changed');
	};

	this.getNextRowField = function(name,row,field) {
		if (!field) return {};
		
		var table = this.getTableByName(name);
		var nextfid = null;

		for (var i = 0; i < table.fields.length; i++) {
			var f = table.fields[i];
			if (f.name == field.name) nextfid = i+1;
		}
		if (nextfid !== null) {
			if (nextfid >= table.fields.length) {
				var index = table.rows.indexOf(row);
				row = table.rows[index+1];
				nextfid = 0;
			}
			if (row) field = table.fields[nextfid];
		}

		return {'row':row,'field':field};
	};

	this.emptyTable = function(name) {
		var table = this.getTableByName(name);
		table.rows = [];			
		this.storeTables();
	};

	this.deleteTable = function(name) {
		var table = this.getTableByName(name);
		var index = this.tables.indexOf(table);

		if (index >= 0) {
			this.tables.splice(index,1);
			this.storeTables();
			location.href = '/#!/';
		}
	};
	
	this.dropAll = function() {
		this.tables = [];
		this.storeTables();
	};

});