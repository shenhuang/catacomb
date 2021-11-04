var CheatBoard

function IncreaseLevel()
{
    level += 10 
}

function DecreaseLevel()
{
    level -= 10
}

function IncreaseMaxHP()
{
    UpdateHPMAX(100)
}

function DecreaseMaxHP()
{
    UpdateHPMAX(-100)
}

function IncreaseHP()
{
    UpdateHP(100)
}

function DecreaseHP()
{
    UpdateHP(-100)
}

function IncreaseMONEY()
{
    UpdateMONEY(100)
}

function DecreaseMONEY()
{
    UpdateMONEY(-100)
}

function IncreaseLUCK()
{
    UpdateLUCK(100)
}

function DecreaseLUCK()
{
    UpdateLUCK(-100)
}

function IncreasePOWER()
{
    UpdatePOWER(100)
}

function DecreasePOWER()
{
    UpdatePOWER(-100)
}

function EnableCheatBoard()
{
    window.addEventListener('keydown', (e) =>
    {
        if(e.key == 'g' || e.key == 'G')
        {
            if(CheatBoard == null)
            {
                CreateCheatBoard()
            }
            else
            {
                if(CheatBoard.style.visibility == 'hidden')
                {
                    CheatBoard.style.visibility = 'visible'
                }
                else
                {
                    CheatBoard.style.visibility = 'hidden'
                }
            }
        }
    })
}

function CreateCheatBoard()
{
    CheatBoard = LoadCheatBoard()
    CheatBoard.appendChild(NewButton('LEVEL+10', () => {
        IncreaseLevel()
    }))
    CheatBoard.appendChild(NewButton('LEVEL-10', () => {
        DecreaseLevel()
    }))
    CheatBoard.appendChild(NewButton('MAXHP+100', () => {
        IncreaseMaxHP()
    }))
    CheatBoard.appendChild(NewButton('MAXHP-100', () => {
        DecreaseMaxHP()
    }))
    CheatBoard.appendChild(NewButton('CURHP+100', () => {
        IncreaseHP()
    }))
    CheatBoard.appendChild(NewButton('CURHP-100', () => {
        DecreaseHP()
    }))
    CheatBoard.appendChild(NewButton('CASH+100', () => {
        IncreaseMONEY()
    }))
    CheatBoard.appendChild(NewButton('CASH-100', () => {
        DecreaseMONEY()
    }))
    CheatBoard.appendChild(NewButton('LUCK+100', () => {
        IncreaseLUCK()
    }))
    CheatBoard.appendChild(NewButton('LUCK-100', () => {
        DecreaseLUCK()
    }))
    CheatBoard.appendChild(NewButton('POWER+100', () => {
        IncreasePOWER()
    }))
    CheatBoard.appendChild(NewButton('POWER-100', () => {
        DecreasePOWER()
    }))
}