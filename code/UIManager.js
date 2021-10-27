const REFRESH_RATE = 100

const FLOAT_MESSAGE_DURATION = 3000
const FLOAT_MESSAGE_HEIGHT = screen.height / 2
const FLOAT_MESSAGE_ASCEND_SPEED = 1

const FLASH_SCREEN_DURATION = 500

const DEBOUNCE_TIME = 100

const TRAITS_PER_PAGE = 10

var IS_TOUCH_DEVICE = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)

var UI_LIGHT = false

function ClearPage()
{
	document.body.innerHTML = ""
}

function debounce(func){
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, DEBOUNCE_TIME)
	}
}

function RegisterScreenTouch(f, o = false)
{
	f = debounce(f)
	if(IS_TOUCH_DEVICE)
	{
		window.addEventListener('touchstart', f, {once : o})
	}
	else
	{
		window.addEventListener('click', f, {once : o})
	}
}

function RegisterObjectTouch(obj, f, o = false)
{
	f = debounce(f)
	obj.action = f
	if(IS_TOUCH_DEVICE)
	{
		obj.addEventListener('touchstart', f, {once : o})
	}
	else
	{
		obj.addEventListener('click', f, {once : o})
	}
}

function UnregisterObjectTouch(obj, f)
{
	if(IS_TOUCH_DEVICE)
	{
		obj.removeEventListener('touchstart', f)
	}
	else
	{
		obj.removeEventListener('click', f)
	}
}

function ChangeTitle(newTitle)
{
	document.title = newTitle
}

function LoadText(text, align = "center")
{
	let textObject = NewText(text, align)
	document.body.appendChild(textObject)
	return textObject
}

function NewText(text, align = "center")
{
	let textObject = document.createElement('DIV')
	textObject.textContent = text
	textObject.style.textAlign = align
	return textObject
}

function LoadBoard()
{
	let boardObject = NewBoard()
	document.body.appendChild(boardObject)
	return boardObject
}

function NewBoard()
{
	let boardObject = document.createElement('DIV')
	boardObject.setAttribute('class', 'board')
	return boardObject
}

function LoadBar(text, color)
{
	let barObject = NewBar(text, color)
	document.body.appendChild(barObject)
	return barObject
}

function NewBar(text, color)
{
	let barObject = document.createElement('DIV')
	barObject.textContent = text
	barObject.setAttribute('class', 'barDeselect')
	barObject.style.borderColor = color
	return barObject
}

function LoadTraitBar(trait)
{
	let barObject = NewTraitBar(trait)
	document.body.appendChild(barObject)
	return barObject
}

function NewTraitBar(trait)
{
	if(trait["名称"] == null)
		return
	let color = traitRairtyColors[trait["稀有度"]]
	let barObject = LoadBar(GetTraitText(trait), color)
	if(color == null)
	{
		let style = traitRairtyStyles[trait["稀有度"]]
		barObject.setAttribute('class', style)
	}
	return barObject
}

function LoadButton(text, action)
{
	let buttonObject = NewButton(text, action)
	document.body.appendChild(buttonObject)
	return buttonObject
}

function NewButton(text, action)
{
	let buttonObject = document.createElement('DIV')
	buttonObject.textContent = text
	buttonObject.setAttribute('class', 'button')
	RegisterObjectTouch(buttonObject, action)
	return buttonObject
}

function LoadCharacterBoard()
{
	let board = LoadBoard()
	let CharacterHPText = NewText(GetCharacterHPString(), "left")
	board.appendChild(CharacterHPText)
	let CharacterFOODText = NewText(GetCharacterFOODString(), "left")
	board.appendChild(CharacterFOODText)
	let CharacterMONEYText = NewText(GetCharacterMONEYString(), "left")
	board.appendChild(CharacterMONEYText)
	let CharacterPOWERText = NewText(GetCharacterPOWERString(), "left")
	board.appendChild(CharacterPOWERText)
	let CharacterLUCKText = NewText(GetCharacterLUCKString(), "left")
	board.appendChild(CharacterLUCKText)
	let boardObject = {
		board				: board,
		CharacterHPText		: CharacterHPText,
		CharacterFOODText	: CharacterFOODText,
		CharacterMONEYText	: CharacterMONEYText,
		CharacterPOWERText	: CharacterPOWERText,
		CharacterLUCKText	: CharacterLUCKText,
	}
	return boardObject
}

function LoadDialog(text)
{
	let dialogObject = NewDialog(text)
	document.body.appendChild(dialogObject)
	return dialogObject
}

function NewDialog(text, style = 'dialog' + GetStyleSuffix())
{
	let dialogObject = document.createElement('DIV')
	dialogObject.textContent = text
	dialogObject.setAttribute('class', style)
	return dialogObject
}

function LoadEventDialog(title, content)
{
	let eventDialogObject = NewEventDialog(title, content)
	document.body.appendChild(eventDialogObject)
	ScrollToBottom()
	return eventDialogObject
}

function NewEventDialog(title, content, style = 'dialog' + GetStyleSuffix())
{
	let eventDialogObject = document.createElement('DIV')
	eventDialogObject.setAttribute('class', style)
	let textTitle = NewEventDialogTitle(title)
	let textContent = NewEventDialogContent(content)
	eventDialogObject.appendChild(textTitle)
	eventDialogObject.appendChild(textContent)
	return eventDialogObject
}

function LightEventDialog(eventDialogObject)
{
	UI_LIGHT = true
	eventDialogObject.setAttribute('class', 'dialogLight')
	for(let i = 0; i < eventDialogObject.children.length; i++)
	{
		let child = eventDialogObject.children[i]
		if(child.className.includes('dialogTitle'))
		{
			child.setAttribute('class', 'dialogTitleLight')
		}
		if(child.className.includes('dialogContent'))
		{
			child.setAttribute('class', 'dialogContentLight')
		}
		if(child.className.includes('choice'))
		{
			child.setAttribute('class', 'choiceLight')
		}
		if(child.className.includes('choiceSelected'))
		{
			child.setAttribute('class', 'choiceSelectedLight')
		}
	}
}

function NewEventDialogTitle(text, style = 'dialogTitle' + GetStyleSuffix())
{
	let textObject = document.createElement('DIV')
	textObject.textContent = text
	textObject.setAttribute('class', style)
	return textObject
}

function NewEventDialogContent(text, style = 'dialogContent' + GetStyleSuffix())
{
	let textObject = document.createElement('DIV')
	textObject.textContent = text
	textObject.setAttribute('class', style)
	return textObject
}

function NewEventDialogChoice(text, action, style = 'choice' + GetStyleSuffix())
{
	let choiceObject = document.createElement('DIV')
	choiceObject.textContent = text
	if(action == null)
	{
		choiceObject.setAttribute('class', 'choiceDisabled')
	}
	else
	{
		choiceObject.action = action
		choiceObject.setAttribute('class', style)
		RegisterObjectTouch(choiceObject, choiceObject.action)
	}
	return choiceObject
}

function NewEventTraitDialogChoice(eText, tText, action, style = 'choice' + GetStyleSuffix(), styleE = 'choiceTraitEText' + GetStyleSuffix(), styleT = 'choiceTraitTText' + GetStyleSuffix())
{
	let choiceObject = document.createElement('DIV')
	let eventText = document.createElement('DIV')
	eventText.textContent = eText
	eventText.setAttribute('class', styleE)
	choiceObject.appendChild(eventText)
	let traitText = document.createElement('DIV')
	traitText.textContent = `(${tText})`
	traitText.setAttribute('class', styleT)
	choiceObject.appendChild(traitText)
	choiceObject.setAttribute('class', style)
	choiceObject.action = action
	RegisterObjectTouch(choiceObject, choiceObject.action)
	return choiceObject
}

function DisableEventDialogChoice(choiceObject, showSelected, style = 'choiceSelected' + GetStyleSuffix())
{
	UnregisterObjectTouch(choiceObject, choiceObject.action)
	if(showSelected)
	{
		choiceObject.setAttribute('class', style)
	}
}

function GetStyleSuffix()
{
	if(UI_LIGHT)
		return 'Light'
	let style = 'Default'
	for(let i in LEVELCONFIG)
	{
		c = LEVELCONFIG[i]
		if(level >= c["最小层数"])
			style =  c["风格"]
	}
	return style
}

function ScrollToBottom()
{
	window.scrollTo(0, document.body.scrollHeight)
}

function ScrollToTop()
{
	window.scrollTo(0, 0)
}

function FlashScreen(color)
{
	let flashScreen = document.createElement('DIV')
	flashScreen.setAttribute('class', 'flashScreen')
	flashScreen.style.backgroundColor = color
	document.body.appendChild(flashScreen)
	setTimeout(() => {
		try {
			if(document.body.hasChildNodes(flashScreen))
			document.body.removeChild(flashScreen)
		}
		catch(e)
		{
			
		}
	}, FLASH_SCREEN_DURATION)
}

function LoadFloatMessage(text)
{
	let FMObject = NewFloatMessage(text)
	FMObject.style.top = `${FLOAT_MESSAGE_HEIGHT}px`
	document.body.appendChild(FMObject)
	setTimeout(() => {
		try {
			if(document.body.hasChildNodes(FMObject))
			document.body.removeChild(FMObject)
		}
		catch(e)
		{

		}
	}, FLOAT_MESSAGE_DURATION)
	return FMObject
}

function NewFloatMessage(text)
{
	let FMObject = document.createElement('DIV')
	FMObject.textContent = text
	FMObject.setAttribute('class', 'floatMessage')
	return FMObject
}

function LoadTraitPanel()
{
	CharacterTraitPanel = NewTraitPanel()
	document.body.appendChild(CharacterTraitPanel)
	CollapseTraitPanel()
	return CharacterTraitPanel
}

function NewTraitPanel()
{
	let TPObject = document.createElement('DIV')
	TPObject.setAttribute('class', 'traitPanel')
	return TPObject
}

function UpdateTraitPanel()
{
	if(CharacterTraitPanel.expanded)
	{
		LoadTraitPanelPage()
	}
}

function ExpandTraitPanel()
{
	CharacterTraitPanel.page = 1
	LoadTraitPanelPage()
	CharacterTraitPanel.style.width = '105%'
	CharacterTraitPanel.expanded = true
}

function LoadTraitPanelPage()
{
	CharacterTraitPanel.innerHTML = ""
	for(let i in CharacterTraits)
	{
		if(i >= (CharacterTraitPanel.page - 1) * TRAITS_PER_PAGE && i < CharacterTraitPanel.page * TRAITS_PER_PAGE)
		{
			let bar = NewTraitBar(CharacterTraits[i])
			CharacterTraitPanel.appendChild(bar)
		}
	}
	let CButton = NewButton("关闭", () =>
	{
		CollapseTraitPanel()
	})
	CharacterTraitPanel.append(CButton)
	if(CharacterTraits.length > TRAITS_PER_PAGE)
	{
		let NButton = NewButton("下一页", () =>
		{
			CharacterTraitPanel.page++
			if((CharacterTraitPanel.page - 1) * TRAITS_PER_PAGE > CharacterTraits.length)
			{
				CharacterTraitPanel.page = 1
			}
			LoadTraitPanelPage()
		})
		CharacterTraitPanel.append(NButton)
	}
}

function CollapseTraitPanel()
{
	CharacterTraitPanel.innerHTML = ""
	let EButton = NewButton("查看天赋", () =>
	{
		ExpandTraitPanel()
	})
	CharacterTraitPanel.append(EButton)
	CharacterTraitPanel.style.width = 'auto'
	CharacterTraitPanel.expanded = false
}

function CenterObject(object)
{
	object.style.position = 'fixed'
	object.style.top = '50%'
	object.style.left = '50%'
	object.style.transform = 'translateX(-50%)'
}

function HardwareVibrate(msdata)
{
	if('vibrate' in window.navigator)
	{
		window.navigator.vibrate(msdata);
	}
}