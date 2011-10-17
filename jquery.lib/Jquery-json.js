/**
 * Created by JetBrains WebStorm.
 * User: perltzhu
 * Date: 11-10-13
 * Time: 下午3:03
 * To change this template use File | Settings | File Templates.
 */
// JSON RegExp
	var rvalidchars = /^[\],:{}\s]*$/,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
/**
 * transfer json string to json object
 * @param data
 */
     var trimLeft = /^\s+/;
	 var trimRight = /\s+$/;
     var trim = (trim) ?
                   function( text ) {
                        return text == null ?
                            "" :
                            trim.call( text );
                    } :
                   function( text ) {
                        return text == null ?
                            "" :
                            text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
                    };

/**
 * transfer json string to json object
 * @param data
 */
    var parseJSON = function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return (new Function( "return " + data ))();

		}
		throw  "Invalid JSON: " + data ;
	};

