const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      display: String,
      name: String,
      block: Object,
    },
    data: function () {
      return {};
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    watch: {},
    computed: {
      returnText() {
        let item = this.uipress.get_block_option(this.block, 'block', 'headingText', true);
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
    },
    methods: {
      returnIconPos() {
        if (this.block.settings.block.options.iconPosition.value) {
          if (this.block.settings.block.options.iconPosition.value.value == 'right') {
            return 'uip-flex-reverse';
          }
        }
      },
      returnClasses() {
        let classes = '';

        let advanced = this.uipress.get_block_option(this.block, 'advanced', 'classes');
        classes += advanced;
        return classes;
      },
    },
    template:
      '\
        <div :id="block.uid" :class="returnClasses()">\
          <accordion :openOnTick="false">\
            <template v-slot:title>\
              <div class="uip-flex-grow uip-flex uip-gap-xxs uip-flex-center">\
                <div class="uip-icon" v-if="block.settings.block.options.iconSelect.value.value">{{block.settings.block.options.iconSelect.value.value}}</div>\
                <div class="uip-">{{returnText}}</div>\
              </div>\
            </template>\
            <template v-slot:content>\
              <uip-content-area :dropAreaStyle="uipress.explodeBlockSettings(block.settings.contentAlign.options, \'style\', uipData.templateDarkMode)"\
              :content="block.content" :returnData="function(data) {block.content = data} "></uip-content-area>\
            </template>\
          </accordion>\
        </div>',
  };
}
