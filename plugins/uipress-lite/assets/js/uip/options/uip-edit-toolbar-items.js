const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        toolbar: this.uipData.toolbar,
        selected: this.formatInput(),
        strings: {
          renameItem: __('Rename item', 'uipress-lite'),
        },
      };
    },
    inject: ['uipData', 'uipress'],
    watch: {
      selected: {
        handler(newValue, oldValue) {
          this.returnData(this.selected);
        },
        deep: true,
      },
    },
    computed: {},
    mounted: function () {
      console.log(this.value);
    },
    methods: {
      formatInput() {
        console.log(this.value);
        if (this.uipress.isObject(this.value)) {
          this.selected = this.value;
          return this.selected;
        } else {
          this.value = {};
          return this.selected;
        }
      },
      returnIcon(id) {
        if (!this.uipress.isObject(this.selected)) {
          this.selected[id] = {};
          this.selected[id].icon = '';
          this.selected[id].title = '';
          return '';
        }
        if (id in this.selected) {
          return this.selected[id].icon;
        } else {
          this.selected[id] = {};
          this.selected[id].icon = '';
          this.selected[id].title = '';
          return '';
        }
      },
      returnTitle(id) {
        if (!this.uipress.isObject(this.selected)) {
          this.selected[id] = {};
          this.selected[id].icon = '';
          this.selected[id].title = '';
          return '';
        }
        if (id in this.selected) {
          return this.selected[id].title;
        } else {
          this.selected[id] = {};
          this.selected[id].icon = '';
          this.selected[id].title = '';
          return '';
        }
      },
    },
    template: `
    <div class="uip-flex uip-flex-column uip-row-gap-xs">
        <template v-for="item in toolbar">
          <div class="uip-text-muted">{{item.id}}</div>
          <div class="uip-flex uip-flex-row uip-gap-xs">
            
            <inline-icon-select :value="{value:returnIcon(item.id)}" :returnData="function (data) {selected[item.id].icon = data.value}">
              <template v-slot:trigger>
                <div class="uip-icon uip-text-l uip-padding-xxxs uip-border-round uip-border uip-w-16 uip-ratio-1-1">{{returnIcon(item.id)}}</div>
              </template>
            </inline-icon-select>
            
            
            <uip-input :value="returnTitle(item.id)" :returnData="function (data) {selected[item.id].title = data}" :placeHolder="strings.renameItem"></uip-input>
          </div>
        </template>
	  </div>`,
  };
}
