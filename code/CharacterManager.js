const FOOD_LOSS_PER_TURN = 1
const HUNGER_HP_LOSS_RATIO = 0.05
const PROCESS_DEATH_DELAY = 1000

const DEBT_INTEREST_RATE = 0.03
const CHARACTER_MAX_DEBT = 3000

var CharacterTraits
var CharacterStatus
var CharacterStats
var CharacterBoard

var CharacterLife
var CharacterIsDebtTaker
var CharacterHasFuhuojia
var CharacterHasMingdao

var CharacterStatsUpdateTable = {
    ["体力上限"] : {
        func : UpdateHPMAX,
        stat : "HPMAX",
    },
    ["体力"] : {
        func : UpdateHP,
        stat : "HPMAX",
    },
    ["金钱"] : {
        func : UpdateMONEY,
        stat : "MONEY",
    },
    ["食物"] : {
        func : UpdateFOOD,
        stat : "FOOD",
    },
    ["战斗力"] : {
        func : UpdatePOWER,
        stat : "POWER",
    },
    ["运气"] : {
        func : UpdateLUCK,
        stat : "LUCK",
    }
}

function CharacterInit()
{
    CharacterStatus = InitCharacterStatus()
    CharacterStats = InitCharacterStats()
    CharacterBoard = LoadCharacterBoard()
    ApplyTraitSelection()
    ApplySelectedTraitStats()
    EnsurePositiveStats()

}

function InitCharacterStatus()
{
    CharacterStatus = []
    CharacterStatus.ALIVE = true
    CharacterLife = 0
    ResetPoisonStatus()
    ResetSpecialTraits()
    return CharacterStatus
}

function ResetSpecialTraits()
{
    CharacterIsDebtTaker = false
    CharacterHasFuhuojia = false
    CharacterHasMingdao = false
}

function InitCharacterStats()
{   
    CharacterStats = []
    CharacterStats.HPMAX = 100
    CharacterStats.HP = 100
    CharacterStats.MONEY = 100
    CharacterStats.FOOD = 100
    CharacterStats.POWER = 100
    CharacterStats.LUCK = 100
    return CharacterStats
}

function EnsurePositiveStats()
{
    for(let i in CharacterStats)
    {
        CharacterStats[i] = Math.max(CharacterStats[i], 0)    
    }
    for(let i in CharacterStatsUpdateTable)
    {
        if(CharacterStatsUpdateTable[i] != null)
        {
            let f = CharacterStatsUpdateTable[i].func
            f(0)
        }
    }
}

function GetCharacterHPString()
{
    s = `体力：${CharacterStats.HP} / ${CharacterStats.HPMAX}\n`
    return s
}

function GetCharacterMONEYString()
{
    s = `金钱：${CharacterStats.MONEY}\n`
    return s
}

function GetCharacterFOODString()
{
    s = `食物：${CharacterStats.FOOD}\n`
    return s
}

function GetCharacterPOWERString()
{
    //s = `战斗力：${CharacterStats.FOOD}\n`
    //return s
}

function GetCharacterLUCKString()
{
    //s = `运气：${CharacterStats.FOOD}\n`
    //return s
}

function UpdateHPMAX(delta, flashScreen = true)
{
    CharacterStats.HPMAX = CharacterStats.HPMAX + delta
    CharacterStats.HP = CharacterStats.HP + delta
    if(flashScreen && delta < 0)
        FlashScreen('red')
    if(CharacterStats.HPMAX < 1)
    {
        CharacterStats.HPMAX = 1
    }
    if(CharacterStats.HP < 1)
    {
        CharacterStats.HP = 1
    }
    CharacterBoard.CharacterHPText.textContent = GetCharacterHPString()
}

function UpdateHP(delta, flashScreen = true)
{
    CharacterStats.HP = CharacterStats.HP + delta
    if(flashScreen && delta < 0)
        FlashScreen('red')
    if(CharacterStats.HP > CharacterStats.HPMAX)
    {
        CharacterStats.HP = CharacterStats.HPMAX
    }
    CharacterBoard.CharacterHPText.textContent = GetCharacterHPString()
    UpdateHPTextColor(CharacterBoard.CharacterHPText)
    if(CharacterStats.HP < 1)
    {
        let sucess = ProcessLethalNegation(delta)
        if(!sucess)
        {
            CharacterDead()
        }
    }
}

function UpdateHPTextColor(text)
{
    if(CharacterStats.HP < CharacterStats.HPMAX / 10)
    {
        text.style.color = 'red'
    }
    else
    {
        text.style.color = 'white'
    }
}

function UpdateMONEY(delta)
{
    CharacterStats.MONEY = CharacterStats.MONEY + delta
    if(CharacterStats.MONEY < 0 && !CharacterIsDebtTaker)
    {
        CharacterStats.MONEY = 0
    }
    CharacterBoard.CharacterMONEYText.textContent = GetCharacterMONEYString()
}

function UpdateFOOD(delta)
{
    CharacterStats.FOOD = CharacterStats.FOOD + delta
    if(CharacterStats.FOOD < 0)
    {
        CharacterStats.FOOD = 0
    }
    CharacterBoard.CharacterFOODText.textContent = GetCharacterFOODString()
    UpdateFoodTextColor(CharacterBoard.CharacterFOODText)
}

function UpdateFoodTextColor(text)
{
    if(CharacterStats.FOOD <= 0)
    {
        text.style.color = 'red'
    }
    else
    {
        text.style.color = 'white'
    }
}

function UpdatePOWER(delta)
{
    CharacterStats.POWER = CharacterStats.POWER + delta
    if(CharacterStats.POWER < 0)
    {
        CharacterStats.POWER = 0
    }
    CharacterBoard.CharacterPOWERText.textContent = GetCharacterPOWERString()
}

function UpdateLUCK(delta)
{
    CharacterStats.LUCK = CharacterStats.LUCK + delta
    if(CharacterStats.LUCK < 0)
    {
        CharacterStats.LUCK = 0
    }
    CharacterBoard.CharacterLUCKText.textContent = GetCharacterLUCKString()
}

function ApplyTraitSelection()
{
    CharacterTraits = []
    for(let traitObject of SelectedTraits)
    {
        CharacterTraits.push(traitObject.content)
    }
}

function ApplySelectedTraitStats()
{
    for(let trait of CharacterTraits)
    {
        ApplyNewTrait(trait)
    }
}

function ProcessCharacter()
{
    ProcessCharacterTraits()
    ProcessCharacterPoison()
    ProcessCharacterHunger()
    if(CharacterIsDebtTaker && CharacterStats.MONEY < 0)
    {
        ProcessCharacterDebt()
    }
}

function ProcessCharacterTraits()
{
    let DeltaHP = 0
    let DeltaMONEY = 0
    let DeltaFOOD = 0
    for(let t of CharacterTraits)
    {
        if(t["每层体力"] != null)
        {
            DeltaHP += t["每层体力"]
        }
        if(t["每层金币"] != null)
        {
            DeltaMONEY += t["每层金币"]
        }
        if(CharacterStats.FOOD > 0 && t["每层食物"] != null)
        {
            DeltaFOOD = t["每层食物"]
        }
    }
    if(DeltaHP != 0)
        UpdateHP(DeltaHP)
    if(DeltaMONEY != 0)
        UpdateMONEY(DeltaMONEY)
    if(DeltaFOOD != 0)
        UpdateFOOD(DeltaFOOD)
}

function ProcessCharacterDebt()
{
    let interest = Math.ceil(CharacterStats.MONEY * DEBT_INTEREST_RATE)
    UpdateMONEY(interest)
    if(CharacterStats.MONEY < -CHARACTER_MAX_DEBT)
    {
        setTimeout(() => {
            ProcessAlertString(`你的负债超过${CHARACTER_MAX_DEBT}，讨债公司前来强制让你卖血还债！`)
        }, 1)
        UpdateHP(Math.ceil(CharacterStats.HPMAX * CharacterStats.MONEY / 10000))
        UpdateMONEY(Math.floor(-CharacterStats.MONEY / 10))
    }
}

function ProcessCharacterPoison()
{
    let totalDamage = GetPoisonTotalDamage()
    if(totalDamage > 0)
    {
        setTimeout(() => {
            ProcessAlertString(`你因为中毒流失了${totalDamage}点体力!`)
        }, 1)
        UpdateHP(-totalDamage)
    }
}

function GetPoisonTotalDamage()
{
    let totalDamage = 0
    let leftOver = []
    for(let i in CharacterStatus.POISON)
    {
        let poison = CharacterStatus.POISON[i]
        if(poison.duration > 0)
        {
            poison.duration--
            totalDamage += poison.strength
            leftOver.push(poison)
        }
    }
    CharacterStatus.POISON.push(leftOver)
    return totalDamage
}

function ClearPoison()
{
    FlashScreen('blue')
    ResetPoisonStatus()
}

function ResetPoisonStatus()
{
    CharacterStatus.POISON = []
}

function ProcessCharacterHunger()
{
    if(CharacterStats.FOOD >= FOOD_LOSS_PER_TURN)
    {
        UpdateFOOD(-FOOD_LOSS_PER_TURN)
    }
    else
    {
        let totalDamage = Math.round((FOOD_LOSS_PER_TURN - CharacterStats.FOOD) * (HUNGER_HP_LOSS_RATIO * CharacterStats.HPMAX))
        setTimeout(() => {
            ProcessAlertString(`你因为饥饿流失了${totalDamage}点体力!`)
        }, 1)
        UpdateHP(-totalDamage)
        CharacterStats.FOOD = 0
    }
}

function CharacterDead()
{
    let revived = ProcessCharacterRevive()
    if(!revived)
    {
        setTimeout(() => {
            ProcessAlertString(`你💀了!`)
            setTimeout(() => {
                ProcessDeath()
            }, PROCESS_DEATH_DELAY)
        }, 1)
        CharacterStatus.ALIVE = false
    }
}

function EnsureDeath()
{
    CharacterLife = 0
    CharacterHasFuhuojia = false
    CharacterHasMingdao = false
}

function ProcessCharacterRevive()
{
    if(CharacterHasFuhuojia)
    {
        setTimeout(() => {
            ProcessAlertString(`你使用了复活甲，现在半血复活！`)
            UpdateHP(Math.ceil(CharacterStats.HPMAX / 2) - CharacterStats.HP)
            CharacterHasFuhuojia = false
        }, 1)
        return true
    }
    if(CharacterLife > 0)
    {
        setTimeout(() => {
            CharacterLife--
            ProcessAlertString(`你失去了一条命，还剩${CharacterLife + 1}条命！`)
            UpdateHP(CharacterStats.HPMAX - CharacterStats.HP)
        }, 1)
        return true
    }
    return false
}

function ProcessLethalNegation(delta)
{
    if(CharacterHasMingdao)
    {
        setTimeout(() => {
            ProcessAlertString(`你触发了名刀被动，免除此次致命伤害！`)
        }, 1)
        CharacterStats.HP = CharacterStats.HP - delta
        CharacterHasMingdao = false
        return true
    }
    return false
}