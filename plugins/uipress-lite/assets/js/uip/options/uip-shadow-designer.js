const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        loading: true,
        shadowOptions: this.value,
        strings: {
          horizDistance: __('Horizontal distance', 'uipress-lite'),
          verticalDistance: __('Vertical distance', 'uipress-lite'),
          blur: __('Blur', 'uipress-lite'),
          spread: __('Spread', 'uipress-lite'),
          shadowColour: __('Shadow colour', 'uipress-lite'),
        },
      };
    },
    inject: ['uipress'],
    watch: {
      shadowOptions: {
        handler(newValue, oldValue) {
          this.returnData(this.shadowOptions);
        },
        deep: true,
      },
    },
    mounted: function () {
      this.processInput();
    },
    computed: {
      returnShadow() {
        return this.shadowOptions;
      },
    },
    methods: {
      processInput() {
        if (!this.uipress.isObject(this.value)) {
          this.shadowOptions = {};
          this.shadowOptions.horizDistance = {};
          this.shadowOptions.horizDistance.value = '';
          this.shadowOptions.horizDistance.units = '%';

          this.shadowOptions.verticalDistance = {};
          this.shadowOptions.verticalDistance.value = '';
          this.shadowOptions.verticalDistance.units = '%';

          this.shadowOptions.blur = {};
          this.shadowOptions.blur.value = '';
          this.shadowOptions.blur.units = '%';

          this.shadowOptions.spread = {};
          this.shadowOptions.spread.value = '';
          this.shadowOptions.spread.units = '%';

          this.shadowOptions.color = {};
          this.shadowOptions.color.value = '';
          this.shadowOptions.color.type = 'solid';
        }

        this.loading = false;
      },
    },
    template:
      '<div class="uip-flex uip-flex-column uip-row-gap-s" v-if="!loading">\
        <div class="uip-grid-small uip-flex uip-flex-wrap uip-row-gap-xxs ">\
          <div class="uip-width-medium">\
            <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.horizDistance}}</div>\
            <value-units :value="returnShadow.horizDistance" :returnData="function(data){shadowOptions.horizDistance = data}"></value-units>\
          </div>\
          <div class="uip-width-medium">\
            <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.verticalDistance}}</div>\
            <value-units :value="returnShadow.verticalDistance" :returnData="function(data){shadowOptions.verticalDistance = data}"></value-units>\
          </div>\
          <div class="uip-width-medium">\
            <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.blur}}</div>\
            <value-units :value="returnShadow.blur" :returnData="function(data){shadowOptions.blur = data}"></value-units>\
          </div>\
          <div class="uip-width-medium">\
            <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.spread}}</div>\
            <value-units :value="returnShadow.spread" :returnData="function(data){shadowOptions.spread = data}"></value-units>\
          </div>\
        </div>\
        <div>\
          <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.shadowColour}}</div>\
          <color-select :value="returnShadow.color" :args="{modes: [\'solid\', \'variables\']}" :returnData="function(data){shadowOptions.color = data}"></color-select>\
        </div>\
    </div>',
  };
}
