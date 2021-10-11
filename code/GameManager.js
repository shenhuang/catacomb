function LoadGame()
{
    LoadText("你来到了卡塔窟")
    LoadText("你会在这里开始你的探险")
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