const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      content: Array,
      returnData: Function,
      layout: String,
      dropAreaStyle: String,
    },
    data: function () {
      return {
        items: this.content,
        emptyMessage: __('Drag blocks here', 'uipress-lite'),
        footerhideen: false,
        drag: false,
        activeBlock: this.returnActiveBlock,
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
    },
    computed: {
      returnActiveBlock() {
        if ('uid' in this.$route.params) {
          return this.$route.params.uid;
        }
        return false;
      },
    },
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
      setdropAreaStylees() {
        let returnData = [];
        returnData.class = 'uip-flex uip-flex-column uip-row-gap-xxs uip-w-100p';

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
      openSettings(item) {
        item.tabOpen = !item.tabOpen;
        let ID = this.$route.params.templateID;
        this.router.push({
          path: '/uibuilder/' + ID + '/settings/blocks/' + item.uid,
          query: { ...this.$route.query },
        });
      },
      isActive(uid) {
        if ('uid' in this.$route.params && this.$route.params.uid == uid) {
          return true;
        }
        return false;
      },

      buildClasses(element) {
        let classes = 'uip-border-round uip-padding-xxs';
        if (this.isActive(element.uid)) {
          classes += ' uip-background-primary-wash uip-text-bold';
        } else {
          classes += ' uip-background-muted';
        }
        return classes;
      },
    },
    template: `<div class="uip-border-round uip-h-100p uip-w-100p uip-flex uip-drop-area"
	  :style="returnDragStyle()" :class="{'uip-drop-hightlight' : uiTemplate.drag}">
           
			<draggable 
	  		v-model="items" 
			  :component-data="setdropAreaStylees()"
	  		:group="{ name: 'uip-blocks', pull: true, put: true }"
	  		@start="uiTemplate.drag=true" 
	  		@end="uiTemplate.drag = false" 
        @change="itemAdded"
			  ghost-class="uip-block-ghost"
        handle=".uip-block-drag"
        animation="300"
			  :sort="true"
	  		item-key="uid">
	  			<template #item="{element, index}">
            
            <div class=" uip-border-round">
              <div class="uip-flex ui-flex-middle uip-flex-center uip-gap-xxs" style="min-width:160px" :class="buildClasses(element)">
                <drop-down dropPos="left" >
                  <template v-slot:trigger>
                      <div class="uip-icon uip-icon-small-emphasis uip-padding-xxxs uip-border-round hover:uip-background-grey uip-cursor-pointer uip-flex-no-grow ">
                        more_vert
                      </div>
                  </template>
                  <template v-slot:content>
                    <div class="uip-padding-xxs">
                      <block-actions :block="element" :parentList="items" :currentIndex="index" :reverse="true"></block-actions>
                    </div>
                  </template>
                </drop-down>
                <div class="uip-cursor-pointer uip-background-muted uip-icon uip-icon-small-emphasis uip-border-round uip-block-drag">drag_indicator</div>
                <div class="uip-cursor-pointer uip-icon uip-icon-small-emphasis" @click="openSettings(element)">{{element.icon}}</div>
                <div class="uip-cursor-pointer uip-flex-grow uip-text-s uip-flex-grow uip-no-wrap" @click="openSettings(element)">{{element.name}}</div>
                
                <!--Chevs -->
                <div v-if="element.content" class="uip-ratio-1-1 uip-icon uip-padding-xxxs uip-text-l uip-line-height-1 uip-cursor-pointer uip-flex uip-flex-center uip-margin-left-xs" type="button" @click="element.tabOpen = !element.tabOpen">
                  <span v-if="!element.tabOpen">chevron_left</span>
                  <span v-if="element.tabOpen">expand_more</span>
                </div>
                
              </div>
              
              <div v-if="element.tabOpen && element.content" class="uip-margin-left-s uip-margin-top-xxs">
                <uip-treeview-drop-area :content="element.content" :returnData="function(data){element.content = data}" ></uip-treeview-drop-area>
              </div>
            </div>  
          
	  			</template>
				<!--FOOTER-->
				<template #footer v-if="uiTemplate.drag && items.length < 1">
            <div class="uip-flex uip-flex-center uip-flex-middle uip-flex-row ">
					    <div  ref="footer" class="uip-text-muted uip-text-center uip-padding-xxs uip-text-center uip-icon" >add</div>
            </div>
				</template>
			</draggable>
	    	
		</div>`,
  };
}
