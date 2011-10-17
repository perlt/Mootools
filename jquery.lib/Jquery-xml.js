/**
 * Created by JetBrains WebStorm.
 * User: perltzhu
 * Date: 11-10-13
 * Time: 下午2:57
 * To change this template use File | Settings | File Templates.
 */

/**
 * transfer xml string to xml document
 * @param data  xml string
 * @return xml
 */
 var parseXML = function( data , xml , tmp ) {
        var xml, tmp;
		if ( window.DOMParser ) { // Standard
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} else { // IE
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}

		tmp = xml.documentElement;

		if ( ! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror" ) {
			throw  "Invalid XML: " + data ;
		}

		return xml;
	}