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
	xmlns:date="http://exslt.org/dates-and-times"
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions">

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:variable name="timestamp" select="date:date-time()"/>

	<xsl:template match="*:document" mode="include-all-css"><!--{{{-->

		<!-- ext -->

		<xsl:choose>
			<xsl:when test="$session/feat/theme">
				<link id="default-theme" rel="stylesheet" type="text/css" href="{$session/feat/theme}"/>
			</xsl:when>
			<xsl:otherwise>
				<link id="default-theme" rel="stylesheet" type="text/css" href="/ext4/resources/css/ext-all.css"/>
			</xsl:otherwise>
		</xsl:choose>
		<!-- <link rel="stylesheet" type="text/css" href="/ext4/resources/ext-theme-neptune/ext-theme-neptune-all.css" /> -->



			<!-- <link rel="stylesheet" type="text/css" href="/ext4/resources/ext-theme-gray/ext-theme-gray-all.css"/> -->
		<!-- <link rel="stylesheet" type="text/css" href="/ext4/resources/ext-theme-access/ext-theme-access-all.css"/> -->

		<!-- <link href="http://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet"/> -->

                <link rel="stylesheet" type="text/css" href="/ux4/DataView/data-view.css" />
                <link rel="stylesheet" type="text/css" href="/ux4/DataView/DragSelector.css" />

		<!-- FilterBar css -->

                <link rel="stylesheet" type="text/css" href="/ux4/resources/css/uxs.css" />
                <link rel="stylesheet" type="text/css" href="/ux4/resources/css/overrides.css" />
                <link rel="stylesheet" type="text/css" href="/ux4/resources/css/app.css" />

		<!-- Saki Grid Multi Search css -->
                <!-- <link rel="stylesheet" type="text/css" href="/ux4/saki/saki-grid-multisearch-all-debug.css" /> -->

		<!-- upload.css -->

		<!-- <xsl:if test="count($model//cmp[@type='uploadpanel'])"> -->
                	<link rel="stylesheet" type="text/css" href="/ux4/upload/css/upload.css" />
		<!-- </xsl:if> -->

		<!-- local app.css -->

		<link rel="stylesheet" type="text/css" href="css/app.css"/>
		<link rel="stylesheet" type="text/css" href="css/icons.css"/>



	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-ext-js"><!--{{{-->

		<xsl:choose>
			<xsl:when test="$session/var/EXT_DEBUG">
    				<!-- <script type="text/javascript" src="/ext4/ext-debug.js"></script> -->
    				<script type="text/javascript" src="/ext4/ext-debug-w-comments.js"></script>
			</xsl:when>
			<xsl:otherwise>
    				<script type="text/javascript" src="/ext4/ext-all.js"></script>
    				<!-- <script type="text/javascript" src="/ext4/ext.js"></script> -->
			</xsl:otherwise>
		</xsl:choose>

		<script type="text/javascript" src="/ux4/util.js"></script>

                
		<!-- FilterBar -->


		<!-- Saki Grid Multi Search -->

		<script type="text/javascript" src="/ext4/packages/ext-locale/build/ext-locale-es.js"/>

	</xsl:template><!--}}}-->

<xsl:template match="*:document" mode="include-xpotronix-js"><!--{{{-->

	<!-- ux -->

	<xsl:choose>
		<xsl:when test="$session/var/EXT_DEBUG">
			<!-- <script type="text/javascript" src="/ext4/examples/ux/ux-all-debug.js"></script> -->
		</xsl:when>
		<xsl:otherwise>
			<!-- <script type="text/javascript" src="/ext4/examples/ux/ux-all.js"></script> -->
		</xsl:otherwise>
	</xsl:choose>


	<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
		integrity="sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs="
		crossorigin="anonymous"></script>

	<script type="text/javascript" src="/js/plugin/lodash/lodash.min.js"/>


	<script src="/js/node_modules/qrious/dist/qrious.min.js"></script>

	<script type="text/javascript" src="/ux4/xpotronix/misc.js?t={$timestamp}"/>

	<!-- DateTimeField -->

	<!-- <script type="text/javascript" src="/ux4/xpotronix/extensions.js?t={$timestamp}"/> -->

	<!-- upload panel -->

	<!-- DEBUG: hay que pasar a loader xq al momento del cargar el modulo no sabe que tiene que cargar estos -->
	<!-- <xsl:if test="count($model//cmp[@type='uploadpanel'])"> -->

	<!-- </xsl:if> -->


</xsl:template><!--}}}-->

<xsl:template match="*:document" mode="include-all-js"><!--{{{-->

	<xsl:apply-templates select="." mode="include-ext-js"/>
	<xsl:apply-templates select="." mode="include-xpotronix-js"/>

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

	<xsl:template match="*:document" mode="include-ext-js-old"><!--{{{-->

		<!-- <script type="text/javascript" src="/ext4/compatibility/ext3-core-compat.js"></script> -->
		<!-- <script type="text/javascript" src="/ext4/compatibility/ext3-compat.js"></script> -->
		
		<!-- <script type="text/javascript" src="/ext4/src/locale/ext-lang-es.js"></script> -->
		<!-- <script type="text/javascript" src="/ext4/src/ext-core/src/core/Loader.js"></script> -->
		<script type="text/javascript" src="/ux4/state/HttpProvider4.js"></script>
		<script type="text/javascript" src="/ux4/util.js"></script>
		<script type="text/javascript">
		</script>


		<xsl:if test="//cmp[@type='ux.GMapPanel3']">
			<script type="text/javascript" src="http://maps.google.com.ar/maps/api/js?sensor=false"></script> 
			<script type="text/javascript" src="/ux4/map/Ext.ux.GMapPanel3.js"></script>
		</xsl:if>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-login-js"><!--{{{-->
		<xsl:variable name="timestamp" select="date:date-time()"/>
		<xsl:apply-templates select="." mode="include-ext-js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpApp.js?t={$timestamp}"/>
	</xsl:template><!--}}}-->

</xsl:stylesheet>
