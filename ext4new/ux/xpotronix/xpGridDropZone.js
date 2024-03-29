// vim: sw=4:ts=4:nu:nospell:fdc=4
/**
* Drag and Drop Grids Example application
*
* @author Ing. Jozef Sakáloš
* @copyright (c) 2008, by Ing. Jozef Sakáloš
* @sponsor Bernhard Schulz http://www.schubec.com
* @date 2. April 2008
* @version $Id: ddgrids.js 156 2009-09-19 23:31:02Z jozo $
*
* @license ddgrids.js is licensed under the terms of the Open Source
* LGPL 3.0 license. Commercial use is permitted to the extent that the
* code/component(s) do NOT become part of another Open Source or Commercially
* licensed development library or toolkit without explicit permission.
*
* License details: http://www.gnu.org/licenses/lgpl.html
*/

Ext.ux.xpotronix.GridDropZone = function(grid, config) {

	let me = this;

	me.grid = grid;

	me.callParent(grid.view.scroller.dom, config);
};

Ext.extend(Ext.ux.xpotronix.GridDropZone, Ext.dd.DropZone, {

	onContainerOver:function(dd, e, data) {

		let me = this;
		return dd.grid !== me.grid ? me.dropAllowed : me.dropNotAllowed;

	} // eo function onContainerOver

	,onContainerDrop:function(dd, e, data) {

		let me = this;

		if(dd.grid !== me.grid) {
			me.grid.onRecordsDrop(dd.grid, data.selections);
			return true;
		}

		return false;

	} // eo function onContainerDrop
	,containerScroll:true
});

