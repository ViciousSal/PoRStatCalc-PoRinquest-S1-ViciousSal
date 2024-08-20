var Stat = function(HP, Str, Mag, Skl, Spd, Lck, Def, Res) {
	this.HP = HP;
	this.Str = Str;
	this.Mag = Mag;
	this.Skl = Skl;
	this.Spd = Spd;
	this.Lck = Lck;
	this.Def = Def;
	this.Res = Res;
}

var BaseStat = function(level, HP, Str, Mag, Skl, Spd, Lck, Def, Res) {
	this.level = level;
	this.stat = new Stat(HP, Str, Mag, Skl, Spd, Lck, Def, Res);
}

var Character = function(preset) {
	for (var attr in preset)
		this[attr] = preset[attr];
		
	this.base = this.base || {};
	this.growth = this.growth || {};
	this.cap = this.cap || {};
	
	if (this.gen == "child" || this.gen == "avatarChild") {
		this.base.Standard = {};
		this.base.Standard.level = this.childBase.level;
		this.base.Standard.stat = {};
		for (var attr in db.classes[this.baseClass].base) {
			this.base.Standard.stat[attr] = this.childBase.stat[attr] + db.classes[this.baseClass].base[attr];
		}
	}
}

Character.prototype.getParentList = function() {
	if (this.fixedParent) {
		var genFilter = {};
		var routeFilter = {};
		var parentGen = db.character[this.fixedParent].gen;
		var parentRoute = db.character[this.fixedParent].route;
		var ret = [];
		
		if (this.fixedParent == "kamui") {
			for (var ch in db.character)
				if (ch != "kamui" && ch != "kanna")
					ret.push(ch);
		}else {
			genFilter.avatar = true;
			routeFilter.All = true;
			
			if (parentGen == "father")
				genFilter.mother = true;
			if (parentGen == "mother")
				genFilter.father = true;
			
			if (parentRoute == "All") {
				routeFilter.Birthright = true;
				routeFilter.Conquest = true;
			}
			if (parentRoute == "Birthright")
				routeFilter.Birthright = true;
			if (parentRoute == "Conquest")
				routeFilter.Conquest = true;
			
			revFilter = {}
			if (this.revParent)
				for (var i=0; i<this.revParent.length; i++)
					revFilter[this.revParent[i]] = true;
					
			exceptionFilter = {}
			if (this.nonParent)
				for (var i=0; i<this.nonParent.length; i++)
					exceptionFilter[this.nonParent[i]] = true;
			
			for (var ch in db.character) {
				if ((genFilter[db.character[ch].gen] && routeFilter[db.character[ch].route] && !exceptionFilter[ch]) || revFilter[ch])
					ret.push(ch);
			}
		}
		
		
		return ret;
	}
}

Character.prototype.setParent = function(varParent) {
	if (this.gen == "child" || this.gen == "avatarChild") {
		this.varParent = varParent;
		this.evaluateChildStat();
	}
}

Character.prototype.evaluateChildStat = function() {
	var fixedParent = db.character[this.fixedParent];
	for (var attr in this.childGrowth) {
		this.growth[attr] = (this.varParent.growth[attr] + this.childGrowth[attr])/2;
		this.cap[attr] = this.varParent.cap[attr] + fixedParent.cap[attr];
		if (this.varParent.gen != "child")
			this.cap[attr]++;
	}
	
	this.classSet = [];
	this.classSet.push(this.baseClass);
	var secondClass = fixedParent.classSet[0];
	if (secondClass == "singer" || secondClass == this.baseClass) {
		secondClass = fixedParent.classSet[1];
		if (secondClass == this.baseClass && fixedParent.classSet[0] == "singer") {
			secondClass = db.classes[fixedParent.classSet[0]].parallel;
			if (secondClass == this.varParent.classSet[0])
				secondClass = db.classes[fixedParent.classSet[1]].parallel;
		}
	}
	var thirdClass = this.varParent.classSet[0];
	if (thirdClass == "singer" || thirdClass == this.baseClass || thirdClass == secondClass) {
		thirdClass = this.varParent.classSet[1];
		if (thirdClass == this.baseClass || thirdClass == secondClass)
			thirdClass = db.classes[this.varParent.classSet[0]].parallel;
	}
	if (secondClass)
		this.classSet.push(secondClass);
	if (thirdClass)
		this.classSet.push(thirdClass);
	
	return this;
}

var db = {};

db.classes = {
	
	Ranger : {
		name	: "Ranger",
		tier	: "tier1",
		promoteTo : [ "Lord" ],
		base	: new Stat(18, 5, 2, 4, 5, 4, 5, 2),
		growth	: new Stat(90, 45, 15, 35, 45, 55, 25, 15),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Lord : {
		name	: "Lord",
		tier	: "tier2",
		base	: new Stat(22, 7, 5, 6, 7, 4, 8, 3),
		growth	: new Stat(90, 35, 15, 35, 55, 55, 25, 15),
		maxStat	: new Stat(60, 26, 20, 27, 28, 30, 24, 22),
	},
	
	Myrmidon : {
		name	: "Myrmidon",
		tier	: "tier1",
		promoteTo : [ "Swordmaster" ],
		base	: new Stat(16, 4, 3, 5, 9, 3, 3, 2),
		growth	: new Stat(55, 50, 30, 55, 65, 30, 15, 25),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Swordmaster : {
		name	: "Swordmaster",
		tier	: "tier2",
		base	: new Stat(19, 7, 5, 9, 11, 3, 4, 4),
		growth	: new Stat(55, 50, 30, 55, 65, 30, 15, 25),
		maxStat	: new Stat(55, 24, 23, 31, 31, 35, 22, 21),
	},
	
	Soldier : {
		name	: "Soldier",
		tier	: "tier1",
		promoteTo : [ "Halberdier" ],
		base	: new Stat(19, 4, 4, 4, 4, 4, 4, 4),
		growth	: new Stat(80, 35, 35, 35, 35, 35, 35, 35),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Halberdier : {
		name	: "Halberdier",
		tier	: "tier2",
		base	: new Stat(24, 6, 6, 6, 6, 4, 6, 6),
		growth	: new Stat(80, 35, 35, 35, 35, 35, 35, 35),
		maxStat	: new Stat(60, 25, 21, 26, 26, 30, 27, 23),
	},
	
	Fighter : {
		name	: "Fighter",
		tier	: "tier1",
		promoteTo : [ "Warrior" ],
		base	: new Stat(19, 8, 2, 3, 5, 4, 3, 1),
		growth	: new Stat(90, 55, 15, 30, 45, 30, 35, 25),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Warrior : {
		name	: "Warrior",
		tier	: "tier2",
		base	: new Stat(25, 10, 5, 5, 6, 4, 5, 2),
		growth	: new Stat(90, 55, 15, 30, 45, 30, 35, 25),
		maxStat	: new Stat(65, 29, 20, 22, 27, 35, 25, 20),
	},
	
	Archer : {
		name	: "Archer",
		tier	: "tier1",
		promoteTo : [ "Sniper" ],
		base	: new Stat(17, 5, 3, 7, 5, 2, 4, 2),
		growth	: new Stat(60, 45, 25, 55, 40, 30, 25, 45),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Sniper : {
		name	: "Sniper",
		tier	: "tier2",
		base	: new Stat(20, 8, 6, 9, 7, 2, 6, 4),
		growth	: new Stat(60, 45, 25, 55, 40, 30, 25, 45),
		maxStat	: new Stat(50, 27, 24, 33, 28, 35, 20, 24),
	},	
	
	Knight : {
		name	: "Knight",
		tier	: "tier1",
		promoteTo : [ "General" ],
		base	: new Stat(20, 5, 2, 3, 2, 2, 9, 2),
		growth	: new Stat(75, 45, 15, 45, 25, 25, 60, 35),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	General : {
		name	: "General",
		tier	: "tier2",
		base	: new Stat(26, 7, 3, 4, 4, 2, 11, 5),
		growth	: new Stat(75, 45, 15, 45, 25, 25, 60, 35),
		maxStat	: new Stat(70, 28, 21, 25, 23, 30, 30, 25),
	},
	
	Cavalier : {
		name	: "Cavalier",
		tier	: "tier1",
		promoteTo : [ "Paladin" ],
		base	: new Stat(18, 5, 3, 3, 5, 3, 6, 2),
		growth	: new Stat(70, 40, 20, 40, 45, 30, 40, 40),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Paladin : {
		name	: "Paladin",
		tier	: "tier2",
		base	: new Stat(23, 7, 5, 6, 7, 3, 7, 4),
		growth	: new Stat(70, 40, 20, 40, 45, 30, 40, 40),
		maxStat	: new Stat(55, 25, 20, 25, 27, 35, 25, 25),
	},
	
	PegasusKnight : {
		name 	: "Pegasus Knight",
		tier	: "tier1",
		promoteTo : [ "Falcoknight" ],
		base 	: new Stat(16, 4, 4, 3, 8, 4, 2, 4),
		growth 	: new Stat(60, 35, 35, 40, 55, 35, 30, 35),
		maxStat : new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Falcoknight : {
		name 	: "Falcoknight",
		tier	: "tier2",
		base 	: new Stat(19, 6, 6, 5, 10, 4, 4, 8),
		growth 	: new Stat(60, 35, 35, 40, 55, 35, 30, 35),
		maxStat : new Stat(55, 24, 24, 27, 30, 30, 21, 28),
	},
	
	Princess : {
		name	: "Princess",
		tier	: "tier1",
		promoteTo : [ "PrincessCrimea" ],
		base	: new Stat(14, 3, 6, 2, 9, 5, 1, 5),
		growth	: new Stat(50, 40, 30, 45, 50, 35, 25, 50),
		maxStat	: new Stat(40, 20, 20, 20, 20, 25, 20, 20),
	},
	
	PrincessCrimea : {
		name	: "Princess Crimea",
		tier	: "tier2",
		base	: new Stat(17, 5, 9, 3, 11, 5, 2, 10),
		growth	: new Stat(50, 40, 30, 45, 50, 35, 25, 50),
		maxStat	: new Stat(50, 21, 28, 22, 28, 40, 20, 30),
	},
	
	WyvernRider : {
		name	: "Wyvern Rider",
		tier	: "tier1",
		promoteTo : [ "WyvernLord" ],
		base	: new Stat(19, 6, 1, 5, 3, 3, 7, 1),
		growth	: new Stat(85, 55, 15, 35, 35, 25, 55, 20),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	WyvernLord : {
		name	: "Wyvern Lord",
		tier	: "tier2",
		base	: new Stat(25, 8, 2, 7, 5, 3, 10, 2),
		growth	: new Stat(85, 55, 15, 35, 35, 25, 55, 20),
		maxStat	: new Stat(60, 28, 19, 27, 25, 30, 28, 19),
	},
	
	Mage : {
		name	: "Mage",
		tier	: "tier1",
		promoteTo : [ "Sage" ],
		base	: new Stat(17, 2, 6, 4, 6, 3, 2, 5),
		growth	: new Stat(60, 20, 65, 40, 50, 20, 20, 50),
		maxStat	: new Stat(40, 20, 20, 20, 20, 30, 20, 20),
	},
	
	Sage : {
		name	: "Sage",
		tier	: "tier2",
		base	: new Stat(20, 4, 8, 6, 9, 3, 4, 8),
		growth	: new Stat(60, 20, 65, 40, 50, 20, 20, 50),
		maxStat	: new Stat(55, 21, 30, 26, 28, 35, 20, 27),
	},
	
	Priest : {
		name	: "Priest",
		tier	: "tier1",
		promoteTo : [ "Bishop" ],
		base	: new Stat(16, 0, 8, 2, 4, 7, 0, 8),
		growth	: new Stat(55, 15, 55, 30, 35, 60, 15, 60),
		maxStat	: new Stat(40, 20, 20, 20, 20, 35, 20, 20),
	},
	
	Bishop : {
		name	: "Bishop",
		tier	: "tier2",
		base	: new Stat(20, 1, 11, 4, 6, 7, 1, 12),
		growth	: new Stat(55, 15, 55, 30, 35, 60, 15, 60),
		maxStat	: new Stat(50, 20, 28, 25, 26, 40, 21, 30),
	},
	
	Cleric : {
		name	: "Cleric",
		tier	: "tier1",
		promoteTo : [ "Valkyrie" ],
		base	: new Stat(15, 2, 7, 3, 2, 8, 2, 6),
		growth	: new Stat(50, 35, 45, 40, 50, 45, 10, 50),
		maxStat	: new Stat(40, 20, 20, 20, 20, 35, 20, 20),
	},
	
	Valkyrie : {
		name	: "Valkyrie",
		tier	: "tier2",
		base	: new Stat(18, 6, 10, 4, 5, 8, 4, 7),
		growth	: new Stat(50, 35, 45, 40, 50, 45, 10, 50),
		maxStat	: new Stat(50, 24, 27, 24, 26, 40, 23, 29),
	},
	
	Thief : {
		name	: "Thief",
		tier	: "tier1",
		promoteTo : [ "Assassin" ],
		base	: new Stat(16, 5, 3, 4, 10, 3, 3, 1),
		growth	: new Stat(60, 45, 15, 55, 60, 40, 30, 20),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Assassin : {
		name	: "Assassin",
		tier	: "tier2",
		base	: new Stat(18, 7, 6, 8, 13, 3, 4, 3),
		growth	: new Stat(60, 45, 15, 55, 60, 40, 30, 20),
		maxStat	: new Stat(60, 25, 23, 34, 34, 30, 22, 20),
	},
	
	Bandit : {
		name	: "Bandit",
		tier	: "tier1",
		promoteTo : [ "Berserker" ],
		base	: new Stat(20, 9, 0, 2, 7, 3, 4, 0),
		growth	: new Stat(100, 60, 10, 25, 50, 25, 40, 15),
		maxStat	: new Stat(45, 20, 20, 20, 20, 20, 20, 20),
	},
	
	Berserker : {
		name	: "Berserker",
		tier	: "tier2",
		base	: new Stat(27, 10, 2, 4, 10, 4, 5, 0),
		growth	: new Stat(100, 60, 10, 25, 50, 25, 40, 15),
		maxStat	: new Stat(70, 30, 19, 23, 29, 30, 21, 19),
	},

	Cat : {
		name	: "Cat",
		tier	: "tier1",
		promoteTo : [ "Cat2" ],
		base	: new Stat(16, 4, 3, 4, 7, 6, 3, 2),
		growth	: new Stat(55, 45, 35, 50, 70, 40, 20, 20),
		maxStat	: new Stat(65, 26, 22, 29, 30, 35, 22, 23),
	},

	Cat2 : {
		name	: "Cat Laguz",
		tier	: "tier2",
		base	: new Stat(18, 6, 4, 8, 10, 6, 5, 5),
		growth	: new Stat(55, 45, 35, 50, 70, 40, 20, 20),
		maxStat	: new Stat(65, 26, 22, 29, 30, 35, 22, 23),
	},

	Cat3 : {
		name	: "Cat New",
		tier	: "tier1",
		base	: new Stat(16, 4, 3, 4, 7, 6, 3, 2),
		growth	: new Stat(115, 95, 75, 110, 150, 80, 45, 50),
		maxStat	: new Stat(65, 26, 22, 29, 30, 35, 22, 23),
		doubleModifier : true  // Flag to indicate double modifiers from boons and banes
	},
		
	Tiger : {
		name	: "Tiger",
		tier	: "tier1",
		promoteTo : [ "Tiger2" ],
		base	: new Stat(19, 8, 2, 4, 4, 3, 4, 1),
		growth	: new Stat(90, 60, 15, 25, 35, 30, 45, 25),
		maxStat	: new Stat(70, 29, 21, 23, 25, 30, 25, 21),
	},

	Tiger2 : {
		name	: "Tiger Laguz",
		tier	: "tier2",
		base	: new Stat(22, 10, 4, 6, 7, 3, 7, 3),
		growth	: new Stat(90, 60, 15, 25, 35, 30, 45, 25),
		maxStat	: new Stat(70, 29, 21, 23, 25, 30, 25, 21),
	},

	Tiger3 : {
		name	: "Tiger New",
		tier	: "tier1",
		base	: new Stat(19, 8, 2, 4, 4, 3, 4, 1),
		growth	: new Stat(190, 125, 45, 55, 80, 60, 100, 55),
		maxStat	: new Stat(70, 29, 21, 23, 25, 30, 25, 21),
		doubleModifier : true  // Flag to indicate double modifiers from boons and banes
	},
	
	Lion : {
		name	: "Lion",
		tier	: "tier1",
		promoteTo : [ "Lion2" ],
		base	: new Stat(20, 8, 1, 6, 2, 3, 5, 0),
		growth	: new Stat(105, 60, 10, 30, 20, 25, 60, 15),
		maxStat	: new Stat(75, 30, 19, 28, 21, 30, 29, 19),
	},

	Lion2 : {
		name	: "Lion Laguz",
		tier	: "tier2",
		base	: new Stat(24, 11, 1, 8, 5, 3, 7, 3),
		growth	: new Stat(105, 60, 10, 30, 20, 25, 60, 15),
		maxStat	: new Stat(74, 30, 19, 28, 21, 30, 29, 19),
	},
	
	Lion3 : {
		name	: "Lion New",
		tier	: "tier1",
		base	: new Stat(20, 8, 1, 6, 2, 3, 5, 0),
		growth	: new Stat(220, 130, 35, 65, 50, 50, 130, 45),
		maxStat	: new Stat(75, 30, 19, 28, 21, 30, 29, 19),
		doubleModifier : true  // Flag to indicate double modifiers from boons and banes
	},
	
	Hawk : {
		name	: "Hawk",
		tier	: "tier1",
		promoteTo : [ "Hawk2" ],
		base	: new Stat(16, 6, 3, 7, 5, 3, 4, 1),
		growth	: new Stat(80, 40, 30, 45, 40, 25, 35, 30),
		maxStat	: new Stat(65, 25, 23, 30, 28, 30, 25, 22),
	},

	Hawk2 : {
		name	: "Hawk Laguz",
		tier	: "tier2",
		base	: new Stat(19, 9, 5, 9, 7, 3, 6, 4),
		growth	: new Stat(80, 40, 30, 45, 40, 25, 35, 30),
		maxStat	: new Stat(65, 25, 23, 30, 28, 30, 25, 22),
	},
	
	Hawk3 : {
		name	: "Hawk New",
		tier	: "tier1",
		base	: new Stat(16, 6, 3, 7, 5, 3, 4, 1),
		growth	: new Stat(170, 90, 65, 95, 85, 50, 75, 70),
		maxStat	: new Stat(65, 25, 23, 30, 28, 30, 25, 22),
		doubleModifier : true  // Flag to indicate double modifiers from boons and banes
	},
	
	Raven : {
		name	: "Raven",
		tier	: "tier1",
		promoteTo : [ "Raven2" ],
		base	: new Stat(14, 4, 4, 7, 8, 0, 4, 4),
		growth	: new Stat(65, 40, 35, 55, 50, 15, 30, 45),
		maxStat	: new Stat(60, 24, 24, 27, 32, 35, 22, 26),
	},

	Raven2 : {
		name	: "Raven Laguz",
		tier	: "tier2",
		base	: new Stat(16, 7, 8, 9, 11, 0, 5, 6),
		growth	: new Stat(65, 40, 35, 55, 50, 15, 30, 45),
		maxStat	: new Stat(60, 24, 24, 27, 32, 35, 22, 26),
	},
			
	Raven3 : {
		name	: "Raven New",
		tier	: "tier1",
		base	: new Stat(14, 4, 4, 7, 8, 0, 4, 4),
		growth	: new Stat(135, 90, 80, 95, 110, 40, 65, 95),
		maxStat	: new Stat(60, 24, 24, 27, 32, 35, 22, 26),
		doubleModifier : true  // Flag to indicate double modifiers from boons and banes
	},
	
	RedDrake : {
		name	: "Red Dragon",
		tier	: "tier1",
		promoteTo : [ "RedDrake2" ],
		base	: new Stat(22, 8, 2, 3, 2, 1, 6, 1),
		growth	: new Stat(115, 55, 5, 25, 10, 25, 75, 15),
		maxStat	: new Stat(80, 29, 15, 24, 23, 30, 30, 15),
	},

	RedDrake2 : {
		name	: "Red Dragon Laguz",
		tier	: "tier2",
		base	: new Stat(28, 12, 2, 5, 4, 1, 8, 2),
		growth	: new Stat(115, 55, 5, 25, 10, 25, 75, 15),
		maxStat	: new Stat(80, 29, 15, 24, 23, 30, 30, 15),
	},
	
	RedDrake3 : {
		name	: "Red Dragon New",
		tier	: "tier1",
		base	: new Stat(22, 8, 2, 3, 2, 1, 6, 1),
		growth	: new Stat(235, 125, 35, 55, 4, 50, 155, 40),
		maxStat	: new Stat(80, 29, 15, 24, 23, 30, 30, 15),
		doubleModifier : true  // Flag to indicate double modifiers from boons and banes
	},
	
	WhiteDrake : {
		name	: "White Dragon",
		tier	: "tier1",
		promoteTo : [ "WhiteDrake2" ],
		base	: new Stat(16, 2, 5, 3, 5, 5, 2, 7),
		growth	: new Stat(85, 5, 60, 40, 65, 30, 20, 40),
		maxStat	: new Stat(70, 22, 30, 26, 26, 35, 22, 28),
	},

	WhiteDrake2 : {
		name	: "White Dragon Laguz",
		tier	: "tier2",
		base	: new Stat(19, 3, 8, 7, 7, 5, 4, 9),
		growth	: new Stat(85, 5, 60, 40, 65, 30, 20, 40),
		maxStat	: new Stat(70, 22, 30, 26, 26, 35, 22, 28),
	},
	
	WhiteDrake3 : {
		name	: "White Dragon New",
		tier	: "tier1",
		base	: new Stat(16, 2, 5, 3, 5, 5, 2, 7),
		growth	: new Stat(180, 40, 130, 90, 100, 60, 45, 85),
		maxStat	: new Stat(70, 22, 30, 26, 26, 35, 22, 28),
		doubleModifier : true  // Flag to indicate double modifiers from boons and banes
	},
	
	Heron : {
		name	: "Heron",
		tier	: "tier1",
		promoteTo : [ "Heron2" ],
		base	: new Stat(14, 0, 7, 2, 7, 6, 1, 8),
		growth	: new Stat(50, 5, 60, 15, 55, 50, 10, 80),
		maxStat	: new Stat(55, 15, 32, 25, 30, 40, 16, 40),
	},

	Heron2 : {
		name	: "Heron Laguz",
		tier	: "tier2",
		base	: new Stat(16, 1, 11, 3, 11, 6, 2, 12),
		growth	: new Stat(50, 5, 60, 15, 55, 50, 10, 80),
		maxStat	: new Stat(55, 15, 32, 25, 30, 40, 16, 40),
	},
		
	Heron3 : {
		name	: "Heron New",
		tier	: "tier1",
		base	: new Stat(14, 0, 7, 2, 7, 6, 1, 8),
		growth	: new Stat(105, 40, 130, 45, 120, 100, 40, 170),
		maxStat	: new Stat(55, 15, 32, 25, 30, 40, 16, 40),
		doubleModifier : true  // Flag to indicate double modifiers from boons and banes
	},
}

db.character = {
	
	kamui : new Character({
		name	: "PoRin",
		gender	: "either",
		gen		: "avatar",
		baseClass : "Ranger",
		classSet  : [ "Ranger" ],
		
		route	: "All",
		
		baseMod	: {
			none : new Stat(18, 5, 2, 4, 5, 4, 5, 2),
			boon : new Stat(4, 2, 2, 5, 2, 5, 2, 2),
			bane : new Stat(-4, -2, -2, -3, -2, -3, -2, -2),
		},
		
		growthMod : {
			none : new Stat(0, 0, 0, 0, 0, 0, 0, 0),
			boon : {
				HP	: new Stat(30, 0, 0, 0, 0, 0, 5, 5),
				Str	: new Stat(0, 15, 0, 5, 0, 0, 5, 0),
				Mag	: new Stat(0, 0, 15, 0, 5, 0, 0, 5),
				Skl	: new Stat(5, 0, 0, 35, 5, 0, 0, 0),
				Spd	: new Stat(0, 5, 0, 0, 15, 0, 0, 5),
				Lck	: new Stat(0, 0, 5, 0, 0, 35, 5, 0),
				Def	: new Stat(5, 0, 0, 0, 0, 5, 15, 0),
				Res	: new Stat(0, 0, 5, 0, 5, 0, 0, 15),
			},
			bane : {
				HP	: new Stat(-15, 0, 0, 0, 0, 0, -5, -5),
				Str	: new Stat(0, -10, 0, -5, 0, 0, -5, 0),
				Mag	: new Stat(0, 0, -10, 0, -5, 0, 0, -5),
				Skl	: new Stat(-5, 0, 0, -20, -5, 0, 0, 0),
				Spd	: new Stat(0, -5, 0, 0, -10, 0, 0, -5),
				Lck	: new Stat(0, 0, -5, 0, 0, -20, -5, 0),
				Def	: new Stat(-5, 0, 0, 0, 0, -5, -10, 0),
				Res	: new Stat(0, 0, -5, 0, -5, 0, 0, -10),
			},
		},
		
		capMod : {
			boon : {
				HP	: new Stat(10, 0, 0, 0, 0, 0, 2, 2),
				Str	: new Stat(0, 4, 0, 3, 0, 0, 2, 0),
				Mag	: new Stat(0, 0, 4, 0, 0, 3, 0, 2),
				Skl	: new Stat(2, 0, 0, 9, 2, 0, 0, 0),
				Spd	: new Stat(0, 2, 0, 0, 4, 0, 0, 2),
				Lck	: new Stat(0, 0, 2, 0, 0, 9, 2, 0),
				Def	: new Stat(3, 0, 0, 0, 0, 3, 4, 0),
				Res	: new Stat(0, 0, 2, 0, 2, 0, 0, 4),
			},
			bane : {
				HP	: new Stat(-5, 0, 0, 0, 0, 0, -1, -1),
				Str	: new Stat(0, -3, 0, -2, 0, 0, -2, 0),
				Mag	: new Stat(0, 0, -3, 0, 0, -2, 0, -2),
				Skl	: new Stat(-2, 0, 0, -4, -2, 0, 0, 0),
				Spd	: new Stat(0, -2, 0, 0, -3, 0, 0, -2),
				Lck	: new Stat(0, 0, -2, 0, 0, -4, -2, 0),
				Def	: new Stat(-3, 0, 0, 0, 0, -3, -3, 0),
				Res	: new Stat(0, 0, -2, 0, -2, 0, 0, -3),
			},
		},
		
		initialize: function(boon, bane) {
			var keySet = new Stat(0, 0, 0, 0, 0, 0, 0, 0);
			this.base.Standard = {};
			this.base.Standard.level = 1;
			this.base.Standard.stat = {};
			this.finalGrowths = {}; // Initialize the final growths property
		
			for (var attr in keySet) {
				if (attr == boon)
					this.base.Standard.stat[attr] = this.baseMod.none[attr] + this.baseMod.boon[attr];
				else if (attr == bane)
					this.base.Standard.stat[attr] = this.baseMod.none[attr] + this.baseMod.bane[attr];
				else
					this.base.Standard.stat[attr] = this.baseMod.none[attr];
		
				this.growth[attr] = this.growthMod.none[attr] + this.growthMod.boon[boon][attr] + this.growthMod.bane[bane][attr];
				this.cap[attr] = this.capMod.boon[boon][attr] + this.capMod.bane[bane][attr];
		
				// Store the final growth rates
				this.finalGrowths[attr] = this.growth[attr];
			}
		
			for (var unit in db.character)
				if (db.character[unit].varParent)
					if (db.character[unit].varParent == this || unit == "kanna")
						db.character[unit].evaluateChildStat();
		}
		
	}),
}
