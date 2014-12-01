
const PanelMenu=imports.ui.panelMenu;
const St=imports.gi.St;
const Main=imports.ui.main;
const Shell=imports.gi.Shell;
const Mainloop=imports.mainloop;
const Lang=imports.lang;
const PopupMenu=imports.ui.popupMenu;
const Clutter=imports.gi.Clutter;
const Soup = imports.gi.Soup;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

const ErrNet = "😴⇝";
const ErrHttp = "⇜😴";
const ErrJson = "{😴}";
const Loading = "…";
const OKState = "😌";
const KOState = "😞";
const RunningState = "↺";

const StyleClassSuccess = "success";
const StyleClassFailure = "failure";
const StyleClassError = "error";
const StyleClassRunning = "running";

const URL_SETTING = "url";
const REFRESH_RATE_SETTING = "period";

let _status_indicator_object=null;

const CIndicator=new Lang.Class(
{
   Name: 'CIndicator.CIndicator',
   Extends: PanelMenu.Button,
   buttonText: null,
   _timeout: null,
   _refresh_rate: 10,
   _change_timeout_loop: false,
   // lock used to prevent multiple parallel update requests
   _isRequesting : false,

   _get_url: function(){
      let url =  this._settings.get_string(URL_SETTING);
      global.log("url = "+url);
      // if (url == "" ){
      //    url = "http://localhost:8080/status";
      //    this._settings.set_string(URL_SETTING, url);
      // }
      return url
   },

   _get_refresh_rate: function(){
      let rr =  this._settings.get_int(REFRESH_RATE_SETTING);
      global.log("period= "+rr);
      // if (rr == 30 ){
      //    rr  = 10;
      //    global.log("period set to"+rr);
      //    this._settings.set_int(REFRESH_RATE_SETTING, rr);
      // }
      return rr
   },

   _init: function()
   {
      this.parent(0.0,"CI Status",false);
      //this._settings = Convenience.getSettings();
      this._settings = Convenience.getSettings();
      //this._settings = Convenience.getSettings();

      this.buttonText=new St.Label({
         name: "ci-indicator-buttonText",
         y_align: Clutter.ActorAlign.CENTER
      });
      this.actor.add_actor(this.buttonText);
      this.buttonText.set_text(Loading);
      this.buttonText.remove_style_class_name(StyleClassError);
      this.buttonText.remove_style_class_name(StyleClassSuccess);
      this.buttonText.remove_style_class_name(StyleClassFailure);
      this.buttonText.remove_style_class_name(StyleClassRunning);



      /* Find starting date and */

      
      this.actor.connect('button-press-event', Lang.bind(this, this._refresh));
      this.actor.connect('key-press-event', Lang.bind(this, this._refresh));

      this._update_refresh_rate();
      this._timeout=null;
      this._refresh();
   },

   _refresh: function()
   {
      this._do_update_status();
      this._update_refresh_rate();
      if(this._change_timeoutloop) {
         this._remove_timeout();
         this._timeout=Mainloop.timeout_add_seconds(this._refresh_rate,Lang.bind(this, this._refresh));
         this._change_timeoutloop=false;
         return false;
      }
      return true;
   },

   _do_update_status: function(){
      if (this._isRequesting){
         return;
      } else {
         //remove all styles first
         this.buttonText.remove_style_class_name(StyleClassError);
         this.buttonText.remove_style_class_name(StyleClassSuccess);
         this.buttonText.remove_style_class_name(StyleClassFailure);

         let url = this._get_url();
         global.log("refreshing ci status: "+url);
         let request = Soup.Message.new('GET', url);
         if( request ) {
            _httpSession.queue_message(request, Lang.bind(this, this._callback));
         }else{
               //global.log("invalid request");
               this.buttonText.set_text(ErrNet);
               this.buttonText.add_style_class_name(StyleClassError);
               this._isRequesting = false;
         }
      }

   },
   _callback: function(httpSession, message)
   {
      this._isRequesting = false;
      if( message.status_code!==200 )  {
                  global.log("http error:", message.status_code);
                  this.buttonText.set_text(ErrHttp);
               this.buttonText.add_style_class_name(StyleClassError);
                  return;
      } else { 
         // parse json
         try {
            let state = JSON.parse(message.response_body.data);
            //the unique message actually from the server
            if (state == 2) {
               this.buttonText.set_text(OKState);
               this.buttonText.add_style_class_name(StyleClassSuccess);
            } else if (state == 1) {
               this.buttonText.set_text(RunningState);
               this.buttonText.add_style_class_name(StyleClassRunning);
            } else {
               this.buttonText.set_text(KOState);
               this.buttonText.add_style_class_name(StyleClassFailure);
            }
         } catch( e ) {
            global.log(e)
            this.buttonText.set_text(ErrJson);
            this.buttonText.add_style_class_name(StyleClassError);
         }
      }
   },
   _update_refresh_rate: function()
   {

      let refresh_rate = this._get_refresh_rate();
      global.log("update refresh rate to: "+ refresh_rate);
      if(this._refresh_rate!=refresh_rate) {
         global.log("rescheduling ");
         this._refresh_rate=refresh_rate;
         this._change_timeoutloop=true;
      }
   },

   _remove_timeout: function()
   {
      if(this._timeout) {
         Mainloop.source_remove(this._timeout);
         this._timeout=null;
      }
   },

   destroy: function()
   {
      this._remove_timeout();
      this.parent();
   }
});

// Init function
function init(metadata){}

// Enable function
function enable()
{
   _status_indicator_object=new CIndicator;
   if(_status_indicator_object) {
      Main.panel.addToStatusArea('cistatus-indicator',_status_indicator_object);
   }
}

// Disable function
function disable()
{
   if(_status_indicator_object) {
      _status_indicator_object.destroy();
      _status_indicator_object=null;
   }
}