/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define( 'Ux.xpotronix.xpUploadPanel', {

	extend: 'Ext.ux.upload.Panel', 
	alias: 'xpUploadPanel',

	obj: undefined,
	acl: undefined,
	feat: undefined,
	border: false,
	show_buttons: true,
	buttonAlign: 'left',
	multi_row: false,
	debug: false,


	initComponent:function() {

		this.callParent();

		/*
		this.uploader.on('beforeallstart', function() {
		}, this );
		*/

	}
});
