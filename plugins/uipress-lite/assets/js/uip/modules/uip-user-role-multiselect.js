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
        loading: false,
        thisSearchInput: '',
        options: [],
        selectedOptions: this.selected,
        ui: {
          dropOpen: false,
        },
      };
    },
    inject: ['uipress'],
    computed: {
      formattedOptions() {
        return this.options;
      },
    },
    watch: {
      selectedOptions: {
        handler(newValue, oldValue) {
          return;
          this.updateSelected(this.selectedOptions);
        },
        deep: true,
      },
      thisSearchInput: function (newValue, oldValue) {
        self = this;

        if (newValue == '') {
          return;
        }

        let formData = new FormData();
        formData.append('action', 'uip_get_user_roles');
        formData.append('security', uip_ajax.security);
        formData.append('searchString', newValue);
        self.loading = true;

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          self.loading = false;
          if (response.error) {
            self.uipress.notify(response.error, 'error');
            return;
          }
          self.options = response.roles;
        });
      },
    },
    methods: {
      //////TITLE: ADDS A SELECTED OPTION//////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////DESCRIPTION: ADDS A SELECTED OPTION FROM OPTIONS
      addSelected(selectedoption) {
        //if selected then remove it
        if (this.ifSelected(selectedoption)) {
          this.removeSelected(selectedoption);
          return;
        }
        if (this.single == true) {
          this.selectedOptions[0] = selectedoption;
        } else {
          this.selectedOptions.push(selectedoption);
        }
      },
      //////TITLE: REMOVES A SLECTED OPTION//////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////DESCRIPTION: ADDS A SELECTED OPTION FROM OPTIONS
      removeSelected(option) {
        let index = this.selectedOptions.findIndex((item) => {
          return item.name === option.name && item.type === option.type;
        });
        if (index > -1) {
          this.selectedOptions.splice(index, 1);
        }
      },
      removeByIndex(index) {
        this.selectedOptions.splice(index, 1);
      },
      //////TITLE:  CHECKS IF SELECTED OR NOT//////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////DESCRIPTION: ADDS A SELECTED OPTION FROM OPTIONS
      ifSelected(option) {
        let index = this.selectedOptions.findIndex((item) => {
          return item.name === option.name && item.type === option.type;
        });

        if (index > -1) {
          return true;
        } else {
          return false;
        }
      },
      //////TITLE:  CHECKS IF IN SEARCH//////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////DESCRIPTION: CHECKS IF ITEM CONTAINS STRING
      ifInSearch(option, searchString) {
        let item = option.name.toLowerCase();
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
        requestAnimationFrame(() => {
          document.documentElement.addEventListener('click', this.onClickOutside, false);
        });
      },
      closeThisComponent() {
        this.ui.dropOpen = false; // whatever codes which close your component
        document.documentElement.removeEventListener('click', this.onClickOutside, false);
      },
    },
    template: `
    <div class="uip-position-relative" @click="openThisComponent">
		  <div class="uip-padding-xs uip-background-muted uip-border-round uip-w-100p uip-max-w-400 uip-cursor-pointer uip-border-box" :class="{'uip-active-outline' : ui.dropOpen}"> 
		    <div class="uip-flex uip-flex-center">
			  <div class="uip-flex-grow uip-margin-right-s" v-if="selectedOptions.length < 1">
			    <div>
				  <span class="uk-text-meta">{{placeHolder}}...</span>
			    </div>
			  </div>
        <div v-else class="uip-flex-grow uip-flex uip-flex-row uip-row-gap-xxs uip-gap-xxs uip-margin-right-s uip-flex-wrap">
          <template v-for="(item, index) in selectedOptions">
            <div class=" uip-padding-left-xxs uip-padding-right-xxs uip-background-primary-wash uip-border-round uip-flex uip-gap-xxs uip-flex-center">
              <span class="uip-text-s">{{item.name}}</span>
              <a @click="removeByIndex(index)" class="uip-link-muted uip-no-underline uip-icon uip-text-l">backspace</a>
            </div>
          </template>
        </div>
			  <span class="uip-icon uip-text-muted">add</span>
			  <span v-if="selectedOptions.length > 0" class="uip-text-inverse uip-background-primary uip-border-round uip-text-s uip-w-18 uip-margin-left-xxs uip-text-center">
			    {{selectedOptions.length}}
			  </span>
		    </div>
		  </div>
		  <div v-if="ui.dropOpen" class="uip-position-absolute uip-background-default uip-border-round uip-border uip-w-100p uip-max-w-400 uip-border-box uip-z-index-9 uip-margin-top-xs uip-overflow-hidden">
		    <div class="uip-flex uip-background-default uip-padding-xs uip-border-bottom">
			  <span class="uip-icon uip-text-muted uip-margin-right-xs">search</span>
			  <input class="uip-blank-input uip-flex-grow" type="search"  
			  :placeholder="searchPlaceHolder" v-model="thisSearchInput" autofocus>
		    </div>
		    <div class="uip-max-h-280 uip-overflow-auto">
        <div v-if="loading" class="uip-padding-s uip-flex uip-flex-center uip-flex-middle"><loading-chart></loading-chart></div>
			  <template v-if="!loading" v-for="option in formattedOptions">
			    <div class="uip-background-default uip-padding-xs hover:uip-background-muted" 
			    @click="addSelected(option,)" 
			    v-if="ifInSearch(option, thisSearchInput)" 
			    style="cursor: pointer">
				  <div class="uip-flex uip-flex-row uip-flex-center">
				    <div class="uip-flex uip-flex-center uip-flex-middle uip-margin-right-xs">
					  <input type="checkbox" :name="option.name" :value="option.name" :checked="ifSelected(option)">
				    </div>
				    <div class="uip-flex-grow">
					  <div class="uip-text-bold uip-text-emphasis">{{option.label}}</div>
					  <div class="uip-text-muted">{{option.typeLocal}}</div>
				    </div>
				  </div>
			    </div>
			  </template>
		    </div>
		  </div>
	  </div>`,
  };
}
