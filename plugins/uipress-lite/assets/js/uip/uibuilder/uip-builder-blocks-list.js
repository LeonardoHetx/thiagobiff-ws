/**
 * Builds the main ui builder shell
 * @since 3.0.0
 */
const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      mode: String,
      insertArea: Array,
    },
    data: function () {
      return {
        loading: true,
        categories: [],
        search: '',
        strings: {
          proBlock: __('Pro', 'uipress-lite'),
          seachBlocks: __('Search blocks...', 'uipress-lite'),
        },
      };
    },
    inject: ['uipData', 'router', 'uipress', 'uiTemplate'],
    mounted: function () {
      this.loading = false;
      this.returnGroups;
    },
    computed: {
      returnCats() {
        let cats = [];
        let self = this;
        let organisedBlocks = [];

        for (let cat in this.returnGroups) {
          let categoryBlocks = this.uipData.blocks.filter((c) => c.group == cat);
          let sortedBlocks = categoryBlocks.sort((a, b) => a.name.localeCompare(b.name));
          let temp = {
            name: this.returnGroups[cat].label,
            blocks: sortedBlocks,
          };
          organisedBlocks.push(temp);
        }

        return organisedBlocks;
      },
      returnGroups() {
        return this.uipData.blockGroups;
      },
    },
    methods: {
      setDropAreaClasses() {
        let returnData = [];
        returnData.class = 'uip-flex uip-flex-column uip-row-gap-xxs uip-w-100p';
        return returnData;
      },
      clone(block) {
        let item = JSON.parse(JSON.stringify(block));

        delete item.path;
        delete item.args;

        delete item.category;

        delete item.description;

        delete item.path;

        item.uid = this.uipress.createUID();

        return item;
      },
      setDragAreaClasses() {
        let returnData = [];
        returnData.class = 'uip-grid-col-4 uip-grid-gap-xs uip-flex-center';

        return returnData;
      },
      componentExists(name) {
        const vm = Vue.getCurrentInstance();
        //console.log(vm)
        if (!vm.appContext.app.component(name)) {
          return false;
        } else {
          return true;
        }
      },
      insertAtPos(block) {
        //Check if we allowing click from modal list
        if (this.mode != 'click') {
          return;
        }
        if (Array.isArray(this.insertArea)) {
          this.insertArea.push(this.clone(block));
        }
      },
      inSearch(block) {
        if (this.search == '') {
          return true;
        }
        let str = this.search.toLowerCase();

        if (block.name.toLowerCase().includes(str)) {
          return true;
        }
        if (block.description.toLowerCase().includes(str)) {
          return true;
        }
        return false;
      },
    },
    template: `<div class="">
        <div class="uip-flex uip-padding-xxs uip-border uip-search-block uip-border-round uip-margin-bottom-s">
          <span class="uip-icon uip-text-muted uip-margin-right-xs uip-text-l uip-icon uip-icon-medium">search</span>
          <input class="uip-blank-input uip-flex-grow uip-text-s" type="search" :placeholder="strings.seachBlocks" autofocus="" v-model="search">
        </div>
        
          <template v-for="cat in returnCats">
            <div class="uip-flex uip-cursor-pointer uip-margin-bottom-s uip-background-muted uip-border-rounded uip-padding-xs uip-border-round uip-text-bold uip-text-emphasis">{{cat.name}}</div>
              <div class=" uip-margin-bottom-s uip-flex-wrap uip-flex-row">
            
              
                <draggable 
                  v-model="cat.blocks" 
                  handle=".uip-block-drag"
                  :component-data="setDragAreaClasses()"
                  :group="{ name: 'uip-blocks', pull: 'clone', put: false, revertClone: true }"
                  @start="uiTemplate.drag = true" 
                  @end="uiTemplate.drag = false" 
                  ghost-class=""
                  animation="300"
                  :sort="false"
                  :clone="clone"
                  itemKey="name">
                    <template #item="{element, index}">
                  
                         <div v-if="componentExists(element.moduleName) && inSearch(element)" class="uip-block-item" :block-name="element.name">
                          <uip-tooltip :message="element.description" :delay="500">
                            <div @click="insertAtPos(element)" class="uip-border-round uip-padding-xxs hover:uip-background-muted uip-cursor-pointer uip-block-drag uip-no-text-select">
                              <div class="uip-flex uip-flex-column uip-flex-center">
                                <div class="uip-icon uip-icon-medium uip-text-xl">
                                  {{element.icon}}
                                </div> 
                                <div class="uip-text-center uip-text-s">{{element.name}}</div>
                              </div>
                            </div>
                          </uip-tooltip>
                        </div>
                        <div v-else-if="inSearch(element)" class="uip-block-item" :block-name="element.name">
                          <uip-tooltip :message="element.description" :delay="200">
                            <div class="uip-border-round uip-padding-xxs hover:uip-background-muted uip-cursor-pointer">
                              <div class="uip-flex uip-flex-column uip-flex-center">
                                <div class="uip-icon uip-icon-medium uip-text-xl">
                                  {{element.icon}}
                                </div> 
                                <div class="uip-text-center uip-text-xs uip-margin-bottom-xs uip-text-s">{{element.name}}</div>
                                <div class="uip-text-center uip-text-s uip-flex uip-gap-xxs uip-padding-xxs uip-padding-top-remove uip-padding-bottom-remove uip-background-green-wash uip-text-bold uip-border-round uip-flex-center uip-text-green">
                                  <div class="uip-icon uip-text-l">redeem</div>
                                  <div class="">{{strings.proBlock}}</div>
                                </div>
                              </div>
                            </div>
                          </uip-tooltip>
                        </div>
                    
                    </template>
                </draggable>
                
              
              </div>
          </template>
      </div>`,
  };
  return compData;
}
