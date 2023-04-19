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
        breadCrumbs: [],
      };
    },
    inject: ['uipress'],
    watch: {},
    mounted: function () {
      let self = this;
      document.addEventListener(
        'uip_breadcrumbs_change',
        (e) => {
          self.breadCrumbs = e.detail.crumbs;
        },
        { once: false }
      );
    },
    computed: {},
    methods: {
      getIcon() {
        let icon = this.uipress.get_block_option(this.block, 'block', 'breadIcon');
        if (!icon) {
          return 'chevron_right';
        }
        if ('value' in icon) {
          return icon.value;
        }
        return icon;
      },
      returnClasses() {
        let classes = '';

        let advanced = this.uipress.get_block_option(this.block, 'advanced', 'classes');
        classes += advanced;
        return classes;
      },
    },
    template: `
        <div :class="returnClasses()" :id="block.uid" class="uip-flex uip-gap-xxxs uip-text-xs uip-flex-middle uip-text-muted">
        
            <template v-for="(item, index) in breadCrumbs">
              <div @click="uipress.updatePage(item.url)" class="hover:uip-color-epmhasis uip-cursor-pointer uip-crumb" v-html="item.name"></div>
              <div class="uip-icon uip-crumb-icon" v-if="index < breadCrumbs.length - 1">{{getIcon()}}</div>
            </template>
            
        </div>`,
  };
}
