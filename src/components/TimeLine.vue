<template>
    <div class="time-panel" @click="clickEvent" @mousemove="mousemoveEvent" @mouseover="mouseoverEvent" @mouseout="mouseoutEvent">
        <div class="time-progress">
            <div class="time-over" :style='"width:"+progressWidth+"px"'></div>
            <i :style='"left:"+ nowLeft+"px"'></i>
            <ii v-for="v in 48" :style='"left:"+(v===1? 40 : 39+wd*(v - 1))+"px"' :data-attr="v"></ii>
        </div>
        <div class="week-panel">
            <div class="time-switch" @click="switchClickEvent">
                <div class="icon-panel" v-show="hasStartSwitch"></div>
                <div class="icon-switch" v-show="!hasStartSwitch">▐▐</div>
            </div>
            <div class="week-items">
                <div class="week-item" v-for="(v,i) in weeks">
                    <ol>
                        <li></li>
                        <li v-for="(v,i) in times">{{v}}</li>
                    </ol>
                    <p>{{v.date + ' ('+v.week+')'}}</p>
                </div>
            </div>
        </div>
        <div class="now-time" :style='"left:"+ (nowPopupLeft - 26.0099) +"px"'>
            <div class="ntime-popup"></div>
            <span>{{nowHouse+':00'}}</span>
        </div>
        <div class="click-time" :style='"left:"+ (clickLeft - 27) +"px;display:"+hasBlock'>
            <div class="ctime-popup"></div>
            <span>{{((clickHouse < 10) ? '0'+clickHouse : clickHouse)+':00'}}</span>
        </div>
    </div>
</template>
<script>
    import {mapMutations,mapState} from 'vuex'

    export default {
        name: 'timeline',
        data() {
            return {
                times:['03','06','09','12','15','18','21'],
                weeks:[],
                wd:0,
                hasStartSwitch:true,
                nowHouse:12,
                nowLeft:100,
                nowPopupLeft:100,
                clickLeft:0,
                clickHouse:0,
                hasBlock:false,
                progressWidth:1000,
                interval:undefined
            };
        },
        components:{},
        computed:{
            ...mapState(['lineTime'])
        },
        created(){
            const _this = this;
            const timeWidth = (document.documentElement.offsetWidth - 470);
            _this.wd = timeWidth/(8*6);
            this.setWeeks();
        },
        mounted(){
        },
        methods:{
            ...mapMutations([
                'setLineTime'
            ]),

            //状态开关点击事件
            switchClickEvent(e){
                this.hasStartSwitch = !this.hasStartSwitch;
                !this.hasStartSwitch ? this.setProgress() : (window.clearInterval(this.interval),this.interval=undefined);
                e.stopPropagation();
            },

            //时间轴点击事件
            clickEvent(e){
                if(e.clientX < 39){
                    return;
                }
                this.progressWidth = e.clientX;
                const tm = this.getHouseByLeft(e.clientX);
                this.nowHouse = tm.house;
                this.nowPopupLeft = e.clientX;
                this.$store.commit('setLineTime',tm.year+'-'+tm.month+'-'+tm.day + ' ' + tm.house + ':00:00');
            },

            //时间轴鼠标事件
            mousemoveEvent(e){
                if(e.clientX < 39){
                    this.hasBlock = 'none';
                    return;
                }
                this.clickLeft = e.clientX;
                const tm = this.getHouseByLeft(e.clientX);
                this.clickHouse = tm.house;
            },

            //时间轴鼠标事件
            mouseoverEvent(e){
                if(e.clientX < 39){
                    this.hasBlock = 'none';
                    return;
                }
                this.hasBlock = 'block';
            },

            //时间轴鼠标事件
            mouseoutEvent(e){
                this.hasBlock = 'none';
            },

            //设置进度条
            setProgress(){
                const _this = this;
                const timeWidth = (document.documentElement.offsetWidth - 470);
                if(!_this.interval){
                    _this.interval = setInterval(function () {
                        const w = _this.progressWidth + _this.wd / 3;
                        if((w-39) > timeWidth){
                            _this.progressWidth = 39;
                        }else{
                            _this.progressWidth += _this.wd / 3;
                        }
                        const tm = _this.getHouseByLeft(_this.progressWidth);
                        _this.$store.commit('setLineTime',tm.year+'-'+tm.month+'-'+tm.day + ' ' + tm.house + ':00:00');
                        _this.nowHouse = tm.house;//_this.getHouseByLeft(_this.progressWidth);
                        _this.nowPopupLeft = _this.progressWidth;
                    },5000);
                }
            },

            //设置初始化周数据
            setWeeks(){
                let nowTime = new Date();

                //开始时间
                let startTime = new Date();
                startTime.setDate(nowTime.getDate() - 2);

                //结束时间
                let endTime = new Date();
                endTime.setDate(startTime.getDate() + 7);

                this.nowLeft = (nowTime.getHours()+24)*(this.wd/3)+40;
                this.progressWidth = this.nowLeft;
                this.nowPopupLeft = this.nowLeft + 6;
                this.nowHouse = endTime.getHours();

                for (let i = 0; i < 7; i++) {
                    startTime.setDate(startTime.getDate() + 1);
                    let tm = {
                        year:startTime.getFullYear(),
                        month:startTime.getMonth() + 1,
                        day:startTime.getDate(),
                        date: (startTime.getMonth() + 1) + '-' + startTime.getDate(),
                        week: this.getWeek(startTime.getDay())
                    };
                    this.weeks.push(tm);
                }
            },

            //获取时间轴时间集合
            getWeek(d) {
                let week = '周一';
                switch (d) {
                    case 1:
                        week = '周一';
                        break;
                    case 2:
                        week = '周二';
                        break;
                    case 3:
                        week = '周三';
                        break;
                    case 4:
                        week = '周四';
                        break;
                    case 5:
                        week = '周五';
                        break;
                    case 6:
                        week = '周六';
                        break;
                    case 0:
                        week = '周日';
                        break;
                }
                return week;
            },

            //根据居左像素获取时间  l:居左像素值
            getHouseByLeft(l){
                const d = 40;
                const h = Math.round((3*(l - d))/this.wd%24);
                const weekIndex = parseInt((3*(l - d))/this.wd/24);
                let week = this.weeks[weekIndex];
                week['house'] = h > 23 ? 0 : h;
                return week;
            }
        }
    };
</script>
<style lang="scss" scoped>
    .time-panel{
        width:calc(100% - 431px);
        position: fixed;
        left: 0;
        bottom: 0;
        height: 52px;
        background: rgba(27,33,67,.8);
        z-index: 1000;
        cursor: pointer;
        .time-progress{
            width: 100%;
            height: 8px;
            background: rgba(255,255,255,.5);
            cursor: pointer;
            .time-over{
                display: block;
                height: 8px;
                width: 140px;
                /*background: #009845;*/
                background: linear-gradient(to left, #4FACFE 0%,#00F2FE 100%);
            }
            i{
                display: block;
                height: 8px;
                position: absolute;
                top: 0;
                left: 0;
                width: 7px;
                background: #094978;
            }
            ii{
                width: 1px;
                background: hsla(0,0%,100%,.38);
                display: block;
                height: 8px;
                position: absolute;
                top: 0;
                left: 0;
            }
        }
        .week-panel{
            .time-switch{
                width: 40px;
                float: left;
                height: 46px;
                /*border-right: 1px solid #ddd;*/
                padding: 5px 10px;
                .icon-panel{
                    width: 0;
                    height: 0;
                    border-top: 10px solid transparent;
                    border-left: 20px solid #02F0FE;
                    border-bottom: 10px solid transparent;
                    background: transparent;
                    cursor: pointer;
                    margin-top: 6px;
                }
                .icon-switch{
                    color: #02F0FE;
                    margin-top: 4px;
                    font-size: 14px;
                    margin-left: -4px;
                }
            }
            .week-items{
                float: left;
                width: calc(100% - 40px);
                .week-item{
                    width: 16.66%;
                    height: 44px;
                    border-left: 1px solid #ddd;
                    float: left;
                    text-align: center;
                    color: #fff;
                    ol{
                        border-bottom: .5px solid hsla(0,0%,71%,.4);
                        height: 14px;
                        list-style: none;
                        li{
                            float: left;
                            width: 12.6%;
                            height: 14px;
                            line-height: 13px;
                            color: #fff;
                            opacity: .7;
                            font-size: 12px;
                            -webkit-transform-origin-x: 0;
                            -webkit-transform: scale(.9);
                            &:first-child{
                                width:6.5%;
                             }
                        }
                    }
                    p{
                        font-size:12px;
                        line-height:24px;
                    }
                }
            }
        }
        .now-time{
            position: absolute;
            padding: 4px 8px;
            height: 24px;
            left: 100px;
            bottom: 62px;
            background: rgba(0,0,0,.3);
            color: #fff;
            z-index: 1002;
            border-radius: 4px;
            .ntime-popup{
                width: 0;
                height: 0;
                border: 10px solid transparent;
                position: absolute;
                margin-left: -10px;
                left: 50%;
                top: 24px;
                border-top-color: rgba(0,0,0,.3);
            }
        }
        .click-time{
            position: absolute;
            padding: 4px 8px;
            height: 24px;
            left: 0;
            bottom: 62px;
            background: #02F0FE;
            color: #fff;
            z-index: 1001;
            display: none;
            border-radius: 4px;
            .ctime-popup{
                width: 0;
                height: 0;
                border: 10px solid transparent;
                position: absolute;
                margin-left: -10px;
                left: 50%;
                top: 24px;
                border-top-color: #02F0FE;
            }
        }
    }
</style>
