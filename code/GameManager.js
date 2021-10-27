const DEBUG_ON = false

var GameConfig

function LoadGame()
{
    LoadButton("==> 制作自己的文字游戏 <==", () => {
        window.open("https://github.com/shenhuang/catacomb")
    })
    ProcessConfigFiles()
    let drawButton = LoadButton(GameConfig["抽卡按钮"], () => {
        document.body.removeChild(drawButton)
        let fakeText = LoadText('假装有延迟')
        CenterObject(fakeText)
        HardwareVibrate([200, 100, 200])
        //优化这段代码赚取20万
        setTimeout(() => {
            document.body.removeChild(fakeText)
            DrawTraits()
            LoadButton(GameConfig["开始按钮"], () => {
                StartGame()
            })
        }, 500)
    })
    CenterObject(drawButton)
}

function StartGame()
{
    ClearPage()
    CharacterInit()
    EventInit()
    LoadTraitPanel()
    if(DEBUG_ON)
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
    let ScoreBoard = LoadEventDialog(`这次探险你到了第${level}层`, `你的角色属性：\n`)
    ScoreBoard.appendChild(NewEventDialogContent(`最大生命：${CharacterStats.HPMAX}\n`))
    ScoreBoard.appendChild(NewEventDialogContent(`金钱：${CharacterStats.MONEY}\n`))
    ScoreBoard.appendChild(NewEventDialogContent(`食物：${CharacterStats.FOOD}\n`))
    ScoreBoard.appendChild(NewEventDialogContent(`战斗力：${CharacterStats.POWER}\n`))
    ScoreBoard.appendChild(NewEventDialogContent(`运气：${CharacterStats.LUCK}\n`))
    LoadText(`你在探险中获得了以下天赋`)
    LoadTraitList(CharacterTraits)
    LoadButton("再来一轮", () => {
        ClearPage()
		LoadGame()
    })
    ScrollToTop()
}

function ProcessWin()
{
    CharacterStatus.ALIVE = false
    ClearPage()
    let ScoreBoard = LoadEventDialog(`* * * 恭喜通关 * * *`, `你的角色属性：\n`)
    ScoreBoard.appendChild(NewEventDialogContent(`最大生命：${CharacterStats.HPMAX}\n`))
    ScoreBoard.appendChild(NewEventDialogContent(`金钱：${CharacterStats.MONEY}\n`))
    ScoreBoard.appendChild(NewEventDialogContent(`食物：${CharacterStats.FOOD}\n`))
    ScoreBoard.appendChild(NewEventDialogContent(`战斗力：${CharacterStats.POWER}\n`))
    ScoreBoard.appendChild(NewEventDialogContent(`运气：${CharacterStats.LUCK}\n`))
    LoadText(`你在探险中获得了以下天赋`)
    LoadTraitList(CharacterTraits)
    LoadButton("再来一轮", () => {
        ClearPage()
		LoadGame()
    })
    ScrollToTop()
}