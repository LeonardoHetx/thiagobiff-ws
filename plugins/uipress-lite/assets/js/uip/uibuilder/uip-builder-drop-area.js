const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      content: Array,
      returnData: Function,
      layout: String,
      dropAreaStyle: String,
      contextualData: Object,
    },
    data: function () {
      return {
        items: this.content,
        emptyMessage: __('Drag blocks here', 'uipress-lite'),
        footerhideen: false,
        test: [1, 2, 6, 5, 3, 8, 9, 4],
        activeTab: 'blocks',
        drag: false,
        strings: {
          doesntExist: __("This component is missing or can't be loaded", 'uipress-lite'),
        },
        switchOptions: {
          blocks: {
            value: 'blocks',
            label: __('Blocks', 'uipress-lite'),
          },
          patterns: {
            value: 'patterns',
            label: __('Patterns', 'uipress-lite'),
          },
        },
      };
    },
    inject: ['uipData', 'uiTemplate', 'router', 'uipress'],
    watch: {
      content: {
        handler(newValue, oldValue) {
          this.items = newValue;
        },
        deep: true,
      },
      items: {
        handler(newValue, oldValue) {
          for (let item of this.items) {
            if (Object.keys(item.settings).length === 0) {
              this.uipress.inject_block_presets(item, item.settings);
            }
          }
        },
        deep: true,
      },
    },
    mounted: function () {},
    methods: {
      itemAdded(evt) {
        if (evt.added) {
          //Log added to history
          let newTem = JSON.parse(JSON.stringify(this.uiTemplate.content));

          //ADD A UID TO ADDED OPTION
          let newElement = evt.added.element;
          //New block, add uid
          if (!('uid' in newElement)) {
            newElement.uid = this.uipress.createUID();
            this.uipress.logHistoryChange(evt.added.element.name + ' ' + __('block added', 'uipress-lite'), newTem, false);
          } else {
            //Block already exists so it has just been moved
            this.uipress.logHistoryChange(evt.added.element.name + ' ' + __('block moved', 'uipress-lite'), newTem, false);
          }
          //New block so let's add settings
          if (Object.keys(newElement.settings).length === 0) {
            this.uipress.inject_block_presets(newElement, newElement.settings);
          }
        }
        this.returnData(this.items);
      },
      setProdClasses() {
        if (this.layout == 'vertical') {
          return 'uip-flex uip-w-100p';
        } else {
          return 'uip-flex uip-flex-row uip-w-100p';
        }
      },
      setdropAreaStyles() {
        let returnData = [];
        if (this.layout == 'vertical') {
          returnData.class = 'uip-flex uip-w-100p';
        } else {
          returnData.class = 'uip-flex uip-flex-row uip-w-100p';
        }

        if (this.dropAreaStyle) {
          returnData.style = this.dropAreaStyle;
        }
        return returnData;
      },
      returnCardKey(element) {
        return element.uid;
      },
      returnDragStyle() {
        if (this.uiTemplate.drag) {
          return 'border-color:var(--uip-background-primary);';
        }
      },
      componentExists(name) {
        if (this.$root._.appContext.components[name]) {
          return true;
        } else {
          return false;
        }
      },
    },
    template: `<div class="uip-border-round uip-border-dashed uip-h-100p uip-w-100p uip-flex uip-drop-area"
	  :style="returnDragStyle()" v-if="uiTemplate.display == 'builder'">
           
			<draggable 
      v-model="items" 
      :component-data="setdropAreaStyles()"
      :group="{ name: 'uip-blocks', pull: true, put: true }"
      @start="uiTemplate.drag=true" 
      @end="uiTemplate.drag = false" 
      ghost-class="uip-block-ghost"
      @change="itemAdded"
      animation="300"
      :sort="true"
      item-key="uid">
	  			<template #item="{element, index}">
				  		  <uip-block-container display="builder" :block="element" :itemIndex="index" :currentContent="items">
					      	<component v-if="componentExists(element.moduleName)" :is="element.moduleName" :contextualData="contextualData" :block="element" :name="element.name" display="builder" :id="element.uid"></component>
                  <div v-if="!componentExists(element.moduleName)" class="uip-padding-xxs uip-border-round uip-background-red uip-text-inverse uip-text-s">
                     {{strings.doesntExist}}
                  </div>
						    </uip-block-container>
	  			</template>
				<!--FOOTER-->
				<template #footer >
            <div class="uip-flex uip-flex-center uip-flex-middle uip-flex-row">
              <drop-down width="260" dropPos="right" :onOpen="function(){uiTemplate.activePath = []}">
                <template v-slot:trigger>
					        <div  ref="footer" class="uip-text-muted uip-text-center uip-padding-xxs uip-text-center uip-icon  uip-text-l hover:uip-background-grey uip-cursor-pointer uip-border-circle" >add_circle</div>
                </template>
                <template v-slot:content>
                  <div class="uip-padding-s uip-max-w-300 uip-w-300 uip-max-h-300 uip-overflow-auto uip-scrollbar">
                    <div class="uip-margin-bottom-xs">
                     <toggle-switch :options="switchOptions" :activeValue="activeTab" :returnValue="function(data){ activeTab = data}"></toggle-switch>
                    </div>
                    <builder-blocks-list mode="click" v-if="activeTab == 'blocks'" :insertArea="items"></builder-blocks-list>
                    <patterns-list mode="click" :insertArea="items" v-if="activeTab == 'patterns'"></patterns-list>
                  </div>
                </template>
              </drop-down>
            </div>
				</template>
			</draggable>
	    	
		</div>
		<div class="uip-h-100p uip-w-100p uip-flex" v-if="uiTemplate.display == 'preview'">
		  <div :class="setProdClasses()" :style="dropAreaStyle">
		  	<template v-for="(element, index) in items">
			    <uip-block-container display="builder" :block="element" :itemIndex="index" :currentContent="items">
					  <component :contextualData="contextualData" :is="element.moduleName" :block="element" :name="element.name" display="builder" :id="element.uid"></component>
				  </uip-block-container>
			  </template>
		  </div>
		</div>`,
  };
}
