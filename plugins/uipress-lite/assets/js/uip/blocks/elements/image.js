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
        placeHolder:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150' viewBox='0 0 300 150'%3E%3Crect fill='%23ddd' width='300' height='150'/%3E%3Ctext fill='rgba(0,0,0,0.5)' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E300×150%3C/text%3E%3C/svg%3E",
      };
    },
    inject: ['uipress'],
    watch: {},
    mounted: function () {},
    computed: {
      returnImg() {
        let item = this.uipress.get_block_option(this.block, 'block', 'userImage', true);
        if (!item) {
          return this.placeHolder;
        }
        if (this.uipress.isObject(item)) {
          if ('url' in item) {
            return item.url;
          } else {
            return this.placeHolder;
          }
        }
        return item;
      },
    },
    methods: {
      returnClasses() {
        let classes = '';
        let advanced = this.uipress.get_block_option(this.block, 'advanced', 'classes');
        classes += advanced;
        return classes;
      },
    },
    template: '\
         <img :class="returnClasses()" class="uip-w-80" :id="block.uid" :src="returnImg">',
  };
}
