<template>
  <div class="content">
    <div id="map"></div>
    <div class="ly-tree">
      <div class="c_com"></div>
      <div class="t-handle" @click="handleClick">监测点</div>
    </div>
  </div>
</template>
<script>
  import Vue from 'Vue'
  import RequestHandle from '@/request'
  import BMapUtil from '@/map/MapUtil'
  import EnvironmentalUtil from '@/stand/EnvironmentalUtil'
  import Test from '@/components/ChildComponent'

  export default {
    name: 'Main',
    data () {
      return {
        source: {},
        treeOption: [
            {
          name: '国控点',
          code: 'LAYER_GS',
          checked: false,
          src: '',
          checkedSrc: '',
          childs: [{
            text: 'AQI',
            name: 'AQI'
          }, {
            text: 'SO2',
            name: 'SO2'
          }]
        }, {
          name: 'TVOC',
          code: 'LAYER_TVOC',
          checked: false,
          src: '',
          checkedSrc: '',
          childs: [{
            text: 'AQI',
            name: 'AQI'
          }, {
            text: 'SO2',
            name: 'SO2'
          }]
        }],
        hasClose: false,
        options2: [
            {
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶',
          disabled: true
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],
        options3: [
            {
          value: '选项1',
          label: '黄金糕1'
        }, {
          value: '选项2',
          label: '双皮奶1',
          disabled: true
        }, {
          value: '选项3',
          label: '蚵仔煎1'
        }, {
          value: '选项4',
          label: '龙须面1'
        }, {
          value: '选项5',
          label: '北京烤鸭1'
        }],
        value2: ''
      };
    },
    created(){
    },
    mounted(){
      this.init();
    },
    render(){

    },
    methods: {
      init(){
        //BMapUtil.setCityName('郑州');
        BMapUtil.render('map', this.loadedMap);

      },

      //加载地图
      loadedMap(){
        let t = this;
        let lc = 'LAYER_GS';
        RequestHandle.request({
          ptype: 'GSCITYPOLLUTION',
          type: 'GET',
          pms: {},
          hasLocal: false
        }, function (data) {
          t.source[lc] = {features: data.features || [], history: data.history || []};
          let dt = t.dataTransform(data, lc, 'citygid', 'aqi', 'MI');
          console.log(JSON.stringify(dt[0]));
          dt && (dt.forEach(v => (BMapUtil.loadedOverlay(v, {hasEvent: false, fcbClick: t.requestMarker}, {hasEvent: true, hasValue: true}))));
        }, function (ex) {
          console.error(ex);
        });

        setTimeout(function () {
          let Te = Vue.extend(Test);
          new Te().$mount('.c_com')
//          t.loadedGeo();
//          let sc = t.source[lc];
//          let dt = (sc && t.dataTransform(sc, lc, 'citygid', 'so2', 'LL')) || [];
////          console.log(dt);
//          dt && (BMapUtil.clearMapOverlay(), dt.forEach(v => (BMapUtil.loadedOverlay(v, {hasEvent: true, fcbClick: t.requestMarker}, {hasEvent: false, hasValue: false}))));
        }, 5000);
      },

      loadedGeo(){
        let t = this;
        let lc = 'LAYER_Y';
        RequestHandle.request({
          ptype: 'LAYERONE',
          type: 'GET',
          pms: {},
          hasLocal: true
        }, function (data) {
          let dt = t.geoTransform(data, lc, 'OP');
//          console.log(JSON.stringify(dt[0]));
          dt && (dt.forEach(v => (BMapUtil.loadedOverlay(v, {hasEvent: false, fcbClick: t.requestMarker}, {hasEvent: false, hasValue: false}))));
        }, function (ex) {
          console.error(ex);
        });
      },

      //点击弹出框事件
      requestMarker(fc, callback){
        let t = this;
        let attr = fc.attr;
        RequestHandle.request({
          ptype: 'GSCITYPOLLUTIONCHART',
          type: 'GET',
          pms: {id: attr.code, type: 'AQI'}
        }, function (data) {
          let el = t.setGSInfoWindow(data.features);
          el && callback(fc, el, {width: 410, height: 'auto'});
          //setTimeout(t.setGSChartData(attr.code, data.history), 500);
          //setTimeout(t.setGSChartData(attr.code, data.features.hourdatas), 500);
        }, function (ex) {
          console.error(ex);
        });
      },

      //国省控点
      setGSInfoWindow(data){
        let aqi = data.aqi;
        let time = data.time;
        let gridName = (data.firstGridName || '') + '-' + (data.secodGridName || '') + '-' + (data.threeGridName || '');
        let tel = data.Contact || data.contact || '';
        let memberName = data.memberName || '';
        return '  <div class="param"><div class="line"></div>\n' +
          '        <div class="item one">\n' +
          '            <div class="above">\n' +
          '            <div class="square"></div>\n' +
          '            <span class="type">' + data.type + '</span>\n' +
          '            </div>\n' +
          '            <div class="date">' + time.replace('T', ' ') + '</div>\n' +
          '        </div>\n' +
          '        <div class="item second">\n' +
          '            <div class="key" style=\'background-color:' + EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getAQILevelIndex(aqi)) + '\'> AQI</div>\n' +
          '            <div class="value">' + aqi + '</div>\n' +
          '        </div>' +
          '<div class="item third">' +
          '<div class="key" style=\'background-color:' + EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getComplexIndex(data.complexindex)) + '\'>综指</div>' +
          '<div class="value">' + parseFloat(data.complexindex).toFixed(3) + '</div></div><br>\n' +
          '        <div class="item secondLine secondLine1">\n' +
          '            <div class="key" style=\'background-color:' + EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getPM25LevelIndex(data.pm25)) + '\'>PM2.5</div>\n' +
          '            <div class="value"> ' + parseInt(data.pm25) + '</div>\n' +
          '        </div>\n' +
          '        <div class="item secondLine secondLine1">\n' +
          '            <div class="key" style=\'background-color:' + EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getPM10LevelIndex(data.pm10)) + '\'>PM10</div>\n' +
          '            <div class="value">' + parseInt(data.pm10) + '</div>\n' +
          '        </div>\n' +
          '        <div class="item secondLine">\n' +
          '            <div class="key" style=\'background-color:' + EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getCOLevelIndex(data.co)) + '\'>CO</div>\n' +
          '            <div class="value">' + parseFloat(data.co).toFixed(1) + '</div>\n' +
          '        </div>\n' +
          '        <div class="item secondLine ">\n' +
          '            <div class="key" style=\'background-color:' + EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getNO2LevelIndex(data.no2)) + '\'>NO2</div>\n' +
          '            <div class="value">' + parseInt(data.no2) + '</div>\n' +
          '        </div>\n' +
          '        <div class="item secondLine ">\n' +
          '            <div class="key" style=\'background-color:' + EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getSO2LevelIndex(data.so2)) + '\'>SO2</div>\n' +
          '            <div class="value">' + parseInt(data.so2) + '</div>\n' +
          '        </div>\n' +
          '        <div class="item secondLine">\n' +
          '            <div class="key" style=\'background-color:' + EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getO3LevelIndex(data.o3)) + '\'>O3</div>\n' +
          '            <div class="value">' + parseInt(data.o3) + '</div>\n' +
          '        </div>\n' +
          '    </div><div class="index">' +
          '<div class="item">温度：' + (parseInt(data.temp) ? (parseInt(data.temp) + '℃') : '--') + '</div>' +
          '<div class="item">湿度：' + (parseInt(data.humi) ? (parseInt(data.humi) + '%') : '--') + '</div>' +
          '<div class="item">风向：' + (data.winddirection || '--') + '</div>' +
          '<div class="item">风级：' + (parseInt(data.windspeed) || 0) + '级' + '</div></div>' +

          '<div class="chart"><div id=\'citychart_' + data.citygid + '\' style=\'width:100%;height:110px\'></div></div>' +
          '<div class="Introduce"><div class="Net">所属网络：' + gridName + '</div><div class="Person">网络员代表：' + memberName + '</div><div>联系方式：' + tel + '</div></div>'

      },

      //设置图表
      setGSChartData(code, data){
        let x = [];
        let y = [];
        let dt = [];
        let col = [];
        data.forEach(v => (dt.push({name: v.time, value: [v.time, v.value]}), x.push(v.time), y.push(v.value), col.push(EnvironmentalUtil.getColorByIndex(EnvironmentalUtil.getAQILevelIndex(v.value)))));
        let option = {
          data: dt,
          col: col
        };
        this.loadCharts(code, option);
      },

      //加载图表
      loadCharts(code, option){
        console.log(option);
        let echarts = require('echarts');
        let c = echarts.init(document.getElementById('citychart_' + code));
        let options = {
          title: {
            show: false
          },
          tooltip: {
            show: true,
            trigger: 'axis'
          },
          grid: {
            top: 10,
            bottom: 35
          },
          xAxis: [{
            type: 'time',
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisTick: {
              lineStyle: {
                color: '#333'
              }
            }
          }],
          yAxis: [{
            type: 'value',
            boundaryGap: [0, '100%'],
            splitNumber: 2,
            axisLine: {
              show: false
            },
            splitLine: {
              show: true
            },
            axisTick: {
              lineStyle: {
                color: 'none'
              }
            }
          }],
          series: [{
            name: '',
            type: 'bar',
            data: option.data,
            barWidth: '50%',
            itemStyle: {
              normal: {
                color: function (params) {
                  return option.col[params.dataIndex]
                }
              }
            }
          }]
        };
        c.setOption(options);
      },

      //数据转换 data:待转换数据 lc:图层标识 kf:唯一标识 vf:ValueField lt:点显示方式
      dataTransform(data, lc, kf, vf, lt){
        let rtValue = [];
        let fs = data.features;
        for (let i = 0, length = fs.length; i < length; i++) {
          let v = fs[i];
          let le = 0;
          switch (vf.toUpperCase()) {
            case 'AQI':
              le = EnvironmentalUtil.getAQILevelIndex(v[vf]);
              break;
            case 'SO2':
              le = EnvironmentalUtil.getSO2LevelIndex(v[vf]);
              break;
          }
          rtValue.push({
            geoType: 'POINT',
            attr: {
              code: v[kf],
              lc: lc,
              lt: lt,
              vl: v[vf],
              el: {
                context: '<div style="height:20px;width:20px;border-radius: 10px;background-color:#333;"></div>',
                height: 20,
                width: 20
              },
              nm: v.pointname,
              le: le,
              hd: false,//le > 3,
              miu: 'static/imgs/environmental/gs-g.png',//16*16
              col: EnvironmentalUtil.getColorByIndex(le)
            },
            geo: {
              lng: v.longitude,
              lat: v.latitude
            },
          });
        }
        return rtValue;
      },

      geoTransform(data, lc, lt){
        let rtValue = [];
        let fs = data.features;
        for (let i = 0, length = fs.length; i < length; i++) {
          let v = fs[i];
          let attr = v.attributes;
          attr['lc'] = lc;
          attr['lt'] = lt;
          rtValue.push({
            geoType: 'POLYGON',
            attr: attr,
            geo: v.geometry
          });
        }
        return rtValue;
      },

      handleClick(e){
        let els = document.getElementsByClassName('t-text');
        if (els.length) {
          for (let i = 0, length = els.length; i < length; i++) {
            els[i].style.width = this.hasClose ? '160px' : '0';
          }
        }
        this.hasClose = !this.hasClose;
      }
    }
  }
  ;
</script>
<style scoped>
  .content {
    position: relative;
    height: 100%;
  }

  .ly-tree {
    height: 90%;
    background: #fff;
    position: absolute;
    margin: 2.5% 0;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    background: #fff;
  }

  .t-handle {
    color: #fff;
    background: #2494F2;
    line-height: 32px;
    opacity: 0.8;
  }

  .t-item {
    position: relative;
    height: 32px;
  }

  .t-item .t-icon {
    float: left;
    display: inline-block;
    height: 32px;
    width: 32px;
    background: #ddd;
    margin: 0 8px 0 0;
  }

  .t-item .t-text {
    float: left;
    width: 160px;
    line-height: 32px;
    text-align: left;
    vertical-align: baseline;
    white-space: nowrap;
    overflow: hidden;
    transition: width 1s;
  }

  .t-item select, .t-item option {
    height: 32px;
    float: right;
    border: none;
  }

  #map {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #333;
    position: absolute;
  }
</style>
