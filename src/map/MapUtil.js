/**
 * Created by admin on 2018/1/5.
 * 涉及属性对象标准
 * 如:{geoType:'',attr:{code:'',lng:'',lat:'',vl:'',nm:'',lt:'',col:'',miu:'',le:''},geo:{lng:'',lat:''}}
 * 说明:
 * geoType:空间数据类别（点、线、面）
 * code:唯一标识
 * lng:经度
 * lat:纬度
 * vl:显示值
 * nm:名称
 * lc:图层名称(唯一标识)
 * el:{context:'',height:20,width:20}显示HTML标签，仅lt为EL时有效果
 * lt:图层类型(LL:两个Label ML:Marker和Label MI:Marker和Icon NL:NameLabel VL:ValueLabel)
 * col:状态颜色
 * miu:图标路径
 * le:污染等级
 * hd:是否警报(默认判断为污染等级，也可自定义)
 */
import BMap from 'BMap'

export default{
  map: undefined,//地图对象
  cityName: '廊坊',//默认城市名称
  defaultZoom: 10,//默认地图比例
  style: {style: 'googlelite'},//地图默认样式
  hasLoaded: false,//是否初次加载
  lsMarker: [],//marker集合
  lsRedLabel: [],//预警Label集合
  lsNameLabel: [],//显示值Label集合,
  lsPolygon: [],//面集合
  mouseLabel: undefined,//鼠标Label集合
  searchInfoWindow: undefined,//弹出信息框

  //重置MapUtil
  reset(){
    this.clearMapOverlay();
    this.map = undefined;
    this.hasLoaded = false;
    this.lsMarker.length = 0;
    this.lsRedLabel.length = 0;
    this.lsNameLabel.length = 0;
    this.mouseLabel = undefined;
    this.searchInfoWindow = undefined;
  },

  //初始化地图 el:地图容器Id fcb:地图加载完回调函数
  render(el, fcb){
    this.createMap(el, fcb);
  },

  //创建地图对象 el:地图容器Id fcb:地图加载完回调函数
  createMap(el, fcb){
    let t = this;
    let map = new BMap.Map(el, {enableMapClick: false});
    map.centerAndZoom(this.cityName, this.defaultZoom);
    map.enableScrollWheelZoom();
    map.setMapStyle(this.style);
    this.map = map;
    this.map.addEventListener('tilesloaded', function () {
      !t.hasLoaded && (t.hasLoaded = true, fcb());
    });
  },

  //加载数据 a:属性集合 fcbClick:点击回调函数 fcbMouse:鼠标事件
  loadedOverlay(a, fcbClick, fcbMouse){
    let t = this;
    let attr = a.attr;
    if (attr.hd) {
      let rl = this.createRedLabel(a, false);
      rl && (this.addMapOverlay(rl, 'RLABEL', attr.lc));
    }
    switch (attr.lt) {
      case 'LL':
        let vll = this.createValueLabel(a);
        let nll = this.createNameLabel(a);
        vll && (this.addMapOverlay(vll, 'MARKER', attr.lc), vll.attributes = a, this.overlayEvent(vll, fcbClick, fcbMouse));
        nll && (this.addMapOverlay(nll, 'NAMEL', attr.lc));
        break;
      case 'ML':
        let mkl = this.createMarker(a, true);
        mkl && (this.addMapOverlay(mkl, 'MARKER', attr.lc), mkl.attributes = a, this.overlayEvent(mkl, fcbClick, fcbMouse));
        break;
      case 'MI':
        let mki = this.createMarker(a, false);
        mki && (this.addMapOverlay(mki, 'MARKER', attr.lc), mki.attributes = a, this.overlayEvent(mki, fcbClick, fcbMouse));
        break;
      case 'VL':
        let vl = this.createValueLabel(a);
        vl && (this.addMapOverlay(vl, 'MARKER', attr.lc), vl.attributes = a, this.overlayEvent(vl, fcbClick, fcbMouse));
        break;
      case 'NL':
        let nl = this.createNameLabel(a, true);
        nl && (this.addMapOverlay(nl, 'NAMEL', attr.lc));
        break;
      case 'EL':
        let el = this.createElementLabel(a);
        el && (this.addMapOverlay(el, 'MARKER', attr.lc), el.attributes = a, this.overlayEvent(el, fcbClick, fcbMouse));
        break;
      case 'OP':
        let op = this.createPolygon(a);
        op && op.forEach(v => (t.addMapOverlay(v, 'POLYGON', attr.lc), v.attributes = attr));
        break;
    }
  },

  //创建Marker a(attributes):空间信息及属性信息 hasLabel:Marker是否加载Label
  createMarker(a, hasLabel){
    let geo = a.geo;
    let attr = a.attr;
    let pt = this.createPoint(geo.lng, geo.lat);
    let icon = new BMap.Icon(attr.miu, new BMap.Size(24, 24));
    let offset = new BMap.Size(0, 0);
    let m = new BMap.Marker(pt, {
      icon: icon,
      offset: offset
    });

    if (hasLabel) {
      let l = this.createNameLabel(a, true);
      l.setOffset(new BMap.Size(-(attr.nm.length * 7) + 4, 20));
      l && m.setLabel(l)
    }
    return m;
  },

  //创建Label a(attributes):空间信息及属性信息 说明：显示点名称 hasArrow:是否带箭头 默认:false
  createNameLabel(a, hasArrow){
    let geo = a.geo;
    let attr = a.attr;
    let pt = this.createPoint(geo.lng, geo.lat);
    let value = attr.nm;
    let label = new BMap.Label(('<span style="padding:0 5px;">' + (value || '--') + '</span>') + (hasArrow ? ('<div class="arrow" style="width: 0;  height: 0; border-left: 8px solid transparent; border-bottom: 8px solid #fff; border-right: 8px solid transparent; color:#333; position: absolute;  margin-top:-24px;margin-left:' + (value.length * 7 - 9) + 'px  " ></div>') : ''));
    label.setStyle({
      border: 'none',
      color: '#333',
      background: 'rgba(255, 255, 255, 0.8)',
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei',
      boxShadow: '1px 3px 4px rgba(0,0,0,0.18)',
      padding: '0 5px'
    });
    label.setPosition(pt);
    value && label.setOffset(new BMap.Size(-((value.length * 14) / 2) - 12, 0));
    return label;
  },

  //创建污染指标值Label a:属性信息
  createValueLabel(a){
    let geo = a.geo;
    let attr = a.attr;
    let pt = this.createPoint(geo.lng, geo.lat);
    let opts = {
      position: pt,
      offset: new BMap.Size(-22, -30)
    };
    let label = new BMap.Label((attr.vl || '--') + '<div class="arrow" style="width: 0;  height: 0; border-left: 8px solid transparent; border-top: 8px solid; border-right: 8px solid transparent; color:' + attr.col + '; position: absolute;  margin-top:-2px;margin-left:10px  " ></div>', opts);  // 创建文本标注对象
    label.setStyle({
      color: attr.le > 3 ? '#fff' : '#333',
      background: attr.col,
      fontSize: '14px',
      border: 'none',
      width: '36px',
      textAlign: 'center',
      height: '22px',
      lineHeight: '22px',
      borderRadius: '4px'
    });
    return label;
  },

  //创建标签元素
  createElementLabel(a){
    let geo = a.geo;
    let pt = this.createPoint(geo.lng, geo.lat);
    let domElement = a.attr.el;
    let elContext = domElement.context;
    let opts = {
      position: pt,
      offset: new BMap.Size((-domElement.width / 2 || -10) - 1, (-domElement.height / 2 || -10) - 10)
    };
    let elementLabel = new BMap.Label(elContext, opts);
    elementLabel.setStyle({
      border: 'none',
      background: 'none',
      height: (domElement.height || 20) + 'px',
      width: (domElement.width || 20) + 'px',
    });
    return elementLabel;
  },

  //创建警报Label a:属性信息 hasIcon:是否为动态图片
  createRedLabel(a, hasIcon){
    let geo = a.geo;
    let labelRed = undefined;
    let pt = this.createPoint(geo.lng, geo.lat);
    if (!hasIcon) {
      let elContext = '<div class="pulse"></div><div class="pulse1"></div>';
      let opts = {
        position: pt,
        offset: new BMap.Size(-35, -35)
      };
      labelRed = new BMap.Label(elContext, opts);
      labelRed.setStyle({
        border: 'none',
        background: 'none',
        height: '60px',
        width: '60px',
      });
    } else {
      let imgUrl = 'static/imgs/main/red10.gif';
      let icon = new BMap.Icon(imgUrl, new BMap.Size(64, 64));
      labelRed = new BMap.Marker(pt, {
        icon: icon,
        offset: new BMap.Size(-5, -5)
      });
    }
    return labelRed;
  },

  //创建MouseLabel a:属性信息 hasValue:是否显示指标值
  createMouseLabel(a, hasValue){
    this.mouseLabel = new BMap.Label('');
    this.mouseLabel.setStyle({
      border: 'none',
      color: '#333',
      background: 'rgba(255, 255, 255, 0.8)',
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei',
      boxShadow: '1px 3px 4px rgba(0,0,0,0.18)',
      padding: hasValue ? '0' : '0 5px'
    });
    this.map.addOverlay(this.mouseLabel);
    this.setMouseLabelContent(a, hasValue);
  },

  //设置MouseLabel显示内容 a:属性信息 hasValue:是否显示指标值
  setMouseLabelContent(a, hasValue){
    let geo = a.geo;
    let attr = a.attr;
    let pt = this.createPoint(geo.lng, geo.lat);
    let name = attr.nm;
    let content = hasValue ? '<div><span style="padding:0 5px;">' + name + '</span><span style="display:inline-block;width:32px;text-align:center;color:' + (a.le > 3 ? '#fff;' : '#333;') + 'background-color:' + attr.col + '">' + attr.vl + '</span></div>' + '<div class="arrow" style="width: 0;  height: 0; border-left: 8px solid transparent; border-bottom: 8px solid; border-right: 8px solid transparent; color:#fff; position: absolute;  margin-top:-24px;margin-left:' + (name.length * 14 + 32) / 2 + 'px  " ></div>' : '<span style="padding:0 5px;">' + name + '</span>' + '<div class="arrow" style="width: 0;  height: 0; border-left: 8px solid transparent; border-bottom: 8px solid; border-right: 8px solid transparent; color:#fff; position: absolute;  margin-top:-24px;margin-left:' + (name.length * 7 - 8) + 'px  " ></div>';
    name && (this.mouseLabel.setContent(content),
      this.mouseLabel.setPosition(pt),
      this.mouseLabel.setOffset(new BMap.Size((-(name.length * 14 + (hasValue && 32)) / 2 - 8), 8)),
      this.mouseLabel.show());
  },

  //创建点对象 lng:经度 lat:纬度 hasTransform:是否坐标转换  默认百度坐标
  createPoint(lng, lat, hasTransform){
    let point = new BMap.Point(lng, lat);
    return hasTransform ? this.wgsPointToBd(point) : point;
  },

  //创建线对象
  createPolyline(a){
    let lsOverlay = [];
    let geo = a.geo;
    let paths = geo.paths;
    let sl = undefined;
    for (let i = 0, length = paths.length; i < length; i++) {
      let path = paths[i];
      let geo = this.getBdGeoStringByGeometry(path);
      let line = new BMap.Polyline(geo, sl);
      lsOverlay.push(line);
    }
    return line;
  },

  //创建面对象
  createPolygon(a){
    let lsOverlay = [];
    let geo = a.geo;
    let rings = geo.rings;
    let sl = this.getPolygonLeaveStyle(0);
    for (let i = 0, length = rings.length; i < length; i++) {
      let ring = rings[i];
      let geo = this.getBdGeoStringByGeometry(ring);
      let ply = new BMap.Polygon(geo, sl);
      lsOverlay.push(ply);
    }
    return lsOverlay;
  },

  //getBdPolygonStringByRings
  getBdGeoStringByGeometry(geo){
    let rtValue = undefined;
    geo.forEach(v => (!rtValue ? (rtValue = v[0] + ',' + v[1]) : (rtValue += ';' + v[0] + ',' + v[1])));
    return rtValue;
  },

  //根据不同获取等级颜色
  getPolygonLeaveStyle (leave) {
    let sle = {};
    switch (leave) {
      case 0:
        sle = {strokeWeight: 1, strokeStyle: 'dashed', strokeColor: '#0070CE', fillColor: '#2D96EF', fillOpacity: 0.2};
        break;
      case 1:
        sle = {strokeWeight: 1, strokeStyle: 'dashed', strokeColor: '#1C7B2A', fillColor: '#6FB779', fillOpacity: 0.2};
        break;
      case 2:
        sle = {strokeWeight: 1, strokeStyle: 'dashed', strokeColor: '#8441c9', fillColor: '#E8AAFF', fillOpacity: 0.2};
        break;
    }
    return sle;
  },

  //创建弹出框 a:属性信息 el:弹出框标签字符串 fs:设置弹出框高度和宽度 fcbClose:弹出框关闭回调函数
  createSearchInfoWindow(a, el, fs, fcbClose){
    let geo = a.geo;
    let attr = a.attr;
    let pt = this.createPoint(geo.lng, geo.lat);
    let m = new BMap.Marker(pt, {
      offset: new BMap.Size(-40, 38)
    });
    this.searchInfoWindow = new BMapLib.SearchInfoWindow(this.map, el, {
      title: '<sapn style="font-size:16px"><b>' + (attr.nm || '--') + '</b>' + '</span>',             //标题
      width: (fs && fs.width) || 410,
      height: (fs && fs.height) || 'auto',
      enableAutoPan: true,
      enableSendToPhone: false,
      searchTypes: []
    });
    fcbClose && this.searchInfoWindow.addEventListener('close', fcbClose);
    this.searchInfoWindow.open(m);
  },

  //设置弹出框显示内容--提交
  setSearchInfoWindowContent(el){
    this.searchInfoWindow && this.searchInfoWindow.setContent(el);
  },

  //点击列表弹出框 a:属性信息 el:弹出框标签字符串 fcbClose:弹出框关闭回调函数
  locationSearchInfoWindow(a, el, fs, fcbClose){
    this.createSearchInfoWindow(a, el, fs, fcbClose);
  },

  //根据图层类型和集合类型获取检索集合 lc:图层标识  ot:覆盖物类型
  getOverlayByLayerType(lc, ot){
    let ls = [];
    switch (ot.toUpperCase()) {
      case 'MARKER':
        ls = this.lsMarker;
        break;
      case 'RLABEL':
        ls = this.lsRedLabel;
        break;
      case 'NAMEL':
        ls = this.lsNameLabel;
        break;
      case 'POLYGON':
        ls = this.lsPolygon;
        break;
      default:
        ls = [];
        break;
    }
    return ls.filter(v => v.type.toUpperCase() === lc.toUpperCase());
  },

  //地图添加覆盖物集合 o:覆盖物 ot:覆盖物类型 lc:图层标识
  addMapOverlay(o, ot, lc){
    o && (ot === 'MARKER' ? (this.lsMarker.push({overlay: o, type: lc}), this.map.addOverlay(o))
      : (ot === 'RLABEL' ? (this.lsRedLabel.push({overlay: o, type: lc}), this.map.addOverlay(o))
        : (ot === 'NAMEL' ? (this.lsNameLabel.push({overlay: o, type: lc}), this.map.addOverlay(o))
          : (ot === 'POLYGON' && (this.lsPolygon.push({overlay: 0, type: lc}, this.map.addOverlay(o)))))));
  },

  //设置覆盖物显隐性 lsOverlay:覆盖物集合 hasVisible:是否显示
  setOverlayVisible(lsOverlay, hasVisible){
    lsOverlay.forEach(v => (hasVisible ? v.overlay.show() : v.overlay.hide()));
  },

  //地图删除覆盖物集合 lsOverlay:覆盖物集合
  removeMapOverlay(lsOverlay){
    let t = this;
    lsOverlay.forEach(v => t.map.removeOverlay(v.overlay));
  },

  //清除地图MouseLabel
  removeMouseLabel(){
    this.mouseLabel && (this.map.removeOverlay(this.mouseLabel), this.mouseLabel = undefined);
  },

  //清除地图上所有覆盖物
  clearMapOverlay(){
    this.map.clearOverlays();
  },

  //清除SearchInfoWindow
  clearSearchInfoWindow(){
    this.searchInfoWindow && (this.searchInfoWindow.close(), this.searchInfoWindow = undefined);
  },

  //覆盖物添加事件 o:覆盖物 efc:是否注册点击事件,包含回调函数({hasEvent:true|false,fcbClick:fun}) efm:是否注册鼠标事件,包含回调函数({hasEvent:true|false,fcbOver:fun,fcbOut:fun})
  overlayEvent(o, efc, efm){
    let t = this;
    (efc && efc.hasEvent) && (o.addEventListener('click', function (e) {
      let tg = e.target || e.currentTarget;
      let atr = tg.attributes;
      efc.fcbClick(atr, function (attr, res, fs) {
        t.createSearchInfoWindow(attr, res, fs);
      });
    }));
    (efm && efm.hasEvent) && (o.addEventListener('mouseover', function (e) {
      let tg = e.target || e.currentTarget;
      let atr = tg.attributes;
      !t.mouseLabel ? t.createMouseLabel(atr, efm.hasValue) : t.setMouseLabelContent(atr, efm.hasValue);
    }), o.addEventListener('mouseout', function (e) {
      t.mouseLabel && t.mouseLabel.hide();
    }));
  },

  //WGS坐标转百度坐标 pt:wgs坐标点
  wgsPointToBd: function (pt) {
    let transPoint = this.transformFun([pt.lng, pt.lat]);
    return new BMap.Point(transPoint[0], transPoint[1]);
  },

  //WGS坐标转百度坐标 path:点坐标(path:[x,y])
  transformFun: function (path) {
    let gcPoint = Coordtransform.wgs84togcj02(path[0], path[1]);
    return Coordtransform.gcj02tobd09(gcPoint[0], gcPoint[1]);
  },

  //设置默认城市 name:默认城市
  setCityName(name){
    this.cityName = name;
  },

  //设置默认地图比例 zoom:默认比例
  setDefaultZoom(zoom){
    this.defaultZoom = zoom;
  },

  //设置地图样式 style:默认地图样式
  setDefaultStyle(style){
    this.style = style;
  }
}
