/**
 * Builds the main ui builder shell
 * @since 3.0.0
 */
const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    inject: ['uipData', 'router', 'uipress', 'uiTemplate', 'layersPanel', 'unsavedChanges'],
    data: function () {
      return {
        loading: true,
        templateID: this.$route.params.templateID,
        saving: false,
        helpLoaded: false,
        allUiTemplates: [],

        ui: {
          zoom: 0.9,
          viewDevice: 'desktop',
          contextualMenu: {
            display: false,
            top: '',
            left: '',
            block: false,
          },
          strings: {
            backToList: __('Exit builder', 'uipress-lite'),
            toggleLayers: __('Toggle layers panel', 'uipress-lite'),
            backToList: __('Back to template list', 'uipress-lite'),
            zoomIn: __('Zoom in', 'uipress-lite'),
            zoomOut: __('Zoom out', 'uipress-lite'),
            darkMode: __('Dark mode', 'uipress-lite'),
            preview: __('Preview', 'uipress-lite'),
            import: __('Import template', 'uipress-lite'),
            export: __('Export template', 'uipress-lite'),
            templateLibrary: __('Template Library', 'uipress-lite'),
            mobile: __('Mobile', 'uipress-lite'),
            desktop: __('Desktop', 'uipress-lite'),
            tablet: __('Tablet', 'uipress-lite'),
            saveTemplate: __('Save', 'uipress-lite'),
            help: __('Help', 'uipress-lite'),
            docs: __('Documentation and guides', 'uipress-lite'),
            active: __('Active', 'uipress-lite'),
            draft: __('Draft', 'uipress-lite'),
            newTemplate: __('New template', 'uipress-lite'),
            recentTemplates: __('Recent templates', 'uipress-lite'),
            templateName: __('Template name', 'uipress-lite'),
            active: __('Active', 'uipress-lite'),
            draft: __('Draft', 'uipress-lite'),
          },
        },
        previewOptions: [
          {
            value: 'builder',
            label: __('Builder', 'uipress-lite'),
          },
          {
            value: 'preview',
            label: __('Preview', 'uipress-lite'),
          },
        ],
      };
    },
    provide() {
      return {
        saveTemplate: this.saveCleanTemplate,
      };
    },
    watch: {
      'ui.viewDevice': {
        handler(newValue, oldValue) {
          let self = this;
          if (newValue == 'desktop') {
            self.uiTemplate.windowWidth = '1000';
            let frame = document.getElementById('uip-preview-content');
            if (frame) {
              frame.classList.add('uip-desktop-view');
              frame.classList.remove('uip-tablet-view');
              frame.classList.remove('uip-phone-view');
            }
          }
          if (newValue == 'tablet') {
            self.uiTemplate.windowWidth = '699';
            let frame = document.getElementById('uip-preview-content');
            if (frame) {
              frame.classList.add('uip-tablet-view');
              frame.classList.remove('uip-desktop-view');
              frame.classList.remove('uip-phone-view');
            }
          }
          if (newValue == 'phone') {
            self.uiTemplate.windowWidth = '600';
            let frame = document.getElementById('uip-preview-content');
            if (frame) {
              frame.classList.add('uip-phone-view');
              frame.classList.remove('uip-tablet-view');
              frame.classList.remove('uip-desktop-view');
            }
          }
          let previewwidthChange = new CustomEvent('uip_builder_preview_change', { detail: { windowWidth: self.uiTemplate.windowWidth } });
          document.dispatchEvent(previewwidthChange);
        },
        deep: true,
      },
      'uiTemplate.content': {
        handler(newValue, oldValue) {
          if (oldValue.length != 0) {
            this.unsavedChanges = true;
          }
        },
        deep: true,
      },
      'uipData.templateDarkMode': {
        handler(newValue, oldValue) {
          let theme = 'light';
          if (newValue) {
            theme = 'dark';
          }
          let frame = document.getElementsByClassName('uip-page-content-frame');
          if (frame[0]) {
            frame[0].contentWindow.document.documentElement.setAttribute('data-theme', theme);
          }
        },
        deep: true,
      },
      'uipData.userPrefs.darkTheme': {
        handler(newValue, oldValue) {
          //Only adjust preview dark mode if we are not in prod
          if (this.uiTemplate.display != 'prod') {
            this.uipData.templateDarkMode = newValue;
          }
        },
        deep: true,
      },
      'ui.zoom': {
        handler(newValue, oldValue) {
          let rounded = Math.round(newValue * 10) / 10;
          //Only adjust preview dark mode if we are not in prod
          this.uipress.saveUserPreference('builderPrefersZoom', String(rounded), false);
        },
        deep: true,
      },
      '$route.params.templateID': {
        handler() {
          this.templateID = this.$route.params.templateID;
        },
      },
    },
    mounted: function () {
      this.loading = false;
      let self = this;
      //Set zoom level from prefs
      let zoom = parseFloat(this.uipData.userPrefs.builderPrefersZoom);
      if (zoom && typeof zoom !== 'undefined') {
        this.ui.zoom = zoom;
      }
      let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      let isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;
      let isIOS = navigator.platform.match(/(iPhone|iPod|iPad)/i) ? true : false;

      if (isMac || isMacLike || isIOS) {
        document.body.classList.add('macos');
      }

      window.addEventListener('keydown', function (e) {
        ///CMD S
        if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          self.saveTemplate();
        }
      });

      document.addEventListener(
        'right_click_frame',
        (e) => {
          self.uipress.searchForBlock(self.uiTemplate.content, e.detail.uid).then((response) => {
            if (response) {
              let framePos = document.getElementById(e.detail.uid).getBoundingClientRect();

              e.detail.pos.y = self.ui.zoom * e.detail.pos.y + framePos.y;
              e.detail.pos.x = self.ui.zoom * e.detail.pos.x + framePos.x;

              self.ui.contextualMenu.block = response;
              self.setRightClickPos(e.detail.pos);
              self.ui.contextualMenu.display = true;
            } else {
              return;
            }
          });
        },
        { once: false }
      );
    },
    computed: {
      returnAllUiTemplates() {
        let self = this;
        if (self.allUiTemplates.length < 1) {
          let formData = new FormData();
          formData.append('action', 'uip_get_ui_templates');
          formData.append('security', uip_ajax.security);
          formData.append('page', 1);
          formData.append('search', '');

          self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
            this.allUiTemplates = response.templates;
            return this.allUiTemplates;
          });
        } else {
          return this.allUiTemplates;
        }
      },
      returnLayout() {
        return this.uiTemplate.layout;
      },
      returnTemplateJS() {
        if (typeof this.uiTemplate.globalSettings.options === 'undefined') {
          return;
        }
        if ('advanced' in this.uiTemplate.globalSettings.options) {
          if ('js' in this.uiTemplate.globalSettings.options.advanced) {
            return this.uiTemplate.globalSettings.options.advanced.js;
          }
        }
      },
      returnTemplateCSS() {
        if (typeof this.uiTemplate.globalSettings.options === 'undefined') {
          return;
        }
        if ('advanced' in this.uiTemplate.globalSettings.options) {
          if ('css' in this.uiTemplate.globalSettings.options.advanced) {
            return this.uiTemplate.globalSettings.options.advanced.css;
          }
        }
      },
    },
    methods: {
      returnColorMode() {
        if (this.uipData.userPrefs.darkTheme) {
          return 'dark';
        }
        if (this.uipData.templateDarkMode) {
          return 'dark';
        }
        return 'light';
      },

      saveTemplate() {
        let self = this;
        self.saving = true;
        let cleanTemplate = JSON.parse(JSON.stringify(self.uiTemplate.content));
        this.uipress.cleanTemplate(cleanTemplate).then((response) => {
          self.saveCleanTemplate(cleanTemplate);
        });
      },

      async saveCleanTemplate(cleanTemplate) {
        let self = this;
        let savetemplate = {};
        savetemplate.globalSettings = JSON.parse(JSON.stringify(self.uiTemplate.globalSettings));
        savetemplate.content = cleanTemplate;

        let template = JSON.stringify(savetemplate, (k, v) => (v === 'true' ? 'uiptrue' : v === true ? 'uiptrue' : v === 'false' ? 'uipfalse' : v === false ? 'uipfalse' : v === '' ? 'uipblank' : v));

        let styles = this.formatStyles();
        let stylesJson = JSON.stringify(styles, (k, v) => (v === 'true' ? 'uiptrue' : v === true ? 'uiptrue' : v === 'false' ? 'uipfalse' : v === false ? 'uipfalse' : v === '' ? 'uipblank' : v));
        //Build form data for fetch request
        let formData = new FormData();
        formData.append('action', 'uip_save_ui_template');
        formData.append('security', uip_ajax.security);
        formData.append('templateID', self.templateID);
        formData.append('template', template);
        formData.append('styles', stylesJson);

        return await self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, 'uipress-lite', '', 'error', true);
            self.saving = false;
            return false;
          }
          if (response.success) {
            self.uipress.notify(__('Template saved', 'uipress-lite'), '', 'success', true);
            self.unsavedChanges = false;
            self.saving = false;

            let newTem = JSON.parse(JSON.stringify(self.uiTemplate.content));
            self.uipress.logHistoryChange(__('Template saved', 'uipress-lite'), newTem, newTem);
            return true;
          }
        });
      },
      formatStyles() {
        let styles = this.uipData.themeStyles;
        let formatted = {};
        for (let key in styles) {
          if (styles[key].value) {
            if (!formatted[styles[key].name]) {
              formatted[styles[key].name] = {};
            }
            formatted[styles[key].name].value = styles[key].value;
          }
          if (styles[key].darkValue) {
            if (!formatted[styles[key].name]) {
              formatted[styles[key].name] = {};
            }
            formatted[styles[key].name].darkValue = styles[key].darkValue;
          }
          if (styles[key].user) {
            formatted[styles[key].name].user = styles[key].user;
            formatted[styles[key].name].label = styles[key].label;
            formatted[styles[key].name].name = styles[key].name;
            formatted[styles[key].name].type = styles[key].type;
          }
        }

        return formatted;
      },
      goBackToList() {
        if (this.unsavedChanges) {
          this.uipress.confirm(__('You have unsaved changes!', 'uipress-lite'), __('If you leave this page all unsaved changes will be discarded', 'uipress-lite')).then((response) => {
            if (response) {
              this.router.push('/');
            }
          });
        } else {
          this.router.push('/');
        }
      },
      returnLoadStyle() {
        if (this.saving) {
          return 'opacity:0;';
        }
      },
      toggleLayers() {
        this.layersPanel.display = !this.layersPanel.display;

        this.uipress.saveUserPreference('builderLayers', this.layersPanel.display, false);
      },
      toggleDisplay() {
        if (this.uiTemplate.display == 'preview') {
          this.uiTemplate.display = 'builder';
        } else {
          this.uiTemplate.display = 'preview';
        }
      },
      preTemplateExport() {
        let self = this;
        let notiID = self.uipress.notify(__('Exporting layout', 'uipress-lite'), '', 'default', false, true);
        self.uipress.cleanTemplate(self.uiTemplate.content).then((response) => {
          self.exportLayout(notiID);
        });
      },
      exportLayout(notiID) {
        self = this;
        let layout = JSON.stringify(self.uiTemplate.content);
        let name = self.uiTemplate.globalSettings.name;

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        let date_today = mm + '-' + dd + '-' + yyyy;
        let filename = 'uip-ui-template-' + name + '-' + date_today + '.json';

        let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(layout);
        let dlAnchorElem = document.getElementById('uip-export-layout');
        dlAnchorElem.setAttribute('href', dataStr);
        dlAnchorElem.setAttribute('download', filename);
        dlAnchorElem.click();
        self.uipress.notify(__('Layout exported', 'uipress-lite'), '', 'success', true);
        self.uipress.destroy_notification(notiID);
      },
      importSettings() {
        let self = this;
        let notiID = self.uipress.notify(__('Importing layout', 'uipress-lite'), '', 'default', false, true);

        let fileInput = document.getElementById('uip-import-layout');
        let thefile = fileInput.files[0];

        if (thefile.type != 'application/json') {
          self.uipress.notify('Templates must be in valid JSON format', '', 'error', true, false);
          self.uipress.destroy_notification(notiID);
          return;
        }

        if (thefile.size > 1000000) {
          self.uipress.notify('Uploaded file is too big', '', 'error', true, false);
          self.uipress.destroy_notification(notiID);
          return;
        }

        let reader = new FileReader();
        reader.readAsText(thefile, 'UTF-8');

        reader.onload = function (evt) {
          let json_settings = evt.target.result;
          let parsed;
          try {
            parsed = JSON.parse(json_settings);
          } catch (error) {
            self.uipress.notify(error, '', 'error', true, false);
            self.uipress.destroy_notification(notiID);
            return;
          }

          if (parsed != null) {
            if (!Array.isArray(parsed)) {
              self.uipress.notify('Template is not valid', '', 'error', true, false);
              self.uipress.destroy_notification(notiID);
              return;
            }
            self.uipress.validDateTemplate(parsed).then((response) => {
              if (!response.includes(false)) {
                self.uiTemplate.content = parsed;
                self.uipress.notify('Template imported', '', 'success', true, false);
                self.uipress.destroy_notification(notiID);
              } else {
                self.uipress.notify('File is not a valid JSON template', '', 'error', true, false);
                self.uipress.destroy_notification(notiID);
              }
            });
          } else {
            self.uipress.notify('JSON parse failed', '', 'error', true, false);
            self.uipress.destroy_notification(notiID);
          }
        };
      },
      openThemeLibrary() {
        let ID = this.$route.params.templateID;
        this.router.push('/uibuilder/' + ID + '/library');
      },
      switchLayout(id) {
        let self = this;
        if (this.unsavedChanges) {
          this.uipress.confirm(__('You have unsaved changes!', 'uipress-lite'), __('If you leave this page all unsaved changes will be discarded', 'uipress-lite')).then((response) => {
            if (response) {
              self.router.push('/uibuilder/' + id + '/');
              self.unsavedChanges = false;
            }
          });
        } else {
          self.router.push('/uibuilder/' + id + '/');
        }
      },
      confirmNewPage(id) {
        let self = this;
        if (this.unsavedChanges) {
          this.uipress.confirm(__('You have unsaved changes!', 'uipress-lite'), __('If you leave this page all unsaved changes will be discarded', 'uipress-lite')).then((response) => {
            if (response) {
              self.createNewUI();
            }
          });
        } else {
          self.createNewUI();
        }
      },
      /**
       * Creates new draft ui template
       * @since 3.0.0
       */
      createNewUI() {
        let self = this;

        let formData = new FormData();
        formData.append('action', 'uip_create_new_ui_template');
        formData.append('security', uip_ajax.security);
        formData.append('templateType', 'ui-template');

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          self.uipress.notify('New template created', '', 'success', true, false);
          self.router.push('/');
          self.router.push('/uibuilder/' + response.id + '/');
          self.returnAllUiTemplates;
        });
      },
      clickHandler(evt) {
        let self = this;

        let target = evt.target.closest('.uip-block-builder-container');

        if (!target) {
          return;
        }
        let targetUID = target.getAttribute('block-uid');
        //No block to select
        if (!targetUID) {
          return;
        }

        //Open block settings
        let ID = self.$route.params.templateID;
        this.router.push({
          path: '/uibuilder/' + ID + '/settings/blocks/' + targetUID,
          query: { ...this.$route.query },
        });
      },
      hideContextual(evt) {
        let self = this;

        if (self.ui.contextualMenu.display) {
          //Check if click was outside contextual if it's open
          let path = evt.composedPath ? evt.composedPath() : undefined;
          // check if the MouseClick occurs inside the component
          if (path && !path.includes(this.$refs.contextualMenu) && !this.$refs.contextualMenu.contains(evt.target)) {
            self.ui.contextualMenu.display = false;
          }
        }
      },
      showOptions(evt) {
        let self = this;

        let target = evt.target.closest('.uip-block-builder-container');

        if (!target) {
          return;
        }
        let targetUID = target.getAttribute('block-uid');
        //No block to select
        if (!targetUID) {
          return;
        }

        self.uipress.searchForBlock(self.uiTemplate.content, targetUID).then((response) => {
          if (response) {
            self.ui.contextualMenu.block = response;
            self.setRightClickPos(evt);
            self.ui.contextualMenu.display = true;
          } else {
            return;
          }
        });
      },
      setRightClickPos(e) {
        let self = this;
        let x = e.pageX;
        let y = e.pageY;

        if (!('pageX' in e)) {
          x = e.x;
          y = e.y;
        }

        self.ui.contextualMenu.top = `${y}px`;
        self.ui.contextualMenu.left = `${x}px`;
      },
      returnContextMenuStyle() {
        let self = this;
        let style = 'top:' + self.ui.contextualMenu.top + '; left:' + self.ui.contextualMenu.left + ';';
        return style;
      },
      closeContextual() {
        this.ui.contextualMenu.display = false;
      },
    },
    template: `
    <component is="style" scoped >
        .uip-user-frame[data-theme="light"]:not(.uip-app-frame){
        <template v-for="item in uipData.themeStyles">
           <template v-if="item.value">{{item.name}}:{{item.value}};</template>
        </template>
        }
        .uip-user-frame[data-theme="dark"]:not(.uip-app-frame) *{
        <template v-for="item in uipData.themeStyles">
           <template v-if="item.darkValue"> {{item.name}}:{{item.darkValue}};</template>
        </template>
        }
        {{returnTemplateCSS}}
      </component>
      <component is="script" scoped >
        {{returnTemplateJS}}
      </component>
      <div class="uip-h-100p uip-w-100p uip-flex uip-flex-column uip-max-h-100p uip-overflow-hidden" @click="hideContextual($event)">
        <!--PREVIEW TOOLBAR -->
        <div id="uip-ui-preview-toolbar" class="uip-flex uip-padding-s uip-gap-xs uip-flex-center uip-flex-between uip-background-default uip-border-bottom uip-flex-wrap">
            <div class="uip-flex  uip-flex-center uip-app-frame">
          
              <div class="uip-logo uip-w-18 uip-ratio-1-1"></div>
              <div class=" uip-margin-left-xxs uip-margin-right-xxs uip-h-20"></div>
            
                <uip-tooltip :message="ui.strings.backToList" :delay="500">
                    <div @click="goBackToList()" class="hover:uip-background-muted uip-padding-xxxs uip-border-round uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium uip-rotate-180">
                    logout
                    </div>
                </uip-tooltip>
                <div class="uip-border-right uip-margin-left-xxs uip-margin-right-xxs uip-h-20"></div>
              
                <builder-history></builder-history>
              
                <div class="uip-border-right uip-margin-left-xxs uip-margin-right-xxs uip-h-20"></div>
              
              <!-- Zooom icons -->
                <uip-tooltip :message="ui.strings.zoomOut" :delay="500">
                    <div class="hover:uip-background-muted uip-padding-xxxs uip-border-round uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium uip-no-text-select" @click="ui.zoom -= 0.1">
                    remove
                    </div>
                </uip-tooltip>
                <uip-tooltip :message="ui.strings.zoomIn" :delay="500">
                    <div class="hover:uip-background-muted uip-padding-xxxs uip-border-round uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium uip-no-text-select" @click="ui.zoom += 0.1">
                    add
                    </div>
                </uip-tooltip>
                
                <div class="uip-border-right uip-margin-left-xxs uip-margin-right-xxs uip-h-20"></div>
                  
                <uip-tooltip :message="ui.strings.export" :delay="500">
                    <div class="hover:uip-background-muted uip-padding-xxxs uip-border-round uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium" @click="preTemplateExport()" >
                    file_download
                    </div>
                    <a id="uip-export-layout" href="" style="display:none;"></a>
                </uip-tooltip>
                <uip-tooltip :message="ui.strings.import" :delay="500">
                    <label class="">
                        <div class="hover:uip-background-muted uip-padding-xxxs uip-border-round uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium" >
                        file_upload
                        </div>
                        <input hidden accept=".json" type="file" single="" id="uip-import-layout" @change="importSettings()">
                    </label>
                </uip-tooltip>
              
          
            </div>
            <!--Middle actions -->
              <div class="uip-flex uip-gap-xxs uip-flex-center">
                
                <drop-down dropPos="bottom-left">
                  <template v-slot:trigger>
                    <div class="uip-flex uip-gap-xs">
                      <div class="uip-flex uip-flex-column uip-line-height-1">
                        <div class="uip-text-s uip-text-bold">Editing</div>
                        <div class="uip-text-s uip-text-muted uip-flex uip-flex-center uip-gap-xxxs">
                          <span v-if="uiTemplate.globalSettings.status" class="uip-w-5 uip-ratio-1-1 uip-display-inline-block uip-border-circle uip-background-green"></span>
                          <span v-if="!uiTemplate.globalSettings.status" class="uip-w-5 uip-ratio-1-1 uip-display-inline-block uip-border-circle uip-background-orange"></span>
                          <span>{{uiTemplate.globalSettings.name}}</span>
                        </div>
                      </div>
                      <div class="uip-icon">arrow_downward</div>
                    </div>
                  </template>
                  <template v-slot:content>
                    <div class=" uip-flex uip-flex-column uip-min-w-200">
                    
                      <div class="uip-padding-xs uip-padding-bottom-remove">
                        <input class="uip-blank-input  uip-w-100p" type="text" v-model="uiTemplate.globalSettings.name" :placeholder="ui.strings.templateName">
                      </div>
                    
                      <div class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-row-gap-xs">
                        
                        <div class="uip-flex uip-flex-between uip-flex-center">
                          <div class="uip-text-muted uip-text-s">
                            <template v-if="uiTemplate.globalSettings.status">{{ui.strings.active}}</template>
                            <template v-if="!uiTemplate.globalSettings.status">{{ui.strings.draft}}</template>
                          </div>
                          <label class="uip-switch">
                            <input type="checkbox" v-model="uiTemplate.globalSettings.status">
                            <span class="uip-slider"></span>
                          </label>
                        </div>
                        
                      </div>
                      
                      
                      
                      <div class="uip-padding-xxs uip-flex uip-flex-column uip-row-gap-xxs">
                        <div class="uip-text-s uip-padding-xxs uip-text-muted">{{ui.strings.recentTemplates}}</div>
                        
                        <!--Recent templates -->
                        <div class="uip-max-h-400 uip-overflow-auto">
                          <template v-for="template in returnAllUiTemplates">
                            <div v-if="template.id != templateID" class="uip-padding-xxs hover:uip-background-muted uip-cursor-pointer uip-line-height-1 uip-border-round" @click="switchLayout(template.id)">
                              <div class="uip-flex uip-flex-row uip-gap-xxs">
                                <div class="uip-link-default uip-text-s">{{template.name}}</div>
                                <div class="uip-text-xs uip-background-orange-wash uip-border-round uip-padding-xxxs uip-post-type-label uip-flex uip-gap-xxs uip-flex-center uip-tag-label uip-inline-flex"
                                :class="{'uip-background-green-wash' : template.status == 'publish'}">
                                  <div v-if="template.status == 'publish'">
                                    {{ui.strings.active}}
                                  </div>
                                  <div v-if="template.status == 'draft'">
                                    {{ui.strings.draft}}
                                  </div>
                                </div>
                              </div>\
                              <div class="uip-text-xs uip-text-muted">{{template.modified}}</div>
                            </div>
                          </template>
                        </div>
                        <!-- End recent templates-->
                        
                      </div>
                      
                      <div class="uip-padding-xs uip-border-top">
                        <div class="uip-link-muted uip-flex uip-flex-row uip-gap-xxs uip-flex-center" @click="confirmNewPage()">
                          <span class="uip-icon">add</span>
                          <span>{{ui.strings.newTemplate}}</span>
                        </div>
                      </div>
                      
                    </div>
                  </template>
                </drop-down>
                
                <div class="uip-h-20 uip-border-right"></div>
              
                <uip-tooltip :message="ui.strings.desktop" :delay="500">
                    <div class="hover:uip-background-muted uip-padding-xxs uip-padding-left-xxxs uip-padding-right-xxxs uip-flex uip-flex-center uip-icon uip-link-default uip-text-l uip-ratio-1-1 uip-line-height-1 uip-icon-medium" @click="ui.viewDevice = 'desktop'" :class="{'uip-border-bottom-primary uip-text-primary' : ui.viewDevice == 'desktop'}">
                    desktop_windows
                    </div>
                </uip-tooltip>
                <uip-tooltip :message="ui.strings.tablet" :delay="500">
                    <div class="hover:uip-background-muted uip-padding-xxs uip-padding-left-xxxs uip-padding-right-xxxs uip-flex uip-flex-center  uip-icon uip-link-default uip-text-l uip-ratio-1-1 uip-line-height-1 uip-icon-medium" @click="ui.viewDevice = 'tablet'" :class="{'uip-border-bottom-primary uip-text-primary' : ui.viewDevice == 'tablet'}">
                    tablet_mac
                    </div>
                </uip-tooltip>
                <uip-tooltip :message="ui.strings.phone" :delay="500">
                    <div class="hover:uip-background-muted uip-padding-xxs uip-padding-left-xxxs uip-padding-right-xxxs uip-flex uip-flex-center  uip-icon uip-link-default uip-text-l uip-ratio-1-1 uip-line-height-1 uip-icon-medium" @click="ui.viewDevice = 'phone'" :class="{'uip-border-bottom-primary uip-text-primary' : ui.viewDevice == 'phone'}">
                    smartphone
                    </div>
                </uip-tooltip>
              </div>\
            
            <div class="uip-flex uip-gap-xxs uip-flex-center">
          
        
              
              
                <uip-tooltip :message="ui.strings.preview" :delay="500">
                    <div class="hover:uip-background-muted uip-padding-xxxs uip-border-round uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium" @click="toggleDisplay()" :class="{'uip-background-grey uip-text-emphasis' : uiTemplate.display == 'preview'}">
                    pageview
                    </div>
                </uip-tooltip>
                
                <uip-tooltip :message="ui.strings.darkMode" :delay="500">
                    <div class="hover:uip-background-muted uip-padding-xxxs uip-border-round uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium" @click="uipData.userPrefs.darkTheme = !uipData.userPrefs.darkTheme" :class="{'uip-background-grey uip-text-emphasis' : uipData.userPrefs.darkTheme}">
                    dark_mode
                    </div>
                </uip-tooltip>
              
                <div class="uip-h-20 uip-border-right uip-margin-left-xxxs uip-margin-right-xxxs"></div>
                
                <!--Help tab -->
                <uip-offcanvas position="right" :style="'padding:0'">
                  <template v-slot:trigger>
                    <uip-tooltip :message="ui.strings.docs" :delay="500">
                        <div class="hover:uip-background-muted uip-padding-xxxs uip-border-round uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium">
                        menu_book
                        </div>
                    </uip-tooltip>
                  </template>
                  <template v-slot:content>
                    <div class="uip-max-h-100vh uip-overflow-hidden uip-w-100p">
                      <div class="uip-padding-m uip-flex uip-flex-center uip-flex-middle" v-if="!helpLoaded">
                        <loading-chart ></loading-chart>
                      </div>
                      <iframe @load="helpLoaded = true" class="uip-h-100p uip-w-100p" src="https://v1.embednotion.com/embed/aafbebeb2ed3402abe0723cbd96b0a2a"></iframe>
                    </div>
                  </template>
                </uip-offcanvas>
              
              
              <!--Layers toggle -->
              <uip-tooltip :message="ui.strings.toggleLayers" :delay="500">
                  <div class="hover:uip-background-muted uip-padding-xxxs uip-flex uip-flex-center  uip-icon uip-link-default uip-text-xl uip-ratio-1-1 uip-line-height-1 uip-icon-medium uip-border-round" @click="toggleLayers()" :class="{'uip-background-grey uip-text-emphasis' : layersPanel.display}">
                  layers
                  </div>
              </uip-tooltip>
              
            
              <button @click="saveTemplate()" class="uip-button-primary uip-flex uip-flex-center uip-flex-middle uip-position-relative uip-text-s uip-margin-left-xxs" type="button">
                <span :style="returnLoadStyle()" class="uip-flex uip-flex-center uip-flex-middle uip-gap-xs">
                  <span>{{ui.strings.saveTemplate}}</span>
                  <span class="uip-padding-left-xxxs uip-padding-right-xxxs uip-border uip-border-round uip-text-s uip-flex uip-flex-center uip-flex-row" data-theme="dark">
                    <span class="uip-command-icon uip-text-muted"></span>
                    <span class="uip-text-muted">S</span>
                  </span>
                </span>
                <div class="uip-position-absolute uip-left-0 uip-right-0" v-if="saving">
                  <span class="uip-load-spinner" ></span>
                </div>
              </button>
            </div>
        </div>
        <!--preview area -->
        <div class="uip-flex-grow uip-flex-grow uip-flex-middle uip-scrollbar uip-overflow-auto uip-max-w-100p uip-max-h-100p uip-w-100p uip-border-box">
        
            <div id="uip-ui-preview-area" class=" uip-user-frame uip-padding-m" :data-theme="returnColorMode()">
            
              <div id="uip-preview-content" class="uip-flex uip-flex-column uip-shadow uip-border uip-border-round uip-ratio-16-10 uip-background-default uip-text-normal uip-desktop-view"  :style="'transform: scale( ' + ui.zoom + ');transform-origin: 0% 0%;'" >
                <!--TOPBAR-->
                <div class="uip-border-bottom uip-padding-xxs uip-flex uip-gap-xxs">
                  <svg viewBox="0 0 20 20" class="uip-w-8" fill="var(--uip-color-base-2)">
                    <circle cx="10" cy="10" r="10" />
                  </svg>
                  <svg viewBox="0 0 20 20" class="uip-w-8" fill="var(--uip-color-base-2)">
                    <circle cx="10" cy="10" r="10" />
                  </svg>
                  <svg viewBox="0 0 20 20" class="uip-w-8" fill="var(--uip-color-base-2)">
                    <circle cx="10" cy="10" r="10" />
                  </svg>
                </div>
                <!--PAGE BODY-->
                <div id="uip-template-body" class="uip-flex-grow uip-ratio-16-10 uip-text-normal uip-body-font" >
              
                  <div class="uip-flex uip-h-100p uip-h-100p" @contextmenu.prevent="showOptions($event)" @click="clickHandler($event)">
                    <!--MAIN DROP AREA-->
                    <uip-content-area :content="uiTemplate.content" :returnData="function(data) {uiTemplate.content = data} "></uip-content-area>
                    <!--END OF MAIN DROP AREA-->
                  </div>
                  
                </div>
              </div>
              
            </div>
          
          
        </div>
        <!--end of preview area -->
        <div class="uip-position-fixed uip-padding-left-xxs uip-padding-top-m uip-padding-bottom-m uip-flex uip-flex-column uip-row-gap-xxs uip-flex-start" id="uip-inline-block-options" v-show="uiTemplate.activePath.length > 0 && uiTemplate.display =='builder'"
        @mouseenter="uiTemplate.activePathLock = true" @mouseleave="uiTemplate.activePathLock = false" style="z-index:0">
            <template v-for="block in uiTemplate.activePath">
              <div style="font-size:18px;"
              class="uip-padding-xxs uip-border-round uip-background-default uip-border uip-shadow uip-text-normal uip-flex uip-gap-xxs uip-flex-center">
                  <div class="uip-text-xxs uip-text-muted">{{block.item.name}}</div>
                  <div class="uip-border-left"></div>
                  <block-actions :block="block.item" :parentList="block.container" :currentIndex="block.index" :smallIcons="true"></block-actions>
              </div>
            </template>
        </div>
        <!--Right click content items-->
        <div ref="contextualMenu" class="uip-border-round uip-shadow uip-border uip-position-fixed uip-background-default" v-if="ui.contextualMenu.display" :style="returnContextMenuStyle()">
          <block-actions :block="ui.contextualMenu.block" :parentList="[]" :currentIndex="0" :smallIcons="true" :expanded="true" :closeActions="closeContextual"></block-actions>
        </div>
        <!-- End right click -->
      </div>`,
  };
  return compData;
}
