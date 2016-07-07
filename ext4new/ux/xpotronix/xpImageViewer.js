Ext.define( 'Ux.xpotronix.xpImageViewer', {

	extend: 'Ext.Panel'
	,alias: 'xpImageViewer'

	,cursorOverClass: 'cursor-open-hand'
	,cursorDownClass: 'cursor-closed-hand'
	,imageNameLabel:'Image File Name:'
	,defaultZoom:'fit' //can be 'fit' or any number between 6 and sliderWidth
	,defaultZoomSliderValue:50 //out of sliderWidth
	,sliderWidth:200
	,loadingImg:'/ext4/resources/ext-theme-classic/images/grid/loading.gif'
	,store:undefined

	,constructor: function(config) {/*{{{*/

	App.obj.get(this.class_name).panels.add(this);

	Ext.apply( config, { 

			dockedItems: [{
				xtype: 'xppagingtoolbar',
				panel: this,
				store: this.store,
				dock: 'top',
				displayInfo: true
			},{
				xtype: 'toolbar',
				panel: this,
				store: this.store,
				dock: 'bottom',
				displayInfo: true,
				layout: { pack: 'center' }
			}],
		});

		this.callParent(arguments);

		/* consoleDebugFn( this ); */
		/* consoleDebugFn( this.getForm() ); */

		this.addEvents( 'loadrecord' );

	}/*}}}*/

	,zoomSelection:function(combo,rec,idx){/*{{{*/
		this.zoom = rec.data.value;
		this.zoomImage();
	}/*}}}*/

	,repositionImage:function(){/*{{{*/
		var setProps = {
			left: 0
			,top: 0
		};
		if(this.compRef.imageCont.el.dom.width < this.compRef.imageCont.el.dom.clientWidth){
			setProps.left = (this.compRef.imageCont.el.dom.clientWidth - this.compRef.imageCont.el.dom.width)/2;
		}
		if(this.compRef.imageCont.el.dom.height < this.compRef.imageCont.el.dom.clientHeight){
			setProps.top = (this.compRef.imageCont.el.dom.clientHeight - this.compRef.imageCont.el.dom.height)/2;
		}
		Ext.apply( this.compRef.imageCont.el.dom, setProps );
	}/*}}}*/

	,setImage:function(imagePath){/*{{{*/
		
		this.image = imagePath;
		
		var ie = this.compRef.imageCont.el;
		this.compRef.imageEl = ie;

		this.compRef.imageCont.setSrc( this.image );
		this.compRef.imageCont.cls = this.cursorOverClass;
		this.compRef.imageCont.style = {position:'absolute', height:'auto', width:'auto'};

		// ie.appendTo(this.compRef.imageCont.el.dom);
	}/*}}}*/

	,getNormalizedZoom:function(zoomSliderValue){/*{{{*/
		zoomSliderValue = (zoomSliderValue / this.sliderWidth)*200;
		if(zoomSliderValue < 1){
			return 1;
		}
		return Math.round(zoomSliderValue);
	}/*}}}*/

	,zoomImage:function(){/*{{{*/
	
		var scaling, wProp, hProp, newWidth, newHeight, setProps, curScrollXratio, curScrollYratio;
		if(this.zoom == 'fit'){
			
			wProp = this.compRef.imageCont.el.dom.clientWidth / this.imageWidth;
			hProp = this.compRef.imageCont.el.dom.clientHeight / this.imageHeight;
			if(wProp < hProp){
				scaling=wProp;
			}else{
				scaling=hProp;
			}
			
		}else{
			scaling = this.zoom / 100;
		}
		newWidth = this.imageWidth * scaling;
		newHeight = this.imageHeight * scaling;
		setProps = {
			width: newWidth
			,height: newHeight
		};
		
		curScrollXratio = this.compRef.imageCont.el.dom.scrollLeft / (this.compRef.imageCont.el.dom.clientWidth-this.compRef.imageCont.el.dom.clientWidth);
		curScrollYratio = this.compRef.imageCont.el.dom.scrollTop / (this.compRef.imageCont.el.dom.clientHeight-this.compRef.imageCont.el.dom.clientHeight);
		
		curScrollXratio = curScrollXratio == 0 ? .5 : curScrollXratio;
		curScrollYratio = curScrollYratio == 0 ? .5 : curScrollYratio;
		this.compRef.imageCont.el.set(setProps);
		
		this.repositionImage();
		
		this.compRef.imageCont.el.dom.scrollLeft = curScrollXratio * (this.compRef.imageCont.el.dom.clientWidth-this.compRef.imageCont.el.dom.clientWidth);
		this.compRef.imageCont.el.dom.scrollTop = curScrollYratio * (this.compRef.imageCont.el.dom.clientHeight-this.compRef.imageCont.el.dom.clientHeight);
	}/*}}}*/

	,initComponent:function(){/*{{{*/

		this.mouseDown = false;
		this.zoom = this.defaultZoom;
		this.imageWidth = 1;
		this.imageHeight = 1;
		this.imageLoaded = false;
		
		this.compRef = {};
		
		this.image = this.image || Ext.BLANK_IMAGE_URL;
		
		Ext.apply(this,{

			layout:'fit'

			,tbar:[{
				xtype:'tbtext'
				,text:this.imageNameLabel
			},{
				xtype:'tbtext'
				,name:'imageName'
				,text:this.image != Ext.BLANK_IMAGE_URL ? this.image : ''
			}]
			,bbar:[{
				xtype:'tbtext'
				,text:'Fit'
				,width:20
			},{
				xtype:'checkbox'
				,width:20
				,labelCls:'x-hidden'
				,name:'autoFitZoom'
				,checked: this.defaultZoom == 'fit' ? true : false
				,listeners:{
					scope:this
					,change:function(checkbox, checked){
						var newZoom;
						if(checked){
							newZoom = 'fit'
							this.compRef.zoomText.setText('Fit');
						}else{
							newZoom = this.getNormalizedZoom(this.compRef.zoomSlider.getValue());
							this.compRef.zoomText.setText(newZoom+' %');
						}
						if(newZoom !== this.zoom){
							this.zoom = newZoom;
							this.zoomImage();
						}
						
					}
				}
			},{
				xtype:'tbtext'
				,width:45
				,text:'Zoom:'
			},{
				xtype:'tbtext'
				,width:40
				,name:'zoomText'
				,text:this.defaultZoom == 'fit' ? 'Fit' : this.defaultZoom
			},{
				xtype:'slider'
				,labelCls:'x-hidden'
				,name:'zoomSlider'
				,value: this.defaultZoomSliderValue
				,minValue:0
				,maxValue:100
				,increment:1
				,width:this.sliderWidth
				,listeners:{
					scope:this
					,change:function(slider, newVal, oldVal){
						this.zoom = this.getNormalizedZoom(newVal);
						//this.zoomSelector.setValue(this.zoom);
						this.compRef.zoomText.setText(this.zoom+' %');
						this.zoomImage();
						this.compRef.autoFitZoom.setValue(false);
					}
				}
			},'->',{
				xtype:'tbtext'
				,width:60
				,text:'Dimensions:'
			},{
				xtype:'tbtext'
				,width:75
				,name:'imageDimensions'
			}]
			,items:{
				autoScroll:true
				,name:'imageCont'
				,xtype: 'image'
				,autoEl: 'img'
				,shrinkWrap:0
				//,frame:true
				,cls:'image-viewer'

				,listeners:{

					scope: this

					,render:function(comp){

						// DEBUG: hot fix
						this.compRef.imageCont = this.query('*[name=imageCont]')[0];
						this.compRef.imageDimensions = this.query('*[name=imageDimensions]')[0];
						this.compRef.zoomText = this.query('*[name=zoomText]')[0];
						this.compRef.autoFitZoom = this.query('*[name=autoFitZoom]')[0];
						this.compRef.zoomSlider = this.query('*[name=zoomSlider]')[0];


						this.compRef.imageCont.setSrc(this.loadingImg);
						/*		
						this.compRef.imageCont.setStyle({
							position:'absolute'
							,top:'20px'
							,left:'20px'
						});
						*/
							
						if(this.image){
							//console.log(this.compRef);
							//console.log(this.compRef.imageDimensions);
							// this.setImage(this.image);
						}else{
							le.addCls('x-hidden');
						}
					}

					,afterrender: function( comp ) {

						this.compRef.imageCont.el.on({ 

							scope:this

							,load:function(){
								this.imageLoaded = true;
								
								this.imageWidth = this.compRef.imageCont.el.dom.width;
								this.imageHeight = this.compRef.imageCont.el.dom.height;

								this.compRef.imageDimensions.setText(this.imageWidth+' x '+this.imageHeight);
					
								// this.compRef.loadingEl.addCls('x-hidden');
								this.zoomImage();
							}
							,mouseout:function(event, el){
								this.mouseDown = false;
								
								Ext.fly(el).replaceCls(this.cursorDownClass, this.cursorOverClass);
							}
							,mousedown:function(event, el){

								this.mouseDown = true;
								this.mouseDownXY = event.getXY();
								
								this.mouseDownScrollLeft = this.compRef.imageCont.el.dom.scrollLeft;
								this.mouseDownScrollTop = this.compRef.imageCont.el.dom.scrollTop;
								
								Ext.fly(el).replaceCls(this.cursorOverClass, this.cursorDownClass);
								event.stopEvent(); // prevents native browser dragging
							}
							,mouseup:function(event, el){
								this.mouseDown = false;
								
								Ext.fly(el).replaceCls(this.cursorDownClass, this.cursorOverClass);
							}
							,mousemove:function(event, el){
								if(this.mouseDown === true){

									var xy = event.getXY();
									
									if(xy[0] > this.mouseDownXY[0]){
										this.compRef.imageCont.el.dom.scrollLeft = this.mouseDownScrollLeft - (xy[0] - this.mouseDownXY[0]);
									}else if(xy[0] < this.mouseDownXY[0]){
										this.compRef.imageCont.el.dom.scrollLeft = this.mouseDownScrollLeft + (this.mouseDownXY[0] - xy[0]);
									}
									
									if(xy[1] > this.mouseDownXY[1]){
										this.compRef.imageCont.el.dom.scrollTop = this.mouseDownScrollTop - (xy[1] - this.mouseDownXY[1]);
									}else if(xy[1] < this.mouseDownXY[1]){
										this.compRef.imageCont.el.dom.scrollTop = this.mouseDownScrollTop + (this.mouseDownXY[1] - xy[1]);
									}
									
									event.stopEvent();
								}
							}
						});
					}
				}
			}
			,listeners:{
				scope:this
				,resize:{
					delay:50
					,fn:function(){
						if(this.imageLoaded){
							if(this.zoom == 'fit'){
								this.zoomImage();
							}
							this.repositionImage();
						}
					}
				}
			}
		});

		
		this.callParent(this, arguments);
	
		if ( typeof this.store == 'string' ) this.store = Ext.StoreMgr.lookup( this.store );

		/* this.getForm().trackResetOnLoad = true; */

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		if ( this.show_buttons && ( this.acl.edit || this.acl.add ) ) {

			var tbar = this.getDockedItems('toolbar[dock=top]')[0];
			var bbar = this.getDockedItems('toolbar[dock=bottom]')[0];

			if ( tbar ) {

				this.acl.add && bbar.add( tbar.add_button( this ) );
				bbar.add('-');
				bbar.add( tbar.save_button( this ));
			}
		}

	
	}/*}}}*/

});
