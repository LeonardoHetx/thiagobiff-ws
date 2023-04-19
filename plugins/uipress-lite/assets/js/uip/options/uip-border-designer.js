const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        borderOptions: this.formatValue(this.value),
        strings: {
          radius: __('Radius', 'uipress-lite'),
          topleft: __('Top left', 'uipress-lite'),
          topright: __('Top right', 'uipress-lite'),
          bottomleft: __('Bottom left', 'uipress-lite'),
          bottomright: __('Bottom right', 'uipress-lite'),
          colour: __('Colour', 'uipress-lite'),
          style: __('Style', 'uipress-lite'),
          width: __('Width', 'uipress-lite'),
          position: __('Position', 'uipress-lite'),
        },
        borderPositions: {
          solid: {
            icon: 'border_outer',
            name: 'solid',
          },
          left: {
            icon: 'border_left',
            name: 'left',
          },
          top: {
            icon: 'border_top',
            name: 'top',
          },
          right: {
            icon: 'border_right',
            name: 'right',
          },
          bottom: {
            icon: 'border_bottom',
            name: 'bottom',
          },
        },
        borderTypes: [
          {
            label: __('Solid', 'uipress-lite'),
            value: 'solid',
          },
          {
            label: __('Dashed', 'uipress-lite'),
            value: 'dashed',
          },
          {
            label: __('Dotted', 'uipress-lite'),
            value: 'dotted',
          },
          {
            label: __('Double', 'uipress-lite'),
            value: 'double',
          },
          {
            label: __('Groove', 'uipress-lite'),
            value: 'groove',
          },
          {
            label: __('Ridge', 'uipress-lite'),
            value: 'ridge',
          },
          {
            label: __('Inset', 'uipress-lite'),
            value: 'inset',
          },
        ],
      };
    },
    inject: ['uipress'],
    watch: {
      borderOptions: {
        handler(newValue, oldValue) {
          let self = this;
          self.returnData(newValue);
        },
        deep: true,
      },
      'borderOptions.radius.value.topleft': {
        handler(newValue, oldValue) {
          if (this.borderOptions.radius.value.sync) {
            this.borderOptions.radius.value.topright = this.borderOptions.radius.value.topleft;
            this.borderOptions.radius.value.bottomleft = this.borderOptions.radius.value.topleft;
            this.borderOptions.radius.value.bottomright = this.borderOptions.radius.value.topleft;
          }
        },
        deep: true,
      },
    },
    methods: {
      createOptionObject() {
        return {
          width: {
            value: '',
            units: 'px',
          },
          style: 'solid',
          color: {
            type: 'solid',
            value: '',
          },
          position: 'solid',
          radius: {
            value: {
              sync: true,
              topleft: '',
              topright: '',
              bottomleft: '',
              bottomright: '',
              units: 'px',
            },
          },
        };
      },
      formatValue(value) {
        let self = this;
        if (!self.uipress.isObject(value) || typeof value === 'undefined') {
          value = self.createOptionObject();
          return value;
        }

        if ('width' in value && 'color' in value && 'radius' in value) {
          return value;
        } else {
          value = self.createOptionObject();
          return value;
        }
      },
    },
    template: `<div class="uip-flex uip-flex-column uip-row-gap-xs">
    
      
        <div class="uip-flex uip-flex-column uip-flex-start" >
          <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs uip-flex-grow">{{strings.position}}</div>
          <div class="uip-flex uip-background-muted uip-text-l uip-padding-xxxs uip-border-round">
            <template v-for="option in borderPositions">
              <div class="uip-link-muted uip-padding-xxs uip-border-round" :class="{'uip-background-default uip-text-emphasis' : option.name == borderOptions.position}" 
              @click="borderOptions.position = option.name">
                <div class="uip-icon uip-text-l uip-icon-medium uip-line-height-1" style="font-size:22px;">{{option.icon}}</div>
              </div>
            </template>
          </div>
        </div>
    
        <div class="uip-gap-m uip-row-gap-s uip-grid-col-2">
         
            <div class="uip-flex uip-flex-column">
              <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.style}}</div>
              <div clas="uip-flex-grow">
                <default-select :value="borderOptions.style" :returnData="function(e){borderOptions.style = e}" :args="{options: borderTypes}"></default-select>
              </div>
            </div>
          
            <div>
              <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.colour}}</div>
              <color-select :value="borderOptions.color" :args="{modes: ['solid', 'variables']}" :returnData="function(data){borderOptions.color = data}"></color-select>
            </div>
          
            <div class="uip-flex uip-gap-xs">
              <div class="">
                <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.width}}</div>
                <value-units :value="borderOptions.width" :returnData="function(data){borderOptions.width = data}"></value-units>
              </div>
            </div>
        
        </div>
        
          <div>
            <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.radius}}</div>
            <div class="uip-flex uip-flex-row uip-gap-xxxs">
              <div class="uip-flex uip-flex-row uip-padding-xxxs uip-background-muted uip-border-round">
                <div class="uip-icon uip-icon-m uip-text-xl uip-link-muted  uip-border-round" @click="borderOptions.radius.value.sync = true"
                :class="{'uip-background-default uip-text-emphasis' : borderOptions.radius.value.sync}">crop_square</div>
                <div class="uip-icon uip-icon-m uip-text-xl uip-link-muted  uip-border-round" @click="borderOptions.radius.value.sync = false"
                :class="{'uip-background-default uip-text-emphasis' : !borderOptions.radius.value.sync}">crop_free</div>
              </div>
            
              <div class="uip-flex uip-flex-row uip-padding-xxs uip-background-muted uip-border-round uip-text-center" v-if="borderOptions.radius.value.sync">
                  <input class="uip-blank-input uip-text-center uip-w-60 uip-text-s" v-model="borderOptions.radius.value.topleft" >
              </div>
            
            <template v-if="!borderOptions.radius.value.sync">
          
              <uip-tooltip :message="strings.topleft" :delay="0" containerClass="uip-flex">
                <div class="uip-flex uip-flex-row uip-padding-xxs uip-background-muted uip-border-round uip-text-center">
                    <input class="uip-blank-input uip-text-center uip-w-28 uip-text-s" v-model="borderOptions.radius.value.topleft" >
                </div>
              </uip-tooltip>
            
              <uip-tooltip :message="strings.topright" :delay="0" containerClass="uip-flex">
                <div class="uip-flex uip-flex-row uip-padding-xxs uip-background-muted uip-border-round uip-text-center">
                    <input class="uip-blank-input uip-text-center uip-w-28 uip-text-s" v-model="borderOptions.radius.value.topright" >
                </div>
              </uip-tooltip>
              
              <uip-tooltip :message="strings.bottomleft" :delay="0" containerClass="uip-flex">
                <div class="uip-flex uip-flex-row uip-padding-xxs uip-background-muted uip-border-round uip-text-center">
                    <input class="uip-blank-input uip-text-center uip-w-28 uip-text-s" v-model="borderOptions.radius.value.bottomleft" >
                </div>
              </uip-tooltip>
              
              <uip-tooltip :message="strings.bottomright" :delay="0" containerClass="uip-flex">
                <div class="uip-flex uip-flex-row uip-padding-xxs uip-background-muted uip-border-round uip-text-center" >
                    <input class="uip-blank-input uip-text-center uip-w-28 uip-text-s" v-model="borderOptions.radius.value.bottomright" >
                </div>
              </uip-tooltip>
            </template>
          
          
              <div class="uip-background-muted uip-border-round">
               <units-select :value="borderOptions.radius.value.units" :returnData="function(e){borderOptions.radius.value.units = e}"></units-select>
              </div>
            
            </div>
          
        </div>
    </div>`,
  };
}
