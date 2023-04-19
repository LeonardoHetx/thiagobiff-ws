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
        toolbar: JSON.parse(JSON.stringify(this.uipData.toolbar)),
      };
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    watch: {
      'uipData.toolbar': {
        handler(newValue, oldValue) {},
        deep: true,
      },
    },
    mounted: function () {
      let self = this;

      //Watch for toolbar changes in frame
      document.addEventListener(
        'uip_page_change_loaded',
        (e) => {
          self.updateToolBarFromFrame();
          setTimeout(function () {
            self.updateQM();
          }, 100);
        },
        { once: false }
      );
    },
    computed: {
      getHidden() {
        let hidden = this.block.settings.block.options.hiddenToolbarItems.value;

        if (this.uipress.isObject(hidden)) {
          return [];
        } else {
          return hidden;
        }
      },
    },
    methods: {
      updateQM() {
        let self = this;
        //Check if query monitor is active
        if (!('query-monitor' in self.toolbar)) {
          return;
        }
        //Get frame
        let frames = document.getElementsByClassName('uip-page-content-frame');
        //Frame does not exist so abort
        if (!frames[0]) {
          return;
        }
        let contentframe = frames[0];
        //Get query monitor item from within frame
        let qmObject = contentframe.contentWindow.document.getElementById('wp-admin-bar-query-monitor');
        //No query monitor item inside frame
        if (!qmObject) {
          return;
        }

        let labelObj = qmObject.getElementsByClassName('ab-label');
        self.toolbar['query-monitor'].title = labelObj[0].outerHTML;
        self.toolbar['query-monitor'].frameLink = true;

        //Check for errors
        if (qmObject.classList.contains('qm-warning')) {
          self.toolbar['query-monitor'].title += '<span class="uip-display-inline-block uip-border-circle uip-w-8 uip-ratio-1-1 uip-background-red uip-margin-left-xxs"></span>';
        }

        //Check for warnings
        if (
          qmObject.classList.contains('qm-alert') ||
          qmObject.classList.contains('qm-notice') ||
          qmObject.classList.contains('qm-deprecated') ||
          qmObject.classList.contains('qm-strict') ||
          qmObject.classList.contains('qm-expensive')
        ) {
          self.toolbar['query-monitor'].title += '<span class="uip-display-inline-block uip-border-circle uip-w-8 uip-ratio-1-1 uip-background-orange uip-margin-left-xxs"></span>';
        }

        let items = qmObject.querySelectorAll('#wp-admin-bar-query-monitor-default > li');
        let newSubs = {};
        //Loop through links and pull relevant content
        for (let sub of items) {
          let ogid = sub.getAttribute('id');
          let id = ogid.replace('wp-admin-bar-query-monitor-', '');
          let link = sub.querySelector('a');
          let href = link.getAttribute('href');
          let title = link.textContent;

          newSubs[id] = {
            group: '',
            href: href,
            id: ogid,
            meta: [],
            parent: 'query-monitor',
            submenu: {},
            title: title,
            frameLink: true,
          };
        }

        self.toolbar['query-monitor'].submenu = newSubs;
      },
      updateToolBarFromFrame() {
        let frames = document.getElementsByClassName('uip-page-content-frame');
        let self = this;

        if (frames[0]) {
          let frame = frames[0];
          //Update toolbar items when the page changes
          if (frame.contentWindow.uipMasterToolbar && typeof frame.contentWindow.uipMasterToolbar !== 'undefined') {
            let toolbar = frame.contentWindow.uipMasterToolbar;
            if (!Array.isArray(toolbar)) {
              self.toolbar = JSON.parse(JSON.stringify(toolbar));
            }
          }
        }
      },
      ifHiden(uid) {
        if (this.getHidden.includes(uid)) {
          return false;
        }

        return true;
      },
      customIcon(id) {
        let icons = this.uipress.get_block_option(this.block, 'block', 'editToolbarItems');
        if (!this.uipress.isObject(icons)) {
          return false;
        }
        if (id in icons) {
          let value = icons[id].icon;
          if (value != '') {
            return value;
          }
        }
        return false;
      },
      customTitle(id) {
        let icons = this.uipress.get_block_option(this.block, 'block', 'editToolbarItems');

        if (!this.uipress.isObject(icons)) {
          return false;
        }
        if (Object.hasOwn(icons, id)) {
          let value = icons[id].title;
          if (value != '') {
            return value;
          }
        }
        return false;
      },

      updatePage(item, evt, forceReload) {
        if (evt.ctrlKey || evt.shiftKey || evt.metaKey || (evt.button && evt.button == 1)) {
          return;
        } else {
          evt.preventDefault();
        }

        if (item.frameLink) {
          //Get frame
          let frames = document.getElementsByClassName('uip-page-content-frame');
          //Frame does not exist so abort
          if (!frames[0]) {
            return;
          }
          let contentframe = frames[0];

          //Find og query monitor click
          let oglINK = contentframe.contentWindow.document.querySelector('#' + item.id + ' a');
          oglINK.click();
          return;
        }

        if (forceReload) {
          this.uipress.updatePage(item.href, forceReload);
        } else {
          this.uipress.updatePage(item.href);
        }
      },
    },
    template: `
            <div :class="block.settings.advanced.options.classes.value"  class="uip-admin-toolbar uip-text-normal" :id="block.uid">
              <div class="uip-flex uip-flex-row uip-flex-center uip-gap-xs">
                <template v-for="item in toolbar">
                  <div class="" v-if="ifHiden(item.id)" :id="item.id">
                    <!--FIRST DROP -->
                    <drop-down :hover="true">
                      <template v-slot:trigger>
                        <a :href="item.href" @click="updatePage(item, $event)" class="uip-link-default uip-no-underline uip-toolbar-top-item uip-flex uip-gap-xxs uip-flex-center">
                          <div class="uip-icon uip-toolbar-top-item-icon" v-if="customIcon(item.id)">{{customIcon(item.id)}}</div>
                          <div class="uip-line-height-1" v-if="customTitle(item.id)">{{customTitle(item.id)}}</div>
                          <div class="uip-line-height-1" v-if="!customTitle(item.id)" v-html="item.title"></div>
                        </a>
                      </template>
                      <template v-slot:content v-if="item.submenu && Object.keys(item.submenu).length > 0">
                        <div class="uip-flex uip-flex-column uip-toolbar-submenu">
                        
                        
                          <!-- NETWORK ADMIN TOOLBAR -->
                          <template v-if="item.id == 'my-sites'" v-for="subsection in item.submenu">
                            <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xxs uip-min-w-130">
                              <template v-for="sub in subsection.submenu">
                                <!--SECOND DROP -->
                              <drop-down width="200" :hover="true">
                                  <template v-slot:trigger>
                                    <a :href="sub.href" @click="updatePage(sub, $event, true)"  class="uip-link-default uip-no-underline uip-toolbar-sub-item uip-flex uip-flex-center uip-flex-between uip-gap-s" >
                                      <span v-html="sub.title"></span>
                                      <span v-if="sub.submenu" class="uip-icon">chevron_right</span>
                                    </a>
                                  </template>
                                  <template v-slot:content v-if="sub.submenu">
                                    <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-padding-xxs uip-toolbar-submenu">
                                      <template v-for="subsub in sub.submenu">
                                        <a :href="subsub.href" @click="updatePage(subsub, $event, true)"  class="uip-link-default uip-no-underline" v-html="subsub.title"></a>
                                      </template>
                                    </div>
                                  </template>
                                </drop-down>
                                <!--END SECOND DROP -->
                              </template>
                            </div>
                            <div v-if="subsection.id == 'my-sites-super-admin'" class="uip-border-bottom"></div>\
                          </template>
                          <!-- END NETWORK ADMIN TOOLBAR -->
                          
                          
                          <div v-else  class="uip-padding-xs uip-min-w-130 uip-flex uip-flex-column uip-row-gap-xxs">
                            <template v-for="sub in item.submenu">
                              <!--SECOND DROP -->
                              <drop-down width="200" dropPos="right" triggerClass="uip-flex uip-flex-grow" :hover="true">
                                <template v-slot:trigger>
                                  <a @click="updatePage(sub, $event)" :href="sub.frameLink" class="uip-link-default uip-no-underline uip-toolbar-sub-item uip-flex uip-flex-center uip-flex-between uip-gap-s uip-flex-grow" >
                                    <span v-html="sub.title"></span>
                                    <span v-if="Object.keys(sub.submenu).length > 0" class="uip-icon">chevron_right</span>
                                  </a>
                                </template>
                                <template v-slot:content v-if="Object.keys(sub.submenu).length > 0">
                                  <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-padding-xs uip-toolbar-submenu">
                                    <template v-for="subsub in sub.submenu">
                                      <a @click="updatePage(subsub, $event)" :href="subsub.frameLink" class="uip-link-default uip-no-underline" v-html="subsub.title"></a>
                                    </template>
                                  </div>
                                </template>
                              </drop-down>
                              <!--END SECOND DROP -->
                            </template>
                          </div>
                        </div>
                      </template>
                    </drop-down>
                    <!--END FIRST DROP -->
                  </div>
                </template>
              </div>
            </div>`,
  };
}
