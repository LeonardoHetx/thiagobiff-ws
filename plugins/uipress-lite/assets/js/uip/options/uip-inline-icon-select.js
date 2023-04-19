const { __, _x, _n, _nx } = wp.i18n;
import * as allUIPIcons from './uip-icons.min.js';
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        open: false,
        icon: {},
        allIcons: allUIPIcons.returnIcons(),
        searchString: '',
        currentPage: 0,
        iconsPerPage: 56,
        totalIcons: 0,
        maxPages: 0,
        strings: {
          searchIcons: __('Search icons', 'uipress-lite'),
          clearIcon: __('Clear icon', 'uipress-lite'),
        },
      };
    },
    inject: ['uipress'],
    watch: {
      icon: {
        handler(newValue, oldValue) {
          this.returnData(newValue);
        },
        deep: true,
      },
    },
    mounted: function () {
      this.formatIcon(this.value);
    },
    computed: {
      iconsPaged() {
        let self = this;
        let masteroptions = self.allIcons;
        let returndata = [];
        let temparray = [];
        let searchinput = self.searchString.toLowerCase();

        if (self.currentPage < 0) {
          self.currentPage = 0;
        }
        self.totalIcons = self.allIcons.length;
        self.maxPages = Math.ceil(self.allIcons.length / this.iconsPerPage);

        if (self.currentPage > self.maxPages) {
          self.currentPage = self.maxPages;
        }

        let startPos = self.currentPage * self.iconsPerPage;
        let endPos = startPos + self.iconsPerPage;

        if (searchinput.length > 0) {
          self.currentPage = 0;

          for (let i = 0; i < masteroptions.length; i++) {
            name = masteroptions[i].toLowerCase();
            if (name.includes(searchinput)) {
              temparray.push(masteroptions[i]);
            }
          }

          returndata = temparray.slice(startPos, endPos);
          self.totalIcons = returndata.length;
          self.maxPages = Math.ceil(returndata.length / this.iconsPerPage);
        } else {
          returndata = this.allIcons.slice(startPos, endPos);
        }
        return returndata;
      },
    },
    methods: {
      formatIcon(value) {
        if (typeof value === 'undefined') {
          this.icon.value = '';
          return this.icon;
        }
        if (this.uipress.isObject(value)) {
          if (!('value' in value)) {
            this.icon.value = '';
            return;
          } else {
            this.icon = value;
            return;
          }
        } else {
          this.icon.value = '';
          return;
        }
      },
      nextPage() {
        this.currentPage = this.currentPage + 1;
      },
      previousPage() {
        this.currentPage = this.currentPage - 1;
      },
      chooseIcon(option) {
        this.icon.value = option;
        this.returnData(this.icon);
      },
    },
    template: `
    <div>
        <drop-down dropPos="left">
            <template v-slot:trigger>
                <slot name="trigger"></slot>
            </template>
            <template v-slot:content>
              <div class=" uip-max-w-320">
                
                <div class="uip-padding-xs uip-border-bottom">
                  <div class="uip-flex  uip-search-block uip-border-round ">
                    <span class="uip-icon uip-text-muted uip-margin-right-xs uip-text-l uip-icon uip-icon-medium" >search</span>
                    <input class="uip-blank-input uip-flex-grow uip-text-s" type="search" :placeholder="strings.searchIcons" v-model="searchString" autofocus="">
                  </div>
                </div>
                
                <div class="uip-padding-xs uip-flex uip-flex-wrap uip-flex-start uip-border-bottom uip-gap-xs uip-row-gap-xs" style="font-size:16px">
                  <template v-for="option in iconsPaged">
                   <span class="uip-icon uip-icon-medium uip-text-xl hover:uip-background-muted uip-padding-xxxs uip-border-round hover:uip-background-grey uip-cursor-pointer uip-flex-no-grow uip-max-w-30 uip-overflow-hidden" @click="chooseIcon(option)">
                     {{option}}
                   </span>
                  </template>
                </div>
                <div class="uip-flex uip-flex-between uip-padding-xs">
                  <div class="uip-flex uip-gap-xs" v-if="totalIcons > iconsPerPage">
                    <button class="uip-button-default uip-icon" @click="previousPage()" type="button">chevron_left</button>
                    <button class="uip-button-default uip-icon" @click="nextPage()" type="button">chevron_right</button>
                  </div>
                  <button class="uip-button-warning uip-button-danger" @click="icon.value = ''">{{strings.clearIcon}}</button>
                </div>
                
              </div>
            </template>
        </drop-down>
      </div>`,
  };
}
