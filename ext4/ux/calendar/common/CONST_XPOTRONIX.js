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

Ext.ux.calendar.CONST = {
    /*
     *true to show the language submenu in myCalendar, or not
     */
    SHOW_LANGUAGE_MENU:true,
    
    BLANK_IMAGE_URL:'/ext/resources/images/default/s.gif',
    /*
     *define the main path of myCalendar
     */
    MAIN_PATH:'',
    /*
     *define the multi-language path of myCalendar
     */
    CALENDAR_LANGUAGE_PATH:'multi-language/',
    /*
     *define the multi-language path of EXT
     */
    EXT_LANGUAGE_PATH:'/ext/src/locale/',
    /*
     * define the some url here for datasource
     */
    searchURL:'?m=CalendarAgent&a=process&p=search',

    showAllCalendarURL:'?m=CalendarAgent&a=process&p=showAllCalendar',

    showOnlyCalendarURL:'?m=CalendarAgent&a=process&p=showOnlyCalendar',

    createUpdateCalendarURL:'?m=CalendarAgent&a=process&p=createUpdateCalendar',

    deleteEventsByCalendarURL:'?m=CalendarAgent&a=process&p=deleteEventsByCalendar',

    deleteCalendarURL:'?m=CalendarAgent&a=process&p=deleteCalendar',

    loadCalendarURL:'?m=CalendarAgent&a=process&p=loadCalendar',

    loadEventURL:'?m=CalendarAgent&a=process&p=loadEvent',

    loadRepeatEventURL:'?m=CalendarAgent&a=process&p=loadRepeatEvent',

    createEventURL:'?m=CalendarAgent&a=process&p=createEvent',

    updateEventURL:'?m=CalendarAgent&a=process&p=updateEvent',

    deleteEventURL:'?m=CalendarAgent&a=process&p=deleteEvent',

    deleteRepeatEventURL:'?m=CalendarAgent&a=process&p=deleteRepeatEvent',

    changeDayURL:'?m=CalendarAgent&a=process&p=changeDay',

    deleteDayURL:'?m=CalendarAgent&a=process&p=deleteDay',

    loadSettingURL:'?m=CalendarAgent&a=process&p=loadSetting',

    updateSettingURL:'?m=CalendarAgent&a=process&p=updateSetting',

    createUpdateRepeatEventURL:'?m=CalendarAgent&a=process&p=createUpdateRepeatEvent',

    initialLoadURL:'?m=CalendarAgent&a=process&p=initialLoad'
};
