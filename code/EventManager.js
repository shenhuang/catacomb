const REWARD_COWS_KILLED = 20

const COW_REWARD_EVENT = 385

const MAX_LEVEL = 255

const EVENT_MARK_COUNT = 3

var level
var EventIDPool
var CurrentEventDialog
var EVENT_PENDING
var LEVEL_REACH_EVENTS

var CowsKilled

function EventInit()
{
    UI_LIGHT = false
    level = -1  
    EventIDPool = []
    CurrentEventDialog = null
    EVENT_PENDING = false
    CowsKilled = 0
    ProcessEventsConfigs()
    RegisterScreenTouch(() => {
        if(!EVENT_PENDING)
            NextEvent()
    })
}

function ProcessEventsConfigs()
{
    ProcessFixedEventsConfig()
}

function ProcessFixedEventsConfig()
{
    LEVEL_REACH_EVENTS = {}
    for(let i in FIXEDEVENTSCONFIG)
    {
        let config = FIXEDEVENTSCONFIG[i]
        if(config["事件"] != null)
        {
            if(config["层数"] != null)
            {
                LEVEL_REACH_EVENTS[config["层数"]] = config["事件"]
            }
        } 
    }
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
    UpdateEventIDPool()
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

function UpdateEventIDPool()
{
    EventIDPool = []
    for(let i in EVENTS)
    {
        if(ValidEvent(EVENTS[i]))
        {
            EventIDPool.push(i)
        }
    }
    LogEventIDPoolInfo(EventIDPool)
}

function LogEventIDPoolInfo(pool)
{
    if(!DEBUG_ON)
        return
    console.log(`currently ${pool.length} events in pool:`)
    console.log(pool)
}

function LogEvent(event)
{
    if(!DEBUG_ON)
        return
    console.log(`event for level ${level} is:`)
    console.log(event)
}

function LoadEvent(event)
{
    return LoadEventDialog(`第${level}${GameConfig["层"]}`, event["描述"])
}

function GetNextEvent()
{
    return GetNextRandomEventMarkRepeat(EVENT_MARK_COUNT)
}

function GetNextRandomEvent()
{
    let id = EventIDPool[Math.floor(Math.random() * EventIDPool.length)]
    let nextEvent = EVENTS[id]
    return nextEvent
}

function GetNextRandomEventMarkRepeat(markCount)
{
    let id = EventIDPool[Math.floor(Math.random() * EventIDPool.length)]
    let nextEvent = EVENTS[id]
    while(nextEvent.mark != null && nextEvent.mark > 0)
    {
        nextEvent.mark--
        id = EventIDPool[Math.floor(Math.random() * EventIDPool.length)]
        nextEvent = EVENTS[id]       
    }
    nextEvent.mark = markCount
    return nextEvent
}

function ProcessEvent(event)
{
    LogEvent(event)
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
    ProcessTraitsChange(event)
    ProcessStatsChange(event)
    ProcessStatusChange(event)
    ProcessLevelChange(event)
    if(event["好结果"] != null || event["坏结果"] != null)
    {
        ProcessDualResult(event)
    }
    else if(event["选项"] != null || event["天赋选项"] != null)
    {
        ProcessChoices(event)
    }
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
    AppendAdditionalString(event["描述"])
    ScrollToBottom()
}

function AppendAdditionalString(string)
{
    CurrentEventDialog.appendChild(NewEventDialogContent(string))
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
        let action = null
        if(ValidSubEvent(event))
        {
            action = () => {
                setTimeout(() => {
                    for(let j in choiceObjectList)
                    {
                        DisableEventDialogChoice(choiceObjectList[j], choiceObjectList[j] == choiceObject)    
                    }
                    ProcessEvent(event)
                }, 1)
            }
        }
        let choiceObject = NewEventDialogChoice(event["名称"], action)
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
            AppendAdditionalString(`你的特殊体质让你免疫了毒素！`)
            return
        }   
        let poison = {
            duration    : Math.floor(event["中毒时间"] * bias.weaken),
            strength    : event["中毒效果"],
        }
        AppendAdditionalString(`你中毒了，将在之后的${poison.duration}回合内损失共计${poison.duration * poison.strength}点生命！`)
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
        if(trait["中毒概率%"] != null)
        {
            c = c + trait["中毒概率%"] / 100
        }
        if(trait["中毒时间%"] != null)
        {
            w = w + trait["中毒时间%"] / 100
        }
    }
    let bias = {
        chance : Math.max(0, c),
        weaken : Math.max(0, w),
    }
    return bias
}

function ValidEvent(event)
{
    if(event == null)
        return false
    if(event["依赖"] != null)
        return false
    return ValidSubEvent(event)
}

function ValidSubEvent(event)
{
    if(event["弃用"] != null)
        return false
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

function ProcessAlertString(alertString)
{
    alert(alertString)
    CurrentEventDialog.appendChild(NewEventDialogContent(alertString))
}