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
      };
    },
    inject: ['uipData', 'uiTemplate', 'router', 'uipress'],
    methods: {
      setProdClasses() {
        if (this.layout == 'vertical') {
          return 'uip-flex uip-w-100p';
        } else {
          return 'uip-flex uip-flex-row uip-w-100p';
        }
      },
      returnCardKey(element) {
        return element.uid;
      },
      returnDragStyle() {
        if (this.uiTemplate.drag) {
          return 'border-color:var(--uip-background-primary);';
        }
      },
      metConditions(block) {
        let conditions = this.uipress.get_block_option(block, 'advanced', 'conditions');
        if (typeof conditions === 'undefined') {
          return true;
        }
        if (!conditions) {
          return true;
        }
        if (!Array.isArray(conditions)) {
          return true;
        }
        if (conditions.length === 0) {
          return true;
        }

        let met = true;

        let userid = this.uipData.options.dynamicData.userid.value;
        let username = this.uipData.options.dynamicData.username.value;
        let userroles = this.uipData.options.dynamicData.userroles.value;
        let useremail = this.uipData.options.dynamicData.useremail.value;

        //Loop through the conditions
        for (let condition of conditions) {
          //username conditions
          if (condition.type == 'userlogin') {
            if (condition.operator == 'is') {
              if (username != condition.value) {
                met = false;
                break;
              }
            }
            if (condition.operator == 'isnot') {
              if (username == condition.value) {
                met = false;
                break;
              }
            }
          }
          //username conditions
          if (condition.type == 'userid') {
            if (condition.operator == 'is') {
              if (userid != condition.value) {
                met = false;
                break;
              }
            }
            if (condition.operator == 'isnot') {
              if (userid == condition.value) {
                met = false;
                break;
              }
            }
          }
          //Role conditions
          if (condition.type == 'userrole') {
            if (condition.operator == 'is') {
              if (!userroles.includes(condition.value)) {
                met = false;
                break;
              }
            }
            if (condition.operator == 'isnot') {
              if (userroles.includes(condition.value)) {
                met = false;
                break;
              }
            }
          }

          //useremail conditions
          if (condition.type == 'useremail') {
            if (condition.operator == 'is') {
              if (useremail != condition.value) {
                met = false;
                break;
              }
            }
            if (condition.operator == 'isnot') {
              if (useremail == condition.value) {
                met = false;
                break;
              }
            }
          }
        }

        return met;
      },
    },
    template:
      '<div  class="uip-border-round uip-h-100p uip-w-100p uip-flex uip-drop-area" \
		  :style="returnDragStyle()">\
		  <div :class="setProdClasses()" :style="dropAreaStyle">\
		  	<template v-for="(element, index) in items">\
			    <uip-block-container v-if="metConditions(element)" display="builder" :block="element" :itemIndex="index" :currentContent="items">\
					  <component :contextualData="contextualData" :is="element.moduleName" :block="element" :name="element.name" display="builder" :id="element.uid"></component>\
				  </uip-block-container>\
			  </template>\
		  </div>\
		</div>',
  };
}
