const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      display: String,
      name: String,
      block: Object,
    },
    data: function () {
      return {
        menu: JSON.parse(JSON.stringify(this.uipData.adminMenu.menu)),
        activeMenu: false,
        activeLink: '',
        breadCrumbs: [{ name: __('Home', 'uipress-lite'), url: this.uipData.dynamicOptions.viewadmin.value }],
        menuDirection: this.block.settings.block.options.menuDirection.value.value,
        strings: {
          mainmenu: __('Main menu', 'uipress-lite'),
          collapseMenu: __('Collapse menu', 'uipress-lite'),
        },
        collapsed: false,
      };
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    watch: {
      breadCrumbs: {
        handler(newValue, oldValue) {
          let self = this;
          let breadChange = new CustomEvent('uip_breadcrumbs_change', { detail: { crumbs: self.breadCrumbs } });
          document.dispatchEvent(breadChange);
        },
        deep: true,
      },
      collapsed: {
        handler(newVal, oldVal) {
          if (newVal) {
            document.documentElement.setAttribute('uip-menu-collapsed', 'true');
          } else {
            document.documentElement.setAttribute('uip-menu-collapsed', 'false');
          }

          this.uipress.saveUserPreference('menuCollapsed', newVal, false);
        },
      },
    },
    mounted: function () {
      let self = this;

      if (this.uipData.userPrefs.menuCollapsed && this.showCollapse) {
        this.collapsed = true;
      }

      document.addEventListener(
        'uip_page_change',
        (e) => {
          if (e.detail.url == '') {
            self.activeLink = e.detail.url;
          } else {
            self.activeLink = e.detail.url.replaceAll('%2F', '/');
          }
        },
        { once: false }
      );
      document.addEventListener(
        'uip_page_change_loaded',
        (e) => {
          self.updateMenuFromFrame();
          self.returnMenu;
        },
        { once: false }
      );
    },
    computed: {
      subMenuStyle() {
        if (this.collapsed) {
          return 'hover';
        }
        return this.block.settings.block.options.subMenuStyle.value.value;
      },
      getHidden() {
        let hidden = this.block.settings.block.options.hiddenMenuItems.value;

        if (this.uipress.isObject(hidden)) {
          return [];
        } else {
          return hidden;
        }
      },
      returnMenu() {
        let currentLink = this.activeLink;
        let self = this;
        let newMenu = this.menu;
        let currentActive = {};
        let activeFound = false;

        newMenu = this.checkForadvancedMenu(this.menu);

        self.breadCrumbs = [{ name: __('Home', 'uipress-lite'), url: self.uipData.dynamicOptions.viewadmin.value }];

        for (const item of newMenu) {
          if (item.active) {
            currentActive = item;
          }
          item.active = false;
          if (currentLink != '' && item.url == currentLink) {
            item.active = true;
            activeFound = true;
            self.breadCrumbs.push({ name: item.name, url: item.url });
          }

          let parentActive = false;
          if (item.submenu && item.submenu.length > 0) {
            for (const sub of item.submenu) {
              sub.active = false;

              if (currentLink != '' && sub.url == currentLink) {
                sub.active = true;
                activeFound = true;
                parentActive = sub;
                self.breadCrumbs.push({ name: sub.name, url: sub.url });
              }
            }
          }

          if (parentActive) {
            item.active = true;
            self.activeMenu = item;
            self.breadCrumbs = [{ name: __('Home', 'uipress-lite'), url: self.uipData.dynamicOptions.viewadmin.value }];
            self.breadCrumbs.push({ name: item.name, url: item.url });
            self.breadCrumbs.push({ name: parentActive.name, url: parentActive.url });
          }
        }

        if (!activeFound) {
          currentActive.active = true;
        }
        //console.log(currentActive);

        return newMenu;
      },
      subMenuCustomIcon() {
        let icon = this.uipress.get_block_option(this.block, 'block', 'subMenuIcon');
        if (icon.value) {
          return icon.value;
        } else {
          return false;
        }
      },
      subMenuCustomIcon() {
        let icon = this.uipress.get_block_option(this.block, 'block', 'subMenuIcon');
        if (icon.value) {
          return icon.value;
        } else {
          return false;
        }
      },
      menuAutoUpdate() {
        let update = this.uipress.get_block_option(this.block, 'block', 'disableAutoUpdate');
        return update;
      },
      showCollapse() {
        let update = this.uipress.get_block_option(this.block, 'block', 'menuCollapse');
        return update;
      },
    },
    methods: {
      returnCustomMenu() {
        let customMenu = this.uipress.get_block_option(this.block, 'block', 'advancedoptions');

        if (typeof customMenu === 'undefined') {
          return false;
        }

        if (!customMenu) {
          return false;
        }

        if (!Array.isArray(customMenu)) {
          return false;
        }

        if (customMenu.length < 1) {
          return;
        }

        return customMenu;
      },
      checkForadvancedMenu(currentMenu) {
        if (!this.returnCustomMenu()) {
          return currentMenu;
        }

        let custom = JSON.parse(JSON.stringify(this.returnCustomMenu()));

        let allUIDs = [];
        let autoUpdate = this.menuAutoUpdate;

        //Loop through custom menu and get all UIDs
        for (let parent of custom) {
          if ('uid' in parent) {
            allUIDs.push(parent.uid);
          }

          if (!('submenu' in parent)) {
            continue;
          }

          for (let sub of parent.submenu) {
            if ('uid' in sub) {
              allUIDs.push(sub.uid);
            }
          }
        }

        let notifications = {};
        let availableItems = [];
        let actualMenu = JSON.parse(JSON.stringify(currentMenu));
        //Now lets loop through all standard menu links. If new items have been added then inject them into the custom menu
        for (let [index, parent] of currentMenu.entries()) {
          let uid = false;
          if ('uid' in parent) {
            uid = parent.uid;
            availableItems.push(uid);
            if (!allUIDs.includes(uid)) {
              if (!autoUpdate) {
                custom.splice(index, 0, parent);
              }
              if ('notifications' in parent) {
                notifications[parent.uid] = parent.notifications;
              }
              continue;
            }
            //Track updated notification count
            if ('notifications' in parent) {
              notifications[parent.uid] = parent.notifications;
            }
          }

          if (!('submenu' in parent)) {
            continue;
          }

          if (!Array.isArray(parent.submenu)) {
            continue;
          }

          if (parent.submenu.length < 1) {
            continue;
          }

          for (let [subindex, sub] of parent.submenu.entries()) {
            if ('uid' in sub) {
              let subuid = sub.uid;
              availableItems.push(subuid);
              if ('notifications' in sub) {
                notifications[subuid] = sub.notifications;
              }

              //Don't add anything else to the menu
              if (autoUpdate) {
                continue;
              }

              if (!allUIDs.includes(subuid)) {
                //Not found in the current menu. Lets check to see if it's normal parent is in the top level list
                let newParent = custom.filter((obj) => {
                  return obj.uid == uid;
                });

                if (typeof newParent !== 'undefined' && newParent.length > 0) {
                  //newParent[0].submenu.splice(subindex, 0, sub);
                  if (!('submenu' in newParent[0])) {
                    newParent[0].submenu = [];
                  }
                  //newParent[0].submenu.splice(subindex, 0, sub);
                  allUIDs.push(sub.name + subuid);
                  continue;
                } else {
                  //It's parent doesn't exist in the top level so push it to top level
                  custom.push(sub);
                  allUIDs.push(sub.name + subuid);
                }
              }
            }
          }
        }

        //Loop through custom menu and delete items that do not exist anymore
        for (var i = custom.length - 1; i >= 0; i--) {
          let parent = custom[i];
          if ('uid' in parent) {
            if (parent.uid in notifications) {
              parent.notifications = notifications[parent.uid];
            }

            if (!parent.custom && !availableItems.includes(parent.uid)) {
              custom.splice(i, 1);
            }
          }

          if (!('submenu' in parent)) {
            continue;
          }

          for (var p = parent.submenu.length - 1; p >= 0; p--) {
            let sub = parent.submenu[p];
            if ('uid' in sub) {
              if (sub.uid in notifications) {
                sub.notifications = notifications[sub.uid];
              }
              if (!sub.custom && !availableItems.includes(sub.uid)) {
                parent.submenu.splice(i, 1);
              }
            }
          }
        }

        this.block.settings.block.options.advancedoptions.value = custom;

        return custom;
      },
      updateMenuFromFrame() {
        //Watch for toolbar changes in frame
        let frames = document.getElementsByClassName('uip-page-content-frame');
        let self = this;

        if (frames[0]) {
          let frame = frames[0];
          //Update menu items when the page changes
          if (frame.contentWindow.uipMasterMenu && typeof frame.contentWindow.uipMasterMenu != undefined) {
            let mastermenu = frame.contentWindow.uipMasterMenu;
            if (typeof mastermenu === 'undefined') {
              return;
            }
            if (!('menu' in mastermenu)) {
              return;
            }
            self.menu = JSON.parse(JSON.stringify(mastermenu.menu));
          }
        }
      },
      activeItem(item, evt) {
        item.active = true;
        if (evt.ctrlKey || evt.shiftKey || evt.metaKey || (evt.button && evt.button == 1)) {
          return;
        } else {
          evt.preventDefault();
        }

        let self = this;

        if (item.submenu && item.submenu.length > 0) {
          this.activeMenu = item;
        }

        let absoluteCheck = new RegExp('^(?:[a-z+]+:)?//', 'i');
        let absoluteURL = item.url;
        if (!absoluteCheck.test(absoluteURL)) {
          absoluteURL = this.uipData.dynamicOptions.viewadmin.value + absoluteURL;
        }

        //Open without frame
        if (item.withoutFrame) {
          let url = new URL(absoluteURL);
          url.searchParams.set('uip-framed-page', 1);
          absoluteURL = url.href;
        }

        //Open without uipress
        if (item.withoutUiPress) {
          let url = new URL(absoluteURL);
          let uid = self.uipress.createUID();
          url.searchParams.set('uipwf', uid);
          url.searchParams.set('uip-framed-page', 0);
          absoluteURL = url.href;

          //Set data
          let formData = new FormData();
          formData.append('action', 'uip_create_frame_switch');
          formData.append('security', uip_ajax.security);
          formData.append('uid', uid);

          self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
            if (item.newTab) {
              this.$refs.newTab.href = absoluteURL;
              this.$refs.newTab.click();
              this.$refs.newTab.href = '';
              this.$refs.newTab.blur();
            } else {
              this.uipress.updatePage(absoluteURL, true);
            }
          });
          return;
        }

        //Open in new tab
        if (item.newTab || item.withoutFrame) {
          this.$refs.newTab.href = absoluteURL;
          this.$refs.newTab.click();
          this.$refs.newTab.href = '';
          this.$refs.newTab.blur();
          return;
        }

        this.uipress.updatePage(item.url);
        //this.returnMenu;
      },
      ifHiden(uid) {
        if (this.getHidden.includes(uid)) {
          return false;
        }

        return true;
      },
      hideIcons() {
        if (this.collapsed) {
          return false;
        }
        return this.block.settings.block.options.hideIcons.value;
      },
      returnDirection() {
        if (this.block.settings.block.options.menuDirection.value.value == 'vertical') {
          return 'uip-flex-column';
        } else {
          return 'uip-flex-row uip-flex-wrap';
        }
      },
      customIcon(item) {
        let id = item.uid;
        let icons = this.block.settings.block.options.editMenuItems.value;

        if (!this.uipress.isObject(icons)) {
          return 'article';
        }
        if (Object.hasOwn(icons, id)) {
          let value = icons[id].icon;
          if (value && value != '') {
            return value;
          }
        }

        if (typeof item.icon === 'undefined') {
          return 'article';
        }
        if (item.icon.includes('uipblank')) {
          item.icon = item.icon.replace('uipblank', 'article');
        }
        return item.icon;
      },
      customTitle(item) {
        let id = item.uid;
        let icons = this.block.settings.block.options.editMenuItems.value;

        if (!this.uipress.isObject(icons)) {
          return false;
        }
        if (Object.hasOwn(icons, id)) {
          let value = icons[id].title;
          if (typeof value !== 'undefined') {
            return value;
          }
        }
        return item.name;
      },
      returnDropPos() {
        if (this.block.settings.block.options.menuDirection.value.value == 'horizontal') {
          return 'bottom-left';
        } else {
          return 'right';
        }
      },
      isMenuHorizontal() {
        if (this.block.settings.block.options.menuDirection.value.value == 'horizontal') {
          return true;
        } else {
          return false;
        }
      },
      returnClasses() {
        let classes = '';

        let advanced = this.uipress.get_block_option(this.block, 'advanced', 'classes');
        classes += advanced;

        if (this.collapsed) {
          classes += ' uip-menu-collapsed';
        }
        return classes;
      },
    },
    template: `
    
          <div class="uip-admin-menu uip-text-normal" :id="block.uid" :class="returnClasses()">
    
            
            <!--INLINE DROP MENU-->
            <template v-if="subMenuStyle == 'inline' && !isMenuHorizontal()">
              <div class="uip-flex" :class="returnDirection()">
            
                <template v-for="item in returnMenu">
                
                  <template v-if="!item.hidden">
                
                    <div v-if="item.type != 'sep' && ifHiden(item.uid)" class="uip-flex uip-flex-column uip-row-gap-xs">
                      <a :href="item.url" @click="activeItem(item, $event)" class="uip-unset-all uip-link-focus uip-flex uip-gap-xxs uip-flex-center uip-cursor-pointer uip-top-level-item uip-margin-bottom-xs" :class="{'uip-top-level-item-active' : item.active}">
                        <div v-if="!hideIcons()" v-html="customIcon(item)" class="uip-flex uip-flex-center uip-menu-icon uip-icon uip-icon-medium"></div>
                        <div class="uip-flex-grow uip-flex uip-gap-xs uip-flex-center">
                          <div>{{customTitle(item)}}</div>
                          <div v-if="item.notifications && item.notifications > 0" class="uip-border-round uip-h-14 uip-ratio-1-1 uip-background-secondary uip-text-inverse uip-text-xxs uip-text-bold uip-flex uip-flex-center uip-flex-middle uip-menu-notification"><span>{{item.notifications}}</span></div>
                        </div>
                        <template v-if="!subMenuCustomIcon && item.submenu && item.submenu.length > 0">
                          <div v-if="!item.active" class="uip-icon uip-margin-left-auto">chevron_right</div>
                          <div v-if="item.active" class="uip-icon uip-margin-left-auto">expand_more</div>
                        </template>
                        <div v-else-if="item.submenu && item.submenu.length > 0" class="uip-icon uip-margin-left-auto uip-submenu-icon" >{{subMenuCustomIcon}}</div>
                      </a>
                      <div v-if="item.submenu && item.active && item.submenu.length > 0" class="uip-admin-submenu uip-margin-left-s uip-margin-bottom-s">
                        <div class="uip-flex uip-flex-column uip-row-gap-xxs">
                          <template v-for="sub in item.submenu">
                          
                            <template v-if="!sub.hidden">
                            
                              <div v-if="sub.type != 'sep'" class="uip-flex-grow uip-flex uip-gap-xs uip-flex-center">
                                <a :href="sub.url" @click="activeItem(sub, $event)" :class="{'uip-sub-level-item-active' : sub.active}" class="uip-unset-all uip-link-focus uip-cursor-pointer uip-sub-level-item">{{sub.name}}</a>
                                <div v-if="sub.notifications && sub.notifications > 0" class="uip-border-circle uip-w-14 uip-h-14 uip-ratio-1-1 uip-background-secondary uip-text-inverse uip-text-xxs uip-flex uip-flex-center uip-flex-middle uip-menu-notification"><span>{{sub.notifications}}</span></div>
                              </div>
                              
                              <div v-else-if="!sub.name" class="uip-margin-bottom-s uip-menu-separator"></div>
                              
                              <div v-else class="uip-margin-bottom-s uip-margin-top-s uip-flex uip-flex-row uip-gap-xxs uip-menu-separator">
                                <span v-if="sub.icon" class="uip-icon">{{sub.icon}}</span>
                                <span>{{sub.name}}</span>
                              </div>
                              
                            </template>
                            
                          </template>
                        </div>
                      </div>
                    </div>
                    
                    <div v-else-if="!item.name && ifHiden(item.uid)" class="uip-margin-bottom-s uip-menu-separator"></div>
                    
                    <div v-else-if="ifHiden(item.uid)" class="uip-margin-bottom-s uip-margin-top-s uip-flex uip-flex-row uip-gap-xxs uip-menu-separator">
                      <span v-if="item.icon" class="uip-icon">{{item.icon}}</span>
                      <span>{{item.name}}</span>
                    </div>
                  
                  </template>
                  
                </template>
              
              </div>
            </template>
            <!--END INLINE DROP MENU-->
            
            
            
            
            <!--HOVER DROP MENU-->
            <template v-if="subMenuStyle == 'hover' || isMenuHorizontal()">
              <div class="uip-flex" :class="returnDirection()">
                <template v-for="item in returnMenu">
                
                
                  <template v-if="!item.hidden">
                  
                    <template v-if="item.type != 'sep'  && ifHiden(item.uid)">
                  
                      <drop-down :hover="true" triggerClass="uip-flex uip-flex-grow" :dropPos="returnDropPos()">
                        <template v-slot:trigger>
                          <a :href="item.url" @click="activeItem(item, $event)" class="uip-unset-all uip-link-focus uip-flex uip-gap-xxs uip-flex-center uip-cursor-pointer uip-top-level-item uip-margin-bottom-xs uip-w-100p"
                          :class="{'uip-top-level-item-active' : item.active}">
                            <div v-if="!hideIcons()" v-html="customIcon(item)" class="uip-flex uip-flex-center uip-menu-icon uip-icon uip-icon-medium"></div>
                            <div class="uip-flex-grow uip-flex uip-gap-xs uip-flex-center uip-line-height-1" v-if="!collapsed">
                              <div class="">{{customTitle(item)}}</div>
                              <div v-if="item.notifications && item.notifications > 0" class="uip-border-circle uip-w-14 uip-h-14 uip-ratio-1-1 uip-background-secondary uip-text-inverse uip-text-xxs uip-text-bold uip-flex uip-flex-center uip-flex-middle uip-menu-notification"><span>{{item.notifications}}</span></div>
                            </div>
                          </a>
                        </template>
                        <template v-slot:content v-if="item.submenu && item.submenu.length > 0">
                          <div class="uip-admin-submenu uip-padding-xs">
                            <div class="uip-flex uip-flex-column uip-row-gap-xxs">
                              <a :href="item.url" @click="activeItem(item, $event)" class="uip-unset-all uip-link-focus uip-flex uip-gap-xxs uip-flex-center uip-sub-menu-header uip-margin-bottom-xs"
                              :class="{'uip-top-level-item-active' : item.active}">
                                <div v-if="!hideIcons()" v-html="item.icon" class="uip-flex uip-flex-center uip-menu-icon"></div>
                                <div class="uip-flex-grow" v-html="item.name"></div>
                              </a>
                              <template v-for="sub in item.submenu">
                              
                                <template v-if="!sub.hidden">
                                
                                  <div v-if="sub.type != 'sep'" class="uip-flex-grow uip-flex uip-gap-xs uip-flex-center">
                                    <a :href="sub.url" @click="activeItem(sub, $event)" :class="{'uip-sub-level-item-active' : sub.active}" class="uip-unset-all uip-link-focus uip-cursor-pointer uip-sub-level-item">
                                      {{sub.name}}
                                    </a>
                                    <div v-if="sub.notifications && sub.notifications > 0" class="uip-border-circle uip-w-14 uip-h-14 uip-ratio-1-1 uip-background-secondary uip-text-inverse uip-text-xxs uip-flex uip-flex-center uip-flex-middle uip-menu-notification"><span>{{sub.notifications}}</span></div>
                                  </div>
                                  
                                  <div v-else-if="!sub.name" class="uip-margin-bottom-s uip-menu-separator"></div>
                                  
                                  <div v-else class="uip-margin-bottom-s uip-margin-top-s uip-flex uip-flex-row uip-gap-xxs uip-menu-separator">
                                    <span v-if="sub.icon" class="uip-icon">{{sub.icon}}</span>
                                    <span>{{sub.name}}</span>
                                  </div>
                                
                                </template>
                                
                              </template>
                            </div>
                          </div>
                        </template>
                      </drop-down>
                    
                    </template>
                    
                    
                    <div v-else-if="!item.name && ifHiden(item.uid)" class="uip-margin-bottom-s uip-menu-separator"></div>
                    
                    <div v-else-if="ifHiden(item.uid)" class="uip-margin-bottom-s uip-margin-top-s uip-flex uip-flex-row uip-gap-xxs uip-menu-separator">
                      <span v-if="item.icon && !collapsed" class="uip-icon">{{item.icon}}</span>
                      <span v-if="!collapsed">{{item.name}}</span>
                    </div>
                    
                  </template>  
                  
                  
                </template>
              </div>
            </template>
            <!--END HOVER DROP MENU-->
            
            
            
            <!--DYNAMIC MENU-->
            <template v-if="subMenuStyle == 'dynamic' && !isMenuHorizontal()">
              <div class="uip-flex uip-gap-x" :class="returnDirection()">
                <template v-if="activeMenu == false" v-for="item in returnMenu">
                
                  <template v-if="!item.hidden">
                  
                    <template v-if="item.type != 'sep' && ifHiden(item.uid)">
                      <a :href="item.url" @click="activeItem(item, $event)" class="uip-unset-all uip-link-focus uip-flex uip-gap-xxs uip-flex-center uip-cursor-pointer uip-top-level-item uip-margin-bottom-xs"
                      :class="[{'uip-top-level-item-active' : item.active}, item.customClasses]" >
                        <div v-if="!hideIcons()" v-html="customIcon(item)" class="uip-flex uip-flex-center uip-menu-icon uip-icon uip-icon-medium"></div>
                        <div class="uip-flex-grow uip-flex uip-gap-xs uip-flex-center uip-line-height-1">
                          <div>{{customTitle(item)}}</div>
                          <div v-if="item.notifications && item.notifications > 0" class="uip-border-circle uip-w-14 uip-h-14 uip-ratio-1-1 uip-background-secondary uip-text-inverse uip-text-xxs uip-text-bold uip-flex uip-flex-center uip-flex-middle uip-menu-notification"><span>{{item.notifications}}</span></div>
                        </div>
                        <template v-if="!subMenuCustomIcon && item.submenu && item.submenu.length > 0">
                          <div class="uip-icon uip-margin-left-auto">chevron_right</div>
                        </template>
                        <div v-else-if="item.submenu && item.submenu.length > 0" class="uip-icon uip-margin-left-auto uip-submenu-icon" >{{subMenuCustomIcon}}</div>
                      </a>
                    </template>
                    
                    <div v-else-if="!item.name  && ifHiden(item.uid)" class="uip-margin-bottom-s uip-menu-separator"></div>
                    
                    <div v-else-if="ifHiden(item.uid)" class="uip-margin-bottom-s uip-margin-top-s uip-flex uip-flex-row uip-gap-xxs uip-menu-separator">
                      <span v-if="item.icon" class="uip-icon">{{item.icon}}</span>
                      <span>{{item.name}}</span>
                    </div>
                  
                  </template>
                  
                  
                </template>
                
                
                
                <template v-else>
                
                  <div class="uip-flex uip-flex-column uip-row-gap-m uip-slide-in-right">
                    <div class="uip-flex uip-gap-xxs uip-flex-row uip-flex-center uip-cursor-pointer" @click="activeMenu = false">
                      <div class="uip-icon uip-icon-medium">chevron_left</div>
                      <div class="uip-flex-grow">{{strings.mainmenu}}</div>
                    </div>
                    <div class="uip-flex uip-gap-xxs uip-flex-row uip-flex-center uip-text-bold uip-text-l uip-sub-menu-header">
                      <div class="uip-flex-grow" v-html="activeMenu.name"></div>
                    </div>
                    <div v-if="activeMenu.submenu" class="uip-admin-submenu">
                      <div class="uip-flex uip-flex-column uip-row-gap-xxs">
                        <template v-for="sub in activeMenu.submenu">
                          
                          <template v-if="!sub.hidden">
                          
                            <div v-if="sub.type != 'sep'" class="uip-flex-grow uip-flex uip-gap-xs uip-flex-center" :class="sub.customClasses">
                              <a :href="sub.url" @click="activeItem(sub, $event)" :class="{'uip-sub-level-item-active' : sub.active}" class="uip-unset-all uip-link-focus uip-cursor-pointer uip-sub-level-item">{{sub.name}}</a>
                              <div v-if="sub.notifications && sub.notifications > 0" class="uip-border-circle uip-w-14 uip-h-14 uip-ratio-1-1 uip-background-secondary uip-text-inverse uip-text-xxs uip-flex uip-flex-center uip-flex-middle uip-menu-notification"><span>{{sub.notifications}}</span></div>
                            </div>
                            
                            <div v-else-if="!sub.name" class="uip-margin-bottom-s uip-menu-separator"></div>
                            
                            <div v-else class="uip-margin-bottom-s uip-margin-top-s uip-flex uip-flex-row uip-gap-xxs uip-menu-separator">
                              <span v-if="sub.icon" class="uip-icon">{{sub.icon}}</span>
                              <span>{{sub.name}}</span>
                            </div>
                          
                          </template>
                          
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </template>
            <!--END DYNAMIC MENU-->
            <a ref="newTab" target="_BLANK" class="uip-hidden"></a>
            
            <div v-if="showCollapse" class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center uip-link-muted uip-margin-top-m uip-menu-collapse" @click="collapsed = !collapsed">
              <div v-if="collapsed" class="uip-icon uip-text-xl">chevron_right</div>
              <div v-if="!collapsed" class="uip-icon uip-text-xl">chevron_left</div>
              <div v-if="!collapsed">{{strings.collapseMenu}}</div>
            </div>
            
          </div>`,
  };
}
