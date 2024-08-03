const ANIMATION_SPEED = 100;

var calc = new StatCalculator();

$(document).ready(function() {
	
	calc = new StatCalculator();
	db.character.kamui.initialize($("#boon-select").val(), $("#bane-select").val());
	for (var i=1; i<=20; i++)
	$("#base-select").prop("disabled", true).empty().append($("<option/>").text("Select a base"));
	resetPanel();
	
	var unitList = {};
	for (var unit in db.character) {
		if (!unitList[db.character[unit].route])
			unitList[db.character[unit].route] = [];
		unitList[db.character[unit].route].push(unit);
	}
	
	for (var route in unitList) {
		var unitSelect = $("#unit-select");
		unitSelect.append($("<option>").text("---" + route + "---").prop("disabled", true));
		for (var i=0; i<unitList[route].length; i++)
			unitSelect.append($("<option>").val(unitList[route][i]).text(db.character[unitList[route][i]].name));
	}
	
	$("#boon-select").change(function() {
		$("option.bane").prop("disabled", false);
		$("select option.bane[value=" + this.value + "]").prop("disabled", true);
		db.character.kamui.initialize($("#boon-select").val(), $("#bane-select").val());
		updateTable();
	});
	
	$("#bane-select").change(function() {
		$("option.boon").prop("disabled", false);
		$("select option.boon[value=" + this.value + "]").prop("disabled", true);
		db.character.kamui.initialize($("#boon-select").val(), $("#bane-select").val());
		updateTable();
	});
	
	$("#extra-select").change(function() {
		calc.extraLevel = parseInt(this.value);
		calc.resetClassChange();
		updateLevelSelect();
		updateTable();
	});
	
	$("input[name=aptitude]").change(function() {
		calc.setAptitude($("input[name=aptitude]").prop("checked"));
		updateTable();
	})
	
	$("#unit-select").change(function() {
		$("#table-div").empty();
		toggleAvatarCustomization();
		toggleAptitude();
		if (this.value != "none") {
			var base = updateBaseSelection(this.value);
			var parentList = db.character[this.value].getParentList();
			updateParentList(parentList);
			updateGrandparentList();
			if (!parentList) {
				calc.setCharacter(this.value, base);
				updateLevelSelect();
				updateTable();
			}else
				resetPanel();
		}else {
			$("#base-select").prop("disabled", true).empty().append($("<option/>").text("Select a base"));
			resetPanel();
		}
	});
	
	$("#parent-select").change(function() {
		$("#table-div").empty();
		toggleAvatarCustomization();
		if (this.value != "none") {
			var grandparentList = db.character[this.value].getParentList();
			updateGrandparentList(grandparentList);
			if (!grandparentList) {
				var unit = $("#unit-select").val();
				var base = $("#base-select").val();
				db.character[unit].setParent(db.character[this.value]);
				calc.setCharacter(unit, base);
				updateLevelSelect();
				updateTable();
			}
		}
	});
	
	$("#grandparent-select").change(function() {
		$("#table-div").empty();
		if (this.value != "none") {
			var unit = $("#unit-select").val();
			var parent = $("#parent-select").val();
			var base = $("#base-select").val();
			db.character[parent].setParent(db.character[this.value]);
			db.character[unit].setParent(db.character[parent]);
			calc.setCharacter(unit, base);
			updateLevelSelect();
			updateTable();
		}
	});
	
	$("#base-select").change(function() {
		$("#reset").attr("disabled", true);
		calc.baseSet = this.value;
		calc.resetClassChange();
		updateLevelSelect();
		updateTable();
	});
	
	$("#level-change-select").change(function() {
		$("#add-seal").attr("disabled", false);
		var classSelect = $("#class-change-select").prop("disabled", false).empty();
		var classSet = calc.getAvaiableClassChange(this.value);
		
		if (classSet.masterSeal) {
			classSelect.append($("<option/>").text("-----Master Seal-----").prop("disabled", true));
			for (var c in classSet.masterSeal)
				classSelect.append($("<option/>", {
					text	: db.classes[c].name,
					value	: c,
				}))
		}
		
		classSelect.append($("<option/>").text("---Friendship/Partner Seal---").prop("disabled", true));
			for (var c in classSet.parallelSeal)
				classSelect.append($("<option/>", {
					text	: db.classes[c].name,
					value	: c,
				}))
	});
	
	$("#add-seal").click(function(evt) {
		$("#add-seal").attr("disabled", true);
		$("#reset").attr("disabled", false);
		calc.addClassChange($("#level-change-select").val(), $("#class-change-select").val());
		updateLevelSelect();
		updateTable();
	});
	
	$("#reset").click(function(evt) {
		$("#reset").attr("disabled", true);
		calc.resetClassChange();
		updateLevelSelect();
		updateTable();
	});
	
	function resetPanel() {
		$("#level-change-select").prop("disabled", true).empty().append($("<option/>").text("Select a level"));
		$("#class-change-select").prop("disabled", true).empty().append($("<option/>").text("Select a class"));
		$("#add-seal").attr("disabled", true);
		$("#reset").attr("disabled", true);
	}
	
	function toggleAvatarCustomization() {
		if ($("#unit-select").val() == "kamui" || $("#unit-select").val() == "kanna" || $("#parent-select").val() == "kamui")
			$("#avatar-custom").show(ANIMATION_SPEED);
		else
			$("#avatar-custom").hide(ANIMATION_SPEED);
	}
	
	function toggleAptitude() {
		var unit = $("#unit-select").val();
		if (unit == "mozume" || (db.character[unit] && (db.character[unit].gen == "child" || db.character[unit].gen == "avatarChild")))
			$("#aptitude-check").show(ANIMATION_SPEED);
		else
			$("#aptitude-check").hide(ANIMATION_SPEED);
	}
	
	function updateBaseSelection(ch) {
		var baseSelection = $("#base-select").empty().prop("disabled", false);
		
		var character = db.character[ch];
		var baseList = [];
		for (var key in character.base)
			baseList.push(key);
		
		for (var i=0; i<baseList.length; i++) {
			baseSelection.append($("<option/>", {
				text	: baseList[i],
				value	: baseList[i],
			}))
		}
		
		// Assume there is at least 1 base
		return baseList[0];
	}
	
	function updateParentList(list) {
		if (list) {
			$("#child-custom").show(ANIMATION_SPEED);
			var parentSelect = $("#parent-select").empty().append($("<option>").text("Select parent").val("none").prop("disabled", true));
			for (var i=0; i<list.length; i++)
				parentSelect.append($("<option>").val(list[i]).text(db.character[list[i]].name));
			parentSelect.val("none");
		}else
			$("#child-custom").hide(ANIMATION_SPEED);
	}
	
	function updateGrandparentList(list) {
		if (list) {
			var parentSelect = $("#grandparent-select").show(ANIMATION_SPEED).empty().append($("<option>").text("Select grandparent").val("none").prop("disabled", true));
			for (var i=0; i<list.length; i++)
				if (list[i] != "kamui")
					parentSelect.append($("<option>").val(list[i]).text(db.character[list[i]].name));
			parentSelect.val("none");
		}else
			$("#grandparent-select").hide(ANIMATION_SPEED);
	}
	
	function updateLevelSelect() {
		$("#class-change-select").prop("disabled", true).empty().append($("<option/>").text("Select a class"));
		var selectLevel = $("#level-change-select").prop("disabled", false).empty();
		selectLevel.append($("<option>").text("Select a level").val("none").prop("disabled", true));
		if ($("#unit-select").val() != "none") {
			var levelRange = calc.getAvailableLevelRange();
			for (var i=0; i<levelRange.length; i++)
				selectLevel.append($("<option>").text(levelRange[i]));
		}
		selectLevel.val("none");
	}
	
	function updateTable() {
		var levelList = calc.compute();
		$("#table-div").empty();
		
		var table = $("<table/>").addClass("table table-striped table-hover table-condensed").attr("style", "width: 500px");
	
		// Headings
		var headerRow = $("<tr/>");
		headerRow.append($("<th/>").text("Level"));
		for (var attr in levelList[0][0].stat)
			headerRow.append($("<th/>").text(attr));
		table.append($("<thead/>").append(headerRow));
		
		var tableBody = $("<tbody/>");
		for (var i = 0; i < levelList.length; i++) {
			var header = $("<tr/>").append($("<th/>").text(levelList[i][0].unitClass.name).attr("colspan", 9));
			tableBody.append(header);
			
			// Data
			for (var j = 0; j < levelList[i].length; j++) {
				var row = $("<tr/>");
				row.append($("<td/>").text(levelList[i][j].displayedLevel));
				for (var attr in levelList[i][j].stat) {
					var val = levelList[i][j].stat[attr];
					var cell;
					if (val >= levelList[i][j].statCap[attr]) {
						val = levelList[i][j].statCap[attr];
						cell = $("<td/>").text(val.toFixed(0)).css({ 'font-weight': 'bold' });
					} else
						cell = $("<td/>").text(val);
					row.append(cell);
				}
				tableBody.append(row);
			}
			// Cap
			var capRow = $("<tr/>");
			capRow.append($("<td/>").append($("<span/>").addClass("cap-td").text("Cap")));
			for (var attr in levelList[i][0].statCap)
				capRow.append($("<td/>").append($("<span/>").addClass("cap-td").text(levelList[i][0].statCap[attr])));
			tableBody.append(capRow);
			
			// Growths
			var growthRow = $("<tr/>");
			growthRow.append($("<td/>").append($("<span/>").addClass("growth-td").text("Grw")));
			for (var attr in db.character.kamui.finalGrowths)
				growthRow.append($("<td/>").append($("<span/>").addClass("growth-td").text(db.character.kamui.finalGrowths[attr] + "%")));
			tableBody.append(growthRow);
		}
	
		// Append table to div
		$("#table-div").append(table.append(tableBody));
	
		// Adjust the CSS for the table container
		$("#table-div").css({
			'height': '100%',       // Use full available height
			'overflow-y': 'auto',   // Enable vertical scrolling if content exceeds the height
			'overflow-x': 'hidden', // Prevent horizontal scrolling
		});
	}
	
});

									 
