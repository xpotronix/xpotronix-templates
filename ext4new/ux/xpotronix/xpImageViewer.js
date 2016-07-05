Ext.define( 'Ux.xpotronix.xpImageViewer', {

	extend: 'Ext.Panel'
	,alias: 'xpImageViewer'

	,cursorOverClass: 'cursor-open-hand'
	,cursorDownClass: 'cursor-closed-hand'
	,imageNameLabel:'Image File Name:'
	,defaultZoom:'fit' //can be 'fit' or any number between 6 and sliderWidth
	,defaultZoomSliderValue:20 //out of sliderWidth
	,sliderWidth:100
	,loadingImg:'/inc/img/loading.gif'

	,zoomSelection:function(combo,rec,idx){
		this.zoom = rec.data.value;
		this.zoomImage();
	}
	,repositionImage:function(){
		var setProps = {
			left: 0
			,top: 0
		};
		if(this.compRef.imageEl.dom.width < this.compRef.imageCont.body.dom.clientWidth){
			setProps.left = (this.compRef.imageCont.body.dom.clientWidth - this.compRef.imageEl.dom.width)/2;
		}
		if(this.compRef.imageEl.dom.height < this.compRef.imageCont.body.dom.clientHeight){
			setProps.top = (this.compRef.imageCont.body.dom.clientHeight - this.compRef.imageEl.dom.height)/2;
		}
		this.compRef.imageEl.setStyle(setProps);
	}
	,setImage:function(imagePath){
		
		this.image = imagePath;
		if(this.compRef.imageEl){
			this.compRef.imageEl.remove();
		}
		this.compRef.loadingEl.removeCls('x-hidden');
		
		var ie = new Ext.core.Element(document.createElement('img'));
		this.compRef.imageEl = ie;

		ie.on({
			scope:this
			,load:function(){
				this.imageLoaded = true;
				
				this.imageWidth = this.compRef.imageEl.dom.width;
				this.imageHeight = this.compRef.imageEl.dom.height;

				this.compRef.imageDimensions.setText(this.imageWidth+' x '+this.imageHeight);
	
				this.compRef.loadingEl.addCls('x-hidden');
				this.zoomImage();
			}
			,mouseout:function(event, el){
				this.mouseDown = false;
				
				Ext.fly(el).replaceCls(this.cursorDownClass, this.cursorOverClass);
			}
			,mousedown:function(event, el){

				this.mouseDown = true;
				this.mouseDownXY = event.getXY();
				
				this.mouseDownScrollLeft = this.compRef.imageCont.body.dom.scrollLeft;
				this.mouseDownScrollTop = this.compRef.imageCont.body.dom.scrollTop;
				
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
						this.compRef.imageCont.body.dom.scrollLeft = this.mouseDownScrollLeft - (xy[0] - this.mouseDownXY[0]);
					}else if(xy[0] < this.mouseDownXY[0]){
						this.compRef.imageCont.body.dom.scrollLeft = this.mouseDownScrollLeft + (this.mouseDownXY[0] - xy[0]);
					}
					
					if(xy[1] > this.mouseDownXY[1]){
						this.compRef.imageCont.body.dom.scrollTop = this.mouseDownScrollTop - (xy[1] - this.mouseDownXY[1]);
					}else if(xy[1] < this.mouseDownXY[1]){
						this.compRef.imageCont.body.dom.scrollTop = this.mouseDownScrollTop + (this.mouseDownXY[1] - xy[1]);
					}
					
					event.stopEvent();
				}
			}
		});
		
		ie.set({
			src: this.image
			,cls: this.cursorOverClass
			,style:{
				position:'absolute'
			}
		});
		
		ie.appendTo(this.compRef.imageCont.body.dom);
	}
	,getNormalizedZoom:function(zoomSliderValue){
		zoomSliderValue = (zoomSliderValue / this.sliderWidth)*500;
		if(zoomSliderValue < 1){
			return 1;
		}
		return Math.round(zoomSliderValue);
	}
	,zoomImage:function(){
	
		var scaling, wProp, hProp, newWidth, newHeight, setProps, curScrollXratio, curScrollYratio;
		if(this.zoom == 'fit'){
			
			wProp = this.compRef.imageCont.body.dom.clientWidth / this.imageWidth;
			hProp = this.compRef.imageCont.body.dom.clientHeight / this.imageHeight;
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
		
		curScrollXratio = this.compRef.imageCont.body.dom.scrollLeft / (this.compRef.imageEl.dom.clientWidth-this.compRef.imageCont.body.dom.clientWidth);
		curScrollYratio = this.compRef.imageCont.body.dom.scrollTop / (this.compRef.imageEl.dom.clientHeight-this.compRef.imageCont.body.dom.clientHeight);
		
		curScrollXratio = curScrollXratio == 0 ? .5 : curScrollXratio;
		curScrollYratio = curScrollYratio == 0 ? .5 : curScrollYratio;
		this.compRef.imageEl.setStyle(setProps);
		
		this.repositionImage();
		
		this.compRef.imageCont.body.dom.scrollLeft = curScrollXratio * (this.compRef.imageEl.dom.clientWidth-this.compRef.imageCont.body.dom.clientWidth);
		this.compRef.imageCont.body.dom.scrollTop = curScrollYratio * (this.compRef.imageEl.dom.clientHeight-this.compRef.imageCont.body.dom.clientHeight);
	}
	,initComponent:function(){
		this.mouseDown = false;
		this.zoom = this.defaultZoom;
		this.imageWidth = 1;
		this.imageHeight = 1;
		this.imageLoaded = false;
		
		this.compRef = {};
		
		this.image = this.image || Ext.BLANK_IMAGE_URL;
		
		Ext.apply(this,{
			width:400
			,height:400
			,layout:'fit'
			,refO:this.compRef
			,tbar:[{
				xtype:'tbtext'
				,text:this.imageNameLabel
			},{
				xtype:'tbtext'
				,ref:'../imageName'
				,refO:this.compRef
				,itemId:'imageName'
				,text:this.image != Ext.BLANK_IMAGE_URL ? this.image : ''
			}]
			,bbar:[{
				xtype:'tbtext'
				,text:'Fit'
				,width:20
			},{
				xtype:'checkbox'
				,width:20
				,ref:'../autoFitZoom'
				,labelCls:'x-hidden'
				,refO:this.compRef
				,itemId:'autoFitZoom'
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
				,ref:'../zoomText'
				,refO:this.compRef
				,itemId:'zoomText'
				,text:this.defaultZoom == 'fit' ? 'Fit' : this.defaultZoom
			},{
				xtype:'slider'
				,ref:'../zoomSlider'
				,refO:this.compRef
				,labelCls:'x-hidden'
				,itemId:'zoomSlider'
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
				,ref:'../imageDimensions'
				,refO:this.compRef
				,width:75
				,itemId:'imageDimensions'
			}]
			,items:{
				autoScroll:true
				,ref:'imageCont'
				,itemId:'imageCont'
				//,frame:true
				,cls:'image-viewer'
				,listeners:{
					scope:this
					,render:function(comp){
						var le = new Ext.core.Element(document.createElement('img'));
						this.compRef.loadingEl = le;
							
						le.set({
							src:this.loadingImg
						});
						le.appendTo(comp.body.dom);
							
						le.setStyle({
							position:'absolute'
							,top:'20px'
							,left:'20px'
						});
							
						if(this.image){
							//console.log(this.compRef);
							//console.log(this.compRef.imageDimensions);
							this.setImage(this.image);
						}else{
							le.addCls('x-hidden');
						}
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
		
		imageViewer.superclass.initComponent.call(this, arguments);
		
	}
});
