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
		base	: new Stat(17, 7, 3, 4, 5, 2, 5, 2),
		growth	: new Stat(15, 15, 10, 10, 10, 10, 10, 5),
		maxStat	: new Stat(40, 23, 17, 19, 21, 22, 21, 19),
	},
	
	Lord : {
		name	: "Lord",
		tier	: "tier2",
		base	: new Stat(19, 10, 4, 5, 6, 4, 7, 3),
		growth	: new Stat(15, 15, 10, 10, 10, 10, 15, 0),
		maxStat	: new Stat(60, 34, 28, 29, 30, 33, 31, 28),
	},
	
	Myrmidon : {
		name	: "Myrmidon",
		tier	: "tier1",
		promoteTo : [ "Swordmaster" ],
		base	: new Stat(17, 4, 0, 5, 8, 3, 3, 3),
		growth	: new Stat(10, 10, 0, 15, 20, 15, 0, 10),
		maxStat	: new Stat(40, 20, 16, 23, 25, 24, 18, 20),
	},
	
	Swordmaster : {
		name	: "Swordmaster",
		tier	: "tier2",
		base	: new Stat(18, 6, 2, 7, 11, 4, 5, 5),
		growth	: new Stat(10, 10, 5, 15, 20, 15, 0, 10),
		maxStat	: new Stat(55, 30, 28, 32, 35, 33, 27, 31),
	},
	
	Soldier : {
		name	: "Soldier",
		tier	: "tier1",
		promoteTo : [ "Halberdier" ],
		base	: new Stat(18, 6, 1, 2, 5, 0, 7, 1),
		growth	: new Stat(20, 20, 10, 0, 10, 0, 20, 0),
		maxStat	: new Stat(45, 24, 19, 16, 20, 17, 23, 18),
	},
	
	Halberdier : {
		name	: "Halberdier",
		tier	: "tier2",
		base	: new Stat(19, 9, 5, 2, 7, 0, 10, 5),
		growth	: new Stat(10, 20, 15, 0, 10, 0, 20, 5),
		maxStat	: new Stat(60, 34, 28, 25, 30, 25, 36, 31),
	},
	
	Fighter : {
		name	: "Fighter",
		tier	: "tier1",
		promoteTo : [ "Warrior" ],
		base	: new Stat(17, 6, 0, 6, 6, 2, 5, 2),
		growth	: new Stat(15, 15, 0, 15, 15, 5, 10, 5),
		maxStat	: new Stat(40, 22, 15, 23, 22, 21, 22, 21),
	},
	
	Warrior : {
		name	: "Warrior",
		tier	: "tier2",
		base	: new Stat(18, 9, 0, 8, 8, 3, 7, 3),
		growth	: new Stat(15, 15, 0, 15, 15, 5, 10, 5),
		maxStat	: new Stat(60, 34, 25, 33, 32, 29, 30, 29),
	},
	
	Archer : {
		name	: "Archer",
		tier	: "tier1",
		promoteTo : [ "Sniper" ],
		base	: new Stat(15, 0, 4, 5, 6, 1, 1, 3),
		growth	: new Stat(0, 5, 15, 10, 10, 5, 0, 10),
		maxStat	: new Stat(35, 17, 22, 20, 23, 19, 16, 20),
	},
	
	Sniper : {
		name	: "Sniper",
		tier	: "tier2",
		base	: new Stat(16, 0, 7, 6, 7, 2, 3, 6),
		growth	: new Stat(0, 0, 20, 10, 15, 0, 0, 15),
		maxStat	: new Stat(45, 25, 33, 31, 32, 27, 25, 31),
	},
	
	Knight : {
		name	: "Knight",
		tier	: "tier1",
		promoteTo : [ "General" ],
		base	: new Stat(16, 0, 3, 5, 5, 4, 2, 5),
		growth	: new Stat(0, 5, 10, 10, 15, 15, 0, 20),
		maxStat	: new Stat(35, 18, 21, 20, 22, 23, 17, 24),
	},
	
	General : {
		name	: "General",
		tier	: "tier2",
		base	: new Stat(19, 8, 6, 6, 8, 5, 6, 7),
		growth	: new Stat(10, 15, 5, 5, 15, 15, 10, 10),
		maxStat	: new Stat(55, 32, 30, 31, 33, 32, 28, 32),
	},
	
	Cavalier : {
		name	: "Cavalier",
		tier	: "tier1",
		promoteTo : [ "Paladin" ],
		base	: new Stat(16, 3, 0, 5, 7, 4, 2, 6),
		growth	: new Stat(0, 10, 0, 10, 15, 20, 0, 20),
		maxStat	: new Stat(35, 19, 16, 21, 23, 25, 18, 25),
	},
	
	Paladin : {
		name	: "Paladin",
		tier	: "tier2",
		base	: new Stat(18, 5, 4, 6, 10, 5, 5, 9),
		growth	: new Stat(0, 10, 10, 10, 15, 20, 0, 20),
		maxStat	: new Stat(55, 28, 27, 30, 34, 35, 27, 35),
	},

	Pegasusknight : {
		name 	: "Pegasus Knight",
		tier	: "tier1",
		promoteTo : [ "Falcoknight" ],
		base 	: new Stat(16, 3, 0, 8, 8, 1, 3, 3),
		growth 	: new Stat(5, 5, 0, 20, 20, 0, 5, 15),
		maxStat : new Stat(35, 17, 15, 25, 25, 18, 19, 20),
	},
	
	Falcoknight : {
		name 	: "Falcoknight",
		tier	: "tier2",
		base 	: new Stat(17, 5, 0, 10, 11, 2, 4, 8),
		growth 	: new Stat(5, 5, 0, 20, 20, 0, 5, 20),
		maxStat : new Stat(55, 27, 25, 35, 35, 28, 26, 34),
	},
	
	Princess : {
		name	: "Princess",
		tier	: "tier1",
		promoteTo : [ "PrincessCrimea" ],
		base	: new Stat(16, 5, 1, 6, 8, 4, 1, 4),
		growth	: new Stat(10, 10, 0, 15, 20, 10, 0, 20),
		maxStat	: new Stat(40, 20, 18, 23, 24, 24, 18, 23),
	},

	PrincessCrimea : {
		name	: "Princess Crimea",
		tier	: "tier2",
		base	: new Stat(19, 6, 2, 9, 10, 5, 2, 8),
		growth	: new Stat(10, 10, 0, 15, 20, 10, 0, 20),
		maxStat	: new Stat(55, 29, 29, 33, 34, 33, 27, 34),
	},
	
	Bandit : {
		name	: "Bandit",
		tier	: "tier1",
		promoteTo : [ "Berserker" ],
		base	: new Stat(19, 7, 0, 6, 6, 2, 4, 1),
		growth	: new Stat(20, 20, 0, 15, 15, 5, 5, 0),
		maxStat	: new Stat(45, 25, 15, 23, 22, 21, 19, 18),
	},
	
	Berserker : {
		name	: "Berserker",
		tier	: "tier2",
		base	: new Stat(24, 12, 0, 8, 9, 0, 5, 0),
		growth	: new Stat(30, 25, 0, 15, 15, 0, 0, 0),
		maxStat	: new Stat(70, 40, 25, 32, 33, 25, 27, 25),
	},
	
	WyvernRider : {
		name	: "Wyvern Rider",
		tier	: "tier1",
		promoteTo : [ "WyvernLord" ],
		base	: new Stat(17, 5, 0, 7, 6, 2, 5, 2),
		growth	: new Stat(10, 15, 0, 20, 15, 5, 10, 5),
		maxStat	: new Stat(40, 22, 15, 24, 22, 20, 21, 19),
	},
	
	WyvernLord : {
		name	: "Wyvern Lord",
		tier	: "tier2",
		base	: new Stat(20, 8, 0, 10, 8, 3, 7, 2),
		growth	: new Stat(20, 15, 0, 20, 15, 5, 10, 0),
		maxStat	: new Stat(60, 32, 25, 35, 32, 31, 30, 27),
	},
	
	Mage : {
		name	: "Mage",
		tier	: "tier1",
		promoteTo : [ "Sage" ],
		base	: new Stat(16, 3, 1, 4, 8, 1, 2, 4),
		growth	: new Stat(0, 10, 5, 10, 20, 0, 0, 20),
		maxStat	: new Stat(35, 19, 18, 20, 24, 18, 17, 22),
	},
	
	Sage : {
		name	: "Sage",
		tier	: "tier2",
		base	: new Stat(17, 4, 6, 6, 10, 2, 3, 8),
		growth	: new Stat(0, 5, 15, 5, 20, 0, 0, 20),
		maxStat	: new Stat(50, 27, 31, 27, 34, 27, 25, 34),
	},
	
	Priest : {
		name	: "Priest",
		tier	: "tier1",
		promoteTo : [ "Bishop" ],
		base	: new Stat(15, 0, 3, 7, 5, 4, 1, 4),
		growth	: new Stat(0, 0, 10, 20, 10, 15, 0, 15),
		maxStat	: new Stat(35, 16, 19, 24, 20, 23, 16, 21),
	},
	
	Bishop : {
		name	: "Bishop",
		tier	: "tier2",
		base	: new Stat(16, 0, 7, 6, 7, 5, 2, 7),
		growth	: new Stat(0, 0, 15, 5, 10, 20, 0, 15),
		maxStat	: new Stat(45, 25, 33, 28, 31, 33, 25, 32),
	},
	
	Cleric : {
		name	: "Cleric",
		tier	: "tier1",
		promoteTo : [ "Valkyrie" ],
		base	: new Stat(19, 8, 0, 4, 6, 0, 4, 0),
		growth	: new Stat(20, 20, 0, 5, 15, 5, 10, 0),
		maxStat	: new Stat(45, 24, 15, 18, 22, 17, 21, 15),
	},
	
	Valkyrie : {
		name	: "Valkyrie",
		tier	: "tier2",
		base	: new Stat(22, 11, 0, 6, 7, 1, 7, 1),
		growth	: new Stat(20, 20, 0, 5, 15, 5, 10, 0),
		maxStat	: new Stat(65, 36, 25, 29, 31, 26, 32, 26),
	},
	
	Thief : {
		name	: "Thief",
		tier	: "tier1",
		promoteTo : [ "Assassin" ],
		base	: new Stat(19, 8, 0, 4, 6, 0, 4, 0),
		growth	: new Stat(20, 20, 0, 5, 15, 5, 10, 0),
		maxStat	: new Stat(45, 24, 15, 18, 22, 17, 21, 15),
	},
	
	Assassin : {
		name	: "Assassin",
		tier	: "tier2",
		base	: new Stat(22, 11, 0, 6, 7, 1, 7, 1),
		growth	: new Stat(20, 20, 0, 5, 15, 5, 10, 0),
		maxStat	: new Stat(65, 36, 25, 29, 31, 26, 32, 26),
	},

	Cat : {
		name	: "Cat",
		tier	: "tier1",
		promoteTo : [ "Cat2" ],
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
	},

	Cat2 : {
		name	: "Cat Laguz",
		tier	: "tier2",
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
	},
	
	Tiger : {
		name	: "Tiger",
		tier	: "tier1",
		promoteTo : [ "Tiger2" ],
		base	: new Stat(17, 4, 7, 5, 9, 4, 3, 9),
		growth	: new Stat(0, 10, 15, 5, 15, 15, 0, 20),
		maxStat	: new Stat(45, 27, 32, 28, 33, 32, 26, 34),
	},

	Tiger2 : {
		name	: "Tiger Laguz",
		tier	: "tier2",
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
	},
	
	Lion : {
		name	: "Lion",
		tier	: "tier1",
		promoteTo : [ "Lion2" ],
		base	: new Stat(19, 8, 3, 6, 8, 1, 6, 9),
		growth	: new Stat(15, 15, 5, 5, 15, 0, 5, 20),
		maxStat	: new Stat(55, 32, 28, 29, 31, 26, 29, 34),
	},

	Lion2 : {
		name	: "Lion Laguz",
		tier	: "tier2",
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
	},
	
	Hawk : {
		name	: "Hawk",
		tier	: "tier1",
		promoteTo : [ "Hawk2" ],
		base	: new Stat(19, 7, 0, 10, 9, 7, 7, 2),
		growth	: new Stat(15, 10, 0, 20, 10, 25, 5, 5),
		maxStat	: new Stat(60, 29, 26, 35, 33, 40, 30, 29),
	},

	Hawk2 : {
		name	: "Hawk Laguz",
		tier	: "tier2",
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
	},
	
	Raven : {
		name	: "Raven",
		tier	: "tier1",
		promoteTo : [ "Raven2" ],
		base	: new Stat(18, 8, 1, 8, 9, 5, 7, 3),
		growth	: new Stat(15, 15, 0, 10, 10, 15, 10, 5),
		maxStat	: new Stat(60, 30, 25, 32, 34, 35, 29, 31),
	},

	Raven2 : {
		name	: "Raven Laguz",
		tier	: "tier2",
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
	},
	
	RedDrake : {
		name	: "Red Dragon",
		tier	: "tier1",
		promoteTo : [ "RedDrake2" ],
		base	: new Stat(21, 10, 0, 6, 7, 3, 9, 1),
		growth	: new Stat(20, 20, 0, 5, 5, 10, 15, 0),
		maxStat	: new Stat(65, 36, 25, 29, 30, 30, 32, 27),
	},

	RedDrake2 : {
		name	: "Red Dragon Laguz",
		tier	: "tier2",
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
	},
	
	WhiteDrake : {
		name	: "White Dragon",
		tier	: "tier1",
		promoteTo : [ "WhiteDrake2" ],
		base	: new Stat(21, 10, 0, 6, 7, 3, 9, 1),
		growth	: new Stat(20, 20, 0, 5, 5, 10, 15, 0),
		maxStat	: new Stat(65, 36, 25, 29, 30, 30, 32, 27),
	},

	WhiteDrake2 : {
		name	: "White Dragon Laguz",
		tier	: "tier2",
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
	},
	
	Heron : {
		name	: "Heron",
		tier	: "tier1",
		promoteTo : [ "Heron2" ],
		base	: new Stat(21, 10, 0, 6, 7, 3, 9, 1),
		growth	: new Stat(20, 20, 0, 5, 5, 10, 15, 0),
		maxStat	: new Stat(65, 36, 25, 29, 30, 30, 32, 27),
	},

	Heron2 : {
		name	: "Heron Laguz",
		tier	: "tier2",
		base	: new Stat(16, 3, 0, 6, 5, 3, 2, 3),
		growth	: new Stat(0, 10, 0, 20, 20, 20, 0, 0),
		maxStat	: new Stat(45, 28, 27, 31, 31, 35, 27, 28),
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
			none : new Stat(19, 7, 4, 7, 6, 5, 6, 2, 5),
			boon : new Stat(4, 2, 2, 5, 2, 5, 2, 2),
			bane : new Stat(-4, -2, -2, -3, -2, -3, -2, -2),
		},
		
		growthMod : {
			none : new Stat(45, 45, 30, 40, 45, 45, 35, 25),
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
