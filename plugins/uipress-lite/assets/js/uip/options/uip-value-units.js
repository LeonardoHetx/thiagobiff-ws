export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        option: this.value,
        focus: false,
      };
    },
    inject: ['uipress'],
    watch: {
      option: {
        handler(newValue, oldValue) {
          this.returnData(this.option);
        },
        deep: true,
      },
    },
    mounted: function () {
      //this.returnValue(this.value);
    },
    computed: {
      returnOption() {
        return this.option;
      },
    },
    methods: {
      returnValue(item) {
        if (typeof item !== 'undefined') {
          if (this.uipress.isObject(item)) {
            this.option.value = item.value;
            this.option.units = item.units;
          }
        }
      },
    },
    template:
      '\
    <div class="uip-flex uip-border uip-border-round uip-padding-left-xxs uip-flex-content-stretch" :class="{\'uip-active-outline\' : focus}">\
      <input @focus="focus = true" @blur="focus = false" style="width:30px" type="number" class="uip-input-small uip-blank-input uip-remove-steps uip-background-remove uip-padding-xxxs uip-flex-grow" v-model="option.value">\
      <units-select :value="returnOption.units" :returnData="function(e){option.units = e}"></units-select>\
    </div>',
  };
}
