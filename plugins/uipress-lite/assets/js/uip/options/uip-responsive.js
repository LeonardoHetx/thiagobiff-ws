const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    inject: ['uipress'],
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        option: this.formatValue(this.value),
        strings: {
          mobile: __('Mobile', 'uipress-lite'),
          tablet: __('Tablet', 'uipress-lite'),
          desktop: __('Desktop', 'uipress-lite'),
        },
      };
    },
    watch: {
      option: {
        handler(newValue, oldValue) {
          let responsiveSet = {};
          if (newValue.mobile) {
            responsiveSet.mobile = true;
          }
          if (newValue.tablet) {
            responsiveSet.tablet = true;
          }
          if (newValue.desktop) {
            responsiveSet.desktop = true;
          }
          this.returnData(responsiveSet);
        },
        deep: true,
      },
    },
    methods: {
      formatValue(value) {
        if (this.uipress.isObject(value)) {
          if (!('mobile' in value)) {
            value.mobie = false;
          }
          if (!('tablet' in value)) {
            value.tablet = false;
          }
          if (!('desktop' in value)) {
            value.desktop = false;
          }
        } else {
          value = {};
          value.mobile = false;
          value.tablet = false;
          value.desktop = false;
        }

        return value;
      },
    },
    template:
      '<div class="uip-flex uip-flex-column uip-row-gap-xs">\
          <div class="uip-flex uip-flex-row uip-flex-between">\
            <div class="uip-flex uip-gap-xxs uip-flex-center">\
              <div class="uip-icon uip-icon-medium">smartphone</div>\
              <div class="">{{strings.mobile}}</div>\
            </div>\
            <switch-select :value="option.mobile" :returnData="function(data){ option.mobile = data }"></switch-select>\
          </div>\
          <div class="uip-flex uip-flex-row uip-flex-between">\
            <div class="uip-flex uip-gap-xxs uip-flex-center">\
              <div class="uip-icon uip-icon-medium">tablet</div>\
              <div class="">{{strings.tablet}}</div>\
            </div>\
            <switch-select :value="option.tablet" :returnData="function(data){ option.tablet = data }"></switch-select>\
          </div>\
          <div class="uip-flex uip-flex-row uip-flex-between">\
            <div class="uip-flex uip-gap-xxs uip-flex-center">\
              <div class="uip-icon uip-icon-medium">desktop_windows</div>\
              <div class="">{{strings.desktop}}</div>\
            </div>\
            <switch-select :value="option.desktop" :returnData="function(data){ option.desktop = data }"></switch-select>\
          </div>\
    </div>',
  };
}
