/**
 * Builds the main ui builder shell
 * @since 3.0.0
 */
const { __, _x, _n, _nx } = wp.i18n;

export function moduleData() {
  return {
    inject: ['uipData', 'router', 'uipress', 'uiTemplate'],

    data: function () {
      return {
        loading: true,
        themes: [],
        search: '',
        activeTemplate: false,
        imageIndex: 0,
        imageHover: false,
        strings: {
          missingMessage: __('This block no longer exists', 'uipress-lite'),
          templateLibrary: __('Template library', 'uipress-lite'),
          pro: __('Pro', 'uipress-lite'),
          searchTemplates: __('Search templates', 'uipress-lite'),
          backToAllThemes: __('Back to all templates', 'uipress-lite'),
          includesProBlocks: __('Includes pro blocks', 'uipress-lite'),
          createdBy: __('Created by', 'uipress-lite'),
          addToTemplate: __('Add to template', 'uipress-lite'),
          replaceContent: __('Replace current layout', 'uipress-lite'),
          addAtEndOfContent: __('Add to end of layout', 'uipress-lite'),
          requires: __('Requires uipress', 'uipress-lite'),
          downloadcount: __('How many times this template has been downloaded', 'uipress-lite'),
          sortBy: __('Sort by', 'uipress-lite'),
          include: __('Include', 'uipress-lite'),
        },
        sortby: 'newest',
        sortOptions: {
          downloads: {
            label: __('Downloads', 'uipress-lite'),
            value: 'downloads',
          },
          newest: {
            label: __('Newest', 'uipress-lite'),
            value: 'newest',
          },
          oldest: {
            label: __('Oldest', 'uipress-lite'),
            value: 'oldest',
          },
        },
        typeOptions: {
          uiTemplates: {
            label: __('UI templates', 'uipress-lite'),
            value: 'ui-template',
            selected: true,
          },
          adminPages: {
            label: __('Admin pages', 'uipress-lite'),
            value: 'ui-admin-page',
            selected: true,
          },
        },
      };
    },
    watch: {
      sortby: {
        handler(newValue, oldValue) {
          this.fetchThemes();
        },
      },
      typeOptions: {
        handler(newValue, oldValue) {
          this.fetchThemes();
        },
        deep: true,
      },
    },
    mounted: function () {
      this.fetchThemes();
      let self = this;
    },
    computed: {
      returnSortBy() {
        return this.sortby;
      },

      returnFilter() {
        let filter = '';
        for (let key in this.typeOptions) {
          if (this.typeOptions[key].selected) {
            filter += this.typeOptions[key].value + '||';
          }
        }
        if (filter == '') {
          this.typeOptions.uiTemplates.selected = true;
        }
        return filter;
      },
    },
    methods: {
      goBack() {
        let ID = this.$route.params.templateID;
        this.router.push('/uibuilder/' + ID + '/');
      },
      fetchThemes() {
        let self = this;
        self.loading = true;
        let formData = new FormData();
        let URL = 'https://api.uipress.co/templates/list/' + '?sort=' + this.returnSortBy + '&filter=' + this.returnFilter;

        self.uipress.callServer(URL, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, 'uipress-lite', '', 'error', true);
            self.loading = false;
          }
          self.loading = false;
          self.themes = response;
        });
      },
      inSearch(template) {
        if (this.search == '') {
          return true;
        }
        let str = this.search.toLowerCase();

        if (template.name.toLowerCase().includes(str)) {
          return true;
        }
        if (template.description.toLowerCase().includes(str)) {
          return true;
        }
        return false;
      },
      addToContent(insertAt, template) {
        let parsed;
        let self = this;
        let type = template.type;

        let formData = new FormData();
        let URL = 'https://api.uipress.co/templates/get/?templateid=' + self.activeTemplate.ID;
        let notiID = self.uipress.notify(__('Importing template', 'uipress-lite'), '', 'default', false, true);

        self.uipress.callServer(URL, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, 'uipress-lite', '', 'error', true);
            self.uipress.destroy_notification(notiID);
          }
          self.uipress.destroy_notification(notiID);
          let template = response;
          self.injectTemplate(template, insertAt, type);
        });
      },
      injectTemplate(template, insertAt, type) {
        let parsed = false;
        try {
          parsed = JSON.parse(template);
        } catch (error) {
          this.uipress.notify(__('Unable to import template', 'uipress-lite'), error, 'error', true, false);
          return;
        }

        let currentTem = JSON.parse(JSON.stringify(this.uiTemplate.content));

        if (Array.isArray(parsed)) {
          let freshLayout = [];
          for (const block of parsed) {
            freshLayout.push(this.cleanBlock(block));
          }
          if (insertAt == 'replace') {
            this.uiTemplate.content = freshLayout;
          }
          if (insertAt == 'add') {
            for (const block of freshLayout) {
              this.uiTemplate.content.push(block);
            }
          }
          if (type == 'Layout') {
            this.uiTemplate.globalSettings.type = 'ui-template';
          } else if (type == 'Admin Page') {
            this.uiTemplate.globalSettings.type = 'ui-admin-page';
          }
        }

        let newTem = JSON.parse(JSON.stringify(this.uiTemplate.content));
        this.uipress.logHistoryChange(__('Template imported from library', 'uipress-lite'), currentTem, newTem);

        this.uipress.notify(__('Template added', 'uipress-lite'), '', 'success', true, false);
      },
      //Iterate over content and create new UIDs
      cleanBlock(block) {
        let item = Object.assign({}, block);
        //item.uid = this.uipress.createUID();
        item.options = [];
        item.settings = JSON.parse(JSON.stringify(item.settings));

        if (item.content) {
          item.content = this.duplicateChildren(item.content);
        }

        return item;
      },

      duplicateChildren(content) {
        let returnChildren = [];

        for (let block of content) {
          let item = Object.assign({}, block);
          //item.uid = this.uipress.createUID();
          item.settings = JSON.parse(JSON.stringify(item.settings));

          if (item.content) {
            item.content = this.duplicateChildren(item.content);
          }

          returnChildren.push(item);
        }

        return returnChildren;
      },
      getBackgroundImg(img) {
        return 'background-image:url("' + img + '");';
      },
      navImagesForward() {
        if (this.imageIndex + 1 > this.activeTemplate.images.length - 1) {
          this.imageIndex = 0;
        } else {
          this.imageIndex += 1;
        }
      },
      navImagesBackward() {
        if (this.imageIndex - 1 < 0) {
          this.imageIndex = this.activeTemplate.images.length - 1;
        } else {
          this.imageIndex -= 1;
        }
      },
    },
    template: `<div class="uip-background-default uip-flex uip-flex-column uip-border-box">
      
		    <div class="uip-flex uip-flex-column uip-h-100p uip-max-h-100p">
          <!--Title block -->
          <div class="uip-margin-bottom-s">
            <div class="">
		          <div class="uip-flex uip-gap-xs uip-margin-bottom-xxs uip-flex-center uip-flex-between">
                <div class="uip-text-bold uip-blank-input uip-text-l">{{strings.templateLibrary}}</div>
		          </div>
            </div>
          </div>
          <!--EndTitle block -->
            
          <template v-if="!activeTemplate">
            <!--Filters and search-->
            <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-margin-bottom-s">
              <drop-down>
                <template v-slot:trigger>
                  <uip-tooltip :message="strings.sortBy">
                    <div class="uip-link-muted uip-padding-xxxs uip-border-round hover:uip-background-muted">
                      <span class="uip-icon uip-text-xl">sort</span>
                    </div>
                  </uip-tooltip>
                </template>
                <template v-slot:content>
                  <div class="uip-flex uip-flex-column">
                    
                    <div class="uip-padding-xxs uip-border-bottom">
                      <div class="uip-padding-xxs uip-text-muted">{{strings.sortBy}}</div>
                      <template v-for="item in sortOptions">
                        <div @click="sortby = item.value"
                        class="uip-w-150 uip-padding-xxs uip-border-round hover:uip-background-muted uip-cursor-pointer uip-flex uip-flex-row uip-flex-between uip-flex-center" :class="{'uip-background-grey' : item.value == sortby}">
                          <span>{{item.label}}</span>
                          <span v-if="item.value == sortby" class="uip-icon uip-text-l">done</span>
                        </div>
                      </template>
                    </div>
                    
                    <div class="uip-padding-xxs">
                      <div class="uip-padding-xxs uip-text-muted">{{strings.include}}</div>
                      <template v-for="item in typeOptions">
                        <label @click="sortby = item.value"
                        class="uip-w-150 uip-padding-xxs uip-border-round hover:uip-background-muted uip-cursor-pointer uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
                          
                          <input class="uip-checkbox" type="checkbox" v-model="item.selected">
                          <span>{{item.label}}</span>
                          
                        </label>
                      </template>
                    </div>
                    
                  </div>
                </template>
              </drop-down>
              
              <div class="uip-flex uip-padding-xxs uip-border-bottom uip-search-block uip-flex-grow">
                <span class="uip-icon uip-text-muted uip-margin-right-xs uip-text-l uip-icon uip-icon-medium">search</span>
                <input class="uip-blank-input uip-flex-grow uip-text-s" type="search" :placeholder="strings.searchTemplates" autofocus="" v-model="search">
              </div>
            </div>
            <!--Filters and search-->
          
        
            <div v-if="loading" class="uip-padding-m uip-flex uip-flex-center uip-flex-middle"><loading-chart></loading-chart></div>
        
            <div v-else class="uip-flex uip-flex-column uip-row-gap-s uip-flex-grow uip-overflow-auto uip-scrollbar uip-padding-bottom-l" >
              <template v-for="theme in themes">
                <div v-if="inSearch(theme)" >
                  <div class="uip-border-round uip-padding-xxs hover:uip-background-muted uip-cursor-pointer uip-pattern-drag" @click="activeTemplate = theme">
                    <div class="uip-flex uip-flex-column uip-row-gap-xs uip-flex-left">
                      <img :src="theme.img" :alt="theme.theme_title" class="uip-w-100p uip-h-100p uip-border uip-border-round uip-ratio-16-10">
                      <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-flex-shrink">
                        <div class="uip-flex uip-flex-between">
                          <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
                            <span class="uip-text-emphasis uip-text-bold">{{theme.name}}</span>
                            <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
                              <span class="uip-text-xs uip-background-primary-wash uip-border-round uip-padding-xxxs uip-post-type-label">{{theme.type}}</span>
                              <uip-tooltip :message="strings.downloadcount">
                                <div class="uip-text-xs uip-background-primary-wash uip-border-round uip-padding-xxxs uip-post-type-label uip-flex uip-flex-row uip-gap-xxxs">
                                  <span class="uip-icon">file_download</span>
                                  {{theme.downloads}}
                                </div>
                              </uip-tooltip>
                            </div>
                          </div>
                        </div>
                        <div class="uip-text-s uip-text-muted uip-max-w-100p uip-no-wrap uip-overflow-hidden uip-text-ellipsis">{{theme.description}}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>
          
          <div v-if="activeTemplate" class="uip-flex uip-flex-column uip-row-gap-s ">
            <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center uip-text-muted uip-link-muted" @click="activeTemplate = false">
              <div class="uip-icon uip-text-l uip-icon-medium">chevron_left</div>
              <div class="">{{strings.backToAllThemes}}</div>
            </div>
            <div @mouseenter="imageHover = true" @mouseleave="imageHover = false" class=" uip-max-w-100p uip-position-relative">
              <div ref="imgHover" :style="getBackgroundImg(activeTemplate.images[imageIndex])" class="uip-w-100p uip-border-round uip-border uip-ratio-16-10"
                style="background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                transition: transform 0.5s ease-out;">
              </div>
              <div @click="navImagesBackward()" class="uip-position-absolute uip-left-0 uip-translate-y-50 uip-top-50p uip-padding-xxs uip-cursor-pointer uip-fade-in" v-if="activeTemplate.images.length > 0 && imageHover">
                <div class="uip-icon uip-text-xxl" >chevron_left</div>
              </div>
              <div @click="navImagesForward()" class="uip-position-absolute uip-right-0 uip-translate-y-50 uip-top-50p uip-padding-xxs uip-cursor-pointer uip-fade-in" v-if="activeTemplate.images.length > 0 && imageHover">
                <div class="uip-icon uip-text-xxl">chevron_right</div>
              </div>
            </div>
            <div class="uip-flex uip-flex-column uip-row-gap-xxxs">
              <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
                <div class="uip-text-emphasis uip-text-l uip-text-emphasis">{{activeTemplate.name}}</div>
                <div class="uip-flex uip-padding-xxxs uip-background-orange-wash uip-padding-left-xxs uip-padding-right-xxs uip-border-round uip-flex-center" v-if="activeTemplate.premium">
                  <div class="">{{strings.includesProBlocks}}</div>
                </div>
              </div>
              <div class="uip-text-muted">
                {{strings.createdBy}} <a href="https://uipress.co" class="uip-link-default">{{activeTemplate.created_by}}</a>
              </div>
            </div>
            <div class="uip-flex uip-flex-row uip-gap-xxs">
              <div class="uip-text-xs uip-background-primary-wash uip-border-round uip-padding-xxs uip-post-type-label">{{activeTemplate.type}}</div>
            
              <uip-tooltip :message="strings.downloadcount">
                <div class="uip-text-xs uip-background-primary-wash uip-border-round uip-padding-xxs uip-post-type-label uip-flex uip-flex-row uip-gap-xxxs">
                  <span class="uip-icon">file_download</span>
                  {{activeTemplate.downloads}}
                </div>
              </uip-tooltip>
            
              <div class="uip-text-xs uip-background-orange-wash uip-border-round uip-padding-xxs uip-post-type-label">{{strings.requires}} {{activeTemplate.requires}}</div>
            </div>
            <div class="uip-text-muted">{{activeTemplate.description}}</div>
            <div class="uip-flex uip-gap-xs">
              <drop-down dropPos="bottom-right">
                <template v-slot:trigger>
                  <button class="uip-button-primary uip-text-s uip-flex uip-gap-xs">
                    <div class="">{{strings.addToTemplate}}</div>
                    <div class="uip-icon uip-text-m uip-icon-medium">chevron_left</div>
                  </button>
                </template>
                <template v-slot:content>
                  <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xs uip-text-right">
                    <div @click="addToContent('replace', activeTemplate)" class="uip-link-muted">{{strings.replaceContent}}</div>
                    <div @click="addToContent('add', activeTemplate)" class="uip-link-muted">{{strings.addAtEndOfContent}}</div>
                  </div>
                </template>
              </drop-down>
            </div>
          
          </div>
        
        </div>
		  </div>`,
  };
  return compData;
}
