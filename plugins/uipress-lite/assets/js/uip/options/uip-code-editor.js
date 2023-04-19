const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: String,
      args: Object,
    },
    data: function () {
      return {
        option: this.value,
        editor: Object,
        language: this.args.language,
        uniqueID: this.uipress.createUID(),
        fullScreen: false,
        strings: {
          openFullscreen: __('Fullscreen', 'uipress-lite'),
          closeFullscreen: __('Exit fullscreen', 'uipress-lite'),
        },
      };
    },
    inject: ['uipress'],
    mounted: function () {
      let self = this;
      self.editor = ace.edit(this.uniqueID);
      self.editor.setTheme('ace/theme/dracula');

      if (self.language == 'css') {
        let cssMode = ace.require('ace/mode/css').Mode;
        self.editor.session.setMode(new cssMode());
      }
      if (self.language == 'javascript') {
        let jsMode = ace.require('ace/mode/javascript').Mode;
        self.editor.session.setMode(new jsMode());
      }
      if (self.language == 'html') {
        let jsMode = ace.require('ace/mode/html').Mode;
        self.editor.session.setMode('ace/mode/html');
      }

      self.editor.setValue(self.option, -1);

      self.editor.session.on('change', function (delta) {
        let val = self.editor.getValue();
        self.returnData(val);
      });
    },
    watch: {
      option: {
        handler(newValue, oldValue) {
          this.returnData(this.option);
        },
        deep: true,
      },
    },
    methods: {
      returnFullscreenClass() {
        let self = this;

        if (self.fullScreen) {
          return 'uip-position-fixed uip-top-0 uip-bottom-0 uip-left-0 uip-right-0 uip-z-index-9999';
        }
      },
    },
    template: `
    
    <div class="uip-flex uip-flex-column" :class="returnFullscreenClass()">
    
      <component is="style" v-if="fullScreen">
        .ace_print-margin{left:auto !important;right:0 !important;}
      </component>
      
      <div class="uip-padding-xxxs uip-flex uip-flex-row uip-background-muted uip-dark-mode uip-flex-center uip-flex-right" style="border-radius:4px 4px 0 0">
      
        <div v-if="!fullScreen" class="uip-link-default uip-flex uip-gap-xxxs uip-flex-center" @click="fullScreen = !fullScreen">
          <div class="uip-text-xs">{{strings.openFullscreen}}</div>
          <div class="uip-icon">open_in_full</div>
        </div>
        
        <div v-if="fullScreen" class="uip-link-default uip-flex uip-gap-xxxs uip-flex-center" @click="fullScreen = !fullScreen">
          <div class="uip-text-xs">{{strings.closeFullscreen}}</div>
          <div class="uip-icon">close_fullscreen</div>
        </div>
        
      </div>
      <div class="uip-min-w-200 uip-min-h-200 uip-w-100p uip-scrollbar uip-flex-grow" style="border-radius:0 0 4px 4px" :id="uniqueID">
      </div>
    </div>
    
    `,
  };
}
