// Rules
// All divs have classes
// Elements only have classes to disambiguate themselves from other elements of the same type in the div/block

// Auxiliary
function Timestamp(Basis)
{
	if (!Basis) Basis = new Date();
	return Basis.getTime();
}

function NativeToUTF8(Input) 
{ 
	return unescape(encodeURIComponent(Input)); 
}

function UTF8ToNative(Input) 
{ 
	return decodeURIComponent(escape(Input)); 
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

function CreateSecret(Loaded)
{
	if (!Loaded)
	{
		var Now = new Date();
		Loaded = {
			ID: Now.getUTCFullYear() + '-' + Timestamp(Now), 
			Title: '',
			TitleDate: Timestamp(Now),
			Category: '',
			CategoryDate: Timestamp(Now),
			Notes: '',
			NotesDate: Timestamp(Now),
			Present: {
				Password: {Date: Timestamp(Now), Value: ''}
			},
			History: []
		};
	}
	this.ID = Loaded.ID;;
	this.Title = Loaded.Title;
	this.TitleDate = Loaded.TitleDate;
	this.Category = Loaded.Category;
	this.CategoryDate = Loaded.CategoryDate;
	this.Notes = Loaded.Notes;
	this.NotesDate = Loaded.NotesDate;
	this.Present = Loaded.Present;
	this.History = Loaded.History;
}
CreateSecret.prototype = {
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
	Merge: function(Secret)
	{
		// Merge the history
		var HistoryMatches = true;
		var NewHistory = [];
		var Index = 0;
		var MergeIndex = 0;
		while ((Index < this.History.length) && (MergeIndex < Secret.History.length))
		{
			var Record = this.History[Index];
			var MergeRecord = Secret.History[MergeIndex];

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
		AppendRemainingHistory(Index, this, Secret);
		AppendRemainingHistory(MergeIndex, Secret, this);

		this.History = NewHistory;
			
		// Merge post-historic values
		var Modifications = {};

		if (this.Title != Secret.Title)
		{
			if (this.TitleDate < Secret.TitleDate)
				Modifications.Title = {Date: Secret.TitleDate, Value: Secret.Title};
			else this.History.push({Name: 'Title', Value: Secret.Title, Date: Secret.TitleDate});
		}
		if (this.Category != Secret.Category)
		{
			if (this.CategoryDate < Secret.CategoryDate)
				Modifications.Category = { Date: Secret.CategoryDate, Value: Secret.Category };
			else this.History.push({Name: 'Category', Value: Secret.Category, Date: Secret.CategoryDate});
		}
		if (this.Notes != Secret.Notes)
		{
			if (this.NotesDate < Secret.NotesDate)
				Modifications.Notes = { Value: Secret.Notes, Date: Secret.NotesDate };
			else this.History.push({ Name: 'Notes', Value: Secret.Notes, Date: Secret.NotesDate });
		}
		for (var Name in Secret.Present)
		{
			var MergeProperty = Secret.Present[Name];
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

function GenerateKey(Secret, Salt)
{
	if (!Salt) Salt = sjcl.random.randomWords(2, 0);
	var SecretBytes = sjcl.codec.utf8String.toBits(NativeToUTF8(Secret));
	var Key = sjcl.misc.pbkdf2(SecretBytes, Salt, 1000).slice(0, 8);
	return {
		Salt: Salt,
		Key: Key,
		Cipher: new sjcl.cipher.aes(Key)
	};
}

function GetLetter(Title) { return Title.split('', 1)[0]; }

function CreateDatabase(Secret)
{
	this.Settings = {
		Secret: Secret,
		MergeSettings: false,
		ShowDeleted: false
	};
	this.Secrets = {};
	this.ViewTree = new CreateSortedArray(function(Element) { return Element.Title + Element.ID; });
	this._Key = GenerateKey(Secret);
}
CreateDatabase.prototype = 
{
	Serialize: function()
	{
		// Encrypt
		var SecretData = { Settings: this.Settings, Secrets: this.Secrets };
		var IV = sjcl.random.randomWords(4, 0);
		var PlainText = sjcl.codec.utf8String.toBits(NativeToUTF8(JSON.stringify(SecretData)));
		var CipherText = sjcl.mode.ccm.encrypt(this._Key.Cipher, PlainText, IV);
		return JSON.stringify({
			Filetype: 'Passworth',
			Version: 0,
			Data: { 
				CipherText: sjcl.codec.base64.fromBits(CipherText, false),
				IV: sjcl.codec.base64.fromBits(IV, false),
				Salt: sjcl.codec.base64.fromBits(this._Key.Salt, false)
			}
		});
	},
	Deserialize: function(StorageData, Secret)
	{
		try 
		{
			var Outer = JSON.parse(StorageData);
			if (!Outer || !('Version' in Outer) || !('Data' in Outer)) return null;
			// (Handle version back-compatibility here)
			var Key = GenerateKey(Secret, sjcl.codec.base64.toBits(Outer.Data.Salt));
			var Decrypted = sjcl.mode.ccm.decrypt(
				Key.Cipher, 
				sjcl.codec.base64.toBits(Outer.Data.CipherText),
				sjcl.codec.base64.toBits(Outer.Data.IV));
			if (!Decrypted) return null;
			return UTF8ToNative(sjcl.codec.utf8String.fromBits(Decrypted));
		}
		catch (Exception)
		{
			return null;
		}
	},
	Store: function()
	{
		window['localStorage'].setItem('passworth', this.Serialize());
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
		var Success = this.Merge(LocalData, this.Settings.Secret);
		this.Settings.MergeSettings = OldMergeSettings;
		return Success;
	},
	SetSecret: function(NewSecret)
	{
		this.Settings.Secret = NewSecret;
		this._RegenerateKey();
		this.Store();
	},
	Merge: function(Data, DataSecret)
	{
		var ResultString = this.Deserialize(Data, DataSecret);
		if (!ResultString) return false;
		var Result = JSON.parse(ResultString);
		if (this.Settings.MergeSettings)
			this.Settings = Result.Settings;
		for (var ID in Result.Secrets)
		{
			var Secret = Result.Secrets[ID];

			var OldCategory = Secret.Category;
			var OldTitle = Secret.Title;

			if (ID in this.Secrets)
				this.Secrets[ID].Merge(Secret);
			else this.Secrets[ID] = new CreateSecret(Secret);

			this._DisplaySecret(this.Secrets[ID], OldCategory, OldTitle);
		}
		return true;
	},
	_DisplaySecret: function(Secret, OldCategory, OldTitle)
	{
		this.Secrets[Secret.ID] = Secret;

		// Remove the password from the tree if its sort data has changed
		if (Secret.Category && ((Secret.Category != OldCategory) || (Secret.Title != OldTitle)))
		{
			var Category = this.ViewTree.Get(OldCategory);
			if (Category)
			{
				Category.RemoveOneByKey(OldTitle);
				if (Category.Elements.length == 0)
				{
					this.ViewTree.RemoveOneByKey(OldCategory);
				}
			}
		}
		else if (!Secret.Category && (Secret.Title != OldTitle))
		{
			this.ViewTree.RemoveOneByKey(OldTitle);
		}

		// (Re)situate the password in the tree. 
		if (Secret.Category)
		{
			var Category = this.ViewTree.Get(Secret.Category);
			if (!Category) 
			{
				Category = new CreateSortedArray(this.ViewTree.Accessor);
				Category.Title = Secret.Category;
				Category.ID = '';
				this.ViewTree.PlaceOneByKey(Category);
			}
			Category.PlaceOne(Secret);
		}
		else
		{
			this.ViewTree.PlaceOne(Secret);
		}
	},
	UpdateSecret: function(Secret, Modifications)
	{
		var OldCategory = Secret.Category;
		var OldTitle = Secret.Title;
		Secret.Modify(Modifications);
		this._DisplaySecret(Secret, OldCategory, OldTitle);
		this.Store();
	}
};

// Interface auxiliary
var Element = 
{
	Expander: function(Label, Items)
	{
		var Out = document.createElement('div');
		Out.className = 'Expander';
		var Expansion = document.createElement('div');
		Expansion.className = 'Expansion Hidden';
		Items.forEach(function(Item) { Expansion.appendChild(Item); });
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
	Title: function(Message)
	{
		var Out = document.createElement('h1');
		Out.appendChild(document.createTextNode(Message));
		return Out;
	},
	BodyTitle: function(Message)
	{
		return this.BodyRow([], [this.Title(Message)]);
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
	Notification: function(Message)
	{
		var Out = document.createElement('p');
		Out.className = 'Notification';
		Out.Set = function(Message)
		{
			Out.className = 'Notification';
			Out.innerHTML = '';
			Out.appendChild(document.createTextNode(Message));
		};
		Out.SetError = function(Message)
		{
			Out.className = 'Notification Error';
			Out.innerHTML = '';
			Out.appendChild(document.createTextNode(Message));
		};
		Out.SetSuccess = function(Message)
		{
			Out.className = 'Notification Success';
			Out.innerHTML = '';
			Out.appendChild(document.createTextNode(Message));
		};
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
		if ('Sublabel' in Optional)
		{
			var Sublabel = document.createElement('p');
			Sublabel.appendChild(document.createTextNode(Optional.Sublabel));
			Out.appendChild(Sublabel);
		}
		Out.appendChild(document.createTextNode(Label));
		var Action = document.createElement('a');
		if ('Action' in Optional)
			Action.onclick = function() { Optional.Action(); };
		Out.appendChild(Action);
		return Out;
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
	BodySecret: function(Label)
	{
		var Div = document.createElement('div');
		Div.className = 'Input';
		var Entry = document.createElement('input');
		Entry.type = 'password';
		Div.appendChild(Entry);
		var Out = this.BodyRow([document.createTextNode(Label)], [Div]);
		Out.GetValue = function() { return Entry.value; };
		return Out;
	},
	BodyFile: function(Label, Optional)
	{
		var Out = document.createElement('div');
		Out.className = 'Input';
		var Selector = document.createElement('input');
		Selector.type = 'file';
		if ('Action' in Optional)
			Selector.onchange = function(Event)
			{
				if (Selector.files.length >= 1)
					Optional.Action(Selector.files[0]);
			};
		Out.appendChild(Selector);
		return this.BodyRow([document.createTextNode(Label)], [Out]);
	},
	BodyToggle: function(Label, Value)
	{
		var Div = document.createElement('div');
		Div.className = 'Input';
		var Entry = document.createElement('input');
		Entry.type = 'checkbox';
		Entry.checked = Value;
		Div.appendChild(Entry);
		var Out = this.BodyRow([document.createTextNode(Label)], [Div]);
		Out.GetValue = function() { return Entry.checked; };
		return Out;
	},
	Jump: function(Name)
	{
		var Out = document.createElement('a');
		Out.href = '#' + encodeURIComponent(Name);
		Out.appendChild(document.createTextNode(Name));
		return Out;
	},
	Landing: function(Name)
	{
		var Out = document.createElement('a');
		Out.name = Name;
		Out.appendChild(document.createTextNode(Name));
		return Out;
	},
	Navigation: function(Name)
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
	sjcl.random.startCollectors();
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

function ShowHistoryPage(Database, MainPageContext, Secret)
{
	MainPageContext.Clear();
	MainPageContext.Navigation.appendChild(Element.Button('Back', {
		Action: function()
		{
			ShowSecretPage(Database, MainPageContext, Secret);
		}
	}));
	MainPageContext.Navigation.appendChild(Element.Title('History'));

	var Now = Timestamp(); // Date calculations are all in UTC
	var HourLength = 1000 * 60 * 60;
	var DayLength = HourLength * 24;
	var WeekLength = DayLength * 7;
	var MonthLength = DayLength * 30;
	var YearLength = DayLength * 365;
	var GetDateCategory = function(RecordDate)
	{
		var Difference = Now - RecordDate;
		var Base = new Date(Now);
		Base.setHours(0, 0, 0, 0);
		var Today = Base.getTime();
		if (RecordDate > Today)
		{
			if (Difference < HourLength) return { Text: 'Recent', Short: true };
			if (Difference < 2 * HourLength) return { Text: '1 hour ago', Short: true };
			if (Difference < 3 * HourLength) return { Text: '2 hours ago', Short: true };
			return { Text: 'Earlier today', Short: true };
		}

		var WeekOffset = Base.getDay() - 1;
		if (WeekOffset == -1) WeekOffset = 6;
		Base.setDate(Base.getDate() - WeekOffset);
		var ThisWeek = Base.getTime();

		Base.setDate(0);
		var ThisMonth = Base.getTime();
		if (RecordDate > ThisMonth)
		{
			if (RecordDate > ThisWeek)
			{
				if (RecordDate > Today - DayLength) return { Text: 'Yesterday', Short: true };
				return { Text: 'Earlier this week', Short: false };
			}
			if (RecordDate > ThisWeek - WeekLength) return { Text: 'Last week', Short: false };
			return { Text: 'Earlier this month', Short: false };
		}
			
		var LastMonth;
		if (Base.getMonth() > 0) LastMonth = Base.setMonth(Base.getMonth() - 1);
		Base.SetMonth(0);
		var ThisYear = Base.getTime();
		if (RecordDate > ThisYear)
		{
			if (LastMonth && (RecordDate > LastMonth)) return { Text: 'Last month', Short: false };
			return { Text: 'Earlier this year', Short: false };
		}

		Base.setFullYear(Base.getFullYear() - 1);
		var LastYear = Base.getTime();

		if (RecordDate > LastYear) 
			return { Text: 'Last year', Short: false };

		return { Text: 'Years ago', Short: false };
	};

	MainPageContext.Body.appendChild(Element.BodyText('Click on a record to restore the indicated value.'));

	var FirstRecordElement;
	var LastIndex = Secret.History.length - 1;
	function CreateRecordElement(Record, ShortDate)
	{
		var WrappedDate = new Date();
		WrappedDate.setTime(Record.Date);
		return Element.Button([Record.Name, ': ', Record.Value].join(''), {
			Sublabel: ShortDate ? 
				WrappedDate.toLocaleTimeString() : 
				(WrappedDate.toLocaleDateString() + ' - ' + WrappedDate.toLocaleTimeString()),
			Action: function()
			{
				Database.UpdateSecret(Secret, {Name: Record.Name, Value: Record.Value, Date: Timestamp()});
				for (; LastIndex < Secret.History.length; LastIndex += 1)
				{
					FirstRecordElement.parentNode.insertBefore(
						CreateRecordElement(Secret.History[LastIndex], true), FirstRecordElement);
				}
			}
		});
	};

	var Categories = [];
	var LastCategory;
	var RecordElements = [];
	for (var Index = Secret.History.length; Index > 0; Index -= 1)
	{
		var Record = Secret.History[Index - 1];
		var CategoryInfo = GetDateCategory(Record.Date);
		if (CategoryInfo.Text !== LastCategory)
		{
			var CategoryJumpElement = Element.Jump(CategoryInfo.Text);
			Categories.push(CategoryJumpElement);

			var CategoryElement = Element.Landing(CategoryInfo.Text);
			LastCategory = CategoryInfo.Text;
			RecordElements.push(CategoryElement);
		}
		var RecordElement = CreateRecordElement(Record, CategoryInfo.Short);
		if (!FirstRecordElement) FirstRecordElement = RecordElement;
		RecordElements.push(RecordElement);
	}
	MainPageContext.Body.appendChild(Element.BodyRow(Categories, RecordElements));
}

function ShowSecretPage(Database, MainPageContext, Secret)
{
	var Modifications = {};

	MainPageContext.Clear();
	MainPageContext.Navigation.appendChild(Element.ExpanderButton('Delete', {
		Action: function()
		{
			return Element.Button('Confirm', {
				Action: function()
				{
					Database.UpdateSecret(Secret, {Name: 'Category', Value: 'Deleted', Date: newDate().getTime()});
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
						ShowHistoryPage(Database, MainPageContext, Secret);
					}
				});
			}
			ShowHistoryPage(Database, MainPageContext, Secret);
			return null;
		}
	}));

	MainPageContext.Body.appendChild(Element.BodyTitleEntry('Title', Secret.Title, {
		Action: function(Value) { Modifications.Title = {Value: Value, Date: Timestamp()}; }
	}));
	MainPageContext.Body.appendChild(Element.BodyEntry('Category', Secret.Category, {
		Action: function(Value) { Modifications.Category = {Value: Value, Date: Timestamp()}; }
	}));
	MainPageContext.Body.appendChild(Element.BodyEntry('Notes', Secret.Notes, {
		Action: function(Value) { Modifications.Notes = {Value: Value, Date: Timestamp()}; }
	}));

	for (var Name in Secret.Present)
	{
		if (!Secret.Present[Name].Value) continue;
		MainPageContext.Body.appendChild(Element.BodyEntry(Name, Secret.Present[Name], {
			Action: function(Value) { Modifications[Secret.Present[Name]] = { Value: Value, Date: Timestamp() }; }
		}));
	}

	var AddValueButton = Element.BodyEntryButton('Password 2', {
		Valid: function(Value)
		{
			if (!Value) return false;
			if (Value in Secret.Present) return false;
			return true;
		},
		Action: function(Name)
		{
			Secret.Present[Name] = { Value: '', Date: Timestamp() };
			MainPageContext.Body.insertBefore(Element.BodyEntry(Name, '', {
				Action: function(Value) { Modifications[Name] = { Value: Value, Date: Timestamp() }; }
			}), AddValueButton);
			AddValueButton.SetValue('');
		}
	});
	MainPageContext.Body.appendChild(AddValueButton);

	MainPageContext.Body.appendChild(Element.BodyRow([], [
		Element.Button('Save', {
			Action: function()
			{
				Database.UpdateSecret(Secret, Modifications);
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

function ShowImportPage(Database, MainPageContext)
{
	MainPageContext.Clear();
	MainPageContext.Navigation.appendChild(Element.Button('Back', {
		Action: function() { ShowMainPage(Database, MainPageContext); }
	}));
	MainPageContext.Navigation.appendChild(Element.Title('Import'));

	var ImportNotification = Element.Notification();
	MainPageContext.Body.appendChild(ImportNotification);
	var ImportData;
	MainPageContext.Body.appendChild(Element.BodyFile('Select Database', {
		Action: function(File)
		{
			ImportNotification.Set('Reading...');
			var Reader = new FileReader();
			Reader.onerror = function()
			{
				ImportNotification.SetError('Could not open file.  Check that you are permitted to read the file.');
			};
			Reader.onload = function()
			{
				ImportData = Reader.result;
				ImportNotification.SetSuccess('File ready to import.');
			};
			Reader.readAsText(File, 'utf-8');
		}
	}));
	var ImportSecret = Element.BodySecret('Imported Database Secret');
	MainPageContext.Body.appendChild(ImportSecret);
	MainPageContext.Body.appendChild(Element.BodyRow([], [
		Element.Button('Import', {
			Action: function()
			{
				if (!ImportData)
				{
					ImportNotification.SetError('You must first select a file to import.');
					return;
				}
				var Deserialized = Database.Deserialize(ImportData, ImportSecret.GetValue());
				if (!Deserialized)
				{
					ImportNotification.SetError('Either your password was incorrect or the selected file is invalid.');
					return;
				}
				Database.Merge(Deserialized);
				ImportNotification.SetSuccess('Import successful.');
			}
		})
	]));
}

function ShowSettingsPage(Database, MainPageContext)
{
	MainPageContext.Clear();
	MainPageContext.Navigation.appendChild(Element.Button('Back', {
		Action: function() { ShowMainPage(Database, MainPageContext); }
	}));
	MainPageContext.Navigation.appendChild(Element.Title('Settings'));

	MainPageContext.Body.appendChild(Element.BodyTitle('Change Database Secret'));
	var DatabaseSecretNotification = Element.Notification();
	var OldDatabaseSecret = Element.BodySecret('Current Secret');
	var NewDatabaseSecret1 = Element.BodySecret('New Secret');
	var NewDatabaseSecret2 = Element.BodySecret('Confirm New Secret');
	MainPageContext.Body.appendChild(Element.BodyRow([], [DatabaseSecretNotification]));
	MainPageContext.Body.appendChild(OldDatabaseSecret);
	MainPageContext.Body.appendChild(NewDatabaseSecret1);
	MainPageContext.Body.appendChild(NewDatabaseSecret2);
	MainPageContext.Body.appendChild(Element.BodyRow([], [
		Element.Button('Change', {
			Action: function()
			{
				if (OldDatabaseSecret.value !== Database.Settings.Secret)
				{
					DatabaseSecretNotification.SetError('Current Secret is incorrect.');
					return;
				}
				if (NewDatabaseSecret1.value !== NewDatabaseSecret2.value)
				{
					DatabaseSecretNotification.SetError('New Secret and Confirm New Secret do not match.');
					return;
				}
				Database.SetSecret(NewDatabaseSecret1.value);
				DatabaseSecretNotification.Set('Database secret successfully changed.');
			}
		})
	]));

	MainPageContext.Body.appendChild(Element.BodyTitle('Preferences'));
	var MergeSettings = Element.BodyToggle('Merge settings from imported data', Database.Settings.MergeSettings);
	MainPageContext.Body.appendChild(MergeSettings);
	var ShowDeleted = Element.BodyToggle('Show deleted secrets', Database.Settings.ShowDeleted);
	MainPageContext.Body.appendChild(ShowDeleted);
	MainPageContext.Body.appendChild(Element.BodyRow([], [
		Element.Button('OK', {
			Action: function()
			{
				Database.Settings.MergeSettings = MergeSettings.GetValue();
				Database.Settings.ShowDeleted = ShowDeleted.GetValue();
				ShowMainPage(Database, MainPageContext);
			}
		}),
		Element.Button('Close', {
			Action: function() { ShowMainPage(Database, MainPageContext); }
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
			var NewSecret = new CreateSecret();
			NewSecret.Title = 'New Secret';
			ShowSecretPage(Database, MainPageContext, NewSecret); 
		}
	}));
	MainPageContext.Navigation.appendChild(Element.ExpanderButton('Export', {
		Action: function()
		{
			var Out = document.createElement('a');
			Out.download = 'PasswordDatabase.passworth';
			Out.href = 'data:application/passworth;charset=utf-8,' + encodeURIComponent(Database.Serialize());
			Out.appendChild(document.createTextNode('Save'));
			return Out;
		}
	}));
	MainPageContext.Navigation.appendChild(Element.Button('Import', {
		Action: function(File)
		{
			ShowImportPage(Database, MainPageContext);
		}
	}));
	MainPageContext.Navigation.appendChild(Element.Button('Settings', {
		Action: function()
		{
			ShowSettingsPage(Database, MainPageContext);
		}
	}));

	var Secrets = [];
	var SecretLetters = [];
	var LastLetter;
	Database.ViewTree.Elements.forEach(function(TreeNode)
	{
		if (GetLetter(TreeNode.Title) != LastLetter)
		{
			LastLetter = GetLetter(TreeNode.Title);
			SecretLetters.push(Element.Jump(LastLetter));
			Secrets.push(Element.Landing(LastLetter));
		}
		if (!('Elements' in TreeNode))
		{
			Secrets.push(Element.Button(TreeNode.Title, {
				Action: function() { ShowSecretPage(Database, MainPageContext, TreeNode); }
			}));
		}
		else if (!Database.Settings.ShowDeletedSecrets || (TreeNode.Title !== 'Deleted'))
		{
			var CategorySecrets = [];
			TreeNode.Elements.forEach(function(TreeLeaf)
			{
				CategorySecrets.push(Element.Button(TreeLeaf.Title, {
					Action: function() { ShowSecretPage(Database, MainPageContext, TreeLeaf); }
				}));
			});
			Secrets.push(Element.Expander(TreeNode.Title, CategorySecrets));
		}
	});
	MainPageContext.Body.appendChild(Element.BodyRow(SecretLetters, Secrets));
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
		Element.Text('Welcome to Passworth.  Enter a new password above to initialize your password database.'),
		//Element.List('Language', [{External: 'English', Internal: 'en'}])
	]));
};

function ShowLoginPage()
{
	var Error = Element.Notification();
	ShowPage(Page.Title([
		Element.Login({
			Action: function(Value)
			{
				var Database = new CreateDatabase(Value);
				if (!Database.Restore())
				{
					Error.SetError('Invalid password.');
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
