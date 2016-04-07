<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<!-- log.xsl 

	xpotronix, 2011 (c)

-->
<!DOCTYPE stylesheet [
<!ENTITY raquo  "&#187;" >
]>

<xsl:stylesheet version="2.0" 
	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/" 
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/" 
	xmlns:fn="http://www.w3.org/2005/xpath-functions">

	<xsl:template name="events_monitor"><!--{{{-->

	/* envia los eventos a la consola del firebug. Ojo que pone el programa muuuy lento !! .) */

	Ext.util.Observable.prototype.fireEvent = Ext.Function.createInterceptor(Ext.util.Observable.prototype.fireEvent, function() {
	    console.log(arguments);
	    return true;
	});	

	</xsl:template><!--}}}-->

	<xsl:template name="console_log"><!--{{{-->

	Ext.Console = function() {
		return (typeof console === 'object') ?
			{
				log: console.log,
				info: console.info,
				warn: console.warn,
				error: console.error,
				startEventMonitoring: function() {
					Ext.util.Observable.prototype.fireEvent = Ext.util.Observable.prototype.fireEvent.createInterceptor(function() {
						Ext.console.log(arguments);
						return true;
					});
				}
			} : {
				log: Ext.emptyFn,
				info: Ext.emptyFn,
				warn: Ext.emptyFn,
				error: Ext.emptyFn,
				startEventMonitorying: Ext.emptyFn
			};
		}();

	</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim600: fdm=marker sw=3 ts=8 ai: 
-->
