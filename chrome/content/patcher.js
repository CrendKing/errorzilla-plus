ezp.patcher =
{
	// patches as DOM nodes, which are appended to specific parent nodes
	// process patches in order, thus first patches can be parent node as succeeding patches
	// format: { XPath_of_parent_node: [ string_of_child_nodes ] }
	nodePatches:
	{
		'/xhtml:html/xhtml:head':
		[
			'<link xmlns="http://www.w3.org/1999/xhtml" rel="stylesheet" href="chrome://ezp/skin/ezp_netError.css" type="text/css" media="all" />',
			'<link xmlns="http://www.w3.org/1999/xhtml" rel="stylesheet" href="chrome://ezp/skin/ezp_checkbox.css" type="text/css" media="all" />',
		],

		'//xhtml:div[@id="errorPageContainer"]':
		[
			'<div xmlns="http://www.w3.org/1999/xhtml" id="ezpTools">\n' +
			'	<div id="toolsRow1">\n' +
			'		<button onclick="OpenTool(\'googlecache\');">netError.tools.googlecache</button>\n' +
			'		<button onclick="OpenTool(\'coralize\');">netError.tools.coralize</button>\n' +
			'		<button onclick="OpenTool(\'wayback\');">netError.tools.wayback</button>\n' +
			'	</div>\n' +
			'	<div>\n' +
			'		<button onclick="OpenTool(\'ping\');">netError.tools.ping</button>\n' +
			'		<button onclick="OpenTool(\'trace\');">netError.tools.trace</button>\n' +
			'		<button onclick="OpenTool(\'whois\');">netError.tools.whois</button>\n' +
			'		<button onclick="Proxify();">netError.tools.proxify</button>\n' +
			'	</div>\n' +
			'	<div>\n' +
			'		<table id="ezpProxyList">\n' +
			'			<thead>\n' +
			'				<tr>\n' +
			'					<th>netError.proxy.name</th>\n' +
			'					<th>netError.proxy.url</th>\n' +
			'					<th>netError.proxy.enc_short</th>\n' +
			'					<th>netError.proxy.trim_short</th>\n' +
			'					<th>netError.proxy.use</th>\n' +
			'				</tr>\n' +
			'			</thead>\n' +
			'			<tbody />\n' +
			'		</table>\n' +
			'	</div>\n' +
			'</div>',
		],
	},

	MakeNodePatch: function(safeDocument)
	{
		for (parentNodePath in this.nodePatches)
		{
			var parentNode = safeDocument.evaluate(parentNodePath, safeDocument, ezp.xhtmlResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			for (var i = 0; i < this.nodePatches[parentNodePath].length; ++i)
			{
				// replace entity names with localized text

				var oriNodeSource = this.nodePatches[parentNodePath][i];
				var localizedNodeSource = '';
				var localizeRe = /netError\.\w+\.\w+/g;
				var matchRet;
				var nextStart = 0;

				while ((matchRet = localizeRe.exec(oriNodeSource)) != null)
				{
					localizedNodeSource += oriNodeSource.substring(nextStart, matchRet.index) + ezp.locale.GetStringFromName(matchRet[0]);
					nextStart = localizeRe.lastIndex;
				}
				localizedNodeSource += oriNodeSource.substr(nextStart);

				// append localized node to document
				var patchNode = ezp.parser.parseFromString(localizedNodeSource, 'application/xhtml+xml').documentElement;
				parentNode.appendChild(patchNode);
			}
		}
	},

	MakeScriptPatch: function(safeDocument)
	{
		var injectCode = '';

		// inject scripts to the document
		// cannot use the node patch due to security restriction
		injectCode += ezp.ReadURI('chrome://ezp/content/util.js');
		injectCode += ezp.ReadURI('chrome://ezp/content/netError.js');

		// inject preferences and initial actions to the document
		// it is impossible to access XPCOM from about:neterror due to security restriction
		injectCode += 'var ezpTools = ' + ezp.toolsPref.Stringify() + '; var ezpProxies = ' + ezp.proxySvc.Stringify() + '; AutoRetry(); LoadProxyList();';

		// create sandbox
		var safeWindow = safeDocument.defaultView;
		var sandbox = Components.utils.Sandbox(safeWindow, { 'wantXrays': false } );
		sandbox.unsafeDocument = safeDocument.wrappedJSObject;
		sandbox.safeWindow = safeWindow;

		// run code in sandbox
		Components.utils.evalInSandbox(injectCode, sandbox);
	},

	MakeUIPatch: function(safeDocument)
	{
		// the retry button is originally existed. it must be moved to the first tools row
		var retryNode = safeDocument.getElementById('errorTryAgain');
		var toolsRow1Node = safeDocument.getElementById('toolsRow1');

		// change Try Again button's id so that default CSS will not affect it
		retryNode.id = 'ezpTryAgain';
		toolsRow1Node.insertBefore(retryNode, toolsRow1Node.childNodes[1]);
	},

	Patch: function(safeDocument)
	{
		this.MakeNodePatch(safeDocument);
		this.MakeUIPatch(safeDocument);
		this.MakeScriptPatch(safeDocument);
	},
};
