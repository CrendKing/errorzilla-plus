ezp.toolsPref = 
{
	Reset: function()
	{
		if (ezp.promptSvc.confirm(null,
			ezp.locale.GetStringFromName('title.tools.reset'),
			ezp.locale.GetStringFromName('info.tools.reset')))
		{
			try
			{
				var toolsPrefList = ezp.pref.getChildList('tools');
				for (var i = 0; i < toolsPrefList.length; ++i)
				{
					if (ezp.pref.prefHasUserValue(toolsPrefList[i]))
						ezp.pref.clearUserPref(toolsPrefList[i]);
				}
			}
			catch (e)
			{
				ezp.promptSvc.alert(
					null,
					ezp.locale.GetStringFromName('title.tools.reset'),
					ezp.locale.formatStringFromName('error.tools.reset', [e], 1));
			}
		}
	},

	Stringify: function()
	{
		var toolsPrefObj = {
			'newtab': ezp.pref.getBoolPref('tools.newtab'),
			'retry_enable': ezp.pref.getBoolPref('tools.retry_enable'),
			'retry_timeout': ezp.pref.getBoolPref('tools.retry_timeout'),
			'retry_interval': ezp.pref.getIntPref('tools.retry_interval'),
			'googlecache': ezp.pref.getCharPref('tools.googlecache'),
			'coralize': ezp.pref.getCharPref('tools.coralize'),
			'wayback': ezp.pref.getCharPref('tools.wayback'),
			'ping': ezp.pref.getCharPref('tools.ping'),
			'trace': ezp.pref.getCharPref('tools.trace'),
			'whois': ezp.pref.getCharPref('tools.whois'),
		};
		return JSON.stringify(toolsPrefObj);
	}
};
