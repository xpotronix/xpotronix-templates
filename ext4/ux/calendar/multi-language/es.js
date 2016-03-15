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
        'title':'Jurisbook: Agenda Común',
        'loadMask.msg':'Por favor, espere...'
    },

    'MainPanel':{
        'loadMask.msg':'Por favor, espere...'
    },
    
    'SharingPopup':{
        'title':'Agenda Común'
    },

    'CalendarContainer':{
        'todayBtn.text':'Hoy',
        'dayBtn.text':'Vista Día',
        'weekBtn.text':'Vista Semana',
        'monthBtn.text':'Vista Mes',
        'weekMenu.showAll.text':'Mostrar Todo',
        'weekMenu.onlyWeek.text':'Sólo Días Semana',
        'monthMenu.showAll.text':'Mostrar Todo',
        'monthMenu.onlyWeek.text':'Solo Días Semana',
        'moreMenu.setting.text':'Configuración',
        'moreMenu.about.text':'Acerca de',
        'moreBtn.text':'Más',
        'searchCriteria.text':'Buscar',        
        'moreMenu.showAlert.text':'Activar Funcion de Alerta',
        'moreMenu.language.text':'Configuración Idioma'
    },

    'WestPanel':{
        'myCalendarPanel.title':'Mi Calendario',
        'otherCalendarPanel.title':'Otros Calendarios',
        'myShowAllBtn.text':'Mostrar Todo',
        'myAddBtn.text':'Nuevo'
    },

    'EventHandler':{
        'showOnlyItem.text':'Mostrar este sólo',
        'viewItem.hide.text':'Ocultar calendario',
        'viewItem.show.text':'Mostrar calendario',
        'editItem.text':'Editar calendario',
        'deleteItem.text':'Eliminar calendario',
        'clearItem.text':'Vaciar calendario',
        'wholeDay':'Todo el día',
        'untitled':'Sin título',
        'unlockItem.text':'Desbloquear',
        'lockItem.text':'Bloquear',
        'editEvent.title':'Editar Evento',
        'deleteEvent.title':'Borrar Evento',
        'more':'Más',
        'deleteRepeatPopup.title':'Confirmar',
        'deleteRepeatPopup.msg':'Seleccione "Sí" para borrar todas las repeticiones de este evento, seleccione "No" para borrar solo este evento',
        'updateRepeatPopup.title':'Confirmar',
        'updateRepeatPopup.msg':'Seleccione "Sí" para borrar todas las repeticiones de este evento, seleccione "No" para borrar solo este evento',
        'shareItem.text':'Compartir Calendario'
    },

    'Editor':{
        'startDayField.label':'Hora desde',
        'endDayField.label':'Hasta',
        'wholeField.label':'Todo el día',
        'subjectField.label':'Tema',
        'contentField.label':'Contenido',
        'calendarField.label':'Calendario',
        'alertCB.label':'Alerta cuando se active',
        'lockCB.label':'Bloquear',
        'deleteBtn.text':'Borrar',
        'saveBtn.text':'Guardar',
        'cancelBtn.text':'Cancelar',
        'new.title':'Nuevo Evento',
        'edit.title':'Editar Evento',
        'repeatTypeField.label':'Repetir tipo',
        'repeatIntervalField.label':'Repite cada ',
        'intervalUnitLabel.day.text':' Día(s) ',
        'intervalUnitLabel.week.text':' Semana(s) ',
        'intervalUnitLabel.month.text':' Mes(es) ',
        'intervalUnitLabel.year.text':' Año(s) ',
        'detailSetting':'Modificar Detalle...',
        'returnBtn.text':'Atrás',
        'startAndEnd':'Principio y Fin',
        'repeatStartField.label':'Inicio',
        'repeatNoEndRG.label':'Sin fecha final',
        'repeatEndTimeRG.label':'Termina antes',
        'repeatEndDateRG.label':'Termina para',
        'repeatEndTimeUnit':'occurrencia(s)',
        'weekCheckGroup.label':'Repetir Día',
        'monthRadioGroup.label':'Repetir Hasta',
        'repeatByDate':'Fecha',
        'repeatByDay':'Día'        
    },
    
    'CalendarEditor':{
        'new.title':'Nuevo Calendario',
        'edit.title':'Editar Calendario',
        'nameField.label':'Nombre',
        'descriptionField.label':'Descripción',
        'clearBtn.text':'Limpiar',
        'saveBtn.text':'Guardar',
        'cancelBtn.text':'Cancelar',
        'returnBtn.text':'Atrás',
        'shareCalendar':'Compartir Calendario con Otros',
        'shareColumns.user':'Usuario',
        'shareColumns.permit':'Permitir',
        'shareColumns.add':'Agregar Usuario para Compartir',
        'shareColumns.remove':'Borrar',
        'userField.emptyText':'Por favor ingrese usuario o dirección de e-mail'
    },
    
    'ExpirePopup':{
        'hideCB.label':'No avisar más',
        'title':'Eventos Alertados',
        'tpl.calendar':'Calendario',
        'tpl.subject':'Tema',
        'tpl.content':'Contenido',
        'tpl.leftTime':'Tiempo restante',
        'hour':'Hora(s)',
        'minute':'Minuto(s)',
        'untitled':'Sin Título',
        'noContent':'Sin Contenido'
    },

    'SettingPopup':{
        'title':'Configuración Calendario',
        'hourFormatField.label':'Formato Hora',
        'dayFormatField.label':'Formato Día para Vista Día',
        'weekFormatField.label':'Formato Día para Vista Semana',
        'monthFormatField.label':'Formato Día para Vista Mes',
        'applyBtn.text':'Aplicar',
        'resetBtn.text':'Limpiar',
        'closeBtn.text':'Cerrar',
        'fromtoFormatField.label':'Formato Desde Hasta',
        'scrollStartRowField.label':'Ciclar Línea Inicio',
        'languageField.label':'Idioma',
        'generalForm.title':'General',
        'dwViewForm.title':'Vista Día|Vista Semana',
        'monthViewForm.title':'Vista Mes',
        'createByDblClickField.label':'Crear Evento Haciendo Doble Click',
        'singleDayField.label':'Eventos de Más de un Día',
        'weekStartDayField.label': 'Día Inicio Semana',
        'activeStartTimeField.label':'Hora Inicio Activo',
        'activeEndTimeField.label':'Hora Fin Activo',
        'hideInactiveTimeField.label':'Ocultar Tiempo Inactivo',
        'readOnlyField.label':'Sólo Lectura',
        'intervalField.label':'Intervalo de Tiempo',
        'startEndInvalid':'La Hora de Inicio de be ser mas temprana que la Hora de Fin!',
        'formatInvalid':'Ejemplo: 09:00'
    },

    'ResultView':{
        'cm.date':'Fecha',
        'cm.calendar':'Calendario',
        'cm.time':'Hora',
        'cm.subject':'Tema',
        'cm.content':'Contenido',
        'cm.expire':'Tiempo Restante',
        'groupBtn.group.text':'Agrupar',
        'groupBtn.unGroup.text':'Desagrupar',
        'returnBtn.text':'Atrás',
        'hour':'Houra(s)',
        'noSubject':'(Sin Tema)',
        'noContent':'(Sin Contenido)',
        'loadMask.msg':'Por favor espere...'
    },

    'DayView':{
        'loadMask.msg':'Por favor espere...',
        'addItem.text':'Nuevo Evento',
        'events':'eventos'
    },

    'MonthView':{
        'loadMask.msg':'Por favor espere...',
        'overview':'Resumen',
        'showingEvents':'Mostrando Eventos',
        'totalEvents':'Total Eventos',
        'dayPre':'',
        'addItem.text':'Nuevo Evento',
        'clearItem.text':'Limpiar Evento',
        'cutItem.text':'Cortar',
        'copyItem.text':'Copiar',
        'pasteItem.text':'Pegar',
        'events':'eventos'
    },

    'Mask':{
        '12Hours':'12 Horas',
        '24Hours':'24 Horas',
        'ar': 'Árabe',
        'de': 'Alemán',
        'en_US':'Ingés Americano',
        'es': 'Español',
        'fr': 'Francés',
        'it': 'Italiano',
        'ja': 'Japonés',
        'nl': 'Noruego',
        'pl': 'Polaco',
        'pt': 'Portugués',
        'ru': 'Ruso',
        'zh_CN':'简体中文',
        'enable':'Habilitar',
        'disable':'Deshabilitar',
        'minute':'Minutos',
        'monday':'Lunes',
        'sunday':'Domingo',
        'permitData':[
            [0, 'Leer, Escribir y Compartir'],
            [1, 'Leer y Escribir'],
            [2, 'Leer Sólo']
        ]
    },

    repeatType:[
        ['no', 'No Repetir'],
        ['day', 'Diario'],
        ['week', 'Semanal'],
        ['month', 'Mensual'],
        ['year', 'Anual']
    ],

    getWeekDayInMonth:function(date){
        var n = date.format('N');
        var d = date.format('d');
        var w = Math.floor((d-n)/7)+1;
        var wd = date.format('l');
        var str = 'el '+w;
        if(1 == w){
            str += 'ro';
        }else if(2 == w){
            str += 'do';
        }else if(3 == w){
            str += 'ro';
        }else{
            str += '';
        }
        return str+' '+wd;
    },

    getIntervalText:function(rtype, intervalSlot){
        var str = '';
        if('day' == rtype){
            if(1 == intervalSlot){
                str = 'Todos los días';
            }else{
                str = 'Cada '+intervalSlot+' días';
            }
        }else if('week' == rtype){
            if(1 == intervalSlot){
                str = 'Cada semana en ';
            }else{
                str = 'Cada '+intervalSlot+' semana en ';
            }
        }else if('month' == rtype){
            if(1 == intervalSlot){
                str = 'Cada mes en ';
            }else{
                str = 'Cada '+intervalSlot+' mes en ';
            }
        }else if('year' == rtype){
            if(1 == intervalSlot){
                str = 'Cada año en ';
            }else{
                str = 'Cada '+intervalSlot+' año en ';
            }
        }
        return str;
    }
};

Ext.apply(Ext.ux.calendar.Mask, Ext.ux.calendar.Language);
