var AutoRetry = function()
{
	if (!ezpTools)
		return;

	if (!ezpTools.retry_enable)
		return;

	if (ezpTools.retry_timeout && getErrorCode() != 'netTimeout')
		return;

	var RetryFunc = function()
	{
		unsafeDocument.getElementById('ezpTryAgain').click();
	};

	safeWindow.setTimeout(RetryFunc, ezpTools.retry_interval * 1000);
};

var LoadProxyList = function()
{
	var proxyList = unsafeDocument.getElementById('ezpProxyList');
	if (!proxyList)
		return;

	var proxyListBody = proxyList.getElementsByTagName('tbody')[0];

	for (var i = 0; i < ezpProxies.length; ++i)
	{
		var proxyRow = unsafeDocument.createElement('tr');

		var nameCell = unsafeDocument.createElement('td');
		nameCell.textContent = ezpProxies[i].name;
		proxyRow.appendChild(nameCell);

		var urlCell = unsafeDocument.createElement('td');
		urlCell.textContent = ezpProxies[i].url;
		proxyRow.appendChild(urlCell);

		var encCell = unsafeDocument.createElement('td');
		encCell.setAttribute('class', 'center');
		encCell.textContent = ezpProxies[i].enc;
		proxyRow.appendChild(encCell);

		var trimCell = unsafeDocument.createElement('td');
		if (ezpProxies[i].trim)
			trimCell.setAttribute('class', 'checked');
		proxyRow.appendChild(trimCell);

		var activeCell = unsafeDocument.createElement('td');
		activeCell.setAttribute('class', 'center');
		var activeRadio = unsafeDocument.createElement('input');
		activeRadio.setAttribute('name', 'activeProxy');
		activeRadio.setAttribute('type', 'radio');
		activeRadio.setAttribute('value', i);
		if (i == 0)
			activeRadio.checked = 'checked';
		activeCell.appendChild(activeRadio);
		proxyRow.appendChild(activeCell);

		var SelectProxy = function(event)
		{
			event.target.parentNode.lastElementChild.firstElementChild.checked = 'checked';
		};
		proxyRow.addEventListener('click', SelectProxy, false);
		proxyListBody.appendChild(proxyRow);
	}
};

// expose to unsafe realm
unsafeDocument.OpenTool = function(toolName)
{
	// locationize tool URL
	// replace {property} with value of window.location.property

	var toolUrl = ezpTools[toolName];
	var regex = /\{(\w*)\}/g;
	var matchRet;
	while ((matchRet = regex.exec(toolUrl)) != null)
		toolUrl = toolUrl.replace(matchRet[0], safeWindow.location[matchRet[1]]);

	// open tool URL

	if (ezpTools.newtab)
		safeWindow.open(toolUrl);
	else
		safeWindow.location = toolUrl;
};

// expose to unsafe realm
unsafeDocument.Proxify = function()
{
	var activeRadio = unsafeDocument.querySelector('#ezpProxyList input[name=activeProxy]:checked');
	if (activeRadio == null)
		return null;

	var currentCell = activeRadio.parentNode;

	currentCell = currentCell.previousElementSibling;
	var trim = currentCell.textContent;

	currentCell = currentCell.previousElementSibling;
	var enc = currentCell.textContent;

	currentCell = currentCell.previousElementSibling;
	var url = currentCell.textContent;

	safeWindow.location = GetProxifiedAddr(safeWindow.location.href, url, enc, trim);
};
