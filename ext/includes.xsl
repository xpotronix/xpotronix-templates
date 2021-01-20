<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<!-- includes.xsl

	xpotronix (c) 2011

-->

<xsl:stylesheet version="2.0" 

	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/" 
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/" 
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions">

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:template match="*:document" mode="include-all-css"><!--{{{-->

		<!-- ext -->

		<link rel="stylesheet" type="text/css" href="/ext/resources/css/ext-all.css" />
	    	<!-- <link rel="stylesheet" type="text/css" href="/ext/resources/css/visual/grid.css" />
	    	<link rel="stylesheet" type="text/css" href="/ext/resources/css/structure/grid.css" /> -->

		<link rel="stylesheet" type="text/css" href="/ux/xpotronix/xpThumbs.css"/>

		<!-- FilterRow -->

		<link rel="stylesheet" type="text/css" href="/ux/grid/FilterRow.css"/>

		<!-- GridFilters -->

		<link rel="stylesheet" type="text/css" href="/ext/examples/ux/gridfilters/css/GridFilters.css"/>
		<link rel="stylesheet" type="text/css" href="/ext/examples/ux/gridfilters/css/RangeMenu.css"/>

		<!-- file -->
	
		<link rel="stylesheet" type="text/css" href="/ux/file/css/filetype.css"/>
		<link rel="stylesheet" type="text/css" href="/ux/file/css/icons.css"/>
		<link rel="stylesheet" type="text/css" href="/ux/file/css/filetree.css"/>

		<!-- other extensions css -->

		<link rel="stylesheet" type="text/css" href="/ux/xpotronix/extensions.css"/>

		<!-- local app.css -->

		<link rel="stylesheet" type="text/css" href="css/app.css"/>
		<link rel="stylesheet" type="text/css" href="css/icons.css"/>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-ext-js"><!--{{{-->

		<xsl:choose>
			<xsl:when test="//*:session/var/EXT_DEBUG=1">
				<script type="text/javascript" src="/ext/adapter/ext/ext-base-debug.js"></script>
    				<script type="text/javascript" src="/ext/ext-all-debug-w-comments.js"></script>
			</xsl:when>
			<xsl:otherwise>
				<script type="text/javascript" src="/ext/adapter/ext/ext-base.js"></script>
    				<script type="text/javascript" src="/ext/ext-all.js"></script>
			</xsl:otherwise>
		</xsl:choose>

		<script type="text/javascript" src="/ext/src/locale/ext-lang-es.js"></script>
		<script type="text/javascript" src="/ext/src/ext-core/src/core/Loader.js"></script>
		<script type="text/javascript" src="/ux/state/HttpProvider.js"></script>
		<script type="text/javascript" src="/ux/util.js"></script>


		<xsl:if test="//cmp[@type='ux.GMapPanel3']">
			<script type="text/javascript" src="http://maps.google.com.ar/maps/api/js?sensor=false"></script> 
			<script type="text/javascript" src="/ux/map/Ext.ux.GMapPanel3.js"></script>
		</xsl:if>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-xpotronix-js"><!--{{{-->

		<!-- ux -->

		<xsl:choose>
			<xsl:when test="$session/var/EXT_DEBUG=1">
			    	<script type="text/javascript" src="/ext/examples/ux/ux-all-debug.js"></script>
			</xsl:when>
			<xsl:otherwise>
			    	<script type="text/javascript" src="/ext/examples/ux/ux-all.js"></script>
			</xsl:otherwise>
		</xsl:choose>


		<!-- extras -->

		<script type="text/javascript" src="/js/node_modules/jquery/dist/jquery.slim.min.js"/>
		<script type="text/javascript" src="/js/plugin/lodash/lodash.min.js"/>
		<script type="text/javascript" src="/js/node_modules/qrious/dist/qrious.min.js"></script>

		<!-- DateTime Field -->

		<script type="text/javascript" src="/ux/form/DateTime.js"></script>
		<script type="text/javascript" src="/ux/grid/Search.js"></script>

		<!-- FilterRow -->

		<script type="text/javascript" src="/ux/grid/FilterRow.js"></script>

		<!-- xpotronix -->

		<xsl:variable name="timestamp" select="date:date-time()"/>

		<script type="text/javascript" src="/ux/xpotronix/xpApp.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/xpObj.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/xpStore.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/xpGrid.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/xpGridDropZone.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/xpGridFilter.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/xpForm.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/xpPanel.js?t={$timestamp}"/>

		<script type="text/javascript" src="/ux/xpotronix/xpFilterRow.js?t={$timestamp}"></script>
	
		<!-- fileUpload & Panel -->
	
		<script type="text/javascript" src="/ux/file/js/Ext.ux.FileUploader.js"></script>
		<script type="text/javascript" src="/ux/file/js/Ext.ux.UploadPanel.js"></script>
		<script type="text/javascript" src="/ux/file/js/Ext.ux.form.BrowseButton.js"></script>
		<script type="text/javascript" src="/ux/xpotronix/xpUploadPanel.js"/>
	
		<!-- thumbs --> 

		<script type="text/javascript" src="/ux/xpotronix/xpThumbs.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/DataViewPlugins.js?t={$timestamp}"/>
	
		<!-- security -->
		<!-- <script type="text/javascript" src="/ux/crypto.js"/> -->

		<!-- other extensions -->

		<script type="text/javascript" src="/ux/xpotronix/extensions.js?t={$timestamp}"/>
		<script type="text/javascript" src="/ux/xpotronix/misc.js?t={$timestamp}"/>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-all-js"><!--{{{-->

		<xsl:apply-templates select="." mode="include-ext-js"/>
		<xsl:apply-templates select="." mode="include-xpotronix-js"/>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-login-js"><!--{{{-->
		<xsl:apply-templates select="." mode="include-ext-js"/>
		<script type="text/javascript" src="/ux/xpotronix/xpApp.js"/>
	</xsl:template><!--}}}-->

	<xsl:template match="file" mode="include-js"><!--{{{-->
		<xsl:variable name="base_dir" select="substring-before(substring-after($session/server/PHP_SELF,'/'),'/')"/>
		<xsl:element name="script">
			<xsl:attribute name="type" select="'text/javascript'"/>
			<xsl:attribute name="src" select="@name"/>
		</xsl:element>
	</xsl:template>	<!--}}}-->

	<xsl:template match="file" mode="include-array-js"><!--{{{-->
			'<xsl:value-of select="@name"/>'<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template>	<!--}}}-->



</xsl:stylesheet>
