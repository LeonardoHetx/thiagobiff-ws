export function moduleData() {
  return {
    props: {},
    inject: ['uipData', 'router', 'uipress'],
    data: function () {
      return {
        template: {
          display: 'prod',
          settings: this.formatTemplate(uipUserTemplate.settings),
          content: this.formatTemplate(uipUserTemplate.content),
          globalSettings: this.formatTemplate(uipUserTemplate.settings),
          updated: this.formatTemplate(uipUserTemplate.updated),
          id: uipUserTemplate.id,
          styles: uipUserStyles,
        },
        loading: true,
        updateAvailable: false,
      };
    },
    provide() {
      return {
        uiTemplate: this.template,
      };
    },
    mounted: function () {
      let self = this;

      setTimeout(function () {
        self.loading = false;
      }, 400);
      if (this.template.globalSettings.type == 'ui-template') {
        setInterval(function () {
          self.checkForUpdates();
        }, 60000);
      }
    },
    computed: {
      returnTemplateJS() {
        if (typeof this.template.globalSettings.options === 'undefined') {
          return;
        }
        if ('advanced' in this.template.globalSettings.options) {
          if ('js' in this.template.globalSettings.options.advanced) {
            return this.template.globalSettings.options.advanced.js;
          }
        }
      },
      returnTemplateCSS() {
        if (typeof this.template.globalSettings.options === 'undefined') {
          return;
        }
        if ('advanced' in this.template.globalSettings.options) {
          if ('css' in this.template.globalSettings.options.advanced) {
            return this.template.globalSettings.options.advanced.css;
          }
        }
      },
    },
    methods: {
      checkForUpdates() {
        let self = this;

        if (this.updateAvailable) {
          return;
        }

        let formData = new FormData();
        formData.append('action', 'uip_check_for_template_updates');
        formData.append('security', uip_ajax.security);
        formData.append('template_id', self.template.id);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            //self.uipress.notify(response.message, 'uipress-lite', '', 'error', true);
            //self.saving = false;
          }
          if (response.success) {
            if (response.updated > self.template.updated) {
              this.updateAvailable = true;
              self.updateNotification();
              return;
            }
          }
        });
      },
      updateNotification() {
        let string = __('Changes have been made to your current app. Refresh the page to update', 'uipress-lite');
        let update = __('Update', 'uipress-lite');

        let message = `
        <div class="uip-margin-bottom-s">${string}</div>
        <button class="uip-button-primary" type='button' onclick="location.reload()">${update}</button>
        `;

        this.uipress.notify(__('Update available', 'uipress-lite'), message, '', false);
      },
      formatTemplate(template) {
        return this.uipress.uipParsJson(JSON.stringify(template));
      },
      componentExists(name) {
        if (this.$root._.appContext.components[name]) {
          return true;
        } else {
          return false;
        }
      },
    },
    template: `
    <component is="style" scoped >
    .uip-user-frame:not(.uip-app-frame){
    <template v-for="(item, index) in template.styles">
      <template v-if="item.value">{{index}}:{{item.value}};</template>
    </template>
    }
    [data-theme="dark"] :not(.uip-app-frame) *{
    <template v-for="(item, index) in template.styles">
      <template v-if="item.darkValue"> {{index}}:{{item.darkValue}};</template>
    </template>
    }
    {{returnTemplateCSS}}
    </component>
    <component is="script" scoped>
      {{returnTemplateJS}}
    </component>
    
    <uip-content-area :content="template.content" 
    :returnData="function(data) {template.content = data} " v-if="!loading">
    </uip-content-area>
    
    <div v-if="loading" class="uip-flex uip-flex-center uip-flex-middle uip-w-100p uip-h-100p"><loading-chart></loading-chart></div>
    
    <!--Import plugins -->
    <template v-for="plugin in uipData.plugins">
      <component v-if="componentExists(plugin.component) && plugin.loadInApp"
      :is="plugin.component">
      </component>
    </template>
    <!-- end plugin import -->`,
  };
}
