const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      display: String,
      name: String,
      block: Object,
    },
    data: function () {
      return {
        loading: true,
        dynamics: this.uipData.dynamicOptions,
      };
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    watch: {},
    mounted: function () {},
    computed: {
      returnText() {
        let item = this.uipress.get_block_option(this.block, 'block', 'buttonText', true);
        if (!item) {
          return '';
        }
        if (this.uipress.isObject(item)) {
          if ('string' in item) {
            return item.string;
          } else {
            return '';
          }
        }
        return item;
      },
      getLink() {
        let src = this.uipress.get_block_option(this.block, 'block', 'linkSelect', true);
        return src;
      },
      getOnClickCode() {
        let code = this.uipress.get_block_option(this.block, 'block', 'onClickCode');
        return code;
      },
      getIcon() {
        let icon = this.uipress.get_block_option(this.block, 'block', 'iconSelect');
        if (!icon) {
          return '';
        }
        if ('value' in icon) {
          return icon.value;
        }
        return icon;
      },
    },
    methods: {
      returnClasses() {
        let classes = '';

        let posis = this.uipress.get_block_option(this.block, 'block', 'iconPosition');
        if (posis) {
          if (posis.value == 'right') {
            classes += 'uip-flex-reverse';
          }
        }
        let advanced = this.uipress.get_block_option(this.block, 'advanced', 'classes');
        classes += advanced;
        return classes;
      },
      followLink() {
        let url = false;
        let item = false;
        let src = this.uipress.get_block_option(this.block, 'block', 'linkSelect', true);
        let srcOBJ = this.uipress.get_block_option(this.block, 'block', 'linkSelect');

        if (!src) {
          return;
        }
        if (this.uipress.isObject(src)) {
          if ('value' in src) {
            url = src.value;
          }
        } else {
          url = src;
        }

        if (!url || url == '') {
          return;
        }

        let newTab;
        if (!this.uipress.isObject(srcOBJ)) {
          newTab = 'dynamic';
        } else {
          newTab = srcOBJ.newTab;
        }
        if (newTab == 'dynamic') {
          this.uipress.updatePage(url);
        }
        if (newTab == 'default') {
          window.location.replace(url);
        }
        if (newTab == 'newTab') {
          let clicker = this.$refs.newTab;
          clicker.href = url;
          clicker.click();

          document.getElementById;
        }
      },
      buildOnClick() {
        let textString = '';
        textString += 'document.getElementById("' + this.block.uid + '").addEventListener("click", function(){';
        textString += this.getOnClickCode;
        textString += '});';

        return textString;
      },
    },
    template: `<!--builder mode-->
          <button class="uip-button-default uip-flex uip-gap-xxs uip-flex-center"
          :class="returnClasses()" :id="block.uid" @click="followLink();">
            <span class="uip-icon" v-if="getIcon">{{getIcon}}</span>
            <span class="uip-flex-grow" v-if="returnText != ''">{{returnText}}</span>
            <a ref="newTab" target="_BLANK" class="uip-hidden"></a>
            
            <component v-if="getOnClickCode" is="script" scoped>
            
              {{buildOnClick()}}
            
            </component>
            
          </button>
          

          `,
  };
}
