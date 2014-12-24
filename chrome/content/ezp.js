// structure defines common variables and functions
var ezp =
{
	fpicker		: Components.classes['@mozilla.org/filepicker;1']
							.createInstance(Components.interfaces.nsIFilePicker),
	icstream	: Components.classes['@mozilla.org/intl/converter-input-stream;1']
							.createInstance(Components.interfaces.nsIConverterInputStream),
	ifstream	: Components.classes['@mozilla.org/network/file-input-stream;1']
							.createInstance(Components.interfaces.nsIFileInputStream),
	ioSvc		: Components.classes['@mozilla.org/network/io-service;1']
							.getService(Components.interfaces.nsIIOService),
	isstream	: Components.classes["@mozilla.org/scriptableinputstream;1"]
							.getService(Components.interfaces.nsIScriptableInputStream),
	locale		: Components.classes['@mozilla.org/intl/stringbundle;1']
							.getService(Components.interfaces.nsIStringBundleService)
							.createBundle('chrome://ezp/locale/ezp.properties'),
	ocstream	: Components.classes['@mozilla.org/intl/converter-output-stream;1']
							.createInstance(Components.interfaces.nsIConverterOutputStream),
	ofstream	: Components.classes['@mozilla.org/network/file-output-stream;1']
							.createInstance(Components.interfaces.nsIFileOutputStream),
	parser		: Components.classes['@mozilla.org/xmlextras/domparser;1']
							.createInstance(Components.interfaces.nsIDOMParser),
	pref		: Components.classes['@mozilla.org/preferences-service;1']
							.getService(Components.interfaces.nsIPrefService).getBranch('extensions.errorzillaplus.'),
	promptSvc	: Components.classes['@mozilla.org/embedcomp/prompt-service;1']
							.getService(Components.interfaces.nsIPromptService),

	// refer to patcher.js
	patcher: null,

	// refer to proxySvc.js
	proxySvc: null,

	// refer to toolsPref.js
	toolsPref: null,

	// XHTML namespace resolver
	xhtmlResolver: function(prefix)
	{
		return 'http://www.w3.org/1999/xhtml';
	},

	OnPageLoad: function(event)
	{
		var safeDocument = event.originalTarget;
		if (safeDocument.documentURI.indexOf('about:neterror') != 0)
			return true;

		ezp.patcher.Patch(safeDocument);
	},

	HookPageLoad: function(event)
	{
		window.removeEventListener("load", ezp.HookPageLoad, false);

		var appcontent = document.getElementById('appcontent');
		if (appcontent)
			appcontent.addEventListener('DOMContentLoaded', ezp.OnPageLoad, true);
	},

	ReadFile: function(fileHandle)
	{
		// open with read-only permission
		this.ifstream.init(fileHandle, 0x01, -1, 0);
		this.icstream.init(this.ifstream, 'UTF-8', 1024, Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

		// convert to UTF-8
		var fileData = '', buffer = {};
		while (this.icstream.readString(4096, buffer) != 0)
			fileData += buffer.value;

		this.icstream.close();
		this.ifstream.close();

		return fileData;
	},

	WriteFile: function(fileHandle, fileData)
	{
		// open with write-only, create and truncation permission
		this.ofstream.init(fileHandle, -1, -1, 0);

		// convert to UTF-8
		this.ocstream.init(this.ofstream, 'UTF-8', 1024, Components.interfaces.nsIConverterOutputStream.DEFAULT_REPLACEMENT_CHARACTER);
		this.ocstream.writeString(fileData);

		this.ocstream.close();
		this.ofstream.close();
	},

	ReadURI: function(uri)
	{
		var channel = ezp.ioSvc.newChannel(uri, null, null);
		var inStream = channel.open();
		ezp.isstream.init(inStream);
		var uriData = ezp.isstream.read(inStream.available());
		ezp.isstream.close();
		inStream.close();

		return uriData;
	},

	proxy: function()
	{
		this.name = null;
		this.url = null;
		this.enc = null;
		this.trim = false;
	},
};
