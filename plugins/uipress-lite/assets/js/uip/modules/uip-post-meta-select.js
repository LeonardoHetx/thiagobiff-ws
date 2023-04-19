const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      //array of selected items
      selected: Array,
      //Placeholder
      placeHolder: String,
      //Search Placeholder
      searchPlaceHolder: String,
      //Whether it is single select or multi
      single: Boolean,
      //Function to return selected on change
      updateSelected: Function,
    },
    data: function () {
      return {
        thisSearchInput: '',
        options: [],
        selectedOptions: this.selected,
        loading: true,
        ui: {
          dropOpen: false,
        },
        strings: {
          add: __('Add', 'uipress-lite'),
          columnTitle: __('Column title', 'uipress-lite'),
        },
      };
    },
    mounted: function () {},
    inject: ['uipress'],
    computed: {
      formattedOptions() {
        return this.options;
      },
    },
    watch: {
      selectedOptions: {
        handler(newValue, oldValue) {
          this.updateSelected(this.selectedOptions);
        },
        deep: true,
      },
    },
    methods: {
      getMetaTypes() {
        self = this;

        let formData = new FormData();
        formData.append('action', 'uip_get_post_table_columns');
        formData.append('security', uip_ajax.security);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.error, 'error');
            self.loading = false;
            return;
          }
          self.loading = false;
          console.log(response.keys);
          self.options = response.keys;
        });
      },
      //////TITLE: ADDS A SELECTED OPTION//////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////DESCRIPTION: ADDS A SELECTED OPTION FROM OPTIONS
      addSelected(selectedoption) {
        //if selected then remove it
        this.selectedOptions.push(selectedoption);
      },
      //////TITLE: REMOVES A SLECTED OPTION//////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////DESCRIPTION: ADDS A SELECTED OPTION FROM OPTIONS
      removeSelected(option, options) {
        let index = options.indexOf(option);
        if (index > -1) {
          options = options.splice(index, 1);
        }
      },
      deleteCol(index) {
        this.selectedOptions.splice(index, 1);
      },
      //////TITLE:  CHECKS IF IN SEARCH//////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////DESCRIPTION: CHECKS IF ITEM CONTAINS STRING
      ifInSearch(option, searchString) {
        let item = option.toLowerCase();
        let string = searchString.toLowerCase();

        if (item.includes(string)) {
          return true;
        } else {
          return false;
        }
      },
      onClickOutside(event) {
        const path = event.path || (event.composedPath ? event.composedPath() : undefined);
        // check if the MouseClick occurs inside the component
        if (path && !path.includes(this.$el) && !this.$el.contains(event.target)) {
          this.closeThisComponent(); // whatever method which close your component
        }
      },
      openThisComponent() {
        this.ui.dropOpen = true; // whatever codes which open your component
        // You can also use Vue.$nextTick or setTimeout
        this.getMetaTypes();
        requestAnimationFrame(() => {
          document.documentElement.addEventListener('click', this.onClickOutside, false);
        });
      },
      closeThisComponent() {
        this.ui.dropOpen = false; // whatever codes which close your component
        document.documentElement.removeEventListener('click', this.onClickOutside, false);
      },
      setdropAreaStyles() {
        let returnData = [];
        returnData.class = 'uip-flex uip-flex-column uip-row-gap-xs uip-w-100p';
        return returnData;
      },
    },
    template:
      '<div class="uip-position-relative">\
        <div div class="uip-flex uip-flex-column uip-row-gap-s">\
      \
          <div @click="openThisComponent" class="uip-padding-xs uip-background-muted uip-border-round uip-w-100p uip-max-w-400 uip-cursor-pointer uip-border-box" :class="{\'uip-active-outline\' : ui.dropOpen}"> \
            <div class="uip-flex uip-flex-center">\
              <div class="uip-flex-grow uip-margin-right-s">\
                  <span class="uk-text-meta">{{placeHolder}}...</span>\
              </div>\
            </div>\
          </div>\
        \
          <div v-if="ui.dropOpen" class="uip-position-absolute uip-background-default uip-border-round uip-border uip-w-100p uip-max-w-400 uip-border-box uip-z-index-9 uip-margin-top-xs uip-overflow-hidden">\
        \
            <div class="uip-flex uip-background-default uip-padding-xs uip-border-bottom">\
              <span class="uip-icon uip-text-muted uip-margin-right-xs">search</span>\
              <input class="uip-blank-input uip-flex-grow" type="search"  \
              :placeholder="searchPlaceHolder" v-model="thisSearchInput" autofocus>\
            </div>\
          \
            <div v-if="loading" class="uip-w-100p uip-flex uip-flex-center uip-flex-middle uip-h-200">\
              <loading-chart></loading-chart>\
            </div>\
          \
            <div class="uip-max-h-280 uip-overflow-auto uip-scrollbar">\
              <template v-for="option in formattedOptions">\
                <div class="uip-background-default uip-padding-xs hover:uip-background-muted" \
                v-if="ifInSearch(option.name, thisSearchInput)" \
                style="cursor: pointer">\
                  <div class="uip-flex uip-flex-row uip-flex-center uip-flex-between">\
                    <div class="uip-flex-grow">\
                      <div class="uip-text-bold uip-text-emphasis">{{option.label}}</div>\
                      <div class="uip-text-muted">{{option.name}}</div>\
                    </div>\
                    <div class="">\
                      <button class="uip-button-secondary uip-text-xs" @click="addSelected(option)">{{strings.add}}</button>\
                    </div>\
                  </div>\
                </div>\
              </template>\
            </div>\
          \
          </div>\
          <!-- end of drop down -->\
          <div class="" v-if="selectedOptions.length > 0">\
            <draggable \
            v-model="selectedOptions" \
            :group="{ name: \'columns\', pull: false, put: false }"\
            :component-data="setdropAreaStyles()"\
            @start="drag=true"\
            @end="drag=false"\
            itemKey="name"\
            :sort="true">\
              <template #item="{element, index}">\
                <div class="uip-flex">\
                  <div class="uip-border uip-border-round uip-border-right-square uip-padding-xxxs uip-w-22 uip-text-center uip-text-muted uip-icon uip-text-l uip-cursor-drag uip-flex-center">drag_indicator</div>\
                  <input type="text" v-model="element.label" :placeholder="strings.columnTitle" class="uip-input uip-input-small uip-border-left-remove uip-border-left-square uip-border-right-square">\
                  <div @click="deleteCol(index)" class="uip-border uip-border-round uip-border-left-square uip-border-left-remove uip-text-l uip-flex uip-icon uip-padding-xxxs uip-text-center hover:uip-background-grey uip-cursor-pointer uip-icon uip-text-normal uip-text-danger uip-flex-center">delete</div>\
                </div>\
              </template>\
            </draggable>\
          </div>\
        </div>\
      </div>',
  };
}
