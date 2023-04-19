const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      display: String,
      name: String,
      block: Object,
      contextualData: Object,
    },
    data: function () {
      return {
        icon: 'view_week',
      };
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    watch: {
      'block.settings.block.options': {
        handler(newValue, oldValue) {},
        deep: true,
      },
    },
    mounted: function () {},
    computed: {},
    methods: {
      returnClasses() {
        let classes = '';

        let advanced = this.uipress.get_block_option(this.block, 'advanced', 'classes');
        classes += advanced;
        return classes;
      },
    },
    template:
      '<div class="uip-flex uip-min-w-20 uip-min-h-20" :class="returnClasses()">\
                <uip-content-area :contextualData="contextualData" :dropAreaStyle="uipress.explodeBlockSettings(block.settings.block.options, \'style\', uipData.templateDarkMode)"\
                :content="block.content" :returnData="function(data) {block.content = data} " layout="vertical" ></uip-content-area>\
          </div>',
  };
}
