const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Array,
    },
    data: function () {
      return {
        items: this.value,
        strings: {
          addNew: __('New item', 'uipress-lite'),
        },
      };
    },
    inject: ['uipress'],
    mounted: function () {},
    watch: {
      items: {
        handler(newValue, oldValue) {
          this.returnData(this.items);
        },
        deep: true,
      },
    },
    computed: {
      returnItems() {
        return this.items;
      },
    },
    methods: {
      deleteTab(index) {
        this.items.splice(index, 1);
      },
      newTab() {
        this.items.push({ value: '', id: this.uipress.createUID() });
      },
      setdropAreaStyles() {
        let returnData = [];
        returnData.class = 'uip-flex uip-flex-column uip-row-gap-xs uip-w-100p';
        return returnData;
      },
    },
    template: `<div class="uip-flex uip-flex-column uip-row-gap-xs">
		<draggable 
		  v-model="items" 
		  :group="{ name: 'tabs', pull: false, put: false }"
		  :component-data="setdropAreaStyles()"
		  @start="drag=true"
		  @end="drag=false"
		  :sort="true"
		  itemKey="id">
			<template #item="{element, index}">
			  <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center">
				<div class="uip-border-round uip-padding-xxxs uip-w-18 uip-text-center uip-text-muted uip-icon uip-text-l uip-cursor-drag uip-flex-center uip-background-muted">drag_indicator</div>
				
				<input type="text" v-model="element.value" class="uip-input-small uip-blank-input uip-flex-grow" placeholder="path/to/file">
				<div @click="deleteTab(index)" class="uip-border-round uip-border-left-square uip-border-left-remove uip-text-l uip-flex uip-icon uip-padding-xxxs uip-text-center uip-cursor-pointer uip-icon uip-link-danger uip-flex-center">delete</div>
			  </div>
			</template>
		  </draggable>
		  <div @click="newTab()" class="uip-padding-xxs uip-border-round uip-background-muted hover:uip-background-grey uip-cursor-pointer uip-flex uip-flex-middle uip-flex-center uip-gap-xs">
			<span class="uip-icon">add</span>
			<span>{{strings.addNew}}</span>
		  </div>
	  </div>`,
  };
}
