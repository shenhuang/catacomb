const REWARD_COWS_KILLED = 20

const COW_REWARD_EVENT = 385

const MAX_LEVEL = 255

const LEVEL_REACH_EVENTS = {
    [0]    : 361,
    [50]   : 357,
    [100]  : 358,
    [200]  : 359,
    [255]  : 360,
}

var level
var EventPool
var CurrentEventDialog
var EVENT_PENDING

var CowsKilled

function EventInit()
{
    UI_LIGHT = false
    level = -1  
    EventPool = []
    CurrentEventDialog = null
    EVENT_PENDING = false
    CowsKilled = 0
    RegisterScreenTouch(() => {
        if(!EVENT_PENDING)
            NextEvent()
    })
}

function NextEvent()
{
    if(!CharacterStatus.ALIVE)
        return
    level++
    if(level > MAX_LEVEL)
    {
        ProcessWin()
        return
    }
    if(LEVEL_REACH_EVENTS[level] != null)
    {
        ProcessLevelReach(level)
        return
    }
    UpdateEventPool()
    let e = GetNextEvent()
    CurrentEventDialog = LoadEvent(e)
    ProcessEvent(e)
    ProcessCharacter()
}

function ProcessLevelReach(l)
{
    let e = EVENTS[LEVEL_REACH_EVENTS[l]]
    CurrentEventDialog = LoadEvent(e)
    ProcessEvent(e)
}

function UpdateEventPool()
{
    EventPool = []
    for(let i in EVENTS)
    {
        if(ValidEvent(EVENTS[i]))
        {
            EventPool.push(EVENTS[i])
        }
    }
    //LogEventPoolInfo(EventPool)
}

function LogEventPoolInfo(pool)
{
    console.log(`# of events in pool: ${pool.length}`)
    console.log(pool)
}

function LoadEvent(event)
{
    return LoadEventDialog(`第${level}层`, event["描述"])
}

function GetNextEvent()
{
    return EventPool[Math.floor(Math.random() * EventPool.length)]
}

function ProcessEvent(event)
{
    if(!CharacterStatus.ALIVE)
        return
    EVENT_PENDING = false
    if(event == null)
    {
        console.error("NULL EVENT ENCOUNTERED!!!")
        return
    }
    if(event["依赖"] != null)
    {
        ProcessDependency(event)
    }
    ProcessSpecial(event)
    if(event["敌人战力"] != null)
    {
        ProcessBattle(event["敌人战力"])
    }
    if(event["好结果"] != null || event["坏结果"] != null)
    {
        ProcessDualResult(event)
    }
    else if(event["选项"] != null || event["天赋选项"] != null)
    {
        ProcessChoices(event)
    }
    ProcessStatsChange(event)
    ProcessStatusChange(event)
    ProcessTraitsChange(event)
    ProcessLevelChange(event)
}

function ProcessSpecial(event)
{
    if(event["描述"] == "世界突然感觉明亮了许多！")
    {
        LightEventDialog()
    }
    if(event["描述"] == "你战胜了奶牛！")
    {
        ProcessCowKill()
    }
}

function ProcessLevelChange(event)
{
    if(event["层数"] != null)
    {
        level += event["层数"]
    }
}

function ProcessDependency(event)
{  
    CurrentEventDialog.appendChild(NewEventDialogContent(event["描述"]))
    ScrollToBottom()
}

function ProcessDualResult(event)
{
    EVENT_PENDING = true
    let result = GetEventResult(event)
    RegisterScreenTouch(() => {
        setTimeout(() => {
            ProcessEvent(result)
            if(event["好结果"] == 'WIN')
            {
                ProcessWin()
            }
        }, 1)
    }, true)
    
}

function GetEventResult(event)
{
    if(Math.random() > 100 / (CharacterStats.LUCK + 100))
    {
        return EVENTS[event["好结果"]]
    }
    return EVENTS[event["坏结果"]]
}

function ProcessChoices(event)
{
    let choiceEvents = GetChoiceEvents(event)
    let choiceEventsTrait = GetChoiceEventsTrait(event)
    LoadChoiceEvents(choiceEvents, choiceEventsTrait)
}

function GetChoiceEvents(event)
{
    let choiceEvents = []
    if(event["选项"] == null)
        return choiceEvents
    let choiceIDs = []
    if(typeof(event["选项"]) == 'number')
    {
        choiceIDs.push(event["选项"])
    }
    else
    {
        choiceIDs = event["选项"].split(',').map(Number)
    }
    for(let i in choiceIDs)
    {
        let e = EVENTS[choiceIDs[i]]
        if(ValidSubEvent(e))
            choiceEvents.push(e)
    }
    return choiceEvents
}

function GetChoiceEventsTrait(event)
{
    let choiceEventsTrait = []
    if(event["天赋选项"] == null)
        return choiceEventsTrait
    let choiceConfigs = event["天赋选项"].split(',').map((data) => {
        let s = data.split('#')
        let c = {
            eid : parseInt(s[0]),
            tid : parseInt(s[1]),
        }
        return c
    })
    for(let i in choiceConfigs)
    {
        let choiceConfig = choiceConfigs[i]
        let e = EVENTS[choiceConfig.eid]
        let t = TRAITS[choiceConfig.tid]
        let choiceEventTrait = 
        {
            event   : e,
            trait   : t,
        }
        if(ValidSubEvent(e) && CharacterTraits.includes(t))
            choiceEventsTrait.push(choiceEventTrait)
    }
    return choiceEventsTrait
}

function LoadChoiceEvents(events, eventsTrait)
{
    if(events == null && eventsTrait == null)
        return
    if(events.length == 0 && eventsTrait.length == 0)
        return
    EVENT_PENDING = true
    let choiceObjectList = []
    for(let i in events)
    {
        let event = events[i]
        let choiceObject = NewEventDialogChoice(event["名称"], () => {
            setTimeout(() => {
                for(let j in choiceObjectList)
                {
                    DisableEventDialogChoice(choiceObjectList[j], choiceObjectList[j] == choiceObject)    
                }
                ProcessEvent(event)
            }, 1)
        })
        choiceObjectList.push(choiceObject)
        CurrentEventDialog.appendChild(choiceObject)
    }
    for(let i in eventsTrait)
    {
        let event = eventsTrait[i].event
        let trait = eventsTrait[i].trait
        let choiceObject = NewEventTraitDialogChoice(event["名称"], trait["名称"], () => {
            setTimeout(() => {
                for(let j in choiceObjectList)
                {
                    DisableEventDialogChoice(choiceObjectList[j], choiceObjectList[j] == choiceObject)    
                }
                ProcessEvent(event)
            }, 1)
        })
        choiceObjectList.push(choiceObject)
        CurrentEventDialog.appendChild(choiceObject)       
    }
    ScrollToBottom()
}

function ProcessStatsChange(event)
{
    let StatsChangeString = ""
    for(let n in CharacterStatsUpdateTable)
    {
        if(event[n] != null)
        {
            let c = GetStatChange(event[n])
            let f = CharacterStatsUpdateTable[n]  
            f(c)
            StatsChangeString += `${n}${c > 0 ? '+' : ''}${c}\n`
        }

    }
    if(StatsChangeString != "")
        setTimeout(() => {LoadFloatMessage(StatsChangeString)}, 1)
}

function GetStatChange(changeData)
{
    if(typeof(changeData) == 'number')
        return changeData
    if(changeData.startsWith('DMHP'))
        return -1 * (CharacterStats.HP + parseInt(changeData.slice(4, changeData.length)))
    if(changeData.startsWith('IMHP'))
        return CharacterStats.HPMAX + parseInt(changeData.slice(4, changeData.length))
    if(changeData == 'DEATH')
    {
        EnsureDeath()
        return -1 * CharacterStats.HP
    }
    let changeRange = changeData.split(',').map(Number)
    let change = Math.round(changeRange[0] + Math.random() * (changeRange[1] - changeRange[0]))
    return change
}

function ProcessStatusChange(event)
{
    ProcessPoisonStatus(event)
}

function ProcessTraitsChange(event)
{
    if(event["获得天赋"] != null)
    {
        let trait = TRAITS[event["获得天赋"]]
        AcquireNewTrait(trait)
    }
    ScrollToBottom()
}

function ProcessPoisonStatus(event)
{
    if(event["中毒时间"] != null && event["中毒效果"] != null)
    {
        let bias = GetPoisonTraitBias(CharacterTraits)
        if(Math.random() > bias.chance)
        {
            CurrentEventDialog.appendChild(NewEventDialogContent(`你的特殊体质让你免疫了毒素！`))
            return
        }   
        let poison = {
            duration    : Math.floor(event["中毒时间"] * bias.weaken),
            strength    : event["中毒效果"],
        }
        CharacterStatus.POISON.push(poison)
    }
    else if(event["中毒时间"] != null && event["中毒时间"] == 'CL')
    {
        ClearPoison()
    }
}

function GetPoisonTraitBias(traits)
{
    let c = 1
    let w = 1
    for(let i in traits)
    {
        let trait = traits[i]
        if(SPECIAL_TRAITS_POISON[trait["名称"]] != null)
        {
            c = c * SPECIAL_TRAITS_POISON[trait["名称"]].chance
            w = w * SPECIAL_TRAITS_POISON[trait["名称"]].weaken
        }
    }
    return {chance : c, weaken : w}
}

function ValidEvent(event)
{
    if(event == null)
        return false
    if(event["弃用"] != null)
        return false
    if(event["依赖"] != null)
        return false
    return ValidSubEvent(event)
}

function ValidSubEvent(event)
{
    if(event["最小层数"] > level)
        return false
    if(event["最大层数"] < level)
        return false
    if(event["最小生命"] > CharacterStats.HP)
        return false
    if(event["最大生命"] < CharacterStats.HP)
        return false
    if(event["%最小生命"] > CharacterStats.HP * 100 / CharacterStats.HPMAX)
        return false
    if(event["%最大生命"] < CharacterStats.HP * 100 / CharacterStats.HPMAX)
        return false
    if(event["最小金钱"] > CharacterStats.MONEY && !CharacterIsDebtTaker)
        return false
    if(event["最大金钱"] < CharacterStats.MONEY)
        return false
    if(event["最小食物"] > CharacterStats.FOOD)
        return false
    if(event["最大食物"] < CharacterStats.FOOD)
        return false
    if(event["最小战力"] > CharacterStats.POWER)
        return false
    if(event["最大战力"] < CharacterStats.POWER)
        return false
    if(event["最小运气"] > CharacterStats.LUCK)
        return false
    if(event["最大运气"] < CharacterStats.LUCK)
        return false
    if(event["天赋免疫"] != null)
    {
        let traitData = event["天赋免疫"]
        if(typeof(traitData) != 'number')
        {
            traitData = traitData.split(',').map(Number)
            for(let i in traitData)
            {
                if(CharacterTraits.includes(TRAITS[traitData[i]]))
                    return false
            }
        }
        else
        {
            if(CharacterTraits.includes(TRAITS[traitData]))
                return false
        }
    }
    if(event["天赋触发"] != null)
    {
        let traitData = event["天赋触发"]
        if(typeof(traitData) != 'number')
        {
            let traitOR = traitData.split(',')
            let includeANY = false
            for(let i in traitOR)
            {
                let traitAND = traitOR[i].split('&').map(Number)
                let includeALL = true
                for(let j in traitAND)
                {
                    let traitItem = traitAND[j]
                    if(!CharacterTraits.includes(TRAITS[traitItem]))
                        includeALL = false
                }
                if(includeALL)
                    includeANY = true
            }
            if(!includeANY)
                return false
        }
        else
        {
            if(!CharacterTraits.includes(TRAITS[event["天赋触发"]]))
                return false
        }
    }
    return true
}

function ProcessCowKill()
{
    CowsKilled++
    if(CowsKilled >= REWARD_COWS_KILLED)
    {
        ProcessCowKillReward()
    }
}

function ProcessCowKillReward()
{
    let e = EVENTS[COW_REWARD_EVENT]
    ProcessEvent(e)
}