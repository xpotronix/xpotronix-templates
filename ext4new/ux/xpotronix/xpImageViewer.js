Ext.define( 'Ux.xpotronix.xpImageViewer', {

	extend: 'Ext.Panel'
	,alias: 'xpImageViewer'
	,require: ['Ux.xpotronix.xpImageToolbar']


	,cursorOverClass: 'cursor-open-hand'
	,cursorDownClass: 'cursor-closed-hand'
	,imageNameLabel:'Nombre Archivo:'
	,defaultZoom:'fit' //can be 'fit' or any number between 6 and sliderWidth
	,defaultZoomSliderValue:40 //out of sliderWidth
	,sliderWidth:200
	,loadingImg:'/ext4/resources/ext-theme-classic/images/grid/loading.gif'
	,store:undefined
	,obj:undefined
	,acl:undefined
	,multi_row: true
	,debug: false
	,resizable: false
	,border:false
	,layout: {

		type: 'vbox',
		align: 'center',
		pack: 'center',
	}

	,constructor: function(config) {/*{{{*/

		App.obj.get(this.class_name).panels.add(this);

		if ( typeof this.store == 'string' ) 
			this.store = App.store.lookup( this.store );

       	        if ( typeof this.obj == 'string' )
			this.obj = App.obj.get( this.obj );

		Ext.apply( config, { 

			dockedItems: [{

				xtype: 'xpimagetoolbar',
 				panel: this,
 				store: this.store,
 				dock: 'top',
 				displayInfo: true,
				layout: { pack: 'center', align: 'middle' }
			},
			{
				xtype: 'toolbar',
				panel: this,
				store: this.store,
				dock: 'bottom',
				displayInfo: true,
				layout: { pack: 'center' }
			}],
		});

		this.callParent(arguments);

		this.debug && consoleDebugFn( this );

		this.addEvents( 'loadrecord' );

	}/*}}}*/

	,zoomSelection:function(combo,rec,idx){/*{{{*/
		this.zoom = rec.data.value;
		this.zoomImage();
	}/*}}}*/

	,repositionImage:function(){/*{{{*/

		let elDom = this.compRef.imageCont.el.dom,
		panelDom = this.body.dom,
		mLeft = (elDom.width < panelDom.clientWidth) ? (panelDom.clientWidth - elDom.width)/2 : 0;
		mTop = (elDom.height < panelDom.clientHeight) ? (panelDom.clientHeight - elDom.height)/2 : 0;

		this.setStyle({
			left: mLeft
			,top: mTop
		});

	}/*}}}*/

	,setImage:function(imagePath){/*{{{*/
		
		let ic = this.compRef.imageCont;

		ic.setSrc( this.image = imagePath );
		ic.cls = this.cursorOverClass;


	}/*}}}*/

	,setStyle:function(config) {/*{{{*/

		for( let key in config ) {

			let value;

			if ( ['width','height','top','left'].indexOf(key) > -1 )
				value = this.round( config[key] ) + 'px';
			else
				value = config[key];

			this.compRef.imageCont.el.setStyle( key, value );
		}

	}/*}}}*/

	,round: function(value, decimals) {/*{{{*/

		decimals = decimals || 0;
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);

	}/*}}}*/

	,getNormalizedZoom:function(zoomSliderValue){/*{{{*/

		zoomSliderValue = (zoomSliderValue / this.sliderWidth)*200;
		return ( zoomSliderValue < 1 ) ? 1 : Math.round(zoomSliderValue);

	}/*}}}*/

	,zoomImage:function(){/*{{{*/
	
		let scaling, wProp, hProp, newWidth, newHeight, setProps, curScrollXratio, curScrollYratio,
		elDom = this.compRef.imageCont.el.dom;

		if ( this.zoom == 'fit' ) {
			
			wProp = elDom.clientWidth / this.imageWidth;
			hProp = elDom.clientHeight / this.imageHeight;

			scaling = ( wProp < hProp ) ? wProp : hProp;

		} else {

			scaling = this.zoom / 100;
		}

		this.setStyle({
			width: this.imageWidth * scaling
			,height: ( this.imageHeight * scaling )
		});
		
		this.repositionImage();

		curScrollXratio = elDom.scrollLeft / (elDom.clientWidth-elDom.clientWidth);
		curScrollYratio = elDom.scrollTop / (elDom.clientHeight-elDom.clientHeight);
		
		curScrollXratio = curScrollXratio == 0 ? 0.5 : curScrollXratio;
		curScrollYratio = curScrollYratio == 0 ? 0.5 : curScrollYratio;
		
		elDom.scrollLeft = curScrollXratio * (elDom.clientWidth-elDom.clientWidth);
		elDom.scrollTop = curScrollYratio * (elDom.clientHeight-elDom.clientHeight);

	}/*}}}*/

	,initComponent:function(){/*{{{*/

		Ext.apply(this,{

			mouseDown: false
			,zoom: this.defaultZoom
			,imageWidth: 1
			,imageHeight: 1
			,imageLoaded: false
			,compRef: {}
			,image: this.image || Ext.BLANK_IMAGE_URL
			/* ,layout:'fit' */

			/*
			,tbar:[{
				xtype:'tbtext'
				,text:this.imageNameLabel
			},{
				xtype:'tbtext'
				,name:'imageFileName'
				,text:this.image != Ext.BLANK_IMAGE_URL ? this.image : ''
			}]

			*/

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
						let newZoom;
						if(checked){
							newZoom = 'fit';
							this.compRef.zoomText.setText('Fit');
						} else{
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
				,minValue:10
				,maxValue:100
				,increment:5
				,width:this.sliderWidth
				,listeners:{
					scope:this
					,change:function(slider, newVal, oldVal){
						this.zoom = this.getNormalizedZoom(newVal);
						//this.zoomSelector.setValue(this.zoom);
						this.compRef.zoomText.setText(this.zoom+' %');
						this.compRef.autoFitZoom.setValue(false);
						this.zoomImage();
					}
				}
			},'->',{
				xtype:'tbtext'
				,width:60
				,text:'Dimensiones:'
			},{
				xtype:'tbtext'
				,width:75
				,name:'imageDimensions'
			}]

			,items:[{
				autoScroll:true
				,name:'imageCont'
				,xtype: 'image'
				,autoEl: 'img'
				,shrinkWrap:true
				,frame:true
				,cls:'image-viewer'
				
				,listeners:{

					scope: this

					,render:function(comp){

						// DEBUG: hot fix
						this.compRef.imageCont = this.query('*[name=imageCont]')[0];
						this.compRef.imageFileName = this.query('*[name=imageFileName]')[0];
						this.compRef.imageDimensions = this.query('*[name=imageDimensions]')[0];
						this.compRef.zoomText = this.query('*[name=zoomText]')[0];
						this.compRef.autoFitZoom = this.query('*[name=autoFitZoom]')[0];
						this.compRef.zoomSlider = this.query('*[name=zoomSlider]')[0];


						this.compRef.imageCont.setSrc(this.loadingImg);
							
						if(this.image){

							this.debug && console.log(this.compRef);
							this.debug && console.log(this.compRef.imageDimensions);

							this.setImage(this.image);

						}else{
							le.addCls('x-hidden');
						}
					}

					,afterrender: function( comp ) {

						this.debug && consoleDebugFn( this.compRef.imageCont.el );

						this.compRef.imageCont.el.on({ 

							scope:this

							,load:function(){

								this.imageLoaded = true;
								
								this.imageWidth = this.compRef.imageCont.el.dom.naturalWidth;
								this.imageHeight = this.compRef.imageCont.el.dom.naturalHeight;

								this.compRef.imageDimensions.setText(this.imageWidth+' x '+this.imageHeight);
								// this.compRef.imageFileName.setText(this.image);

								this.setTitle(this.image);

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
								
								this.mouseDownScrollLeft = this.body.dom.scrollLeft;
								this.mouseDownScrollTop = this.body.dom.scrollTop;
								
								Ext.fly(el).replaceCls(this.cursorOverClass, this.cursorDownClass);
								event.stopEvent(); // prevents native browser dragging
							}

							,mouseup:function(event, el){

								this.mouseDown = false;
								
								Ext.fly(el).replaceCls(this.cursorDownClass, this.cursorOverClass);
							}

							,mousemove:function(event, el){

								if(this.mouseDown === true){

									let xy = event.getXY();
									
									if(xy[0] > this.mouseDownXY[0]){
										this.body.dom.scrollLeft = this.mouseDownScrollLeft - (xy[0] - this.mouseDownXY[0]);
									}else if(xy[0] < this.mouseDownXY[0]){
										this.body.dom.scrollLeft = this.mouseDownScrollLeft + (this.mouseDownXY[0] - xy[0]);
									}
									
									if(xy[1] > this.mouseDownXY[1]){
										this.body.dom.scrollTop = this.mouseDownScrollTop - (xy[1] - this.mouseDownXY[1]);
									}else if(xy[1] < this.mouseDownXY[1]){
										this.body.dom.scrollTop = this.mouseDownScrollTop + (this.mouseDownXY[1] - xy[1]);
									}
									
									event.stopEvent();
								}
							}
						});
					}
				}
			}]

			,listeners:{
				scope:this
				,move:{
					delay:50
					,fn:function(){
						if(this.imageLoaded){
							this.zoomImage();
						}
					}
				}
			}
		});

		this.callParent(this, arguments);
	
		if ( typeof this.store == 'string' ) 
			this.store = App.store.lookup( this.store );

		/* this.getForm().trackResetOnLoad = true; */

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;
	
	}/*}}}*/

});
