function ProcessBattle(enemyPower)
{
    let enemyPowerValue = GetEnemyPowerValue(enemyPower)
    EVENT_PENDING = true
    BATTLE_PENDING = true
    RegisterScreenTouch(() => {
            let HPLoss = GetBattleHPLoss(enemyPowerValue)
            if(HPLoss <= 0)
            {
                CurrentEventDialog.appendChild(NewEventDialogContent(`敌人根本不是对手，你毫发无损！`))
            }
            else
            {
                CurrentEventDialog.appendChild(NewEventDialogContent(`你在战斗中受到了${HPLoss}点伤害！`))
                UpdateHP(-HPLoss)
            }
            ScrollToBottom()
            EVENT_PENDING = false
    }, true)
}

function GetEnemyPowerValue(enemyPower)
{
    if(typeof(enemyPower) == "string")
    {
        powerCode = enemyPower.split('|')
        let enemyPowerValue = 0
        for(let c of powerCode)
        {
            if(c.charAt(0) == '&')
            {
                enemyPowerValue = CharacterStats.POWER + parseInt(c.substring(1))
            }
            if(c.charAt(0) == '+')
            {
                enemyPowerValue = Math.max(enemyPowerValue, parseInt(c.substring(1)))
            }
        }
        return enemyPowerValue
    }
    return enemyPower
}

function GetBattleHPLoss(enemyPowerValue)
{
    let bias = GetBattleDamageTraitBias(CharacterTraits)
    return Math.round((enemyPowerValue - CharacterStats.POWER) * bias)
}

function GetBattleDamageTraitBias(traits)
{
    let b = 1
    for(let i in traits)
    {
        let trait = traits[i]
        if(trait["战斗受伤%"] != null)
        {
            b = b * (1 + trait["战斗受伤%"] / 100)
        }
    }
    return Math.max(0, b)
}