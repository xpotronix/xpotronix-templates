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
        'loadMask.msg':'Proszę czekać...'
    },

    'MainPanel':{
        'loadMask.msg':'Proszę czekać...'
    },
    
    'CalendarContainer':{
        'todayBtn.text':'Dzisiaj',
        'dayBtn.text':'Widok dnia',
        'weekBtn.text':'Widok tygodnia',
        'monthBtn.text':'Widok miesiąca',
        'weekMenu.showAll.text':'Pokaż wszystkie',
        'weekMenu.onlyWeek.text':'Tylko robocze',
        'monthMenu.showAll.text':'Pokaż wszystkie',
        'monthMenu.onlyWeek.text':'Tylko robocze',
        'moreMenu.setting.text':'Ustawienia',
        'moreMenu.about.text':'Informacje o FeyaSoft MyCalendar',
        'moreBtn.text':'Więcej',
        'searchCriteria.text':'Szukaj',        
        'moreMenu.showAlert.text':'Aktywuj funkcję alarmu',
        'moreMenu.language.text':'Ustawienia językowe'
    },

    'WestPanel':{
        'myCalendarPanel.title':'Mój kalendarz',
        'myShowAllBtn.text':'Pokaż wszystkie',
        'myAddBtn.text':'Nowy'
    },

    'EventHandler':{
        'showOnlyItem.text':'Pokaż tylko ten',
        'viewItem.hide.text':'Ukryj kalendarz',
        'viewItem.show.text':'Pokaż kalendarz',
        'editItem.text':'Edytuj kalendarz',
        'deleteItem.text':'Skasuj kalendarz',
        'clearItem.text':'Wyczyść kalendarz',
        'wholeDay':'Cały dzień',
        'untitled':'Nienazwany',
        'unlockItem.text':'Odblokuj',
        'lockItem.text':'Zablokuj',
        'editEvent.title':'Edytuj wpis',
        'deleteEvent.title':'Usuń wpis',
        'more':'More',
        'deleteRepeatPopup.title':'Confirm',
        'deleteRepeatPopup.msg':'Click "Yes" to delete all this repeat events, or click "No" to only delete the current event?',
        'updateRepeatPopup.title':'Confirm',
        'updateRepeatPopup.msg':'Click "Yes" to update for all this repeat events, or click "No" to only update for the current event?'
    },

    'Editor':{
        'startDayField.label':'Data',
        'wholeField.label':'Cały dzień',
        'subjectField.label':'Temat',
        'contentField.label':'Treść',
        'calendarField.label':'Kalendarz',
        'alertCB.label':'Powiadom o czasie',
        'lockCB.label':'Zablokowany',
        'deleteBtn.text':'Usuń',
        'saveBtn.text':'Zapisz',
        'cancelBtn.text':'Anuluj',
        'new.title':'Nowy wpis',
        'edit.title':'Edytuj wpis',
        'edit.title':'Edit Event',
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
        'new.title':'Nowy kalendarz',
        'edit.title':'Edytuj kalendarz',
        'nameField.label':'Nazwa',
        'descriptionField.label':'Opis',
        'clearBtn.text':'Wyczyść',
        'saveBtn.text':'Zapisz',
        'cancelBtn.text':'Anuluj'
    },
    
    'ExpirePopup':{
        'hideCB.label':'Nie otwieraj więcej',
        'title':'Zdarzenia',
        'tpl.calendar':'Kalendarz',
        'tpl.subject':'Temat',
        'tpl.content':'Treść',
        'tpl.leftTime':'Pozostały czas',
        'hour':'Gidzny',
        'minute':'Minuty',
        'untitled':'Nienazwany',
        'noContent':'Brak Treści'
    },

    'SettingPopup':{
        'title':'Ustawienia feyaCalendar',
        'hourFormatField.label':'Format godziny',
        'dayFormatField.label':'Format dnia w widoku dziennym',
        'weekFormatField.label':'Format dnia w widoku tygodniowym',
        'monthFormatField.label':'Format dnia w widoku miesięcznym',
        'applyBtn.text':'Zastosuj',
        'resetBtn.text':'Resetuj',
        'closeBtn.text':'Zamknij',
        'fromtoFormatField.label':'Format od-do',
        'scrollStartRowField.label':'Przewiń wiersz początkowy',
        'languageField.label':'Język',
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
        'cm.date':'Data',
        'cm.calendar':'Kalendarz',
        'cm.time':'Godzina',
        'cm.subject':'Temat',
        'cm.content':'Treść',
        'cm.expire':'Pozostały czas',
        'groupBtn.group.text':'Grupuj',
        'groupBtn.unGroup.text':'Usuń grupowanie',
        'returnBtn.text':'Wstecz',
        'hour':'Godzin',
        'noSubject':'(Brak tematu)',
        'noContent':'(Brak treści)',
        'loadMask.msg':'Proszę czekać...'
    },

    'DayView':{
        'loadMask.msg':'Proszę czekać...',
        'addItem.text':'Nowe zdarzenie',
        'events':'zdarzenie'
    },

    'MonthView':{
        'loadMask.msg':'Proszę czekać...',
        'overview':'Widok ogólny',
        'showingEvents':'Wyświetlanie wpisów',
        'totalEvents':'Wszystkich wpisów',
        'dayPre':'',
        'addItem.text':'Nowe zdarzenie',
        'clearItem.text':'Czyścić zdarzenie',
        'cutItem.text':'Ciąć',
        'copyItem.text':'Kopiowanie',
        'pasteItem.text':'Wklej',
        'events':'zdarzenie'
    },

    'Mask':{
        '12Hours':'12 godzinny',
        '24Hours':'24 godzinny',
        'ar': 'Arabski',
        'de': 'Niemiecki',
        'en_US':'American English',
        'es': 'Hiszpański',
        'fr': 'Français',
        'it': 'Italiano',
        'ja': 'Hiszpański',
        'nl': 'Nederlandse',
        'pl': 'Polski',
        'pt': 'Portugalski',
        'ru': 'Rosyjski',
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