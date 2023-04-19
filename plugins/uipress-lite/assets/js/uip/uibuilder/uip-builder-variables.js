const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {},
    data: function () {
      return {
        loading: true,
        ui: {
          mode: 'light',
          search: '',
          strings: {
            theme: __('Theme', 'uipress'),
            add: __('Add', 'uipress'),
            variableLabel: __('Variable label', 'uipress'),
            variableName: __('Variable name', 'uipress'),
            deleteVariable: __('Delete variable', 'uipress'),
            custom: __('custom', 'uipress-lite'),
            revertStyle: __('Revert style back to default', 'uipress-lite'),
            searchVariables: __('Search variables...', 'uipress-lite'),
            new: __('New variable', 'uipress-lite'),
          },
          switchOptions: {
            light: {
              value: 'light',
              label: __('Light', 'uipress-lite'),
            },
            dark: {
              value: 'dark',
              label: __('Dark', 'uipress-lite'),
            },
          },
          varTypeSelected: 'color',
          varTypes: {
            color: {
              value: 'color',
              label: __('Colour', 'uipress-lite'),
            },
            units: {
              value: 'units',
              label: __('Units', 'uipress-lite'),
            },
            font: {
              value: 'font',
              label: __('Font', 'uipress-lite'),
            },
          },
          fonts: [
            {
              value: 'Arial, Helvetica, sans-serif',
              label: __('Arial / Helvetica', 'uipress-lite'),
            },
            {
              value: 'Times New Roman, Times, serif',
              label: __('Times New Roman', 'uipress-lite'),
            },
            {
              value: 'Courier New / Courier, Monospace',
              label: __('Courier New', 'uipress-lite'),
            },
            {
              value: 'Tahoma, sans-serif',
              label: __('Tahoma', 'uipress-lite'),
            },
            {
              value: 'Trebuchet MS, sans-serif',
              label: __('Trebuchet MS', 'uipress-lite'),
            },
            {
              value: 'Verdana, sans-serif',
              label: __('Verdana', 'uipress-lite'),
            },
            {
              value: 'Georgia, serif',
              label: __('Georgia', 'uipress-lite'),
            },
            {
              value: 'Garamond, serif',
              label: __('Garamond', 'uipress-lite'),
            },
            {
              value: 'Arial Black, sans-serif',
              label: __('Arial Black', 'uipress-lite'),
            },
            {
              value: 'Impact, sans-serif',
              label: __('Impact', 'uipress-lite'),
            },
            {
              value: 'Brush Script MT, cursive',
              label: __('Brush Script MT', 'uipress-lite'),
            },
            {
              value: 'Material Symbols Rounded',
              label: __('UiPress icons', 'uipress-lite'),
            },
            {
              value: 'inherit',
              label: __('Inherit', 'uipress-lite'),
            },
          ],
        },

        newVariable: {
          label: '',
          var: '',
          type: 'color',
        },
      };
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    watch: {
      'newVariable.var': {
        handler(newValue, oldValue) {
          if (newValue && newValue.length > 2) {
            let firstTwo = newValue.slice(0, 2);
            let first = newValue.slice(0, 2);
            let ammended = '';

            if (firstTwo != '--') {
              if (first != '-') {
                ammended = '--' + newValue;
              } else {
                ammended = '-' + newValue;
              }
            } else {
              ammended = newValue;
            }
            ammended = ammended.replace(' ', '-');

            this.newVariable.var = ammended;
          }
        },
        deep: true,
      },
    },
    mounted: function () {
      if (this.uipData.userPrefs.darkTheme) {
        this.ui.mode = 'dark';
      }
    },
    computed: {},
    methods: {
      returnVar(item) {
        if (this.ui.mode == 'light') {
          return item.value;
        } else {
          return item.darkValue;
        }
      },
      splitUnitVal(item) {
        let val = false;
        if (this.ui.mode == 'light') {
          val = item.value;
        } else {
          val = item.darkValue;
        }

        if (!val || val == '') {
          return { units: 'px', value: '' };
        }

        let num = val.replace(/\D/g, '');
        if (num == '') {
          return { units: 'px', value: '' };
        }

        let parts = val.split(num);
        let units = parts[1];
        return { value: num, units: units };
      },
      setVar(data, item) {
        if (this.ui.mode == 'light') {
          item.value = data;
        } else {
          item.darkValue = data;
        }
      },
      setUnitVal(data, item) {
        if (this.ui.mode == 'light') {
          item.value = data.value + data.units;
        } else {
          item.darkValue = data.value + data.units;
        }
      },
      clearVar(item) {
        if (this.ui.mode == 'light') {
          delete item.value;
        } else {
          delete item.darkValue;
        }
      },
      deleteVar(item, key) {
        delete this.uipData.themeStyles[key];
        this.uipress.notify(__('Variable deleted', 'uipress-lite'), '', 'success', true);
      },
      createVariable() {
        if (this.newVariable.label == '') {
          this.uipress.notify(__('Variable label is required', 'uipress-lite'), '', 'error', true);
          return;
        }
        if (this.newVariable.var == '') {
          this.uipress.notify(__('Variable name is required', 'uipress-lite'), '', 'error', true);
          return;
        }
        console.log(this.newVariable.type);
        let style = {
          label: this.newVariable.label,
          darkValue: '',
          value: '',
          type: this.newVariable.type,
          name: this.newVariable.var,
          user: true,
        };

        this.uipData.themeStyles[this.newVariable.var] = style;
        this.uipress.notify(__('Variable created!', 'uipress-lite'), '', 'success', true);

        this.newVariable.label = '';
        this.newVariable.var = '';
      },
      customSet(style) {
        if (this.ui.mode == 'light') {
          if (style.value) {
            return true;
          }
        }
        if (this.ui.mode == 'dark') {
          if (style.darkValue) {
            return true;
          }
        }
        return false;
      },
      inSearch(variable) {
        if (this.ui.search == '') {
          return true;
        }
        let str = this.ui.search.toLowerCase();

        if (variable.name.toLowerCase().includes(str)) {
          return true;
        }
        if (variable.label.toLowerCase().includes(str)) {
          return true;
        }
        return false;
      },
    },
    template: `
		  <div class="uip-flex uip-flex-column uip-row-gap-xs">
      
        <!-- Tittle and new var -->
			  <div class="uip-flex uip-flex-between">
			    <div class="uip-text-bold">{{ui.strings.theme}}</div>
			    <drop-down dropPos="left">
				    <template v-slot:trigger>
				     <div class="uip-button-secondary uip-text-s uip-padding-xxs">{{ui.strings.new}}</div>
				    </template>
				    <template v-slot:content>
				      <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xs">
					    <input type="text" :placeholder="ui.strings.variableLabel" class="uip-input uip-input-small" v-model="newVariable.label">
					    <input type="text" :placeholder="ui.strings.variableName" class="uip-input uip-input-small" v-model="newVariable.var">
              
              <select v-model="newVariable.type" class="uip-input-small uip-padding-top-xxxs uip-padding-bottom-xxxs uip-max-w-100p">
                <template v-for="varType in ui.varTypes">
                  <option :value="varType.value" >{{varType.label}}</option>
                </template>
              </select>
              
					    <button @click="createVariable()" class="uip-button-secondary uip-text-xs">{{ui.strings.add}}</button>
				      </div>
				    </template>
			    </drop-down>
			  </div>
        
        <!-- theme switch -->
			  <div class="uip-margin-bottom-xs">
			   <toggle-switch :options="ui.switchOptions" :activeValue="ui.mode" :returnValue="function(data){ ui.mode = data}"></toggle-switch>
			  </div>
        
        
        <!-- search-->
			  <div class="uip-flex uip-padding-xxs uip-border uip-search-block uip-border-round">
				  <span class="uip-icon uip-text-muted uip-margin-right-xs uip-text-l uip-icon uip-icon-medium">search</span>
				  <input class="uip-blank-input uip-flex-grow uip-text-s" type="search" v-model="ui.search" :placeholder="ui.strings.searchVariables" autofocus="">
			  </div>
        
        <!-- Var types -->
        <div class="uip-margin-bottom-xs">
          <toggle-switch :options="ui.varTypes" :activeValue="ui.varTypeSelected" :returnValue="function(data){ ui.varTypeSelected = data}"></toggle-switch>
        </div>
        
        
        <div class="uip-variable-grid">
			    <template v-for="(item, index) in uipData.themeStyles">
          
          
			      <component is="style" scoped v-if="item.value">
			      .{{item.name}}[data-theme="light"] { {{item.name}}:{{item.value}} };
			      </component>
			      <component is="style" scoped v-if="item.darkValue">
			      .{{item.name}}[data-theme="dark"] { {{item.name}}:{{item.darkValue}} };
			      </component>
            
            <template v-if="item.type == ui.varTypeSelected">
            
              <!--Color vars-->
			        <div v-if="inSearch(item) && item.type == 'color'" class="uip-flex uip-flex-row uip-gap-xs uip-flex-center" :class="item.name">
				        <color-picker :value="returnVar(item)" :returnData="function(data){ setVar(data, item)}">
				          <template v-slot:trigger>
					         <div :data-theme="ui.mode" class="uip-border-circle uip-w-26 uip-h-26 uip-border" 
                   :class="item.name" :style="'background-color:var(' + item.name + ')'"></div>
				          </template>
				        </color-picker>
				        <div class="">
				          <div class="uip-flex uip-gap-xxs uip-flex-center">
					          <span>{{item.label}}</span>
					          <span v-if="customSet(item)" class="uip-text-xs uip-background-primary-wash uip-border-round uip-padding-xxxs uip-post-type-label">
					            {{ui.strings.custom}}
					          </span>
				          </div>
				          <div class="uip-text-muted uip-text-s">{{item.name}}</div>
				        </div>
				        <div v-if="!item.user" class="uip-flex-grow uip-flex uip-flex-right">
				          <uip-tooltip :message="ui.strings.revertStyle" :delay="2000">
					         <a @click="clearVar(item)" class="uip-icon uip-link-muted uip-no_underline uip-text-l">format_color_reset</a>
				          </uip-tooltip>
				        </div>
				        <div v-if="item.user" class="uip-flex-grow uip-flex uip-flex-right">
				          <uip-tooltip :message="ui.strings.deleteVariable" :delay="2000">
					         <a @click="deleteVar(item, index)" class="uip-icon uip-link-muted uip-no_underline uip-text-l uip-text-danger">delete</a>
				          </uip-tooltip>
				        </div>
			        </div>
              
              <!--Value units-->
              <div v-if="inSearch(item) && item.type == 'units'" class="uip-flex uip-flex-row uip-gap-xs uip-flex-center" :class="item.name">
                <div class="uip-flex uip-flex-column uip-flex-grow">
                  <div class="uip-flex uip-gap-xxs uip-flex-center">
                    <span>{{item.label}}</span>
                    <span v-if="customSet(item)" class="uip-text-xs uip-background-primary-wash uip-border-round uip-padding-xxxs uip-post-type-label">
                      {{ui.strings.custom}}
                    </span>
                  </div>
                  <div class="uip-text-muted uip-text-s uip-margin-bottom-xxs">{{item.name}}</div>
                </div>
                <div class="uip-flex-right uip-w-100">
                  <value-units :value="splitUnitVal(item)" size="xsmall" :returnData="function(data){ setUnitVal(data, item)}"></value-units>\
                </div>
                <div v-if="!item.user" class="uip-flex uip-flex-right">
                  <uip-tooltip :message="ui.strings.revertStyle" :delay="2000">
                   <a @click="clearVar(item)" class="uip-icon uip-link-muted uip-no_underline uip-text-l">format_color_reset</a>
                  </uip-tooltip>
                </div>
                <div v-if="item.user" class=" uip-flex uip-flex-right">
                  <uip-tooltip :message="ui.strings.deleteVariable" :delay="2000">
                   <a @click="deleteVar(item, index)" class="uip-icon uip-link-muted uip-no_underline uip-text-l uip-text-danger">delete</a>
                  </uip-tooltip>
                </div>
              </div>
              
              <!--Text -->
              <div v-if="inSearch(item) && item.type == 'font'" class="uip-flex uip-flex-row uip-gap-xs uip-flex-center" :class="item.name">
                <div class="uip-flex uip-flex-column uip-flex-grow">
                  <div class="uip-flex uip-gap-xxs uip-flex-center">
                    <span>{{item.label}}</span>
                    <span v-if="customSet(item)" class="uip-text-xs uip-background-primary-wash uip-border-round uip-padding-xxxs uip-post-type-label">
                      {{ui.strings.custom}}
                    </span>
                  </div>
                  <div class="uip-text-muted uip-text-s uip-margin-bottom-xxs">{{item.name}}</div>
                </div>
                
                <div class="uip-flex-right">
                  <select v-if="ui.mode == 'light'" v-model="item.value" class="uip-input-small uip-padding-top-xxxs uip-padding-bottom-xxxs uip-max-w-100p">
                    <template v-for="font in ui.fonts">
                      <option vlass="font.value" >{{font.label}}</option>
                    </template>
                  </select>
                  <select v-else="ui.mode == 'light'" v-model="item.darkValue" class="uip-input-small uip-padding-top-xxxs uip-padding-bottom-xxxs uip-max-w-100p">
                    <template v-for="font in ui.fonts">
                      <option :value="font.value" >{{font.label}}</option>
                    </template>
                  </select>
                </div>
                
                <div v-if="!item.user" class="uip-flex uip-flex-right">
                  <uip-tooltip :message="ui.strings.revertStyle" :delay="2000">
                   <a @click="clearVar(item)" class="uip-icon uip-link-muted uip-no_underline uip-text-l">format_color_reset</a>
                  </uip-tooltip>
                </div>
                <div v-if="item.user" class="uip-flex uip-flex-right">
                  <uip-tooltip :message="ui.strings.deleteVariable" :delay="2000">
                   <a @click="deleteVar(item, index)" class="uip-icon uip-link-muted uip-no_underline uip-text-l uip-text-danger">delete</a>
                  </uip-tooltip>
                </div>
              </div>
            
            </template>
            
            
            
            
			    </template>
        </div>
        
        
		  </div>`,
  };
}
