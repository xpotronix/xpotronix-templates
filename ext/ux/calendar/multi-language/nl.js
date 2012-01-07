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

Ext.ux.calendar.Language = {

    // please help to transfer words after :. Thanks
    'CalendarWin':{
        'title':'FeyaSoft MyCalendar 1.1.0',
        'loadMask.msg':'Wachten a.u.b. ...'
    },

    'MainPanel':{
        'loadMask.msg':'Wachten a.u.b. ...'
    },
    
    'CalendarContainer':{
        'todayBtn.text':'Vandaag',
        'dayBtn.text':'De agenda van vandaag',
        'weekBtn.text':'De agenda van deze week',
        'monthBtn.text':'De agenda van deze maand',
        'weekMenu.showAll.text':'Alle dagen',
        'weekMenu.onlyWeek.text':'Alleen weekdagen',
        'monthMenu.showAll.text':'Alle dagen',
        'monthMenu.onlyWeek.text':'Alleen weekdagen',
        'moreMenu.setting.text':'Instellingen',
        'moreMenu.about.text':'Over FeyaSoft MyCalendar',
        'moreBtn.text':'Meer',
        'searchCriteria.text':'Zoek',        
        'moreMenu.showAlert.text':'Activeer Verwittig Functie',
        'moreMenu.language.text':'Taal'
    },

    'WestPanel':{
        'myCalendarPanel.title':'Mijn agenda',
        'myShowAllBtn.text':'Alle',
        'myAddBtn.text':'Toevoegen'
    },

    'EventHandler':{
        'showOnlyItem.text':'Toon aleen dit',
        'viewItem.hide.text':'Verberg agenda',
        'viewItem.show.text':'Toon agenda',
        'editItem.text':'Wijzig agenda',
        'deleteItem.text':'Wis agenda',
        'clearItem.text':'Reinigen',
        'wholeDay':'Ganse dag',
        'untitled':'Geen titel',
        'unlockItem.text':'In gebruik',
        'lockItem.text':'Beschikbaar',
        'editEvent.title':'Wijzig gebeurtenis',
        'deleteEvent.title':'Verwijder gebeurtenis',
        'more':'More',
        'deleteRepeatPopup.title':'Confirm',
        'deleteRepeatPopup.msg':'Click "Yes" to delete all this repeat events, or click "No" to only delete the current event?',
        'updateRepeatPopup.title':'Confirm',
        'updateRepeatPopup.msg':'Click "Yes" to update for all this repeat events, or click "No" to only update for the current event?'
    },

    'Editor':{
        'startDayField.label':'Datum',
        'endDayField.label':'Ann',
        'wholeField.label':'Ganse dag',
        'subjectField.label':'Onderwerp',
        'contentField.label':'Omschrijving',
        'calendarField.label':'Agenda',
        'alertCB.label':'Verwittig wanneer actief',
        'lockCB.label':'Beschikbaar',
        'deleteBtn.text':'Verwijder',
        'saveBtn.text':'Opslaan',
        'cancelBtn.text':'Annuleren',
        'new.title':'Nieuwe gebeurtenis',
        'edit.title':'Wijzig gebeurtenis',
        'repeatTypeField.label':'Repeat Type',
        'repeatIntervalField.label':'Recur every ',
        'intervalUnitLabel.day.text':' Day(s) ',
        'intervalUnitLabel.week.text':' Week(s) ',
        'intervalUnitLabel.month.text':' Month(s) ',
        'intervalUnitLabel.year.text':' Year(s) ',
        'detailSetting':'Modify Detail...',
        'returnBtn.text':'Back',
        'startAndEnd':'Start and End',
        'repeatStartField.label':'Start',
        'repeatNoEndRG.label':'No end date',
        'repeatEndTimeRG.label':'End after',
        'repeatEndDateRG.label':'End by',
        'repeatEndTimeUnit':'occurrence(s)',
        'weekCheckGroup.label':'Repeat Day',
        'monthRadioGroup.label':'Repeat By',
        'repeatByDate':'Date',
        'repeatByDay':'Day'        
    },
    
    'CalendarEditor':{
        'new.title':'Nieuwe agenda',
        'edit.title':'Wijzig agenda',
        'nameField.label':'Naam',
        'descriptionField.label':'Omschrijving',
        'clearBtn.text':'Wis',
        'saveBtn.text':'Opslaan',
        'cancelBtn.text':'Annuleren'
    },
    
    'ExpirePopup':{
        'hideCB.label':'Niet meer laten zien',
        'title':'Alerted Events',
        'tpl.calendar':'Agenda',
        'tpl.subject':'Onderwerp',
        'tpl.content':'Omschrijving',
        'tpl.leftTime':'Duurtijd',
        'hour':'uren',
        'minute':'minuten',
        'untitled':'Zonder titel',
        'noContent':'Geen onderwerp'
    },

    'SettingPopup':{
        'title':'feyaCalendar Instellingen',
        'hourFormatField.label':'Uur formaat',
        'dayFormatField.label':'Datum formaat dag',
        'weekFormatField.label':'Datum formaat week',
        'monthFormatField.label':'Dag formaat maand',
        'applyBtn.text':'Toepassen',
        'resetBtn.text':'Reset',
        'closeBtn.text':'Sluiten',
        'fromtoFormatField.label':'Van tot formaat',
        'scrollStartRowField.label':'Starttijd',
        'languageField.label':'Taal',
        'generalForm.title':'General',
        'dwViewForm.title':'DayView|WeekView',
        'monthViewForm.title':'MonthView',
        'createByDblClickField.label':'Create Event by Double click',
        'singleDayField.label':'Cross Day Event',
        'weekStartDayField.label': 'Start Week Day',
        'activeStartTimeField.label':'Active Start Time',
        'activeEndTimeField.label':'Active End Time',
        'hideInactiveTimeField.label':'Hide Inactive Time',
        'intervalField.label':'Interval Slot',
        'startEndInvalid':'Active Start Time should be earlier than Active End Time!',
        'formatInvalid':'Example: 09:00'
    },

    'ResultView':{
        'cm.date':'Datum',
        'cm.calendar':'Agenda',
        'cm.time':'Datum',
        'cm.subject':'Onderwerp',
        'cm.content':'Omschrijving',
        'cm.expire':'Duurtijd',
        'groupBtn.group.text':'Groeperen',
        'groupBtn.unGroup.text':'Niet groeperen',
        'returnBtn.text':'Terug',
        'hour':'Uren',
        'noSubject':'(Geen Onderwerp)',
        'noContent':'(Geen Omschrijving)',
        'loadMask.msg':'Wachten a.u.b. ...'
    },

    'DayView':{
        'loadMask.msg':'Wachten a.u.b. ...',
        'addItem.text':'Nieuwe gebeurtenis',
        'events':'gebeurtenis'
    },

    'MonthView':{
        'loadMask.msg':'Wachten a.u.b. ...',
        'overview':'Overzicht',
        'showingEvents':'Toon gebeurtenissen',
        'totalEvents':'Totaal aantal gebeurtenissen',
        'dayPre':'',
        'addItem.text':'Nieuwe gebeurtenis',
        'clearItem.text':'Reinigen gebeurtenis',
        'cutItem.text':'Snijden',
        'copyItem.text':'Kopiëren',
        'pasteItem.text':'Pasta',
        'events':'gebeurtenis'
    },

    'Mask':{
        '12Hours':'12 uurs formaat',
        '24Hours':'24 uurs formaat',
        'ar': 'Arabisch',
        'de': 'Duits',
        'en_US':'American English',
        'es': 'Spaans',
        'fr': 'Français',
        'it': 'Italiano',
        'ja': 'Japanees',
        'nl': 'Nederlandse',
        'pl': 'Polski',
        'pt': 'Portuguees',
        'ru': 'Russisch',
        'zh_CN':'简体中文',
        'enable':'Enable',
        'disable':'Disable',
        'minute':'Minutes',
        'monday':'Monday',
        'sunday':'Sunday'
    },

    repeatType:[
        ['no', 'Not Repeat'],
        ['day', 'Daily'],
        ['week', 'Weekly'],
        ['month', 'Monthly'],
        ['year', 'Yearly']
    ],

    getWeekDayInMonth:function(date){
        var n = date.format('N');
        var d = date.format('d');
        var w = Math.floor((d-n)/7)+1;
        var wd = date.format('l');
        var str = 'the '+w;
        if(1 == w){
            str += 'st';
        }else if(2 == w){
            str += 'nd';
        }else if(3 == w){
            str += 'rd';
        }else{
            str += 'th';
        }
        return str+' '+wd;
    },

    getIntervalText:function(rtype, intervalSlot){
        var str = '';
        if('day' == rtype){
            if(1 == intervalSlot){
                str = 'Everyday';
            }else{
                str = 'Every '+intervalSlot+' days';
            }
        }else if('week' == rtype){
            if(1 == intervalSlot){
                str = 'Every week at ';
            }else{
                str = 'Every '+intervalSlot+' weeks at ';
            }
        }else if('month' == rtype){
            if(1 == intervalSlot){
                str = 'Every month at ';
            }else{
                str = 'Every '+intervalSlot+' months at ';
            }
        }else if('year' == rtype){
            if(1 == intervalSlot){
                str = 'Every year at ';
            }else{
                str = 'Every '+intervalSlot+' years at ';
            }
        }
        return str;
    }
};

Ext.apply(Ext.ux.calendar.Mask, Ext.ux.calendar.Language);