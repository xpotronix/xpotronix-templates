<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="html" encoding="utf-8" indent="yes" />


<xsl:template match="/"><!--{{{-->

	<xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;</xsl:text><html lang="en">

	<xsl:apply-templates select="/" mode="bootstrap_head"/>

	<body>

		<div class="container">

			<h1><xsl:value-of select="*:document/*:session/feat/application"/></h1>
			<h1><xsl:value-of select="*:document/*:session/feat/page_title"/></h1>

			<!-- Jumbotron -->
			<div class="jumbotron">
				<h1>Acceso a la aplicacion</h1>
				<p class="lead">prueba</p>
				<p><a class="btn btn-lg btn-success" href="#" role="button">Acceda a la aplicacion</a></p>
			</div>

			<xsl:apply-templates/>

		</div> <!-- /container -->


		<!-- Bootstrap core JavaScript
		================================================== -->
		<!-- Placed at the end of the document so the pages load faster -->
		<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
		<!-- <script src="../../assets/js/ie10-viewport-bug-workaround.js"></script> -->

		<xsl:apply-templates select="." mode="bootstrap-gallery"/>
	</body>
</html>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document"><!--{{{-->

		<h1>xpotronix:document</h1>

		<xsl:apply-templates/>

	</xsl:template><!--}}}-->

	<xsl:template match="*:session"><!--{{{-->

		<h1>xpotronix:session</h1>

	</xsl:template><!--}}}-->

	<xsl:template match="*:model"><!--{{{-->

		<h1>xpotronix:model</h1>

	</xsl:template><!--}}}-->

	<xsl:template match="*:metadata"><!--{{{-->

		<h1>xpotronix:metadata</h1>

		<xsl:apply-templates/>


	</xsl:template><!--}}}-->


	<xsl:template match="obj">

		<h1>OBJECT name: <xsl:value-of select="@name"/></h1>

		<xsl:apply-templates/>

	</xsl:template>


	<xsl:template match="primary_key">

		<xsl:for-each select="*">

			<p><xsl:value-of select="name()"/>: <xsl:value-of select="text()"/></p>



		</xsl:for-each>


	</xsl:template>


	<xsl:template match="*:dataset"><!--{{{-->

		<h1>xpotronix:dataset</h1>

	</xsl:template><!--}}}-->

	<xsl:template match="*:messages"><!--{{{-->

		<h1>xpotronix:messages</h1>

	</xsl:template><!--}}}-->

	<xsl:template match="product"><!--{{{-->

	<div class="row">
			<div class="col-lg-3"><h4><xsl:value-of select="Name"/></h4></div>
			<div class="col-lg-9">
				<xsl:apply-templates select="Name|Description|MAP"/>
			</div>
		</div>

		<div class="row">
		  
			<div id="images">

				<xsl:for-each select="c_/imagen">
				<xsl:sort select="filename" data-type="text" order="ascending"/>
				<xsl:if test="position() lt 6">
					<xsl:apply-templates select="."/>
				</xsl:if>
				</xsl:for-each>
			</div>

		</div>

	</xsl:template><!--}}}-->

	<xsl:template match="product/*"><!--{{{-->

		<div class="row">
			<div class="col-lg-3"><xsl:value-of select="name()"/></div>
			<div class="col-lg-9"><xsl:value-of select="text()"/></div>
		</div>

	</xsl:template><!--}}}-->

	<xsl:template match="imagen"><!--{{{-->

	<div class="item">
		<img src="http://localhost/patioland/?m=imagen&amp;a=process&amp;p=thumb&amp;q=40&amp;ar=x&amp;ID={ID}" class="img-rounded" alt="{filename}"/>
		<p><xsl:value-of select="filename"/></p>
	</div>

	</xsl:template><!--}}}-->

	<xsl:template match="/" mode="bootstrap_head"><!--{{{-->

  <head>

    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content=""/>
    <meta name="author" content=""/>
    <link rel="icon" href="../../favicon.ico"/>

	<style>
/* Grid */

body {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

h3 {
  margin-top: 2rem;
}

.row {
  margin-bottom: 1rem;
}
.row .row {
  margin-top: 1rem;
  margin-bottom: 0;
}
[class*="col-"] {
  padding-top: 1rem;
  padding-bottom: 1rem;
  background-color: rgba(86,61,124,.15);
  border: 1px solid rgba(86,61,124,.2);
}

hr {
  margin-top: 2rem;
  margin-bottom: 2rem;
}



/* Masonry Image Gallery */

body {
    font-family: sans-serif;
}
#container {
    background: #DDD;
    max-width: 1000px;
}
.item {
    width: 200px;
    float: left;
}
.item img {
    display: block;
    width: 100%;
    padding: 2px;
}
button {
    font-size: 18px;
}

</style>


<script   src="https://code.jquery.com/jquery-3.1.1.js"   integrity="sha256-16cdPddA6VdVInumRGo6IbivbERE8p7CQR3HzTBuELA="   crossorigin="anonymous"></script>

    <title>Grid Template for Bootstrap</title>

	<!-- Latest compiled and minified CSS -->
	<link 	rel="stylesheet" 
		href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" 
		integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" 
		crossorigin="anonymous"/>

	<!-- Optional theme -->
	<link 	rel="stylesheet" 
		href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" 
		integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" 
		crossorigin="anonymous"/>

	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" 
		integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" 
		crossorigin="anonymous"></script>



  </head>

	</xsl:template><!--}}}-->

	<xsl:template match="/" mode="bootstrap-gallery"><!--{{{-->

    <script src="//masonry.desandro.com/masonry.pkgd.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/3.0.4/jquery.imagesloaded.js"></script>
 
	<script type="text/javascript">

	$(function () {

	    var $container = $('#container').masonry({
		itemSelector: '.item',
		columnWidth: 200
	    });

	    // reveal initial images
	    $container.masonryImagesReveal($('#images').find('.item'));
	});

	$.fn.masonryImagesReveal = function ($items) {
	    var msnry = this.data('masonry');
	    var itemSelector = msnry.options.itemSelector;
	    // hide by default
	    $items.hide();
	    // append to container
	    this.append($items);
	    $items.imagesLoaded().progress(function (imgLoad, image) {
		// get item
		// image is imagesLoaded class, not img is image.img
		var $item = $(image.img).parents(itemSelector);
		// un-hide item
		$item.show();
		// masonry does its thing
		msnry.appended($item);
	    });

	    return this;
	};

	</script>

	</xsl:template><!--}}}-->

</xsl:stylesheet>
