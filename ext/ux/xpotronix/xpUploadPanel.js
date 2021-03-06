/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.ux.xpotronix.xpUploadPanel = Ext.extend(Ext.ux.UploadPanel, {

	initComponent:function() {

		// call parent
		Ext.ux.xpotronix.xpUploadPanel.superclass.initComponent.apply(this, arguments);

		this.uploader.on('beforeallstart', function() {

			Ext.apply( this.uploader.baseParams, this.obj.store.get_foreign_key() );

		}, this );

	} // eo function initComponent

}); // eo extend

// register xtype
Ext.reg('xpUploadPanel', Ext.ux.xpotronix.xpUploadPanel);

// eof
