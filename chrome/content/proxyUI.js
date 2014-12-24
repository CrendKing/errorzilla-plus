var LoadCurrentProxy = function()
{
	var proxyTree = window.opener.document.getElementById('proxyTree');
	var nameBox = document.getElementById('uiName');
	var urlBox = document.getElementById('uiURL');
	var encBox = document.getElementById('uiEncode');
	var trimBox = document.getElementById('uiTrim');

	nameBox.value = window.opener.ezp.proxySvc.proxies[proxyTree.currentIndex].name;
	urlBox.value = window.opener.ezp.proxySvc.proxies[proxyTree.currentIndex].url;
	encBox.value = window.opener.ezp.proxySvc.proxies[proxyTree.currentIndex].enc;
	trimBox.checked = window.opener.ezp.proxySvc.proxies[proxyTree.currentIndex].trim;
};

var TryProxy = function(action)
{
	var newProxy = new ezp.proxy;
	newProxy.name = document.getElementById('uiName').value;
	newProxy.url = document.getElementById('uiURL').value;
	newProxy.enc = document.getElementById('uiEncode').value;
	newProxy.trim = document.getElementById('uiTrim').checked;
	
	var error;
	switch (action)
	{
		case 'add':
			error = window.opener.ezp.proxySvc.AddProxy(newProxy);
			break;
		case 'edit':
			error = window.opener.ezp.proxySvc.EditProxy(newProxy);
			break;
		case 'test':
			window.opener.ezp.proxySvc.TestProxy(newProxy);
			return false;
		default:
			return false;
	}
	
	if (error[0] != 0)
	{
		var statusMsg = document.getElementById('uiStatus');
		statusMsg.style.color = '#f00';
		statusMsg.value = error[1];
	}

	return error[0] == 0;
};
