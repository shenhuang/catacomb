var GameConfig

function LoadGame()
{
    LoadButton("==> 制作自己的文字游戏 <==", () => {
        window.open("https://github.com/shenhuang/catacomb")
    })
    ProcessConfigFiles()
    InitTraits()
    LoadTraits()
    LoadButton(GameConfig["开始按钮"], () => {
        StartGame()
    })
}

function StartGame()
{
    ClearPage()
    CharacterInit()
    EventInit()
    LoadTraitPanel()
    EnableCheatBoard()
}

function ProcessConfigFiles()
{
    ProcessLoadConfig()
    ProcessGameConfig()
}

function ProcessLoadConfig()
{
    for(let i in LOADCONFIG)
    {
        let c = LOADCONFIG[i]
        if(c["类别"] == '标题')
        {
            ChangeTitle(c["内容"])
        }
        if(c["类别"] == '欢迎语')
        {
            LoadText(c["内容"])
        }
    }
}

function ProcessGameConfig()
{
    GameConfig = {}
    for(let i in GAMECONFIG)
    {
        let config = GAMECONFIG[i]
        GameConfig[config["属性"]] = config["值"]
    }
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

function ProcessWin()
{
    CharacterStatus.ALIVE = false
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