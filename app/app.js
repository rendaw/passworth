// Rules
// All divs have classes
// Elements only have classes to disambiguate themselves from other elements of the same type in the div/block

// Auxiliary
var SerializeStorage = function(Input)
{
	var Version = 0;
	return JSON.stringify({Version: Version, Data: Input});
}

var DeserializeStorage = function(Input)
{
	return JSON.parse(Input);
}

function CreateSortedArray(KeyAccessor)
{
	this.Elements = [];
	this.Accessor = KeyAccessor;
}
CreateSortedArray.prototype = {
	PlaceOneByKey: function(NewElement, Key)
	{
		var Temp = { Key: Key, Data: NewElement };
		for (var Index = 0; Index < this.Elements.length; Index += 1)
		{
			var ElementKey = this.Accessor(this.Elements[Index]);
			if (ElementKey == Temp.Key) return;
			if (ElementKey < Temp.Key) continue;

			var Temp2 = { Key: this.Accessor(this.Elements[Index]), Data: this.Elements[Index] };
			this.Elements[Index] = Temp.Data;
			Temp = Temp2;
		}
		this.Elements.push(Temp.Data);
	},
	PlaceOne: function(NewElement)
	{
		this.PlaceOneByKey(NewElement, this.Accessor(NewElement));
	},
	RemoveOneByKey: function(Key)
	{
		var Deleted = false;
		for (var Index = 0; Index < this.Elements.length; Index += 1)
		{
			var Element = this.Elements[Index];
			if (!Deleted && (this.Accessor(Element) == Key))
				Deleted = true;
			else if (Deleted)
				this.Elements[Index - 1] = Element;
		}
		if (!Deleted) return; // Error?  Element not found.
		this.Elements.pop();
	},
	RemoveOne: function(OldElement)
	{
		this.RemoveOneByKey(this.Accessor(OldElement));
	},
	ReplaceOne: function(OldKey, Element)
	{
		if (this.Accessor(Element) == OldKey) return;
		this.RemoveOneByKey(OldKey);
		this.PlaceOne(Element);
	},
	Get: function(Key)
	{
		for (var Index = 0; Index < this.Elements.length; Index += 1)
		{
			if (this.Accessor(this.Elements[Index]) == Key) return this.Elements[Index];
		}
		return null;
	}
};

function CreatePassword()
{
	var Now = new Date();
	this.ID = Now.getFullYear() + '-' + Now.getTime();
	this.Title = '';
	this.TitleDate = Now.getTime();
	this.Category = '';
	this.CategoryDate = Now.getTime();
	this.Notes = '';
	this.NotesDate = Now.getTime();
	this.Present = {
		Password: {Date: Now.getTime(), Value: ''}
	};
	this.History = [];
}
CreatePassword.prototype = {
	Modify: function(Modifications)
	{
		for (var Name in Modifications)
		{
			var Modification = Modifications[Name];
			if (Name == 'Title')
			{
				this.History.push({ Name: Name, Value: this.Title, Date: this.TitleDate});
				this.Title = Modification.Value;
				this.TitleDate = Modification.Date;
			}
			else if (Name == 'Category')
			{
				this.History.push({ Name: Name, Value: this.Category, Date: this.CategoryDate});
				this.Category = Modification.Value;
				this.CategoryDate = Modification.Date;
			}
			else if (Name == 'Notes')
			{
				this.History.push({ Name: Name, Value: this.Notes, Date: this.NotesDate});
				this.Notes = Modification.Value;
				this.NotesDate = Modification.Date;
			}
			else
			{
				if (Name in this.Present)
					this.History.push({ Name: Name, Value: this.Present[Name].Value, Date: this.Present[Name].Date});
				else this.Present[Name] = {};
				this.Present[Name].Value = Modification.Value;
				this.Present[Name].Date = Modification.Date;
			}
		}
	},
	Merge: function(Password)
	{
		// Merge the history
		var HistoryMatches = true;
		var NewHistory = [];
		var Index = 0;
		var MergeIndex = 0;
		while ((Index < this.History.length) && (MergeIndex < Password.History.length))
		{
			var Record = this.History[Index];
			var MergeRecord = Password.History[MergeIndex];

			if ((Record.Date != MergeRecord.Date) || 
				(Record.Name != MergeRecord.Name) ||
				(Record.Value != MergeRecord.Value)) 
			{
				HistoryMatches = false;
				if (Record.Date <= MergeRecord.Date)
				{
					Index += 1;
					NewHistory.push(Record);
				}
				else
				{
					MergeIndex += 1;
					NewHistory.push(MergeRecord);
				}
			}
			else
			{
				Index += 1;
				MergeIndex += 1;
				NewHistory.push(Record);
			}
		}
		function AppendRemainingHistory(Index, Base, Mergee)
		{
			for (; Index < Base.History.length; Index += 1)
			{
				var Record = Base.History[Index];

				// If the current values for the mergee exist in the base's history, subsume them.
				if ((Record.Name == 'Title') && (Mergee.TitleDate == Record.Date) && (Mergee.Title == Record.Value))
				{
					Mergee.TitleDate = Base.TitleDate;
					Mergee.Title = Base.Title;
				}
				if ((Record.Name == 'Category') && (Mergee.CategoryDate == Record.Date) && (Mergee.Category == Record.Value))
				{
					Mergee.CategoryDate = Base.CategoryDate;
					Mergee.Category = Base.Category;
				}
				if ((Record.Name == 'Notes') && (Mergee.NotesDate == Record.Date) && (Mergee.Notes == Record.Value))
				{
					Mergee.NotesDate = Base.NotesDate;
					Mergee.Notes = Base.Notes;
				}
				
				for (var Name in Mergee.Present)
				{
					if ((Record.Name == Name) && (Mergee.Present[Name].Date == Record.Date) && (Mergee.Present[Name].Value == Record.Value))
					{
						Mergee.Present[Name].Date = Base.Present[Name].Date;
						Mergee.Present[Name].Value = Base.Present[Name].Value;
					}
				}

				// Merge the existing historic record
				NewHistory.push(Record);
			}
		}
		AppendRemainingHistory(Index, this, Password);
		AppendRemainingHistory(MergeIndex, Password, this);

		this.History = NewHistory;
			
		// Merge post-historic values
		var Modifications = {};

		if (this.Title != Password.Title)
		{
			if (this.TitleDate < Password.TitleDate)
				Modifications.Title = {Date: Password.TitleDate, Value: Password.Title};
			else this.History.push({Name: 'Title', Value: Password.Title, Date: Password.TitleDate});
		}
		if (this.Category != Password.Category)
		{
			if (this.CategoryDate < Password.CategoryDate)
				Modifications.Category = { Date: Password.CategoryDate, Value: Password.Category };
			else this.History.push({Name: 'Category', Value: Password.Category, Date: Password.CategoryDate});
		}
		if (this.Notes != Password.Notes)
		{
			if (this.NotesDate < Password.NotesDate)
				Modifications.Notes = { Value: Password.Notes, Date: Password.NotesDate };
			else this.History.push({ Name: 'Notes', Value: Password.Notes, Date: Password.NotesDate });
		}
		for (var Name in Password.Present)
		{
			var MergeProperty = Password.Present[Name];
			if (!(Name in this.Present))
				Modifications[Name] = { Value: MergeProperty.Value, Date: MergeProperty.Date };
			else
			{
				var Property = this.Present[Name];
				if (Property.Value != MergeProperty.Value)
				{
					if (Property.Date < MergeProperty.Date)
						Modifications[Name] = MergeProperty;
					else this.History.push({ Name: Name, Value: MergeProperty.Value, Date: MergeProperty.Date });
				}
			}
		}

		this.Modify(Modifications);
	}
};


function CreateDatabase(Password)
{
	this.Settings = {
		Password: Password,
		MergeSettings: false,
		ObscureUnfocusedPasswords: false
	};
	this.Passwords = {};
	this.ViewTree = new CreateSortedArray(function(Element) { return Element.Title; });
}
CreateDatabase.prototype = {
	Serialize: function(PasswordData, Password)
	{
		return JSON.stringify({
			Version: 0,
			Data: CryptoJS.AES.encrypt(JSON.stringify(PasswordData, Password))
		});
	},
	Deserialize: function(StorageData, Password)
	{
		var Prelim = JSON.parse(StorageData);
		if (!Prelim || !('Version' in Prelim) || !('Data' in Prelim)) return null;
		// Handle version back-compatibility here
		return JSON.parse(CryptoJS.AES.decrypt(Prelim, Password));
	},
	Store: function()
	{
		window['localStorage'].setItem('passworth', Serialize({ Settings: this.Settings, Passwords: this.Passwords}, this.Settings.Password));
	},
	HasStoredData: function()
	{
		return !!window['localStorage'].getItem('passworth');
	},
	Restore: function()
	{
		var LocalData = window['localStorage'].getItem('passworth');
		var OldMergeSettings = this.Settings.MergeSettings;
		this.Settings.MergeSettings = true;
		this.Merge(LocalData, this.Settings.Password);
		this.Settings.MergeSettings = OldMergeSettings;
	},
	SetPassword: function(NewPassword)
	{
		this.Settings.Password = NewPassword;
		this.Store();
	},
	Merge: function(Data, Password)
	{
		var Result = Deserialize(Data, Password);
		if (this.Settings.MergeSettings)
			this.Settings = Result.Settings;
		for (var ID in Result.Passwords)
		{
			var Modifications = {};

			if (ID in this.Passwords)
				this.Passwords[ID].Merge(Results.Passwords[ID]);
			else this.Passwords[ID] = Results.Passwords[ID];

			this.UpdatePassword(Password, Modifications);
		}
	},
	UpdatePassword: function(Password, Modifications)
	{
		this.Passwords[Password.ID] = Password;

		// Remove the password from the tree if its sort data has changed
		if (Password.Category && (('Category' in Modifications) || ('Title' in Modifications)))
		{
			var Category = this.ViewTree.Get(Password.Category);
			Category.RemoveOne(Password);
			if (Category.Elements.length == 0)
				this.ViewTree.RemoveOneByKey(Password.Category);
		}
		else if (!Password.Category && ('Title' in Modifications))
		{
			this.ViewTree.RemoveOne(Password);
		}

		// Apply the modifications
		Password.Modify(Modifications);

		// (Re)situate the password in the tree. 
		if (Password.Category)
		{
			var Category = this.ViewTree.Get(Password.Category);
			if (!Category) 
			{
				Category = new CreateSortedArray(function(Element) { return Element.Title; });
				Category.Title = Password.Category;
				this.ViewTree.PlaceOneByKey(Category, Password.Category);
			}
			Category.PlaceOne(Password);
		}
		else
		{
			this.ViewTree.PlaceOne(Password);
		}
	}
};

// Interface auxiliary
var SetText = function(Element, Message)
{
	Element.innerHTML = '';
	Element.appendChild(document.createTextNode(Message));
}

var Element = 
{
	Expander: function(Label, Items)
	{
		var Out = document.createElement('div');
		Out.className = 'Expander';
		var Expansion = document.createElement('div');
		Expansion.className = 'Expansion Hidden';
		var Button = this.Button(Label, {
			Action: function()
			{
				if (Expansion.className == 'Expansion Hidden')
					Expansion.className = 'Expansion Visible';
				else 
					Expansion.className = 'Expansion Hidden';
			}
		});
		Out.appendChild(Button);
		Out.appendChild(Expansion);
		return Out;
	},
	BodyRow: function(Left, Right)
	{
		var Out = document.createElement('tr');
		var LeftCell = document.createElement('td');
		Left.forEach(function(Item) { LeftCell.appendChild(Item); });
		Out.appendChild(LeftCell);
		var RightCell = document.createElement('td');
		Right.forEach(function(Item) { RightCell.appendChild(Item); });
		Out.appendChild(RightCell);
		return Out;
	},
	BodyTitle: function(Message)
	{
		var Item = document.createElement('h1');
		Item.appendChild(document.createTextNode(Message));
		return this.BodyRow([], [Item]);
	},
	Text: function(Message)
	{
		var Out = document.createElement('p');
		Out.appendChild(document.createTextNode(Message));
		return Out;
	},
	BodyText: function(Message)
	{
		return this.BodyRow([], [this.Text(Message)]);
	},
	Error: function(Message)
	{
		var Out = document.createElement('p');
		Out.className = 'Error';
		Out.appendChild(document.createTextNode(Message));
		return Out;
	},
	Login: function(Optional)
	{
		var Out = document.createElement('div');
		Out.className = 'Input';
		var Entry = document.createElement('input');
		Entry.type = 'password';
		Entry.id = 'Focus';
		Out.appendChild(Entry);
		var Action = document.createElement('a');
		if ('Action' in Optional)
		{
			Action.onclick = function() { Optional['Action'](Entry.value); };
			Entry.onkeypress = Action.onkeypress = function(Event)
			{
				Event = Event || window.event;
				var Code = Event.keyCode || Event.which;
				if (Code == 13)
					Action.click();
			};
		}
		Out.appendChild(Action);
		return Out;
	},
	Button: function(Label, Optional)
	{
		var Out = document.createElement('div');
		Out.className = 'Input';
		Out.appendChild(document.createTextNode(Label));
		var Action = document.createElement('a');
		if ('Action' in Optional)
			Action.onclick = function() { Optional.Action(); };
		Out.appendChild(Action);
		return Out;
	},
	BodyButton: function(Label, Optional)
	{
		return this.BodyRow([], [this.Button(Label, Optional)]);
	},
	ExpanderButton: function(Label, Optional)
	{
		var Out = document.createElement('div');
		Out.className = 'Input';
		var Expansion = document.createElement('div');
		Expansion.className = 'Expansion Hidden';
		var Button = this.Button(Label, {
			Action: function()
			{
				if (Expansion.className == 'Expansion Hidden')
				{
					var ExpansionContents;
					if ('Action' in Optional)
						ExpansionContents = Optional.Action();
					if (!ExpansionContents) return;
					Expansion.appendChild(ExpansionContents);
					Expansion.className = 'Expansion Visible';
				}
				else 
				{
					Expansion.innerHTML = '';
					Expansion.className = 'Expansion Hidden';
				}
			}
		});
		Out.appendChild(Button);
		Out.appendChild(Expansion);
		return Out;
	},
	BodyTitleEntry: function(Label, Value, Optional)
	{
		Optional.Title = true;
		return this.BodyEntry(Label, Value, Optional);
	},
	BodyEntry: function(Label, Value, Optional)
	{
		var Out = document.createElement('div');
		Out.className = 'Input';
		var Input = document.createElement('input');
		Input.type = 'text';
		Input.value = Value;
		if ('Title' in Optional)
			Input.className = 'Title';
		var ReplaceInput = function()
		{
			var OldInput = Input;
			if (!OldInput)
			{
				if (Value.length > 35)
				{
					Input = document.createElement('textarea');
				}
				else
				{
					Input = document.createElement('input');
					Input.type = 'text';
				}
				Input.value = Value;
			}
			else 
			{
				if ((Input.value.length > 35) && (Input.tagName == 'INPUT'))
				{
					Input = document.createElement('textarea');
				}
				else if ((Input.value.length < 20) && (Input.tagName == 'TEXTAREA'))
				{
					Input = document.createElement('input');
					Input.type = 'text';
				}
				else return;
				Input.value = OldInput.value;
				Out.removeChild(OldInput);
			}
			Out.appendChild(Input);
			if (OldInput)
			{
				Input.focus();
				Input.selectionStart = OldInput.selectionStart;
				Input.selectionEnd = OldInput.selectionEnd;
				Input.onkeyup = OldInput.onkeyup;
			}
		}
		Input.onkeyup = function(Event)
		{
			ReplaceInput();
			if ('Action' in Optional)
				Optional.Action(this.value);
		};
		Out.appendChild(Input);
		return Element.BodyRow([document.createTextNode(Label)], [Out]);
	},
	BodyEntryButton: function(Value, Optional)
	{
		var Left = document.createElement('div');
		Left.className = 'Input';
		var Input = document.createElement('input');
		var Action = document.createElement('a');
		if ('Valid' in Optional)
			Input.onkeyup = function(Event)
			{
				var TrimmedValue = Input.value.trim();
				if (Input.className && Optional.Valid(TrimmedValue))
					Input.className = '';
				else if (!Input.className && !Optional.Valid(TrimmedValue))
					Input.className = 'Error';
			}
		if ('Action' in Optional)
			Action.onclick = function() { 
				var TrimmedValue = Input.value.trim();
				if (!('Valid' in Optional) || Optional.Valid(TrimmedValue))
					Optional.Action(TrimmedValue); 
			};
		Left.appendChild(Action);
		Input.type = 'text';
		Input.value = Value;
		Left.appendChild(Input);

		var Right = document.createElement('div');
		Right.className = 'NoInput';

		var Out = Element.BodyRow([Left], [Right]);
		Out.SetValue = function(NewValue)
		{
			Input.value = NewValue;
		};
		return Out;
	},
	Navigation: function()
	{
		var Out = document.createElement('td');
		return Out;
	},
	Body: function()
	{
		var Out = document.createElement('tbody');
		return Out;
	}
};

var Page = 
{
	Title: function(Body)
	{
		var Out = document.createDocumentFragment();
		for (var ElementIndex = 0; ElementIndex < Body.length; ElementIndex++) 
			Out.appendChild(Body[ElementIndex]);
		return [Out];
	},
	Main: function(Navigation, Body, Optional)
	{
		var NavigationBlockBody2 = document.createElement('tr');
		NavigationBlockBody2.appendChild(Navigation);
		var Logout = document.createElement('td');
		var LogoutButton = Element.Button('Logout', {
			Action: function() { if ('Logout' in Optional) Optional['Logout'](); }
		});
		NavigationBlockBody2.appendChild(LogoutButton);
		var NavigationBlockBody1 = document.createElement('tbody');
		NavigationBlockBody1.appendChild(NavigationBlockBody2);
		var NavigationBlock = document.createElement('table');
		NavigationBlock.className = 'Navigation';
		NavigationBlock.appendChild(NavigationBlockBody1);

		var BodyBlock = document.createElement('table');
		BodyBlock.className = 'Body';
		BodyBlock.appendChild(Body);

		return [NavigationBlock, BodyBlock];
	}
};

// Pages
function DetermineAndShowInitialPage()
{
	var MeetsRequirements = (function ()
	{
		try 
		{
			return 'localStorage' in window && window['localStorage'] !== null &&
				JSON;
		} 
		catch (Error) 
		{
			return false;
		}
	})();

	if (!MeetsRequirements)
	{
		ShowNotSupportedPage();
	}
	else
	{
		var LocalData = window['localStorage'].getItem('passworth');
		if (!LocalData)
		{
			ShowSetupPage();
		}
		else
		{
			ShowLoginPage();
		}
	}
}

function ShowPage(Body)
{
	document.body.innerHTML = '';
	Body.forEach(function (Element) { document.body.appendChild(Element); });
	if (document.getElementById('Focus'))
		document.getElementById('Focus').focus();
}

function ShowHistoryPage(Database, MainPageContext, Password)
{
	MainPageContext.Clear();
	MainPageContext.Navigation.appendChild(Element.Button('Back', {
		Action: function()
		{
			ShowPasswordPage(Database, MainPageContext, Password);
		}
	}));

	MainPageContext.Body.appendChild(Element.BodyTitle('History'));
	MainPageContext.Body.appendChild(Element.BodyText('Click on a record to restore the indicated value.'));
	var LastIndex = 0;
	var FirstRecordNode;
	function AddHistoryItems()
	{
		for (; LastIndex < Password.History.length; LastIndex += 1)
		{
			var Record = Password.History[LastIndex];
			var WrappedDate = new Date();
			WrappedDate.setTime(Record.Date);
			var RecordNode = Element.BodyRow([
				document.createTextNode(WrappedDate.toLocaleString())
			], [
				Element.BodyButton([Record.Name, ': ', Record.Value].join(), {
					Action: function()
					{
						Database.UpdatePassword(Password, {Name: Record.Name, Value: Record.Value, Date: new Date().getTime()});
						AddHistoryItems(); // Add new history from update to the page
					}
				})
			]);
			if (!FirstRecordNode) 
				MainPageContext.Body.appendChild(RecordNode);
			else MainPageContext.Body.insertBefore(RecordNode, FirstRecordNode);
			FirstRecordNode = RecordNode;
		}
	}
}

function ShowPasswordPage(Database, MainPageContext, Password)
{
	var Modifications = {};

	MainPageContext.Clear();
	MainPageContext.Navigation.appendChild(Element.ExpanderButton('Delete', {
		Action: function()
		{
			return Element.Button('Confirm', {
				Action: function()
				{
					Database.UpdatePassword(Password, {Name: 'Category', Value: 'Deleted', Date: newDate().getTime()});
					ShowMainPage(Database, MainPageContext);
				}
			});
		}
	}));
	MainPageContext.Navigation.appendChild(Element.ExpanderButton('History', {
		Action: function()
		{
			if (Object.keys(Modifications).length >= 1)
			{
				return Element.Button('Discard Changes', {
					Action: function()
					{
						ShowHistoryPage(Database, MainPageContext, Password);
					}
				});
			}
			ShowHistoryPage(Database, MainPageContext, Password);
			return null;
		}
	}));

	MainPageContext.Body.appendChild(Element.BodyTitleEntry('Title', Password.Title, {
		Action: function(Value) { Modifications.Title = {Value: Value, Date: new Date().getTime()}; }
	}));
	MainPageContext.Body.appendChild(Element.BodyEntry('Category', Password.Category, {
		Action: function(Value) { Modifications.Category = {Value: Value, Date: new Date().getTime()}; }
	}));
	MainPageContext.Body.appendChild(Element.BodyEntry('Notes', Password.Notes, {
		Action: function(Value) { Modifications.Notes = {Value: Value, Date: new Date().getTime()}; }
	}));

	for (var Name in Password.Present)
	{
		if (!Password.Present[Name].Value) continue;
		MainPageContext.Body.appendChild(Element.BodyEntry(Name, Password.Present[Name], {
			Action: function(Value) { Modifications[Password.Present[Name]] = { Value: Value, Date: new Date().getTime() }; }
		}));
	}

	var AddValueButton = Element.BodyEntryButton('Password 2', {
		Valid: function(Value)
		{
			if (!Value) return false;
			if (Value in Password.Present) return false;
			return true;
		},
		Action: function(Name)
		{
			Password.Present[Name] = { Value: '', Date: new Date().getTime() };
			MainPageContext.Body.insertBefore(Element.BodyEntry(Name, '', {
				Action: function(Value) { Modifications[Name] = { Value: Value, Date: new Date().getTime() }; }
			}), AddValueButton);
			AddValueButton.SetValue('');
		}
	});
	MainPageContext.Body.appendChild(AddValueButton);

	MainPageContext.Body.appendChild(Element.BodyRow([], [
		Element.Button('Save', {
			Action: function()
			{
				Database.UpdatePassword(Password, Modifications);
				Modifications = {};
			}
		}),
		Element.ExpanderButton('Close', {
			Action: function()
			{
				if (Object.keys(Modifications).length >= 1)
				{
					return Element.Button('Discard Changes', {
						Action: function()
						{
							ShowMainPage(Database, MainPageContext);
						}
					});
				}
				ShowMainPage(Database, MainPageContext);
				return null;
			}
		})
	]));
}

function ShowMainPage(Database, MainPageContext)
{
	if (!MainPageContext) 
	{
		MainPageContext = 
		{
			Clear: function()
			{
				this.Navigation.innerHTML = '';
				this.Body.innerHTML = '';
			}
		}
		MainPageContext.Navigation = Element.Navigation();
		MainPageContext.Body = Element.Body();
		ShowPage(Page.Main(MainPageContext.Navigation, MainPageContext.Body, {
			Logout: function()
			{
				DetermineAndShowInitialPage();
			}
		}));
	}
	else MainPageContext.Clear();
	MainPageContext.Navigation.appendChild(Element.Button('Create', {
		Action: function() 
		{ 
			var NewPassword = new CreatePassword();
			NewPassword.Title = 'New Password';
			ShowPasswordPage(Database, MainPageContext, NewPassword); 
		}
	}));
	MainPageContext.Navigation.appendChild(Element.Button('Export', {}));
	MainPageContext.Navigation.appendChild(Element.Button('Import', {}));
	MainPageContext.Navigation.appendChild(Element.Button('Settings', {}));

	var Passwords = [];
	Database.ViewTree.Elements.forEach(function(TreeNode)
	{
		if ('ID' in TreeNode)
		{
			Passwords.push(Element.Button(TreeNode.Title, {
				Action: function() { ShowPasswordPage(Database, MainPageContext, TreeNode); }
			}));
		}
		else
		{
			throw '1';
			var CategoryPasswords = [];
			TreeNode.Elements.forEach(function(TreeLeaf)
			{
				CategoryPasswords.push(Element.Button(TreeLeaf.Title, {
					Action: function() { ShowPasswordPage(Database, MainPageContext, TreeLeaf); }
				}));
			});
			Passwords.push(Element.Expander(TreeNode.Title, CategoryPasswords));
		}
	});
	MainPageContext.Body.appendChild(Element.BodyRow([], Passwords));
};

function ShowNotSupportedPage()
{
	ShowPage(Page.Title([
		Element.Error('You need a browser that supports localStorage, JSON for this application to work.')
	]));
};

function ShowSetupPage()
{
	ShowPage(Page.Title([
		Element.Login({
			Action: function(Value) 
			{ 
				ShowMainPage(new CreateDatabase(Value));
			}
		}),
		Element.Text('Welcome to Passworth.  Enter a new password above to initialize your password database.')
	]));
};

function ShowLoginPage()
{
	var Error = Element.Error('');
	Error.style.display = 'none';
	ShowPage(Page.Title([
		Element.Login({
			Action: function(Value)
			{
				if (LocalData.Version !== 0)
				{
					SetText(Error, 'Unrecognized database version.  Make sure the application is up-to-date.');
					Error.style.display = '';
					return;
				}
				var Database = new CreateDatabase(Value);
				if (!Database.Restore())
				{
					SetText(Error, 'Invalid password.');
					Error.style.display = '';
					return;
				}

				ShowMainPage(Database);
			}
		}),
		Error,
		Element.Text('Enter your database password above.')
	]));
};

window.onload = DetermineAndShowInitialPage;
