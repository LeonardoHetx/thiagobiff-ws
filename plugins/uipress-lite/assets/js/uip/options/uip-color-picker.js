const { __, _x, _n, _nx } = wp.i18n;
import '../../libs/uip-color-picker.min.js';
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: String,
    },
    data: function () {
      return {
        open: false,
        colour: this.value,
        manualColorInput: this.value,
        pickerObject: '',
        strings: {
          colorValue: __('Colour value', 'uipress-lite'),
          colourCode: __('Colour code', 'uipress-lite'),
        },
      };
    },
    inject: ['uipData'],
    watch: {
      manualColorInput: {
        handler(newValue, Oldvalue) {
          this.color = newValue;
          this.pickerObject.color.set(newValue);
        },
      },
    },
    mounted: function () {},
    computed: {},
    methods: {
      mountPicker() {
        let picker = this.$el.getElementsByClassName('uip-color-picker')[0];
        let self = this;

        let startColor = this.value;

        let colorPicker = new iro.ColorPicker(picker, {
          // Set the size of the color picker
          width: 200,
          margin: 5,
          padding: 0,
          color: startColor,
          handleSvg: '#uip-color-handle',
          layout: [
            {
              component: iro.ui.Box,
            },
            {
              component: iro.ui.Slider,
              options: {
                id: 'hue-slider',
                sliderType: 'hue',
                width: 180,
              },
            },
            {
              component: iro.ui.Slider,
              options: {
                sliderType: 'alpha',
                width: 180,
              },
            },
          ],
        });

        self.pickerObject = colorPicker;
        colorPicker.on('color:change', function (color) {
          self.colour = color.rgbaString;
          self.manualColorInput = self.colour;
          self.returnData(self.colour);
        });
      },
    },
    template:
      '<drop-down :onOpen="mountPicker">\
          <template v-slot:trigger>\
              <slot name="trigger"></slot>\
          </template>\
          <template v-slot:content>\
            <div class="uip-margin-bottom-xs">\
                <div class="uip-color-picker"></div>\
            </div>\
            <div class="uip-flex uip-flex-row uip-gap-xs uip-padding-xs uip-flex-start">\
              <div class="uip-flex uip-flex-column uip-flex-grow">\
                <div class="uip-text-xs">{{strings.colourCode}}</div>\
                <input type="text" class="uip-input uip-input-small uip-blank-input uip-text-bold uip-w-100p uip-text-muted" :placeholder="strings.colorValue" v-model="manualColorInput">\
              </div>\
              <div class="uip-border-round uip-border uip-w-28 uip-ratio-1-1" :style="\'background-color:\' + colour">\
              </div>\
            </div>\
            <svg style="display:none">\
              <defs>\
                <g id="uip-color-handle">\
                  <circle cx="8" cy="8" r="8" fill="rgba(0,0,0,0)" stroke-width="2" stroke="#fff"></circle>\
                </g>\
              </defs>\
            </svg>\
          </template>\
      </drop-down>',
  };
}
