/*
 Highmaps JS v5.0.12 (2017-05-24)
 Highmaps as a plugin for Highcharts 4.1.x or Highstock 2.1.x (x being the patch version of this file)

 (c) 2011-2017 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(v){"object"===typeof module&&module.exports?module.exports=v:v(Highcharts)})(function(v){(function(a){var h=a.Axis,n=a.each,k=a.pick;a=a.wrap;a(h.prototype,"getSeriesExtremes",function(a){var p=this.isXAxis,d,h,t=[],f;p&&n(this.series,function(a,b){a.useMapGeometry&&(t[b]=a.xData,a.xData=[])});a.call(this);p&&(d=k(this.dataMin,Number.MAX_VALUE),h=k(this.dataMax,-Number.MAX_VALUE),n(this.series,function(a,b){a.useMapGeometry&&(d=Math.min(d,k(a.minX,d)),h=Math.max(h,k(a.maxX,d)),a.xData=t[b],
f=!0)}),f&&(this.dataMin=d,this.dataMax=h))});a(h.prototype,"setAxisTranslation",function(a){var p=this.chart,d=p.plotWidth/p.plotHeight,p=p.xAxis[0],k;a.call(this);"yAxis"===this.coll&&void 0!==p.transA&&n(this.series,function(a){a.preserveAspectRatio&&(k=!0)});if(k&&(this.transA=p.transA=Math.min(this.transA,p.transA),a=d/((p.max-p.min)/(this.max-this.min)),a=1>a?this:p,d=(a.max-a.min)*a.transA,a.pixelPadding=a.len-d,a.minPixelPadding=a.pixelPadding/2,d=a.fixTo)){d=d[1]-a.toValue(d[0],!0);d*=a.transA;
if(Math.abs(d)>a.minPixelPadding||a.min===a.dataMin&&a.max===a.dataMax)d=0;a.minPixelPadding-=d}});a(h.prototype,"render",function(a){a.call(this);this.fixTo=null})})(v);(function(a){var h=a.Axis,n=a.Chart,k=a.color,d,p=a.each,z=a.extend,w=a.isNumber,t=a.Legend,f=a.LegendSymbolMixin,c=a.noop,b=a.merge,l=a.pick,r=a.wrap;d=a.ColorAxis=function(){this.init.apply(this,arguments)};z(d.prototype,h.prototype);z(d.prototype,{defaultColorAxisOptions:{lineWidth:0,minPadding:0,maxPadding:0,gridLineWidth:1,tickPixelInterval:72,
startOnTick:!0,endOnTick:!0,offset:0,marker:{animation:{duration:50},width:.01,color:"#999999"},labels:{overflow:"justify",rotation:0},minColor:"#e6ebf5",maxColor:"#003399",tickLength:5,showInLegend:!0},keepProps:["legendGroup","legendItemHeight","legendItemWidth","legendItem","legendSymbol"].concat(h.prototype.keepProps),init:function(a,q){var g="vertical"!==a.options.legend.layout,e;this.coll="colorAxis";e=b(this.defaultColorAxisOptions,{side:g?2:1,reversed:!g},q,{opposite:!g,showEmpty:!1,title:null});
h.prototype.init.call(this,a,e);q.dataClasses&&this.initDataClasses(q);this.initStops();this.horiz=g;this.zoomEnabled=!1;this.defaultLegendLength=200},initDataClasses:function(a){var g=this.chart,u,e=0,m=g.options.chart.colorCount,c=this.options,l=a.dataClasses.length;this.dataClasses=u=[];this.legendItems=[];p(a.dataClasses,function(a,q){a=b(a);u.push(a);a.color||("category"===c.dataClassColor?(q=g.options.colors,m=q.length,a.color=q[e],a.colorIndex=e,e++,e===m&&(e=0)):a.color=k(c.minColor).tweenTo(k(c.maxColor),
2>l?.5:q/(l-1)))})},initStops:function(){this.stops=this.options.stops||[[0,this.options.minColor],[1,this.options.maxColor]];p(this.stops,function(a){a.color=k(a[1])})},setOptions:function(a){h.prototype.setOptions.call(this,a);this.options.crosshair=this.options.marker},setAxisSize:function(){var a=this.legendSymbol,q=this.chart,b=q.options.legend||{},e,m;a?(this.left=b=a.attr("x"),this.top=e=a.attr("y"),this.width=m=a.attr("width"),this.height=a=a.attr("height"),this.right=q.chartWidth-b-m,this.bottom=
q.chartHeight-e-a,this.len=this.horiz?m:a,this.pos=this.horiz?b:e):this.len=(this.horiz?b.symbolWidth:b.symbolHeight)||this.defaultLegendLength},normalizedValue:function(a){this.isLog&&(a=this.val2lin(a));return 1-(this.max-a)/(this.max-this.min||1)},toColor:function(a,b){var g=this.stops,e,m,q=this.dataClasses,c,l;if(q)for(l=q.length;l--;){if(c=q[l],e=c.from,g=c.to,(void 0===e||a>=e)&&(void 0===g||a<=g)){m=c.color;b&&(b.dataClass=l,b.colorIndex=c.colorIndex);break}}else{a=this.normalizedValue(a);
for(l=g.length;l--&&!(a>g[l][0]););e=g[l]||g[l+1];g=g[l+1]||e;a=1-(g[0]-a)/(g[0]-e[0]||1);m=e.color.tweenTo(g.color,a)}return m},getOffset:function(){var a=this.legendGroup,b=this.chart.axisOffset[this.side];a&&(this.axisParent=a,h.prototype.getOffset.call(this),this.added||(this.added=!0,this.labelLeft=0,this.labelRight=this.width),this.chart.axisOffset[this.side]=b)},setLegendColor:function(){var a,b=this.reversed;a=b?1:0;b=b?0:1;a=this.horiz?[a,0,b,0]:[0,b,0,a];this.legendColor={linearGradient:{x1:a[0],
y1:a[1],x2:a[2],y2:a[3]},stops:this.stops}},drawLegendSymbol:function(a,b){var g=a.padding,e=a.options,m=this.horiz,q=l(e.symbolWidth,m?this.defaultLegendLength:12),c=l(e.symbolHeight,m?12:this.defaultLegendLength),f=l(e.labelPadding,m?16:30),e=l(e.itemDistance,10);this.setLegendColor();b.legendSymbol=this.chart.renderer.rect(0,a.baseline-11,q,c).attr({zIndex:1}).add(b.legendGroup);this.legendItemWidth=q+g+(m?e:f);this.legendItemHeight=c+g+(m?f:0)},setState:c,visible:!0,setVisible:c,getSeriesExtremes:function(){var a=
this.series,b=a.length;this.dataMin=Infinity;for(this.dataMax=-Infinity;b--;)void 0!==a[b].valueMin&&(this.dataMin=Math.min(this.dataMin,a[b].valueMin),this.dataMax=Math.max(this.dataMax,a[b].valueMax))},drawCrosshair:function(a,b){var g=b&&b.plotX,e=b&&b.plotY,m,c=this.pos,q=this.len;b&&(m=this.toPixels(b[b.series.colorKey]),m<c?m=c-2:m>c+q&&(m=c+q+2),b.plotX=m,b.plotY=this.len-m,h.prototype.drawCrosshair.call(this,a,b),b.plotX=g,b.plotY=e,this.cross&&(this.cross.addClass("highcharts-coloraxis-marker").add(this.legendGroup),
this.cross.attr({fill:this.crosshair.color})))},getPlotLinePath:function(a,b,c,e,m){return w(m)?this.horiz?["M",m-4,this.top-6,"L",m+4,this.top-6,m,this.top,"Z"]:["M",this.left,m,"L",this.left-6,m+6,this.left-6,m-6,"Z"]:h.prototype.getPlotLinePath.call(this,a,b,c,e)},update:function(a,c){var g=this.chart,e=g.legend;p(this.series,function(a){a.isDirtyData=!0});a.dataClasses&&e.allItems&&(p(e.allItems,function(a){a.isDataClass&&a.legendGroup&&a.legendGroup.destroy()}),g.isDirtyLegend=!0);g.options[this.coll]=
b(this.userOptions,a);h.prototype.update.call(this,a,c);this.legendItem&&(this.setLegendColor(),e.colorizeItem(this,!0))},remove:function(){this.legendItem&&this.chart.legend.destroyItem(this);h.prototype.remove.call(this)},getDataClassLegendSymbols:function(){var b=this,q=this.chart,l=this.legendItems,e=q.options.legend,m=e.valueDecimals,r=e.valueSuffix||"",d;l.length||p(this.dataClasses,function(e,g){var u=!0,k=e.from,x=e.to;d="";void 0===k?d="\x3c ":void 0===x&&(d="\x3e ");void 0!==k&&(d+=a.numberFormat(k,
m)+r);void 0!==k&&void 0!==x&&(d+=" - ");void 0!==x&&(d+=a.numberFormat(x,m)+r);l.push(z({chart:q,name:d,options:{},drawLegendSymbol:f.drawRectangle,visible:!0,setState:c,isDataClass:!0,setVisible:function(){u=this.visible=!u;p(b.series,function(a){p(a.points,function(a){a.dataClass===g&&a.setVisible(u)})});q.legend.colorizeItem(this,u)}},e))});return l},name:""});p(["fill","stroke"],function(b){a.Fx.prototype[b+"Setter"]=function(){this.elem.attr(b,k(this.start).tweenTo(k(this.end),this.pos),null,
!0)}});r(n.prototype,"getAxes",function(a){var b=this.options.colorAxis;a.call(this);this.colorAxis=[];b&&new d(this,b)});r(t.prototype,"getAllItems",function(a){var b=[],c=this.chart.colorAxis[0];c&&c.options&&(c.options.showInLegend&&(c.options.dataClasses?b=b.concat(c.getDataClassLegendSymbols()):b.push(c)),p(c.series,function(a){a.options.showInLegend=!1}));return b.concat(a.call(this))});r(t.prototype,"colorizeItem",function(a,b,c){a.call(this,b,c);c&&b.legendColor&&b.legendSymbol.attr({fill:b.legendColor})})})(v);
(function(a){var h=a.defined,n=a.each,k=a.noop,d=a.seriesTypes;a.colorPointMixin={isValid:function(){return null!==this.value},setVisible:function(a){var d=this,p=a?"show":"hide";n(["graphic","dataLabel"],function(a){if(d[a])d[a][p]()})},setState:function(d){a.Point.prototype.setState.call(this,d);this.graphic&&this.graphic.attr({zIndex:"hover"===d?1:0})}};a.colorSeriesMixin={pointArrayMap:["value"],axisTypes:["xAxis","yAxis","colorAxis"],optionalAxis:"colorAxis",trackerGroups:["group","markerGroup",
"dataLabelsGroup"],getSymbol:k,parallelArrays:["x","y","value"],colorKey:"value",pointAttribs:d.column.prototype.pointAttribs,translateColors:function(){var a=this,d=this.options.nullColor,k=this.colorAxis,h=this.colorKey;n(this.data,function(f){var c=f[h];if(c=f.options.color||(f.isNull?d:k&&void 0!==c?k.toColor(c,f):f.color||a.color))f.color=c})},colorAttribs:function(a){var d={};h(a.color)&&(d[this.colorProp||"fill"]=a.color);return d}}})(v);(function(a){function h(a){a&&(a.preventDefault&&a.preventDefault(),
a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)}function n(a){this.init(a)}var k=a.addEvent,d=a.Chart,p=a.doc,z=a.each,w=a.extend,t=a.merge,f=a.pick,c=a.wrap;n.prototype.init=function(a){this.chart=a;a.mapNavButtons=[]};n.prototype.update=function(b){var c=this.chart,d=c.options.mapNavigation,g,q,u,e,m,p=function(a){this.handler.call(c,a);h(a)},y=c.mapNavButtons;b&&(d=c.options.mapNavigation=t(c.options.mapNavigation,b));for(;y.length;)y.pop().destroy();f(d.enableButtons,d.enabled)&&!c.renderer.forExport&&
a.objectEach(d.buttons,function(a,b){g=t(d.buttonOptions,a);q=g.theme;q.style=t(g.theme.style,g.style);e=(u=q.states)&&u.hover;m=u&&u.select;a=c.renderer.button(g.text,0,0,p,q,e,m,0,"zoomIn"===b?"topbutton":"bottombutton").addClass("highcharts-map-navigation").attr({width:g.width,height:g.height,title:c.options.lang[b],padding:g.padding,zIndex:5}).add();a.handler=g.onclick;a.align(w(g,{width:a.width,height:2*a.height}),null,g.alignTo);k(a.element,"dblclick",h);y.push(a)});this.updateEvents(d)};n.prototype.updateEvents=
function(a){var b=this.chart;f(a.enableDoubleClickZoom,a.enabled)||a.enableDoubleClickZoomTo?this.unbindDblClick=this.unbindDblClick||k(b.container,"dblclick",function(a){b.pointer.onContainerDblClick(a)}):this.unbindDblClick&&(this.unbindDblClick=this.unbindDblClick());f(a.enableMouseWheelZoom,a.enabled)?this.unbindMouseWheel=this.unbindMouseWheel||k(b.container,void 0===p.onmousewheel?"DOMMouseScroll":"mousewheel",function(a){b.pointer.onContainerMouseWheel(a);h(a);return!1}):this.unbindMouseWheel&&
(this.unbindMouseWheel=this.unbindMouseWheel())};w(d.prototype,{fitToBox:function(a,c){z([["x","width"],["y","height"]],function(b){var g=b[0];b=b[1];a[g]+a[b]>c[g]+c[b]&&(a[b]>c[b]?(a[b]=c[b],a[g]=c[g]):a[g]=c[g]+c[b]-a[b]);a[b]>c[b]&&(a[b]=c[b]);a[g]<c[g]&&(a[g]=c[g])});return a},mapZoom:function(a,c,d,g,q){var b=this.xAxis[0],e=b.max-b.min,m=f(c,b.min+e/2),l=e*a,e=this.yAxis[0],p=e.max-e.min,k=f(d,e.min+p/2),p=p*a,m=this.fitToBox({x:m-l*(g?(g-b.pos)/b.len:.5),y:k-p*(q?(q-e.pos)/e.len:.5),width:l,
height:p},{x:b.dataMin,y:e.dataMin,width:b.dataMax-b.dataMin,height:e.dataMax-e.dataMin}),l=m.x<=b.dataMin&&m.width>=b.dataMax-b.dataMin&&m.y<=e.dataMin&&m.height>=e.dataMax-e.dataMin;g&&(b.fixTo=[g-b.pos,c]);q&&(e.fixTo=[q-e.pos,d]);void 0===a||l?(b.setExtremes(void 0,void 0,!1),e.setExtremes(void 0,void 0,!1)):(b.setExtremes(m.x,m.x+m.width,!1),e.setExtremes(m.y,m.y+m.height,!1));this.redraw()}});c(d.prototype,"render",function(a){this.mapNavigation=new n(this);this.mapNavigation.update();a.call(this)})})(v);
(function(a){var h=a.extend,n=a.pick,k=a.Pointer;a=a.wrap;h(k.prototype,{onContainerDblClick:function(a){var d=this.chart;a=this.normalize(a);d.options.mapNavigation.enableDoubleClickZoomTo?d.pointer.inClass(a.target,"highcharts-tracker")&&d.hoverPoint&&d.hoverPoint.zoomTo():d.isInsidePlot(a.chartX-d.plotLeft,a.chartY-d.plotTop)&&d.mapZoom(.5,d.xAxis[0].toValue(a.chartX),d.yAxis[0].toValue(a.chartY),a.chartX,a.chartY)},onContainerMouseWheel:function(a){var d=this.chart,k;a=this.normalize(a);k=a.detail||
-(a.wheelDelta/120);d.isInsidePlot(a.chartX-d.plotLeft,a.chartY-d.plotTop)&&d.mapZoom(Math.pow(d.options.mapNavigation.mouseWheelSensitivity,k),d.xAxis[0].toValue(a.chartX),d.yAxis[0].toValue(a.chartY),a.chartX,a.chartY)}});a(k.prototype,"zoomOption",function(a){var d=this.chart.options.mapNavigation;n(d.enableTouchZoom,d.enabled)&&(this.chart.options.chart.pinchType="xy");a.apply(this,[].slice.call(arguments,1))});a(k.prototype,"pinchTranslate",function(a,k,h,n,t,f,c){a.call(this,k,h,n,t,f,c);"map"===
this.chart.options.chart.type&&this.hasZoom&&(a=n.scaleX>n.scaleY,this.pinchTranslateDirection(!a,k,h,n,t,f,c,a?n.scaleX:n.scaleY))})})(v);(function(a){var h=a.color,n=a.colorPointMixin,k=a.each,d=a.extend,p=a.isNumber,z=a.map,w=a.merge,t=a.noop,f=a.pick,c=a.isArray,b=a.Point,l=a.Series,r=a.seriesType,g=a.seriesTypes,q=a.splat,u=void 0!==a.doc.documentElement.style.vectorEffect;r("map","scatter",{allAreas:!0,animation:!1,nullColor:"#f7f7f7",borderColor:"#cccccc",borderWidth:1,marker:null,stickyTracking:!1,
joinBy:"hc-key",dataLabels:{formatter:function(){return this.point.value},inside:!0,verticalAlign:"middle",crop:!1,overflow:!1,padding:0},turboThreshold:0,tooltip:{followPointer:!0,pointFormat:"{point.name}: {point.value}\x3cbr/\x3e"},states:{normal:{animation:!0},hover:{brightness:.2,halo:null},select:{color:"#cccccc"}}},w(a.colorSeriesMixin,{type:"map",supportsDrilldown:!0,getExtremesFromAll:!0,useMapGeometry:!0,forceDL:!0,searchPoint:t,directTouch:!0,preserveAspectRatio:!0,pointArrayMap:["value"],
getBox:function(e){var b=Number.MAX_VALUE,c=-b,g=b,d=-b,q=b,l=b,u=this.xAxis,r=this.yAxis,h;k(e||[],function(e){if(e.path){"string"===typeof e.path&&(e.path=a.splitPath(e.path));var m=e.path||[],u=m.length,k=!1,r=-b,x=b,y=-b,n=b,A=e.properties;if(!e._foundBox){for(;u--;)p(m[u])&&(k?(r=Math.max(r,m[u]),x=Math.min(x,m[u])):(y=Math.max(y,m[u]),n=Math.min(n,m[u])),k=!k);e._midX=x+(r-x)*(e.middleX||A&&A["hc-middle-x"]||.5);e._midY=n+(y-n)*(e.middleY||A&&A["hc-middle-y"]||.5);e._maxX=r;e._minX=x;e._maxY=
y;e._minY=n;e.labelrank=f(e.labelrank,(r-x)*(y-n));e._foundBox=!0}c=Math.max(c,e._maxX);g=Math.min(g,e._minX);d=Math.max(d,e._maxY);q=Math.min(q,e._minY);l=Math.min(e._maxX-e._minX,e._maxY-e._minY,l);h=!0}});h&&(this.minY=Math.min(q,f(this.minY,b)),this.maxY=Math.max(d,f(this.maxY,-b)),this.minX=Math.min(g,f(this.minX,b)),this.maxX=Math.max(c,f(this.maxX,-b)),u&&void 0===u.options.minRange&&(u.minRange=Math.min(5*l,(this.maxX-this.minX)/5,u.minRange||b)),r&&void 0===r.options.minRange&&(r.minRange=
Math.min(5*l,(this.maxY-this.minY)/5,r.minRange||b)))},getExtremes:function(){l.prototype.getExtremes.call(this,this.valueData);this.chart.hasRendered&&this.isDirtyData&&this.getBox(this.options.data);this.valueMin=this.dataMin;this.valueMax=this.dataMax;this.dataMin=this.minY;this.dataMax=this.maxY},translatePath:function(a){var e=!1,b=this.xAxis,c=this.yAxis,g=b.min,d=b.transA,b=b.minPixelPadding,q=c.min,f=c.transA,c=c.minPixelPadding,l,u=[];if(a)for(l=a.length;l--;)p(a[l])?(u[l]=e?(a[l]-g)*d+b:
(a[l]-q)*f+c,e=!e):u[l]=a[l];return u},setData:function(e,b,g,d){var m=this.options,f=this.chart.options.chart,u=f&&f.map,r=m.mapData,h=m.joinBy,n=null===h,x=m.keys||this.pointArrayMap,y=[],B={},t=this.chart.mapTransforms;!r&&u&&(r="string"===typeof u?a.maps[u]:u);n&&(h="_i");h=this.joinBy=q(h);h[1]||(h[1]=h[0]);e&&k(e,function(a,b){var g=0;if(p(a))e[b]={value:a};else if(c(a)){e[b]={};!m.keys&&a.length>x.length&&"string"===typeof a[0]&&(e[b]["hc-key"]=a[0],++g);for(var d=0;d<x.length;++d,++g)x[d]&&
(e[b][x[d]]=a[g])}n&&(e[b]._i=b)});this.getBox(e);(this.chart.mapTransforms=t=f&&f.mapTransforms||r&&r["hc-transform"]||t)&&a.objectEach(t,function(a){a.rotation&&(a.cosAngle=Math.cos(a.rotation),a.sinAngle=Math.sin(a.rotation))});if(r){"FeatureCollection"===r.type&&(this.mapTitle=r.title,r=a.geojson(r,this.type,this));this.mapData=r;this.mapMap={};for(t=0;t<r.length;t++)f=r[t],u=f.properties,f._i=t,h[0]&&u&&u[h[0]]&&(f[h[0]]=u[h[0]]),B[f[h[0]]]=f;this.mapMap=B;e&&h[1]&&k(e,function(a){B[a[h[1]]]&&
y.push(B[a[h[1]]])});m.allAreas?(this.getBox(r),e=e||[],h[1]&&k(e,function(a){y.push(a[h[1]])}),y="|"+z(y,function(a){return a&&a[h[0]]}).join("|")+"|",k(r,function(a){h[0]&&-1!==y.indexOf("|"+a[h[0]]+"|")||(e.push(w(a,{value:null})),d=!1)})):this.getBox(y)}l.prototype.setData.call(this,e,b,g,d)},drawGraph:t,drawDataLabels:t,doFullTranslate:function(){return this.isDirtyData||this.chart.isResizing||this.chart.renderer.isVML||!this.baseTrans},translate:function(){var a=this,b=a.xAxis,c=a.yAxis,g=a.doFullTranslate();
a.generatePoints();k(a.data,function(e){e.plotX=b.toPixels(e._midX,!0);e.plotY=c.toPixels(e._midY,!0);g&&(e.shapeType="path",e.shapeArgs={d:a.translatePath(e.path)})});a.translateColors()},pointAttribs:function(a,b){b=g.column.prototype.pointAttribs.call(this,a,b);a.isFading&&delete b.fill;u?b["vector-effect"]="non-scaling-stroke":b["stroke-width"]="inherit";return b},drawPoints:function(){var a=this,b=a.xAxis,c=a.yAxis,d=a.group,f=a.chart,q=f.renderer,l,r,h,p,n=this.baseTrans,t,B,z,w,v;a.transformGroup||
(a.transformGroup=q.g().attr({scaleX:1,scaleY:1}).add(d),a.transformGroup.survive=!0);a.doFullTranslate()?(f.hasRendered&&k(a.points,function(b){b.shapeArgs&&(b.shapeArgs.fill=a.pointAttribs(b,b.state).fill)}),a.group=a.transformGroup,g.column.prototype.drawPoints.apply(a),a.group=d,k(a.points,function(a){a.graphic&&(a.name&&a.graphic.addClass("highcharts-name-"+a.name.replace(/ /g,"-").toLowerCase()),a.properties&&a.properties["hc-key"]&&a.graphic.addClass("highcharts-key-"+a.properties["hc-key"].toLowerCase()))}),
this.baseTrans={originX:b.min-b.minPixelPadding/b.transA,originY:c.min-c.minPixelPadding/c.transA+(c.reversed?0:c.len/c.transA),transAX:b.transA,transAY:c.transA},this.transformGroup.animate({translateX:0,translateY:0,scaleX:1,scaleY:1})):(l=b.transA/n.transAX,r=c.transA/n.transAY,h=b.toPixels(n.originX,!0),p=c.toPixels(n.originY,!0),.99<l&&1.01>l&&.99<r&&1.01>r&&(r=l=1,h=Math.round(h),p=Math.round(p)),t=this.transformGroup,f.renderer.globalAnimation?(B=t.attr("translateX"),z=t.attr("translateY"),
w=t.attr("scaleX"),v=t.attr("scaleY"),t.attr({animator:0}).animate({animator:1},{step:function(a,b){t.attr({translateX:B+(h-B)*b.pos,translateY:z+(p-z)*b.pos,scaleX:w+(l-w)*b.pos,scaleY:v+(r-v)*b.pos})}})):t.attr({translateX:h,translateY:p,scaleX:l,scaleY:r}));u||a.group.element.setAttribute("stroke-width",a.options[a.pointAttrToOptions&&a.pointAttrToOptions["stroke-width"]||"borderWidth"]/(l||1));this.drawMapDataLabels()},drawMapDataLabels:function(){l.prototype.drawDataLabels.call(this);this.dataLabelsGroup&&
this.dataLabelsGroup.clip(this.chart.clipRect)},render:function(){var a=this,b=l.prototype.render;a.chart.renderer.isVML&&3E3<a.data.length?setTimeout(function(){b.call(a)}):b.call(a)},animate:function(a){var b=this.options.animation,e=this.group,c=this.xAxis,g=this.yAxis,d=c.pos,f=g.pos;this.chart.renderer.isSVG&&(!0===b&&(b={duration:1E3}),a?e.attr({translateX:d+c.len/2,translateY:f+g.len/2,scaleX:.001,scaleY:.001}):(e.animate({translateX:d,translateY:f,scaleX:1,scaleY:1},b),this.animate=null))},
animateDrilldown:function(a){var b=this.chart.plotBox,e=this.chart.drilldownLevels[this.chart.drilldownLevels.length-1],c=e.bBox,g=this.chart.options.drilldown.animation;a||(a=Math.min(c.width/b.width,c.height/b.height),e.shapeArgs={scaleX:a,scaleY:a,translateX:c.x,translateY:c.y},k(this.points,function(a){a.graphic&&a.graphic.attr(e.shapeArgs).animate({scaleX:1,scaleY:1,translateX:0,translateY:0},g)}),this.animate=null)},drawLegendSymbol:a.LegendSymbolMixin.drawRectangle,animateDrillupFrom:function(a){g.column.prototype.animateDrillupFrom.call(this,
a)},animateDrillupTo:function(a){g.column.prototype.animateDrillupTo.call(this,a)}}),d({applyOptions:function(a,c){a=b.prototype.applyOptions.call(this,a,c);c=this.series;var e=c.joinBy;c.mapData&&((e=void 0!==a[e[1]]&&c.mapMap[a[e[1]]])?(c.xyFromShape&&(a.x=e._midX,a.y=e._midY),d(a,e)):a.value=a.value||null);return a},onMouseOver:function(a){clearTimeout(this.colorInterval);if(null!==this.value||this.series.options.nullInteraction)b.prototype.onMouseOver.call(this,a);else this.series.onMouseOut(a)},
onMouseOut:function(){var a=this,c=+new Date,g=h(this.series.pointAttribs(a).fill),d=h(this.series.pointAttribs(a,"hover").fill),f=a.series.options.states.normal.animation,l=f&&(f.duration||500);l&&4===g.rgba.length&&4===d.rgba.length&&"select"!==a.state&&(clearTimeout(a.colorInterval),a.colorInterval=setInterval(function(){var b=(new Date-c)/l,e=a.graphic;1<b&&(b=1);e&&e.attr("fill",d.tweenTo(g,b));1<=b&&clearTimeout(a.colorInterval)},13),a.isFading=!0);b.prototype.onMouseOut.call(a);a.isFading=
null},zoomTo:function(){var a=this.series;a.xAxis.setExtremes(this._minX,this._maxX,!1);a.yAxis.setExtremes(this._minY,this._maxY,!1);a.chart.redraw()}},n))})(v);(function(a){var h=a.seriesType,n=a.seriesTypes;h("mapline","map",{lineWidth:1,fillColor:"none"},{type:"mapline",colorProp:"stroke",pointAttrToOptions:{stroke:"color","stroke-width":"lineWidth"},pointAttribs:function(a,d){a=n.map.prototype.pointAttribs.call(this,a,d);a.fill=this.options.fillColor;return a},drawLegendSymbol:n.line.prototype.drawLegendSymbol})})(v);
(function(a){var h=a.merge,n=a.Point;a=a.seriesType;a("mappoint","scatter",{dataLabels:{enabled:!0,formatter:function(){return this.point.name},crop:!1,defer:!1,overflow:!1,style:{color:"#000000"}}},{type:"mappoint",forceDL:!0},{applyOptions:function(a,d){a=void 0!==a.lat&&void 0!==a.lon?h(a,this.series.chart.fromLatLonToPoint(a)):a;return n.prototype.applyOptions.call(this,a,d)}})})(v);(function(a){var h=a.arrayMax,n=a.arrayMin,k=a.Axis,d=a.color,p=a.each,z=a.isNumber,w=a.noop,t=a.pick,f=a.pInt,
c=a.Point,b=a.Series,l=a.seriesType,r=a.seriesTypes;l("bubble","scatter",{dataLabels:{formatter:function(){return this.point.z},inside:!0,verticalAlign:"middle"},marker:{lineColor:null,lineWidth:1,radius:null,states:{hover:{radiusPlus:0}},symbol:"circle"},minSize:8,maxSize:"20%",softThreshold:!1,states:{hover:{halo:{size:5}}},tooltip:{pointFormat:"({point.x}, {point.y}), Size: {point.z}"},turboThreshold:0,zThreshold:0,zoneAxis:"z"},{pointArrayMap:["y","z"],parallelArrays:["x","y","z"],trackerGroups:["group",
"dataLabelsGroup"],specialGroup:"group",bubblePadding:!0,zoneAxis:"z",directTouch:!0,pointAttribs:function(a,c){var g=t(this.options.marker.fillOpacity,.5);a=b.prototype.pointAttribs.call(this,a,c);1!==g&&(a.fill=d(a.fill).setOpacity(g).get("rgba"));return a},getRadii:function(a,b,c,e){var g,d,f,l=this.zData,q=[],u=this.options,r="width"!==u.sizeBy,h=u.zThreshold,k=b-a;d=0;for(g=l.length;d<g;d++)f=l[d],u.sizeByAbsoluteValue&&null!==f&&(f=Math.abs(f-h),b=Math.max(b-h,Math.abs(a-h)),a=0),null===f?f=
null:f<a?f=c/2-1:(f=0<k?(f-a)/k:.5,r&&0<=f&&(f=Math.sqrt(f)),f=Math.ceil(c+f*(e-c))/2),q.push(f);this.radii=q},animate:function(a){var b=this.options.animation;a||(p(this.points,function(a){var c=a.graphic,g;c&&c.width&&(g={x:c.x,y:c.y,width:c.width,height:c.height},c.attr({x:a.plotX,y:a.plotY,width:1,height:1}),c.animate(g,b))}),this.animate=null)},translate:function(){var b,c=this.data,f,e,d=this.radii;r.scatter.prototype.translate.call(this);for(b=c.length;b--;)f=c[b],e=d?d[b]:0,z(e)&&e>=this.minPxSize/
2?(f.marker=a.extend(f.marker,{radius:e,width:2*e,height:2*e}),f.dlBox={x:f.plotX-e,y:f.plotY-e,width:2*e,height:2*e}):f.shapeArgs=f.plotY=f.dlBox=void 0},alignDataLabel:r.column.prototype.alignDataLabel,buildKDTree:w,applyZones:w},{haloPath:function(a){return c.prototype.haloPath.call(this,0===a?0:(this.marker?this.marker.radius||0:0)+a)},ttBelow:!1});k.prototype.beforePadding=function(){var a=this,b=this.len,c=this.chart,e=0,d=b,l=this.isXAxis,r=l?"xData":"yData",k=this.min,w={},v=Math.min(c.plotWidth,
c.plotHeight),D=Number.MAX_VALUE,A=-Number.MAX_VALUE,E=this.max-k,C=b/E,F=[];p(this.series,function(b){var e=b.options;!b.bubblePadding||!b.visible&&c.options.chart.ignoreHiddenSeries||(a.allowZoomOutside=!0,F.push(b),l&&(p(["minSize","maxSize"],function(a){var b=e[a],c=/%$/.test(b),b=f(b);w[a]=c?v*b/100:b}),b.minPxSize=w.minSize,b.maxPxSize=Math.max(w.maxSize,w.minSize),b=b.zData,b.length&&(D=t(e.zMin,Math.min(D,Math.max(n(b),!1===e.displayNegative?e.zThreshold:-Number.MAX_VALUE))),A=t(e.zMax,Math.max(A,
h(b))))))});p(F,function(b){var c=b[r],f=c.length,g;l&&b.getRadii(D,A,b.minPxSize,b.maxPxSize);if(0<E)for(;f--;)z(c[f])&&a.dataMin<=c[f]&&c[f]<=a.dataMax&&(g=b.radii[f],e=Math.min((c[f]-k)*C-g,e),d=Math.max((c[f]-k)*C+g,d))});F.length&&0<E&&!this.isLog&&(d-=b,C*=(b+e-d)/b,p([["min","userMin",e],["max","userMax",d]],function(b){void 0===t(a.options[b[0]],a[b[1]])&&(a[b[0]]+=b[2]/C)}))}})(v);(function(a){var h=a.merge,n=a.Point,k=a.seriesType,d=a.seriesTypes;d.bubble&&k("mapbubble","bubble",{animationLimit:500,
tooltip:{pointFormat:"{point.name}: {point.z}"}},{xyFromShape:!0,type:"mapbubble",pointArrayMap:["z"],getMapData:d.map.prototype.getMapData,getBox:d.map.prototype.getBox,setData:d.map.prototype.setData},{applyOptions:function(a,k){return a&&void 0!==a.lat&&void 0!==a.lon?n.prototype.applyOptions.call(this,h(a,this.series.chart.fromLatLonToPoint(a)),k):d.map.prototype.pointClass.prototype.applyOptions.call(this,a,k)},ttBelow:!1})})(v);(function(a){var h=a.colorPointMixin,n=a.each,k=a.merge,d=a.noop,
p=a.pick,v=a.Series,w=a.seriesType,t=a.seriesTypes;w("heatmap","scatter",{animation:!1,borderWidth:0,nullColor:"#f7f7f7",dataLabels:{formatter:function(){return this.point.value},inside:!0,verticalAlign:"middle",crop:!1,overflow:!1,padding:0},marker:null,pointRange:null,tooltip:{pointFormat:"{point.x}, {point.y}: {point.value}\x3cbr/\x3e"},states:{normal:{animation:!0},hover:{halo:!1,brightness:.2}}},k(a.colorSeriesMixin,{pointArrayMap:["y","value"],hasPointSpecificOptions:!0,supportsDrilldown:!0,
getExtremesFromAll:!0,directTouch:!0,init:function(){var a;t.scatter.prototype.init.apply(this,arguments);a=this.options;a.pointRange=p(a.pointRange,a.colsize||1);this.yAxis.axisPointRange=a.rowsize||1},translate:function(){var a=this.options,c=this.xAxis,b=this.yAxis,d=function(a,b,c){return Math.min(Math.max(b,a),c)};this.generatePoints();n(this.points,function(f){var g=(a.colsize||1)/2,l=(a.rowsize||1)/2,h=d(Math.round(c.len-c.translate(f.x-g,0,1,0,1)),-c.len,2*c.len),g=d(Math.round(c.len-c.translate(f.x+
g,0,1,0,1)),-c.len,2*c.len),e=d(Math.round(b.translate(f.y-l,0,1,0,1)),-b.len,2*b.len),l=d(Math.round(b.translate(f.y+l,0,1,0,1)),-b.len,2*b.len);f.plotX=f.clientX=(h+g)/2;f.plotY=(e+l)/2;f.shapeType="rect";f.shapeArgs={x:Math.min(h,g),y:Math.min(e,l),width:Math.abs(g-h),height:Math.abs(l-e)}});this.translateColors()},drawPoints:function(){t.column.prototype.drawPoints.call(this);n(this.points,function(a){a.graphic.attr(this.colorAttribs(a))},this)},animate:d,getBox:d,drawLegendSymbol:a.LegendSymbolMixin.drawRectangle,
alignDataLabel:t.column.prototype.alignDataLabel,getExtremes:function(){v.prototype.getExtremes.call(this,this.valueData);this.valueMin=this.dataMin;this.valueMax=this.dataMax;v.prototype.getExtremes.call(this)}}),h)})(v);(function(a){function h(a,c){var b,d,f,g=!1,h=a.x,k=a.y;a=0;for(b=c.length-1;a<c.length;b=a++)d=c[a][1]>k,f=c[b][1]>k,d!==f&&h<(c[b][0]-c[a][0])*(k-c[a][1])/(c[b][1]-c[a][1])+c[a][0]&&(g=!g);return g}var n=a.Chart,k=a.each,d=a.extend,p=a.format,v=a.merge,w=a.win,t=a.wrap;n.prototype.transformFromLatLon=
function(d,c){if(void 0===w.proj4)return a.error(21),{x:0,y:null};d=w.proj4(c.crs,[d.lon,d.lat]);var b=c.cosAngle||c.rotation&&Math.cos(c.rotation),f=c.sinAngle||c.rotation&&Math.sin(c.rotation);d=c.rotation?[d[0]*b+d[1]*f,-d[0]*f+d[1]*b]:d;return{x:((d[0]-(c.xoffset||0))*(c.scale||1)+(c.xpan||0))*(c.jsonres||1)+(c.jsonmarginX||0),y:(((c.yoffset||0)-d[1])*(c.scale||1)+(c.ypan||0))*(c.jsonres||1)-(c.jsonmarginY||0)}};n.prototype.transformToLatLon=function(d,c){if(void 0===w.proj4)a.error(21);else{d=
{x:((d.x-(c.jsonmarginX||0))/(c.jsonres||1)-(c.xpan||0))/(c.scale||1)+(c.xoffset||0),y:((-d.y-(c.jsonmarginY||0))/(c.jsonres||1)+(c.ypan||0))/(c.scale||1)+(c.yoffset||0)};var b=c.cosAngle||c.rotation&&Math.cos(c.rotation),f=c.sinAngle||c.rotation&&Math.sin(c.rotation);c=w.proj4(c.crs,"WGS84",c.rotation?{x:d.x*b+d.y*-f,y:d.x*f+d.y*b}:d);return{lat:c.y,lon:c.x}}};n.prototype.fromPointToLatLon=function(d){var c=this.mapTransforms,b;if(c){for(b in c)if(c.hasOwnProperty(b)&&c[b].hitZone&&h({x:d.x,y:-d.y},
c[b].hitZone.coordinates[0]))return this.transformToLatLon(d,c[b]);return this.transformToLatLon(d,c["default"])}a.error(22)};n.prototype.fromLatLonToPoint=function(d){var c=this.mapTransforms,b,f;if(!c)return a.error(22),{x:0,y:null};for(b in c)if(c.hasOwnProperty(b)&&c[b].hitZone&&(f=this.transformFromLatLon(d,c[b]),h({x:f.x,y:-f.y},c[b].hitZone.coordinates[0])))return f;return this.transformFromLatLon(d,c["default"])};a.geojson=function(a,c,b){var f=[],h=[],g=function(a){var b,c=a.length;h.push("M");
for(b=0;b<c;b++)1===b&&h.push("L"),h.push(a[b][0],-a[b][1])};c=c||"map";k(a.features,function(a){var b=a.geometry,e=b.type,b=b.coordinates;a=a.properties;var l;h=[];"map"===c||"mapbubble"===c?("Polygon"===e?(k(b,g),h.push("Z")):"MultiPolygon"===e&&(k(b,function(a){k(a,g)}),h.push("Z")),h.length&&(l={path:h})):"mapline"===c?("LineString"===e?g(b):"MultiLineString"===e&&k(b,g),h.length&&(l={path:h})):"mappoint"===c&&"Point"===e&&(l={x:b[0],y:-b[1]});l&&f.push(d(l,{name:a.name||a.NAME,properties:a}))});
b&&a.copyrightShort&&(b.chart.mapCredits=p(b.chart.options.credits.mapText,{geojson:a}),b.chart.mapCreditsFull=p(b.chart.options.credits.mapTextFull,{geojson:a}));return f};t(n.prototype,"addCredits",function(a,c){c=v(!0,this.options.credits,c);this.mapCredits&&(c.href=null);a.call(this,c);this.credits&&this.mapCreditsFull&&this.credits.attr({title:this.mapCreditsFull})})})(v);(function(a){function h(a,c,d,g,f,h,e,k){return["M",a+f,c,"L",a+d-h,c,"C",a+d-h/2,c,a+d,c+h/2,a+d,c+h,"L",a+d,c+g-e,"C",a+
d,c+g-e/2,a+d-e/2,c+g,a+d-e,c+g,"L",a+k,c+g,"C",a+k/2,c+g,a,c+g-k/2,a,c+g-k,"L",a,c+f,"C",a,c+f/2,a+f/2,c,a+f,c,"Z"]}var n=a.Chart,k=a.defaultOptions,d=a.each,p=a.extend,v=a.merge,w=a.pick,t=a.Renderer,f=a.SVGRenderer,c=a.VMLRenderer;p(k.lang,{zoomIn:"Zoom in",zoomOut:"Zoom out"});k.mapNavigation={buttonOptions:{alignTo:"plotBox",align:"left",verticalAlign:"top",x:0,width:18,height:18,padding:5,style:{fontSize:"15px",fontWeight:"bold"},theme:{"stroke-width":1,"text-align":"center"}},buttons:{zoomIn:{onclick:function(){this.mapZoom(.5)},
text:"+",y:0},zoomOut:{onclick:function(){this.mapZoom(2)},text:"-",y:28}},mouseWheelSensitivity:1.1};a.splitPath=function(a){var b;a=a.replace(/([A-Za-z])/g," $1 ");a=a.replace(/^\s*/,"").replace(/\s*$/,"");a=a.split(/[ ,]+/);for(b=0;b<a.length;b++)/[a-zA-Z]/.test(a[b])||(a[b]=parseFloat(a[b]));return a};a.maps={};f.prototype.symbols.topbutton=function(a,c,d,g,f){return h(a-1,c-1,d,g,f.r,f.r,0,0)};f.prototype.symbols.bottombutton=function(a,c,d,g,f){return h(a-1,c-1,d,g,0,0,f.r,f.r)};t===c&&d(["topbutton",
"bottombutton"],function(a){c.prototype.symbols[a]=f.prototype.symbols[a]});a.Map=a.mapChart=function(b,c,d){var f="string"===typeof b||b.nodeName,h=arguments[f?1:0],k={endOnTick:!1,visible:!1,minPadding:0,maxPadding:0,startOnTick:!1},e,l=a.getOptions().credits;e=h.series;h.series=null;h=v({chart:{panning:"xy",type:"map"},credits:{mapText:w(l.mapText,' \u00a9 \x3ca href\x3d"{geojson.copyrightUrl}"\x3e{geojson.copyrightShort}\x3c/a\x3e'),mapTextFull:w(l.mapTextFull,"{geojson.copyright}")},tooltip:{followTouchMove:!1},
xAxis:k,yAxis:v(k,{reversed:!0})},h,{chart:{inverted:!1,alignTicks:!1}});h.series=e;return f?new n(b,h,d):new n(h,c)}})(v)});