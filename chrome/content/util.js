var Base64 = function(input)
{
	var base64KeyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var output = '';
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	do
	{
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2))
			enc3 = enc4 = 64;
		else if (isNaN(chr3))
			enc4 = 64;

		output = output + base64KeyStr.charAt(enc1) + base64KeyStr.charAt(enc2) + base64KeyStr.charAt(enc3) + base64KeyStr.charAt(enc4);
	} while (i < input.length);

	return output;
};

var ROT13 = function(input)
{
	var output = '';

	for (var i = 0; i < input.length; i++)
	{
		var curr_char = input[i];
		var rot_code = curr_char.charCodeAt();

		if (curr_char >= 'A' && curr_char <= 'Z')
			rot_code = (curr_char.charCodeAt() - 'A'.charCodeAt() + 13) % 26 + 'A'.charCodeAt();
		else if (curr_char >= 'a' && curr_char <= 'z')
			rot_code= (curr_char.charCodeAt() - 'a'.charCodeAt() + 13) % 26 + 'a'.charCodeAt();

		output += String.fromCharCode(rot_code);
	}

	return output;
};

var GetProxifiedAddr = function(targetURL, proxyURL, proxyEnc, proxyTrim)
{
	// if trim, 'http://www.hostname.com/path' will become '://www.hostname.com/path'
	if (proxyTrim.toString() == 'true')
	{
		targetURL = targetURL.match('://.+');

		// this is not supposed to happen
		if (targetURL == null)
			return proxyURL;

		targetURL = targetURL[0];
	}

	// use the function with the same name of proxyEnc to encode
	// then do URL encode
	var encodedURL = targetURL;
	switch (proxyEnc)
	{
		case 'Base64':
			encodedURL = Base64(targetURL);
			break;
		case 'ROT13':
			encodedURL = ROT13(targetURL);
			break;
	}

	return proxyURL + escape(encodedURL);
};
