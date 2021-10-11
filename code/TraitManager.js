const MAX_SEL_TRAIT = 3
const MAX_GEN_TRAIT = 10

var SelectedTraits

var traitRairtyWeights = {
	[1] : 100,
	[2] : 60,
	[3] : 30,
	[4] : 10,
	[5] : 1,
}

var traitRairtyColors = {
	[1] : "#C7C7C7",
	[2] : "#ADE687",
	[3] : "#8791E6",
	[4] : "#C587E6",
	[5] : "#E6BB87",
}

var traitAttributes = [
	"体质",
	"金钱",
	"食物",
	"战斗力",
	"运气",
]

const SPECIAL_TRAITS_POISON = {
	//常吃地沟油 中毒概率-10% 中毒时间-25%
	"常吃地沟油" : {
		chance	: 0.9,
		weaken	: 0.75,
	},
	//抗毒体质 中毒概率-50% 中毒时间-50%
	"抗毒体质" : {
		chance	: 0.5,
		weaken	: 0.5,
	},
	//百毒不侵 不会中毒
	"百毒不侵" : {
		chance	: 0,
		weaken	: 0,
	},
}

const SPECIAL_TRAITS_REVIVE = {
	"月光饭盒" : {
		revive	: 1,
	},
	"绿色蘑菇" : {
		revive	: 1,
	},
	"游戏币" : {
		revive	: 1,
	},
	"九命猫" : {
		revive	: 8,
	},
	"饕餮宝珠" : {
		loss	: 1,
	},
}

const SPECIAL_TRAITS_REGENERATE = {
	"活力充沛" : {
		regen	: 1,
	},
	"自愈体质" : {
		regen	: 2,
	},
	"仙丹（精）" : {
		regen	: 5,
	},
	"爸者重装" : {
		regen	: 5,
	},
	"金刚狼" : {
		regen	: 10,
	},
	"路飞" : {
		regen	: 2,
	},
	"饕餮宝珠" : {
		regen	: 10,
	},
}

const SPECIAL_TRAITS_FOODLOSS = {
	"金刚狼" : {
		loss	: 1,
	},
	"大胃王" : {
		loss	: 2,
	},
	"路飞" : {
		loss	: 2,
	},
	"饕餮宝珠" : {
		loss	: 2,
	},
}

const SPECIAL_TRAITS_MONEYGAIN = {
	"老头" : {
		gain	: 1,
	},
	"学渣宝石" : {
		gain	: 5,
	},
	"包租婆" : {
		gain	: 10,
	},
	"聚宝盆" : {
		gain	: 15,
	},
}

const SPECIAL_TRAITS_BATTLEDAMAGE = {
	"金钟罩" : {
		bias	: 0.5,
	},
	"饕餮宝珠" : {
		loss	: 0.8,
	},
	"抖M" : {
		bias	: 1.25,
	},
	"林妹妹" : {
		bias	: 1.5,
	},
}

const SPECIAL_TRAIT_DEBT = "超前消费"

const SPECIAL_TRAIT_FUHUOJIA = "咸鱼的庇护"
const SPECIAL_TRAIT_MINGDAO = "名刀 - 思妹"

function InitTraits()
{
	SelectedTraits = new Set()
}

function LoadTraits()
{
	let showTraits = GetShowTraits()
	return LoadTraitList(showTraits)
}

function LoadTraitList(traitList)
{
	let traitObjects = []
	for(i in traitList)
	{
		traitObjects.push(LoadTrait(traitList[i]))
	}
	return traitObjects
}

function LoadAllTraits()
{
	let traitObjects = []
	for(i in TRAITS)
	{
		traitObjects.push(LoadTrait(TRAITS[i]))
	}
	return traitObjects
}

function GetShowTraits()
{
	let traitRairtyOdds = GetTraitRairtyOdds(traitRairtyWeights)
	let thresh = GetTraitRairtyThresh(traitRairtyOdds)
	let showTraitsByRairty = GetShowTraitsByRairty()
	let showTraits = []
	for(i = 0; i < MAX_GEN_TRAIT; i++)
	{
		let randn = Math.random()
		let rairty = 0
		for(r in thresh)
		{
			if(randn > thresh[r])
			{
				rairty = r
			}
		}
		let randomTrait = GetRandomTrait(showTraitsByRairty[rairty])
		if(randomTrait != null)
		{
			showTraits.push(randomTrait)
		}
	}
	return showTraits
}

function GetTraitRairtyOdds(weights)
{
	let d = 0
	for(i in weights)
	{
		d += weights[i]
	}
	let odds = []
	for(i in weights)
	{
		odds[i] = weights[i] / d
	}
	return odds
}

function GetTraitRairtyThresh(odds)
{
	thresh = []
	s = 0
	for(i in odds)
	{
		thresh[i] = s
		s += odds[i]
	}
	return thresh
}

function GetShowTraitsByRairty()
{
	let stbr = {}
	for(i in TRAITS)
	{
		let trait = TRAITS[i]
		if(trait["可预选"] == 1 && trait["稀有度"] != null)
		{
			if(stbr[trait["稀有度"]] == null)
				stbr[trait["稀有度"]] = []
			stbr[trait["稀有度"]].push(trait)
		}
	}
	return stbr
}

function GetRandomTrait(traitList)
{
	let index = Math.floor(Math.random() * traitList.length)
	return traitList.splice(index, 1)[0]
}

function LoadTrait(trait)
{
	let traitObject = {
		div		: LoadTraitBar(trait),
		sel		: false,
		content	: trait,
	}
	RegisterObjectTouch(traitObject.div, () =>
	{
		SelectTrait(traitObject, !trait.selected)
	})
	return traitObject
}

function GetTraitText(trait)
{
	let text = trait["名称"]
	let desc = GetTraitDesc(trait)
	if(desc != " ()")
	{
		text = text + desc
	}
	return text
}

function GetTraitDesc(trait)
{
	let desc = " ("
	if(trait["描述"] != null)
	{
		desc = desc + trait["描述"]
		
	}
	else
	{
		for(i of traitAttributes)
		{
			if(trait[i] != null)
			{
				desc = desc + i
				if(trait[i] >= 0)
				{
					desc = desc + "+"
				}
				desc = desc + trait[i] + " "
			}
		}
	}
	desc = desc.trimEnd()
	desc = desc + ")"
	return desc
}

function SelectTrait(traitObject, select)
{
	if(traitObject.sel == true)
	{
		traitObject.div.setAttribute('class', 'barDeselect')
		traitObject.sel = false
		SelectedTraits.delete(traitObject)
	}
	else
	{
		if(SelectedTraits.size < MAX_SEL_TRAIT)
		{
			traitObject.div.setAttribute('class', 'barSelect')
			traitObject.sel = true
			SelectedTraits.add(traitObject)	
		}
	}
}

function ApplyNewTrait(trait)
{
	ApplyTraitStats(trait)
	ApplyTraitSpecial(trait)
}

function ApplyTraitStats(trait)
{
	if(trait["体质"] != null)
	{
		UpdateHPMAX(trait["体质"], false)
	}
	if(trait["金钱"] != null)
	{
		UpdateMONEY(trait["金钱"])
	}
	if(trait["食物"] != null)
	{
		UpdateFOOD(trait["食物"])
	}
	if(trait["战斗力"] != null)
	{
		UpdatePOWER(trait["战斗力"])
	}
	if(trait["运气"] != null)
	{
		UpdateLUCK(trait["运气"])
	}    
}

function AcquireNewTrait(trait)
{
    if(!CharacterTraits.includes(trait))
    {
        CurrentEventDialog.appendChild(NewEventDialogContent("你获得了新的天赋："))
        CurrentEventDialog.appendChild(NewTraitBar(trait))
        ApplyNewTrait(trait)
        CharacterTraits.push(trait)
    }
}

function ApplyTraitSpecial(trait)
{
    if(SPECIAL_TRAITS_REVIVE[trait["名称"]] != null)
    {
        CharacterLife += SPECIAL_TRAITS_REVIVE[trait["名称"]].revive
    }
	if(SPECIAL_TRAIT_DEBT == trait["名称"])
	{
		CharacterIsDebtTaker = true
	}
	if(SPECIAL_TRAIT_FUHUOJIA == trait["名称"])
	{
		CharacterHasFuhuojia = true
	}
	if(SPECIAL_TRAIT_MINGDAO == trait["名称"])
	{
		CharacterHasMingdao = true
	}
}