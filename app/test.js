// Sorted array tests
function CompareArrays(Expected, Test)
{
	if (Expected.length != Test.Elements.length)
		throw JSON.stringify({Expected: Expected.length, Got: Test.Elements.length});
	for (var Index = 0; Index < Expected.length; Index++)
	{
		if (Expected[Index] != Test.Elements[Index])
			throw JSON.stringify({Index: Index, Expected: Expected[Index], Got: Test.Elements[Index]});
	}
}

(function()
{
	var Expected = [1];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.RemoveOne(1);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [0, 1];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(0);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [1, 2];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(2);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [1, 1.5, 2];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(2);
	Test.PlaceOne(1.5);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [1];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(2);
	Test.RemoveOne(2);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [2];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(2);
	Test.RemoveOne(1);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [1, 2];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(2);
	Test.PlaceOne(1.5);
	Test.RemoveOne(1.5);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [1];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(1);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	var Got = Test.Get(1);
	if (!Got) throw Got;
})();

(function()
{
	var Expected = [1, 5];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(5);
	Test.PlaceOne(7);
	Test.ReplaceOne(7, 1);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [1, 5];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(5);
	Test.PlaceOne(1);
	Test.ReplaceOne(1, 1);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [5, 7];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(5);
	Test.PlaceOne(7);
	Test.ReplaceOne(7, 7);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [0, 1, 3];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(2);
	Test.PlaceOne(3);
	Test.ReplaceOne(2, 0);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [1, 3, 4];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(2);
	Test.PlaceOne(3);
	Test.ReplaceOne(2, 4);
	CompareArrays(Expected, Test);
})();

(function()
{
	var Expected = [1, 2, 3];
	var Test = new CreateSortedArray(function(Element) { return Element; });
	Test.PlaceOne(1);
	Test.PlaceOne(2);
	Test.PlaceOne(3);
	Test.ReplaceOne(2, 2);
	CompareArrays(Expected, Test);
})();

// Password modification tests
function ComparePasswords(Expected, Got)
{
	if (Expected.Title != Got.Title)
		throw JSON.stringify({ Expected: Expected.Title, Got: Got.Title });
	if (Expected.TitleDate != Got.TitleDate)
		throw JSON.stringify({ Expected: Expected.TitleDate, Got: Got.TitleDate });

	if (Expected.Category != Got.Category)
		throw JSON.stringify({ Expected: Expected.Category, Got: Got.Category });
	if (Expected.CategoryDate != Got.CategoryDate)
		throw JSON.stringify({ Expected: Expected.CategoryDate, Got: Got.CategoryDate });

	if (Expected.Notes != Got.Notes)
		throw JSON.stringify({ Expected: Expected.Notes, Got: Got.Notes });
	if (Expected.NotesDate != Got.NotesDate)
		throw JSON.stringify({ Expected: Expected.NotesDate, Got: Got.NotesDate });

	var AllProperties = {};
	for (var Key in Expected.Present) AllProperties[Key] = 1;
	for (var Key in Got.Present) AllProperties[Key] = 1;
	for (var Key in AllProperties)
	{
		if (!(Key in Expected.Present))
			throw JSON.stringify({ ShouldntHave: Key });
		if (!(Key in Got.Present))
			throw JSON.stringify({ Missing: Key });
		if (Expected.Present[Key].Value != Got.Present[Key].Value)
			throw JSON.stringify({ Key: Key, Expected: Expected.Present[Key].Value, Got: Got.Present[Key].Value });
		if (Expected.Present[Key].Date != Got.Present[Key].Date)
			throw JSON.stringify({ Key: Key, Expected: Expected.Present[Key].Date, Got: Got.Present[Key].Date });
	}

	if (Expected.History.length != Got.History.length)
		throw JSON.stringify({ Expected: Expected.History.length, Got: Got.History.length });
	for (var Index = 0; Index < Expected.History.length; Index++)
	{
		var ExpectedRecord = Expected.History[Index];
		var GotRecord = Got.History[Index];
		if (ExpectedRecord.Name != GotRecord.Name)
			throw JSON.stringify({ Index: Index, Expected: ExpectedRecord.Name, Got: GotRecord.Name });
		if (ExpectedRecord.Value != GotRecord.Value)
			throw JSON.stringify({ Index: Index, Expected: ExpectedRecord.Value, Got: GotRecord.Value });
		if (ExpectedRecord.Date != GotRecord.Date)
			throw JSON.stringify({ Index: Index, Expected: ExpectedRecord.Date, Got: GotRecord.Date });
	}
};

(function()
{
	var Expected = {
		Title: '1', TitleDate: 10,
		Category: '', CategoryDate: 0,
		Notes: '', NotesDate: 0,
		Present: {
			Password: { Value: '', Date: 0 }
		},
		History: [ { Name: 'Title', Value: '', Date: 0 } ]
	};
	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;

	var Modifications = { Title: { Value: '1', Date: 10 } };

	Test.Modify(Modifications);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '', TitleDate: 0,
		Category: '1', CategoryDate: 10,
		Notes: '', NotesDate: 0,
		Present: {
			Password: { Value: '', Date: 0 }
		},
		History: [ { Name: 'Category', Value: '', Date: 0 } ]
	};
	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;

	var Modifications = { Category: { Value: '1', Date: 10 } };

	Test.Modify(Modifications);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '', TitleDate: 0,
		Category: '', CategoryDate: 0,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '', Date: 0 }
		},
		History: [ { Name: 'Notes', Value: '', Date: 0 } ]
	};
	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;

	var Modifications = { Notes: { Value: '1', Date: 10 } };

	Test.Modify(Modifications);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '', TitleDate: 0,
		Category: '', CategoryDate: 0,
		Notes: '', NotesDate: 0,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [ { Name: 'Password', Value: '', Date: 0 } ]
	};
	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;

	var Modifications = { Password: { Value: '1', Date: 10 } };

	Test.Modify(Modifications);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '', TitleDate: 0,
		Category: '', CategoryDate: 0,
		Notes: '', NotesDate: 0,
		Present: {
			Password: { Value: '', Date: 20 }
		},
		History: [ 
			{ Name: 'Password', Value: '', Date: 0 },
			{ Name: 'Password', Value: '1', Date: 10 }
		]
	};
	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;

	Test.Modify({ Password: { Value: '1', Date: 10 } });
	Test.Modify({ Password: { Value: '', Date: 20 } });

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '', TitleDate: 0,
		Category: '', CategoryDate: 0,
		Notes: '', NotesDate: 0,
		Present: {
			Password: { Value: '', Date: 0 },
			Lumbar: { Value: '1', Date: 10 }
		},
		History: []
	};
	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;

	Test.Modify({ Lumbar: { Value: '1', Date: 10 } });

	ComparePasswords(Expected, Test);
})();

// Password merge tests
(function()
{
	var Expected = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 }
		]
	};

	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;
	Test.Modify({
		Title: { Value: '1', Date: 10 },
		Category: { Value: '1', Date: 10 },
		Notes: { Value: '1', Date: 10 },
		Password: { Value: '1', Date: 10 }
	});
	
	var Test2 = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 }
		]
	};
	
	Test.Merge(Test2);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 }
		]
	};

	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;
	Test.Modify({
		Title: { Value: '1', Date: 10 },
		Category: { Value: '1', Date: 10 },
		Notes: { Value: '1', Date: 10 },
		Password: { Value: '1', Date: 10 }
	});
	
	var Test2 = {
		Title: '', TitleDate: 0,
		Category: '', CategoryDate: 0,
		Notes: '', NotesDate: 0,
		Present: {
			Password: { Value: '', Date: 0 }
		},
		History: [
		]
	};
	
	Test.Merge(Test2);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 }
		]
	};

	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;
	
	var Test2 = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 }
		]
	};
	
	Test.Merge(Test2);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 },
			{ Name: 'Title', Value: '2', Date: 5 },
			{ Name: 'Category', Value: '2', Date: 5 },
			{ Name: 'Notes', Value: '2', Date: 5 },
			{ Name: 'Password', Value: '2', Date: 5 }
		]
	};

	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;
	Test.Modify({
		Title: { Value: '1', Date: 10 },
		Category: { Value: '1', Date: 10 },
		Notes: { Value: '1', Date: 10 },
		Password: { Value: '1', Date: 10 }
	});
	
	var Test2 = {
		Title: '2', TitleDate: 5,
		Category: '2', CategoryDate: 5,
		Notes: '2', NotesDate: 5,
		Present: {
			Password: { Value: '2', Date: 5 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 }
		]
	};
	
	Test.Merge(Test2);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 },
			{ Name: 'Title', Value: '2', Date: 5 },
			{ Name: 'Category', Value: '2', Date: 5 },
			{ Name: 'Notes', Value: '2', Date: 5 },
			{ Name: 'Password', Value: '2', Date: 5 }
		]
	};

	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;
	Test.Modify({
		Title: { Value: '2', Date: 5 },
		Category: { Value: '2', Date: 5 },
		Notes: { Value: '2', Date: 5 },
		Password: { Value: '2', Date: 5 }
	});
	
	var Test2 = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 }
		]
	};
	
	Test.Merge(Test2);

	ComparePasswords(Expected, Test);
})();

(function()
{
	var Expected = {
		Title: '1', TitleDate: 10,
		Category: '1', CategoryDate: 10,
		Notes: '1', NotesDate: 10,
		Present: {
			Password: { Value: '1', Date: 10 },
			Lumbar: { Value: '2', Date: 20 }
		},
		History: [
			{ Name: 'Title', Value: '', Date: 0 },
			{ Name: 'Category', Value: '', Date: 0 },
			{ Name: 'Notes', Value: '', Date: 0 },
			{ Name: 'Password', Value: '', Date: 0 }
		]
	};

	var Test = new CreateSecret();
	Test.TitleDate = 0;
	Test.CategoryDate = 0;
	Test.NotesDate = 0;
	Test.Present.Password.Date = 0;
	Test.Modify({
		Title: { Value: '1', Date: 10 },
		Category: { Value: '1', Date: 10 },
		Notes: { Value: '1', Date: 10 },
		Password: { Value: '1', Date: 10 }
	});
	
	var Test2 = {
		Title: '', TitleDate: 0,
		Category: '', CategoryDate: 0,
		Notes: '', NotesDate: 0,
		Present: {
			Password: { Value: '', Date: 0 },
			Lumbar: { Value: '2', Date: 20 }
		},
		History: [
		]
	};
	
	Test.Merge(Test2);

	ComparePasswords(Expected, Test);
})();

// UTF8 conversion
(function()
{
	var Native = 'dog';
	var UTF8 = 'dog';
	var Converted = NativeToUTF8(Native);
	if (Converted !== UTF8)
		throw "Expected: " + UTF8 + ", got: " + Converted;
})();

(function()
{
	var UTF8 = 'dog';
	var Native = 'dog';
	var Converted = UTF8ToNative(UTF8);
	if (Converted !== Native)
		throw "Expected: " + Native + ", got: " + Converted;
})();

(function()
{
	var Native = '\u5B50\u4F9B';
	var UTF8 = '\xE5\xAD\x90\xE4\xBE\x9B';
	var Converted = NativeToUTF8(Native);
	if (Converted !== UTF8)
		throw "Expected: " + UTF8 + ", got: " + Converted;
})();

(function()
{
	var Native = '\u5B50\u4F9B';
	var UTF8 = '\xE5\xAD\x90\xE4\xBE\x9B';
	var Converted = UTF8ToNative(UTF8);
	if (Converted !== Native)
		throw 'Expected: ' + Native + ', got: ' + Converted;
})();

// Encryption, decryption
(function()
{
	var Salt = [588169339, -600533108];
	var SecretBytes = sjcl.codec.utf8String.toBits('join');
	var Key = sjcl.misc.pbkdf2(SecretBytes, Salt, 1000).slice(0, 8);
	var Cipher = new sjcl.cipher.aes(Key);
	var IV = [73868294, 1634350578, 1055428797, -1313435180];
	var PlainText = sjcl.codec.utf8String.toBits('plaintext');
	var CipherText = sjcl.mode.ccm.encrypt(Cipher, PlainText, IV);

	var PreResult = sjcl.mode.ccm.decrypt(Cipher, CipherText, IV);
	var Result = sjcl.codec.utf8String.fromBits(PreResult);

	if (Result !== 'plaintext')
		throw 'PlainText: ' + Result + ', expected: plaintext';
})();

