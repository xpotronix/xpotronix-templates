/**
 * FeyaSoft Online Calendar
 * Copyright(c) 2006-2009, FeyaSoft Inc. All right reserved.
 * fzhuang@feyasoft.com
 * http://www.feyasoft.com/myCalendar
 *
 * You need buy one of the Feyasoft's License if you want to use MyCalendar in
 * your commercial product.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
Ext.ns("Ext.ux.calendar");

Ext.ux.calendar.RepeatType = {
    getEvent:function(re, day){
        var rt = re.repeatType;
        var rtype = rt.rtype;
        var eps = rt.exceptions;
        if(rt.beginDay <= day && ('no' == rt.endDay || day <= rt.endDay) && (!eps || !eps[day])){
            var e;
            if('day' == rtype){
                e = Ext.ux.calendar.RepeatType.getRepeatDayEvent(day, re);
            }else if('week' == rtype){
                e = Ext.ux.calendar.RepeatType.getRepeatWeekEvent(day, re);
            }else if('month' == rtype){
                e = Ext.ux.calendar.RepeatType.getRepeatMonthEvent(day, re);
            }else if('year' == rtype){
                e = Ext.ux.calendar.RepeatType.getRepeatYearEvent(day, re);
            }
            return e;
        }
    },

    getRepeatDayEvent:function(day, re){        
        var rt = re.repeatType;
        var beginDay = rt.beginDay;
        var intervalSlot = rt.intervalSlot;
        var dspan = rt.dspan;
        var rtime = rt.rtime;
        var dnum = Ext.ux.calendar.Mask.getDayOffset(beginDay, day);
        var r = dnum%intervalSlot;
        var t = Math.floor(dnum/intervalSlot);
        if(0 == r && (!rtime || t < rtime)){
            var e = Ext.apply({}, re);
            e.day = day;
            var date = Date.parseDate(day, 'Y-m-d');
            e.eday = date.add(Date.DAY, dspan).format('Y-m-d');
            delete(e.lflag);
            delete(e.rflag);
            return e;
        }
    },

    getRepeatWeekEvent:function(day, re){
        var rt = re.repeatType;
        var beginDay = rt.beginDay;
        var beginDate = Date.parseDate(beginDay, 'Y-m-d');        
        var bn = beginDate.format('N');
        var date = Date.parseDate(day, 'Y-m-d');        
        var n = date.format('N');        
        var rday = rt.rday;
        if('{}' == Ext.encode(rday)){
            rday[bn] = true;
        }
        if(rday[n]){
            var intervalSlot = rt.intervalSlot;
            var dspan = rt.dspan;
            var rtime = rt.rtime;
            var dnum = Math.floor((Ext.ux.calendar.Mask.getDayOffset(beginDay, day)-n-bn)/7)+1;
            var r = dnum%intervalSlot;
            var t = Math.floor(dnum/intervalSlot);
            if(0 == r && (!rtime || t < rtime)){
                var e = Ext.apply({}, re);
                e.day = day;
                var date = Date.parseDate(day, 'Y-m-d');
                e.eday = date.add(Date.DAY, dspan).format('Y-m-d');
                delete(e.lflag);
                delete(e.rflag);
                return e;
            }
        }
    },

    getRepeatMonthEvent:function(day, re){
        var rt = re.repeatType;
        var beginDay = rt.beginDay;
        var parts = beginDay.split('-', 3);
        var by = parseInt(parts[0]);
        var bm = parseInt(parts[1]);
        var bd = parseInt(parts[2]);
        parts = day.split('-', 3);
        var y = parseInt(parts[0]);
        var m = parseInt(parts[1]);
        var d = parseInt(parts[2]);        
        var rby = rt.rby;

        var beginDate = Date.parseDate(beginDay, 'Y-m-d');
        var bn = beginDate.format('N');
        var bw = Math.floor((bd-bn)/7)+1;
        var date = Date.parseDate(day, 'Y-m-d');
        var n = date.format('N');
        var w = Math.floor((d-n)/7)+1;

        if(('date' == rby && bd == d) || ('day' == rby && w == bw && n == bn)){
            var intervalSlot = rt.intervalSlot;
            var dspan = rt.dspan;
            var rtime = rt.rtime;
            var dnum = 12*y+m-12*by-bm;
            var r = dnum%intervalSlot;
            var t = Math.floor(dnum/intervalSlot);
            if(0 == r && (!rtime || t < rtime)){
                var e = Ext.apply({}, re);
                e.day = day;
                var date = Date.parseDate(day, 'Y-m-d');
                e.eday = date.add(Date.DAY, dspan).format('Y-m-d');
                delete(e.lflag);
                delete(e.rflag);
                return e;
            }
        }
    },

    getRepeatYearEvent:function(day, re){
        var rt = re.repeatType;
        var beginDay = rt.beginDay;
        var parts = beginDay.split('-', 3);
        var by = parseInt(parts[0]);
        var bm = parts[1];
        var bd = parts[2];
        parts = day.split('-', 3);
        var y = parseInt(parts[0]);
        var m = parts[1];
        var d = parts[2];
        if(bm == m && bd == d){            
            var intervalSlot = rt.intervalSlot;
            var dspan = rt.dspan;
            var rtime = rt.rtime;
            var dnum = y-by;
            var r = dnum%intervalSlot;
            var t = Math.floor(dnum/intervalSlot);
            if(0 == r && (!rtime || t < rtime)){
                var e = Ext.apply({}, re);
                e.day = day;
                var date = Date.parseDate(day, 'Y-m-d');
                e.eday = date.add(Date.DAY, dspan).format('Y-m-d');
                delete(e.lflag);
                delete(e.rflag);
                return e;
            }
        }
    }
};