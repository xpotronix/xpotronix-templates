/**
	Create an Ext.tree.TreePanel in the passed Element using
	an XML document from the passed URL, calling the passed
	callback on completion.
	@param el {String/Element/HtmlElement} The tree's container.
	@param url {String} The URL from which to read the XML
	@param callback {function:tree.render} The function to call on completion,
		defaults to rendering the tree.
*/
function createXmlTree(el, url, callback) {
    var tree = new Ext.tree.TreePanel(el);
	var p = new Ext.data.HttpProxy({url:url});
	p.on("loadexception", function(o, response, e) {
		if (e) throw e;
	});
	p.load(null, {
		read: function(response) {
			var doc = response.responseXML;
			tree.setRootNode(treeNodeFromXml(doc.documentElement || doc));
		}
	}, callback || tree.render, tree);
	return tree;
}
/**
	Create a TreeNode from an XML node
*/
function treeNodeFromXml(XmlEl) {
//	Text is nodeValue to text node, otherwise it's the tag name
	var t = ((XmlEl.nodeType == 3) ? XmlEl.nodeValue : XmlEl.tagName);

//	No text, no node.
	if (t.replace(/\s/g,'').length == 0) {
		return null;
	}

//	Special case of an element containing no attributes and just one text node
	var leafTextNode = ((XmlEl.attributes.length == 0) && (XmlEl.childNodes.length == 1) && (XmlEl.firstChild.nodeType == 3));
	if (leafTextNode ) {
		return new Ext.tree.TreeNode({
			tagName: XmlEl.tagName,
			text: XmlEl.firstChild.nodeValue
		});
	}
	
	var result = new Ext.tree.TreeNode({
        text : t
    });

//	For Elements, process attributes and children
	if (XmlEl.nodeType == 1) {
		Ext.each(XmlEl.attributes, function(a) {
			var c = new Ext.tree.TreeNode({
				text: a.nodeName
			});
			c.appendChild(new Ext.tree.TreeNode({
				text: a.nodeValue,
			}));
			result.appendChild(c);
		});
		if (!leafTextNode) {
			Ext.each(XmlEl.childNodes, function(el) {
//			Only process Elements and TextNodes
				if ((el.nodeType == 1) || (el.nodeType == 3)) {
					var c = treeNodeFromXml(el);
					if (c) {
						result.appendChild(c);
					}
				}
			});
		}
	}
	return result;
}
