function LoadGame()
{
    LoadText("这里是卡塔窟")
    LoadText("开启你的奇妙历险")
    LoadText("请选择最多三个初始天赋")
    InitTraits()
    LoadTraits()
    LoadButton("开始冒险", () => {
		ClearPage()
        CharacterInit()
        EventInit()
    })
}

function ProcessDeath()
{
    ClearPage()
    LoadText(`这次探险你到了第${level}层`)
    LoadText(`你的角色属性：\n`)
    LoadText(`最大生命：${CharacterStats.HPMAX}\n`)
    LoadText(`金钱：${CharacterStats.MONEY}\n`)
    LoadText(`食物：${CharacterStats.FOOD}\n`)
    LoadText(`战斗力：${CharacterStats.POWER}\n`)
    LoadText(`运气：${CharacterStats.LUCK}\n`)
    LoadText(`你在探险中获得了以下天赋`)
    LoadTraitList(CharacterTraits)
    LoadButton("再来一轮", () => {
        ClearPage()
		LoadGame()
    })
}

function ProcessComplete()
{
    ClearPage()
    LoadText(`* * * 恭喜通关 * * *`)
    LoadText(`你的角色属性：\n`)
    LoadText(`最大生命：${CharacterStats.HPMAX}\n`)
    LoadText(`金钱：${CharacterStats.MONEY}\n`)
    LoadText(`食物：${CharacterStats.FOOD}\n`)
    LoadText(`战斗力：${CharacterStats.POWER}\n`)
    LoadText(`运气：${CharacterStats.LUCK}\n`)
    LoadText(`你在探险中获得了以下天赋`)
    LoadTraitList(CharacterTraits)
    LoadButton("再来一轮", () => {
        ClearPage()
		LoadGame()
    })
}