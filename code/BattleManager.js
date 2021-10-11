function ProcessBattle(enemyPower)
{
    let enemyPowerValue = GetEnemyPowerValue(enemyPower)
    EVENT_PENDING = true
    BATTLE_PENDING = true
    RegisterScreenTouch(() => {
            let HPLoss = GetBattleHPLoss(enemyPowerValue)
            if(HPLoss <= 0)
            {
                CurrentEventDialog.appendChild(NewEventDialogContent(`敌人根本不是你的对手，你毫发无损！`))
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
        for(c of powerCode)
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
    for(i in traits)
    {
        let trait = [traits[i]]
        if(SPECIAL_TRAITS_BATTLEDAMAGE[trait["名称"]] != null)
        {
            b = b * SPECIAL_TRAITS_BATTLEDAMAGE[trait["名称"]].bias
        }
    }
    return b
}