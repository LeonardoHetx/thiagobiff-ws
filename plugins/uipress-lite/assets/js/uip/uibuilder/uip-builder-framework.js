/**
 * Builds the main ui builder shell
 * @since 3.0.0
 */
const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    inject: ['uipData', 'router', 'uipress'],

    data: function () {
      return {
        loading: true,
        templateID: this.$route.params.templateID,
        layoutFetched: false,
        unsavedChanges: false,
        welcomeMessage: true,
        ui: {
          modal: {
            open: false,
            activeModule: '',
            title: '',
            args: {},
          },
          settingsPanel: {
            pos: {},
          },
          layers: {
            display: this.uipData.userPrefs.builderLayers,
          },
          sideBar: {
            activeTab: 'blocks',
          },
          strings: {
            layers: __('Layers', 'uipress-lite'),
            welcomeTitle: __('Welcome to the uiBuilder', 'uipress-lite'),
            welcomeMeta: __(
              'Brand new for UiPress 3, the uiBuilder is a powerful drag and drop tool for building great looking, functional admin experiences for yourself or your clients',
              'uipress-lite'
            ),
            browseTemplates: __('Browse premade templates or start from scratch', 'uipress-lite'),
            blankCanvas: __('Blank canvas', 'uipress-lite'),
            viewTemplates: __('View templates', 'uipress-lite'),
            dontShowAgain: __("Don't show this again", 'uipress-lite'),
            close: __('Close', 'uipress-lite'),
            deletesAllBlocks: __('Deletes all blocks', 'uipress-lite'),
            hideLayers: __('Hide layers', 'uipress-lite'),
            shortCuts: __('Block shortcuts', 'uipress-lite'),
            shortCutsExplanation: __('As you build your template, key blocks will automatically be added here for easy settings access'),
          },
          keyBlocks: [],
        },
        template: {
          copied: false,
          activePath: [],
          activePathLock: false,
          windowWidth: window.innerWidth,
          patterns: [],
          googleAnalyticsRequest: {
            range: {
              start: '',
              end: '',
            },
            fetching: false,
            data: {},
          },
          display: 'builder',

          globalSettings: {
            name: __('Draft Layout', 'uipress-lite'),
            status: false,
            rolesAndUsers: [],
            excludesRolesAndUsers: [],
            type: 'ui-template',
            options: {},
            menuIcon: {
              value: '',
            },
            code: {
              css: '',
              js: '',
            },
          },
          content: [],
        },
        switchOptions: {
          blocks: {
            value: 'blocks',
            label: __('Blocks', 'uipress-lite'),
          },
          patterns: {
            value: 'patterns',
            label: __('Patterns', 'uipress-lite'),
          },
          library: {
            value: 'library',
            label: __('Library', 'uipress-lite'),
          },
          settings: {
            value: 'settings',
            label: __('Settings', 'uipress-lite'),
          },
        },
      };
    },
    watch: {
      'ui.sideBar.activeTab': {
        handler(newValue, oldValue) {
          this.$router.push({
            query: { tab: newValue },
          });
        },
        deep: true,
      },
      '$route.params.templateID': {
        handler() {
          this.templateID = this.$route.params.templateID;
          this.getTemplate();
        },
      },
    },
    provide() {
      return {
        uiTemplate: this.returnTemplateData,
        layersPanel: this.ui.layers,
        openModal: this.openModal,
        unsavedChanges: this.returnUnsaved,
      };
    },
    mounted: function () {
      this.loading = false;
      this.getTemplate();
      let self = this;

      for (const key in self.template.layout) {
        let item = self.template.layout[key];
        self.buildOptions(item.optionsEnabled, item.settings);
      }

      let query = this.$route.query;

      if (query) {
        if (query.tab) {
          this.ui.sideBar.activeTab = query.tab;
        }
      }
    },

    computed: {
      returnTemplateData() {
        return this.template;
      },
      returnLayers() {
        return this.ui.layers;
      },
      currentRouteName() {
        return this.$route.name;
      },
      returnUnsaved() {
        return this.unsavedChanges;
      },
      returnOptionsWidth() {
        let width = parseFloat(this.uipData.userPrefs.builderOptionsWodth);
        if ((width && typeof width !== 'undefined' && width != '') || !isNaN(width)) {
          return 'width:' + width + 'px;';
        }
        return false;
      },
      getBlockshortcuts() {
        let self = this;
        self.ui.keyBlocks = [];
        self.uipress.findBYmodnameAndReturn(self.template.content, ['uip-admin-menu', 'uip-content', 'uip-toolbar', 'uip-content-navigator'], self.ui.keyBlocks);
        return self.ui.keyBlocks;
      },
    },
    methods: {
      injectSavedStyles(styles) {
        let themeStyles = this.uipData.themeStyles;
        for (let key in themeStyles) {
          let item = themeStyles[key];

          if (styles[item.name]) {
            if ('value' in styles[item.name]) {
              item.value = styles[item.name].value;
            }
            if ('darkValue' in styles[item.name]) {
              item.darkValue = styles[item.name].darkValue;
            }
          }
        }

        for (let key in styles) {
          let item = styles[key];
          if (item.user) {
            this.uipData.themeStyles[item.name] = item;
          }
        }
      },
      getTemplate() {
        let self = this;

        //Build form data for fetch request
        let formData = new FormData();
        formData.append('action', 'uip_get_ui_template');
        formData.append('security', uip_ajax.security);
        formData.append('templateID', self.templateID);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, '', 'error', true);
            return;
          }

          if (response.styles) {
            self.injectSavedStyles(response.styles);
          }

          let settings = response.settings[0];
          let content = response.content;
          //Store user patterns
          self.template.patterns = response.patterns;

          if (!content) {
            self.layoutFetched = true;
            return;
          }

          self.template.content = content;

          if (!settings) {
            if ('type' in response) {
              self.template.globalSettings.type = response.type;
            }

            self.layoutFetched = true;
            return;
          }
          //Update global settings
          if ('excludesRolesAndUsers' in settings) {
            self.template.globalSettings.excludesRolesAndUsers = settings.excludesRolesAndUsers;
          }
          if ('rolesAndUsers' in settings) {
            self.template.globalSettings.rolesAndUsers = settings.rolesAndUsers;
          }
          if ('name' in settings) {
            self.template.globalSettings.name = settings.name;
          }
          if ('status' in settings) {
            self.template.globalSettings.status = settings.status;
          }
          if ('type' in settings) {
            self.template.globalSettings.type = settings.type;
          }
          if ('excludesRolesAndUsers' in settings) {
            self.template.globalSettings.excludesRolesAndUsers = settings.excludesRolesAndUsers;
          }

          if ('applyToSubsites' in settings) {
            self.template.globalSettings.applyToSubsites = settings.applyToSubsites;
          }

          if ('options' in settings) {
            self.template.globalSettings.options = settings.options;
          }
          if ('menuParent' in settings) {
            self.template.globalSettings.menuParent = settings.menuParent;
          }
          if ('menuIcon' in settings) {
            self.template.globalSettings.menuIcon = settings.menuIcon;
          }
          self.formatBuilderGroupOptions();
          self.layoutFetched = true;
          self.unsavedChanges = false;
          return;
        });
      },
      formatBuilderGroupOptions() {
        let self = this;
        let settings = self.uipData.templateGroupOptions;
        let options = self.template.globalSettings.options;

        for (let [key, value] of Object.entries(settings)) {
          if (!(key in options)) {
            options[key] = {};
          }

          for (let option of value.settings) {
            if (!value.uniqueKey in options[key]) {
              if (option.accepts === String) {
                options[group][key] = '';
              }
              if (option.accepts === Array) {
                options[group][key] = [];
              }
              if (option.accepts === Object) {
                options[group][key] = {};
              }
            }
          }
        }
      },
      openThemeLibrary() {
        //let ID = this.$route.params.templateID;
        //this.router.push('/uibuilder/' + ID);
        this.$router.push({
          query: { tab: 'library' },
        });
        this.ui.sideBar.activeTab = 'library';
      },
      suppressWelcome() {
        this.welcomeMessage = false;
        this.uipData.userPrefs.supressBuilderWelcome = true;
        this.uipress.saveUserPreference('supressBuilderWelcome', true, false);
      },
      closeLayersPanel() {
        this.ui.layers.display = false;
        this.uipress.saveUserPreference('builderLayers', false, false);
      },
      openModal(componentName, modalTitle, args) {
        if (!componentName || componentName == '') {
          return;
        }
        this.ui.modal.activeModule = componentName;
        this.ui.modal.title = modalTitle;
        this.ui.modal.args = args;
        this.ui.modal.open = true;

        //this.setPosition();
        // You can also use Vue.$nextTick or setTimeout
        requestAnimationFrame(() => {
          document.documentElement.addEventListener('click', this.onClickOutside, false);
        });
      },
      onClickOutside(event) {
        if (!this.$refs.uipmodal) {
          return;
        }
        const path = event.path || (event.composedPath ? event.composedPath() : undefined);
        // check if the MouseClick occurs inside the component
        if (path && !path.includes(this.$refs.uipmodal) && !this.$refs.uipmodal.contains(event.target)) {
          this.closeThisComponent(); // whatever method which close your component
        }
      },
      closeThisComponent() {
        this.ui.modal.open = false; // whatever codes which close your component
        document.documentElement.removeEventListener('click', this.onClickOutside, false);
      },
      confirmEmptyTemplate() {
        let currentTem = JSON.parse(JSON.stringify(this.template.content));
        let self = this;

        this.uipress.confirm(__('Are you sure?', 'uipress-lite'), __('This will delete all blocks from your template.', 'uipress-lite')).then((response) => {
          if (response) {
            self.template.content = [];
            self.uipress.logHistoryChange(__('Template blocks deleted', 'uipress-lite'), currentTem, []);
          }
        });
      },
      componentExists(name) {
        if (this.$root._.appContext.components[name]) {
          return true;
        } else {
          return false;
        }
      },
      mouseMoveHandler(e) {
        const optionsPanel = document.getElementById('uip-builder-settings-panel');
        let change = e.clientX - this.ui.settingsPanel.pos.startX;
        optionsPanel.style.width = this.ui.settingsPanel.pos.width - change + 'px';
      },
      mouseUpHandler() {
        document.removeEventListener('mousemove', this.mouseMoveHandler, true);
        document.removeEventListener('mouseup', this.mouseUpHandler, true);
        const optionsPanel = document.getElementById('uip-builder-settings-panel');
        this.uipress.saveUserPreference('builderOptionsWodth', optionsPanel.style.width, false);
      },
      mouseDownHandler(e) {
        const optionsPanel = document.getElementById('uip-builder-settings-panel');

        this.ui.settingsPanel.pos = {
          // The current scroll
          startX: e.clientX,
          width: parseInt(optionsPanel.getBoundingClientRect().width, 10),
        };
        document.addEventListener('mousemove', this.mouseMoveHandler, true);
        document.addEventListener('mouseup', this.mouseUpHandler, true);
      },
      openSettings(uid) {
        let ID = this.$route.params.templateID;
        this.router.push('/uibuilder/' + ID + '/settings/blocks/' + uid);
      },
    },
    template: `
      <div v-if="!layoutFetched" class="uip-background-default uip-body-font uip-h-viewport uip-max-h-viewport uip-flex uip-flex-center uip-flex-middle" style="min-height: calc(100vh - 32px); max-height: calc(100vh - 32px)">
        <loading-chart></loading-chart>
      </div>
    
      <div v-if="layoutFetched" class="uip-background-default uip-body-font uip-h-viewport uip-max-h-viewport uip-flex uip-text-normal uip-app-frame uip-border-box uip-builder-frame">
      
        <div class="uip-flex uip-h-100p uip-w-100p">
        
          <!-- Preview -->
          <div class="uip-flex-grow uip-background-muted">
            <ui-preview></ui-preview>
          </div>
          <!--End preview-->
          
          <!--Layers panel -->
          <div class="uip-overflow-auto uip-padding-xs uip-scrollbar uip-border-left uip-slide-in-right uip-app-frame uip-flex-no-shrink" v-if="ui.layers.display">
          
            <div class="uip-flex uip-gap-xs uip-flex-center uip-margin-bottom-s uip-flex-between uip-padding-xs">
              <div class="uip-text-bold uip-text-l">{{ui.strings.layers}}</div>
              
              <div class="uip-flex uip-gap-xxs">
              
                <uip-tooltip :message="ui.strings.deletesAllBlocks" :delay="200">
                  <span @click="confirmEmptyTemplate()" class="uip-padding-xxxs uip-border-round hover:uip-background-grey uip-cursor-pointer uip-flex uip-flex-middle uip-flex-center uip-ratio-1-1 uip-flex-middle">
                    <span class="uip-icon uip-text-l uip-line-height-1">clear_all</span>
                  </span>
                </uip-tooltip>
                
                <uip-tooltip :message="ui.strings.hideLayers" :delay="200">
                  <span @click="ui.layers.display = false" class="uip-padding-xxxs uip-border-round hover:uip-background-grey uip-cursor-pointer uip-flex uip-flex-middle uip-flex-center uip-ratio-1-1 uip-flex-middle">
                    <span class="uip-icon uip-text-l uip-line-height-1">arrow_right_alt</span>
                  </span>
                </uip-tooltip>
                
              </div>
              
            </div>
            
            <div class="uip-w-250">
              <uip-treeview-drop-area :content="template.content" :returnData="function(data){template.content = data}" ></uip-treeview-drop-area>
              
                <div class="uip-padding-xs uip-margin-top-s uip-flex uip-flex-column uip-row-gap-xs">
                
                  <div class="uip-text-bold uip-text-m uip-flex uip-gap-xs uip-flex-center uip-flex-between">
                    {{ui.strings.shortCuts}}
                  </div>
                  
                  <div v-if="getBlockshortcuts.length < 1" class="uip-text-muted uip-text-s">
                    {{ui.strings.shortCutsExplanation}}
                  </div>
                
                </div>
                
                <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-padding-xxxs">
                  
                  <template v-for="element in getBlockshortcuts">
                    <div class="uip-flex ui-flex-middle uip-flex-center uip-gap-xxs uip-flex uip-cursor-pointer uip-flex-middle uip-flex-center uip-border-round uip-padding-xxs hover:uip-background-muted" style="min-width:140px">
                      <div class="uip-cursor-pointer uip-icon uip-padding-xxxs" @click="openSettings(element.uid)">{{element.icon}}</div>
                      <div class="uip-cursor-pointer uip-flex-grow uip-text-s" @click="openSettings(element.uid)">{{element.name}}</div>
                    </div>
                  </template>
                    
                </div>
              
            </div>
            
          </div>
          <!--End Layers panel -->
          
          
          <!--Right bar -->
          <div class="uip-panel-options uip-w-350 uip-border-left uip-app-frame uip-flex-no-shrink uip-position-relative" id="uip-builder-settings-panel" :style="returnOptionsWidth">
            <div class="uip-flex uip-flex-column uip-h-100p uip-max-h-100p">
              <template v-if="currentRouteName == 'Builder'">
              <div class="uip-padding-s uip-border-box">
                <toggle-switch :options="switchOptions" :activeValue="ui.sideBar.activeTab" :returnValue="function(data){ ui.sideBar.activeTab = data}"></toggle-switch>
              </div>
              <!-- OUTPUT SETTINGS OR BLOCKS -->
              <div class="uip-flex-grow uip-overflow-auto uip-padding-s uip-scrollbar uip-padding-top-remove">
                <builder-settings v-if="ui.sideBar.activeTab == 'settings'"></builder-settings>
                <patterns-list v-if="ui.sideBar.activeTab == 'patterns'"></patterns-list>
                <builder-blocks-list v-if="ui.sideBar.activeTab == 'blocks'"></builder-blocks-list>
                <uip-template-library v-if="ui.sideBar.activeTab == 'library'"></uip-template-library>
              </div>
              </template>
              <router-view :key="$route.path"></router-view>
            </div>
            <div @mousedown="mouseDownHandler" ref="uipPanelResize"
            class="uip-background-muted uip-border uip-border-round uip-position-absolute uip-left-0 uip-top-50p uip-w-10 uip-h-24 uip-translate-all-50p uip-cursor-drag uip-no-text-select uip-flex uip-flex-center uip-flex-middle">
              <span class="uip-icon">drag_indicator</span>
            </div>
          </div>
          <!-- End right bar -->
          
        </div>
        
	    </div>
    
      <div ref="modalOuter" v-if="ui.modal.activeModule != '' && ui.modal.open" class="uip-position-fixed uip-top-0 uip-left-0 uip-h-viewport uip-w-vw uip-background-black-wash uip-flex uip-flex-center uip-flex-middle uip-fade-in">
        <div ref="uipmodal" class="uip-background-default uip-border-round uip-border uip-flex uip-flex-column uip-row-gap-s uip-scale-in uip-min-w-350 uip-w-600 uip-max-w-100p uip-text-normal">
          <div class="uip-flex uip-flex-between  uip-padding-s">
            <div class="uip-text-bold uip-text-l">{{ui.modal.title}}</div>
            <div @click="closeThisComponent()" class="hover:uip-background-grey uip-padding-xxs uip-border-round uip-cursor-pointer">
              <div class="uip-icon uip-text-l">close</div>
            </div>
          </div>
          <div class="uip-max-h-500 uip-overflow-auto uip-scrollbar  uip-padding-s uip-padding-top-remove">
            <component :is="ui.modal.activeModule" :args="ui.modal.args"></component>
          </div>
        </div>
      </div>
  
      <!--Import plugins -->
      <template v-for="plugin in uipData.plugins" v-if="layoutFetched">
        <component v-if="componentExists(plugin.component) && plugin.loadInApp" :is="plugin.component"></component>
      </template>
      <!-- end plugin import -->
    
      <div v-if="welcomeMessage && !uipData.userPrefs.supressBuilderWelcome" class="uip-position-fixed uip-top-0 uip-left-0 uip-h-viewport uip-w-vw uip-background-black-wash uip-flex uip-flex-center uip-flex-middle uip-fade-in">
        <div class="uip-background-default uip-border-round uip-overflow-hidden uip-flex uip-flex-column uip-row-gap-xs uip-scale-in uip-min-w-350 uip-w-450">
          <div class="uip-flex uip-flex-row uip-padding-s uip-gap-s  uip-flex-center uip-background-primary uip-padding-top-m uip-padding-bottom-m">
            <div class="uip-logo-inverse uip-w-28 uip-h-28"></div>
            <div class="uip-text-xl uip-text-emphasis uip-text-bold uip-text-inverse">{{ui.strings.welcomeTitle}}!</div>
          </div>
          <div class="uip-flex uip-flex-column uip-row-gap-s uip-padding-s">
            <div class="uip-text-normal uip-text-m">{{ui.strings.welcomeMeta}}</div>
            <div class="uip-text-normal uip-text-m">{{ui.strings.browseTemplates}}</div>
            <div class="uip-flex uip-flex-row uip-gap-s uip-margin-top-xs">
              <button class="uip-button-default" @click="suppressWelcome()">{{ui.strings.dontShowAgain}}</button>
              <div class="uip-flex uip-gap-xs uip-flex-grow uip-flex-right">
                <button class="uip-button-secondary" @click="welcomeMessage = false">{{ui.strings.blankCanvas}}</button>
                <button class="uip-button-secondary" @click="welcomeMessage = false; openThemeLibrary()">{{ui.strings.viewTemplates}}</button>
              </div>
            </div>
          </div>
        </div>
      </div>`,
  };
}
