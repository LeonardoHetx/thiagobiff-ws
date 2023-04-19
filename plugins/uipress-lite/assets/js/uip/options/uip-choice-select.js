export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
      args: Object,
    },
    data: function () {
      return {
        option: {},
      };
    },
    watch: {
      option: {
        handler(newValue, oldValue) {
          this.returnData(this.option);
        },
        deep: true,
      },
    },
    inject: ['uipress'],
    mounted: function () {
      this.formatInput(this.value);
    },
    methods: {
      formatInput(value) {
        if (typeof value === 'undefined') {
          this.option.value = 'left';
          return this.option;
        }
        if (this.uipress.isObject(value)) {
          if (!('value' in value)) {
            this.option.value = 'left';
            return;
          } else {
            this.option = value;
            return;
          }
        } else {
          this.option.value = 'left';
          return;
        }
      },
    },
    template: '<div class="uip-flex">\
      <toggle-switch :options="args.options" :activeValue="option.value" :returnValue="function(data){ option.value = data}"></toggle-switch>\
    </div>',
  };
}
