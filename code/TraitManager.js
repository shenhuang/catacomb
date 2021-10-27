const MAX_SEL_TRAIT = 3
const MAX_GEN_TRAIT = 10

var SelectedTraits
var CharacterTraitPanel

var traitRairtyWeights = {
	[1] : 50,
	[2] : 40,
	[3] : 20,
	[4] : 10,
	[5] : 5,
}

var traitRairtyColors = {
	[1] : "#C7C7C7",
	[2] : "#ADE687",
	[3] : "#8791E6",
	[4] : "#C587E6",
	[5] : "#E6BB87",
}

var traitRairtyStyles = {
	[6] : "barRairty06",
}

var traitAttributes = [
	"体质",
	"金钱",
	"食物",
	"战斗力",
	"运气",
	"每层体力",
	"每层金币",
	"每层食物",
	"战斗受伤%",
	"中毒概率%",
	"中毒时间%",
]

const SPECIAL_TRAIT_DEBT = "超前消费"

const SPECIAL_TRAIT_FUHUOJIA = "咸鱼的庇护"
const SPECIAL_TRAIT_MINGDAO = "名刀 - 丝袜"

function DrawTraits()
{
	InitTraits()
    LoadTraits()
}

function InitTraits()
{
	SelectedTraits = new Set()
}

function LoadTraits()
{
	let showTraits = GetShowTraits()
	showTraits = SortTraitListByRairty(showTraits)
	return LoadTraitList(showTraits)
}

function SortTraitListByRairty(traitList)
{
	traitList.sort((a, b) => {
		return b["稀有度"] - a["稀有度"]
	})
	return traitList
}

function LoadTraitList(traitList)
{
	let traitObjects = []
	for(let i in traitList)
	{
		traitObjects.push(LoadTrait(traitList[i]))
	}
	return traitObjects
}

function LoadAllTraits()
{
	let traitObjects = []
	for(let i in TRAITS)
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
	for(let i = 0; i < MAX_GEN_TRAIT; i++)
	{
		let randn = Math.random()
		let rairty = 0
		for(let r in thresh)
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
	for(let i in weights)
	{
		d += weights[i]
	}
	let odds = []
	for(let i in weights)
	{
		odds[i] = weights[i] / d
	}
	return odds
}

function GetTraitRairtyThresh(odds)
{
	thresh = []
	s = 0
	for(let i in odds)
	{
		thresh[i] = s
		s += odds[i]
	}
	return thresh
}

function GetShowTraitsByRairty()
{
	let stbr = {}
	for(let i in TRAITS)
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
	if(desc != ' ()')
	{
		text = text + desc
	}
	return text
}

function GetTraitDesc(trait)
{
	if(trait["描述"] != null)
	{
		return`(${trait["描述"]})`
	}
	let descList = ''
	for(let a of traitAttributes)
	{
		if(trait[a] != null)
		{
			let ns = ''
			let as = ''
			if(trait[a] >= 0)
			{
				ns = ns + '+'
			}
			if(a.charAt(a.length - 1) == '%')
			{
				ns = ns + trait[a] + '%'
				as = as + a.slice(0, a.length - 1)
			}
			else
			{
				ns = ns + trait[a]
				as = as + a
			}
			descList = descList + as + ns + ' '
		}
	}
	descList = descList.trimEnd()
	desc = ` (${descList})`
	return desc
}

function SelectTrait(traitObject)
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
		UpdateTraitPanel()
    }
}

function ApplyTraitSpecial(trait)
{
    if(trait["额外生命"] != null)
    {
        CharacterLife += trait["额外生命"]
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