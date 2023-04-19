const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        open: false,
        link: {},
        adminMenu: this.uipData.adminMenu.menu,
        dynamics: this.uipData.dynamicOptions,
        posts: [],
        searchString: '',
        fetchSearchString: '',
        serverActive: false,
        strings: {
          searchLinks: __('Search admin pages', 'uipress-lite'),
          searchPages: __('Search pages and posts', 'uipress-lite'),
          noneFound: __('No posts found for current query', 'uipress-lite'),
          newTab: __('Link mode', 'uipress-lite'),

          currentValue: __('Current value', 'uipress-lite'),
          select: __('select', 'uipress-lite'),
        },
        linkTypes: {
          admin: {
            value: 'admin',
            label: __('Admin', 'uipress-lite'),
          },
          front: {
            value: 'content',
            label: __('Content', 'uipress-lite'),
          },
          dynamic: {
            value: 'dynamic',
            label: __('Dynamic', 'uipress-lite'),
          },
        },
        linkModes: {
          dynamic: {
            value: 'dynamic',
            label: __('Dynamic', 'uipress-lite'),
            placeHolder: __('Dynamic links will load in the available content frame without page refresh. If none exists then it will perform a normal relead.'),
          },
          default: {
            value: 'default',
            label: __('Default', 'uipress-lite'),
            placeHolder: __('Default links load like a normal link and will refresh the whole page.'),
          },
          newTab: {
            value: 'newTab',
            label: __('New tab', 'uipress-lite'),
            placeHolder: __('New tab links open in a new browser tab.'),
          },
        },
        activeValue: 'admin',
      };
    },
    inject: ['uipData', 'uipress'],
    watch: {
      fetchSearchString: {
        handler(newValue, oldValue) {
          this.searchPosts();
        },
        deep: true,
      },
      link: {
        handler(newValue, oldValue) {
          this.returnData(newValue);
        },
        deep: true,
      },
    },
    mounted: function () {
      this.formatValue(this.value);
    },
    computed: {
      getPosts() {
        return this.posts;
      },
      createOptionObject() {
        let defaultlink = {
          value: '',
          newTab: 'dynamic',
          dynamic: false,
          dynamicKey: '',
        };
        return defaultlink;
      },
    },
    methods: {
      formatValue(value) {
        let self = this;
        if (typeof value === 'undefined') {
          this.link.value = self.createOptionObject.value;
          this.link.newTab = self.createOptionObject.newTab;
          this.link.dynamic = self.createOptionObject.dynamic;
          this.link.dynamicKey = self.createOptionObject.dynamicKey;
          this.link.dynamicType = 'link';
          return;
        }
        if (Object.keys(value).length < 1) {
          this.link.value = self.createOptionObject.value;
          this.link.newTab = self.createOptionObject.newTab;
          this.link.dynamic = self.createOptionObject.dynamic;
          this.link.dynamicKey = self.createOptionObject.dynamicKey;
          this.link.dynamicType = 'link';
          return;
        }

        this.uipress.assignBlockValues(this.link, value);
      },
      searchPosts() {
        if (this.fetchSearchString == '') {
          return;
        }
        if (this.serverActive) {
          return;
        }
        this.serverActive = true;
        let str = this.fetchSearchString.toLowerCase();

        let self = this;

        //Build form data for fetch request
        let formData = new FormData();
        formData.append('action', 'uip_search_posts_pages');
        formData.append('security', uip_ajax.security);
        formData.append('searchStr', str);
        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          self.posts = response.posts;
          self.serverActive = false;
        });
      },
      chooseLink(option) {
        this.link.value = option;
        this.link.dynamic = false;
        this.link.dynamicKey = '';
        this.returnData(this.link);
      },
      inSearch(menu) {
        if (this.searchString == '') {
          return true;
        }

        if (menu[0] == '') {
          return true;
        }

        let lowStr = this.searchString.toLowerCase();

        if (menu[0].toLowerCase().includes(lowStr) || menu[2].toLowerCase().includes(lowStr)) {
          return true;
        }

        return false;
      },
      chooseItem(item) {
        this.link.dynamic = true;
        this.link.dynamicKey = item.key;
        this.link.value = item.value;
        this.link.dynamicType = 'link';

        this.returnData(this.link);
      },
      removeDynamicItem() {
        this.link.dynamic = false;
        this.link.dynamicKey = '';
        this.link.value = '';
        this.link.dynamicType = '';

        this.returnData(this.link);
      },
    },
    template:
      '<div>\
        <drop-down>\
            <template v-slot:trigger>\
              <div class="uip-flex uip-flex-row">\
                <div class="uip-padding-xxxs uip-border uip-border-round uip-border-right-square">\
                  <span class="uip-border-round  uip-flex uip-icon uip-text-l uip-text-center">link</span>\
                </div>\
                <div v-if="link.dynamic" class="uip-padding-xxxs uip-border uip-border-right-square uip-background-primary uip-text-inverse">\
                  <span class="uip-border-round  uip-flex uip-icon uip-text-l uip-text-center">database</span>\
                </div>\
              </div>\
            </template>\
            <template v-slot:post-trigger>\
                <input type="text" class="uip-input-small uip-border-left-square uip-border-left-remove" v-model="link.value">\
            </template>\
            <template v-slot:content>\
              <div class="uip-padding-xs uip-max-w-260">\
                <div class="uip-margin-bottom-s">\
                  <toggle-switch :options="linkTypes" :activeValue="activeValue" :returnValue="function(data){ activeValue = data}"></toggle-switch>\
                </div>\
                <template v-if="activeValue == \'admin\'">\
                <div class="uip-margin-bottom-s">\
                  <input type="text" class="uip-input-small uip-w-100p" v-model="searchString" :placeholder="strings.searchLinks">\
                </div>\
                <div class="uip-flex uip-margin-bottom-m uip-flex-column uip-max-h-200 uip-overflow-auto uip-scrollbar">\
                  <template v-for="menu in adminMenu">\
                   <div v-if="menu[0] != \'\' && inSearch(menu)" class="uip-border-round hover:uip-background-muted uip-border-round uip-padding-xxs uip-flex uip-cursor-pointer" @click="chooseLink(menu[2])">\
                     <div class="">\
                      <div class="uip-text-s uip-text-bold" v-html="menu[0]"></div>\
                      <div class="uip-text-s uip-text-muted">{{menu[2]}}</div>\
                     </div>\
                   </div>\
                    <template v-if="menu.submenu" v-for="sub in menu.submenu">\
                      <div v-if="inSearch(menu)" class="uip-border-round hover:uip-background-muted uip-border-round uip-padding-xxs uip-flex uip-cursor-pointer" @click="chooseLink(sub[2])">\
                         <div class="">\
                          <div class="uip-text-s uip-text-bold" v-html="sub[0]"></div>\
                          <div class="uip-text-s uip-text-muted">{{sub[2]}}</div>\
                         </div>\
                       </div>\
                    </template>\
                  </template>\
                </div>\
                </template>\
                <template v-if="activeValue == \'content\'">\
                  <div class="uip-w-250">\
                    <div class="uip-margin-bottom-s">\
                      <input type="text" class="uip-input-small uip-w-100p" v-model="fetchSearchString" :placeholder="strings.searchPages">\
                    </div>\
                    <div class="uip-flex uip-margin-bottom-m uip-flex-column uip-max-h-200 uip-overflow-auto uip-scrollbar">\
                      <template v-for="post in getPosts">\
                       <div class="uip-border-round hover:uip-background-muted uip-border-round uip-padding-xxs uip-flex uip-cursor-pointer" @click="chooseLink(post.link)">\
                         <div class="">\
                          <div class="uip-text-s uip-text-bold">{{post.name}}</div>\
                          <div class="uip-text-s uip-text-muted">{{post.link}}</div>\
                         </div>\
                       </div>\
                      </template>\
                      <div v-if="posts.length < 1 && fetchSearchString != \'\'" class="uip-text-muted uip-text-s uip-padding-xxs">{{strings.noneFound}}</div>\
                    </div>\
                  </div>\
                </template>\
                <template v-if="activeValue == \'dynamic\'">\
                  <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-w-250 uip-max-h-200 uip-scrollbar uip-overflow-auto">\
                    <template v-for="dynamic in dynamics">\
                     <div v-if="dynamic.type == \'link\'" class="uip-border-round hover:uip-background-muted uip-border-round uip-padding-xxs uip-flex uip-flex-between uip-flex-center uip-flex-middle uip-cursor-pointer"  :class="{\'uip-background-primary-wash\' : link.dynamicKey == dynamic.key}">\
                       <div class="">\
                        <div class="uip-text-s uip-text-bold">{{dynamic.label}}</div>\
                        <div class="uip-text-xs uip-text-muted uip-flex uip-flex-center uip-gap-s">\
                          <span class="uip-no-wrap uip-overflow-hidden uip-text-ellipsis uip-max-w-150">{{dynamic.value}}</span>\
                        </div>\
                       </div>\
                       <span v-if="link.dynamicKey == dynamic.key" @click="removeDynamicItem()"\
                       class="uip-padding-xxs uip-border-round uip-background-muted hover:uip-background-grey uip-cursor-pointer uip-flex uip-flex-middle uip-flex-center">\
                        <span class="uip-icon">delete</span>\
                       </span>\
                       <span v-else @click="chooseItem(dynamic)"\
                        class="uip-padding-xxs uip-border-round uip-background-muted hover:uip-background-grey uip-cursor-pointer uip-flex uip-flex-middle uip-flex-center">\
                         {{strings.select}}\
                        </span>\
                     </div>\
                    </template>\
                  </div>\
                </template>\
              </div>\
            </template>\
        </drop-down>\
        <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs uip-flex-grow uip-margin-top-s uip-margin-bottom-xxs">{{strings.newTab}}</div>\
        <toggle-switch :options="linkModes" :activeValue="link.newTab" :returnValue="function(data){ link.newTab = data}"></toggle-switch>\
      </div>',
  };
}
