ezp.proxySvc = 
{
	// array of proxy objects
	proxies: [],
		
	// XUL tree representing proxy list
	proxyTree: null,
		
	childWindow: null,
		
	encodings: {'Base64': null, 'ROT13': null},
	
	// update the proxy tree view according to the proxy data
	RefreshView: function()
	{
		function MakeView(proxies)
		{
			this.rowCount = proxies.length;
			this.getRowProperties = function(index, properties) {};
			this.getCellProperties = function(row, col, properties) {};
			this.getColumnProperties = function(col, properties) {};
			this.isContainer = function() { return false; };
			this.isSeparator = function(index) { return false; };
			this.isSorted = function() { return false; };
			this.getImageSrc = function(row, col) { return null; };
			this.getCellText = function(row, col) { return proxies[row][col.id]; };
			this.getCellValue = function(row, col) { return proxies[row][col.id]; };
			this.setTree = function(tree) {};
			this.cycleHeader = function(col) {};
		};
		
		this.proxyTree.view = new MakeView(this.proxies);
	},

	SaveProxies: function()
	{
		ezp.pref.setCharPref('proxies', JSON.stringify(this.proxies));
	},

	// check if the specific proxy is compatible with current proxies
	CheckError: function(proxy)
	{
		// proxy name must not be empty
		if (proxy.name == '')
			return [1, ezp.locale.GetStringFromName('error.proxy.emptyName')];
		
		// URL prefix must be starting with 'http://' or 'https://'
		if (proxy.url.indexOf('http://') != 0 && proxy.url.indexOf('https://') != 0)
			return [2, ezp.locale.GetStringFromName('error.proxy.startWithHTTP')];

		// proxy name must be different to other ones
		for (var i = 0; i < this.proxies.length; ++i)
		{
			if (this.proxies[i].name == proxy.name)
				return [3, ezp.locale.GetStringFromName('error.proxy.nameAssigned')];
		}
		
		// 0 means no error
		return [0, null];
	},
	
	// load compatible proxies from the specific proxy data
	LoadProxies: function(newProxies)
	{
		// string contains failed proxies
		var failed = '';
		
		for (var i = 0; i <newProxies.length; ++i)
		{
			var currProxy = newProxies[i];
			
			// proxy encoding is unknown, use None
			if (!this.encodings.hasOwnProperty(currProxy.enc))
				currProxy.enc = 'None';
			
			var error = this.CheckError(currProxy);
			if (error[0] == 0)
				this.proxies.push(currProxy);
			else
				failed += this.proxies[i].name + ': ' + error[1] + '\n';
		}
		
		if (failed != '')
			ezp.promptSvc.alert(
				window.opener,
				ezp.locale.GetStringFromName('title.proxy.error'),
				ezp.locale.formatStringFromName('error.proxy.validate', [failed], 1));
	},
		
	TestProxy: function(newProxy)
	{
		var statusMsg = this.childWindow.document.getElementById('uiStatus');
		var testProg = this.childWindow.document.getElementById('uiProgress');
		var testURL = 'http://www.google.com';

		var proxifiedAddr = GetProxifiedAddr(testURL, newProxy.url, newProxy.enc, newProxy.trim);
		var req = new XMLHttpRequest();
		
		req.open('GET', proxifiedAddr, true);
		req.onreadystatechange = function(event)
		{
			if (req.readyState == 4)
			{
				statusMsg.hidden = false;
				testProg.hidden = true;
				
				if (req.status == 200 && req.responseText.indexOf('<title>Google</title>') != -1)
				{
					statusMsg.style.color = '#090';
					statusMsg.value = ezp.locale.GetStringFromName('info.proxy.good');
				}
				else
				{
					statusMsg.style.color = '#f00';
					statusMsg.value = ezp.locale.GetStringFromName('info.proxy.bad');
				}
			}
		}
		req.send(null);
		
		statusMsg.hidden = true;
		testProg.hidden = false;
	},
	
	// add the specific proxy to record and represent updates
	AddProxy: function(newProxy)
	{
		// check compatibility
		var error = this.CheckError(newProxy);
		if (error[0] == 0)
		{
			// if no error, update proxy data
			this.proxies.push(newProxy);
			this.SaveProxies();
			this.RefreshView();
		}
		
		return error;
	},
	
	// change the currently selected proxy to the new one
	EditProxy: function(newProxy)
	{
		var error = this.CheckError(newProxy);
		var oldName = this.proxies[this.proxyTree.currentIndex].name;
		
		// the new name can either be the old one, or be different to other ones
		if ( error[0] == 0 || (error[0] == 3 && oldName == newProxy.name) )
		{
			error[0] = 0;
			
			this.proxies[this.proxyTree.currentIndex] = newProxy;
			this.SaveProxies();
			this.RefreshView();
		}
		
		return error;
	},
	
	// remove selected proxy
	RemoveSel: function()
	{
		this.proxies.splice(this.proxyTree.currentIndex, 1);
		this.SaveProxies();
		this.RefreshView();
	},
	
	// remove all proxies
	RemoveAll: function()
	{
		this.proxies = [];
		this.SaveProxies();
		this.RefreshView();
	},
	
	Import: function(isReplace)
	{
		ezp.fpicker.init(
			window,
			ezp.locale.GetStringFromName('title.proxy.import'),
			Components.interfaces.nsIFilePicker.modeOpen);
		ezp.fpicker.appendFilters(
			Components.interfaces.nsIFilePicker.filterText |
			Components.interfaces.nsIFilePicker.filterAll);
		ezp.fpicker.defaultExtension = 'txt';
		ezp.fpicker.filterIndex = 1;
		
		if (ezp.fpicker.show() != Components.interfaces.nsIFilePicker.returnCancel)
		{
			try
			{
				var fileData = ezp.ReadFile(ezp.fpicker.file).replace(/.+ = |;/g, '');
				var newProxies = JSON.parse(fileData);
				
				if (isReplace)
					this.proxies = [];
				
				this.LoadProxies(newProxies);
				this.SaveProxies();
				this.RefreshView();
			}
			catch (e)
			{
				ezp.promptSvc.alert(
					null,
					ezp.locale.GetStringFromName('title.proxy.error'),
					ezp.locale.formatStringFromName('error.proxy.load', [e], 1));
			}
		}
	},
	
	Export: function()
	{
		ezp.fpicker.init(
			window,
			ezp.locale.GetStringFromName('title.proxy.export'),
			Components.interfaces.nsIFilePicker.modeSave);
		ezp.fpicker.appendFilters(
			Components.interfaces.nsIFilePicker.filterText |
			Components.interfaces.nsIFilePicker.filterAll);
		ezp.fpicker.defaultExtension = 'txt';
		ezp.fpicker.filterIndex = 1;
		
		if (ezp.fpicker.show() != Components.interfaces.nsIFilePicker.returnCancel)
			ezp.WriteFile(ezp.fpicker.file, JSON.stringify(this.proxies));
	},

	Stringify: function()
	{
		return ezp.pref.getCharPref('proxies');
	},
	
	LoadProxyTree: function()
	{
		var newProxies = JSON.parse(this.Stringify());
		this.LoadProxies(newProxies);
		
		this.proxyTree = document.getElementById('proxyTree');
		this.RefreshView();
	},
	
	ShowWindow: function(filename)
	{
		this.childWindow = window.open(filename, '', 'centerscreen, chrome, dialog, resizable');
	},
};
