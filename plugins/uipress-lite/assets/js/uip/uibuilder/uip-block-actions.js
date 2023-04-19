/**
 * Responsible for the inline block options in the builder
 * @since 3.0.0
 */
const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      block: Object,
      parentList: Array,
      currentIndex: Number,
      smallIcons: Boolean,
      reverse: Boolean,
      disabled: Array,
      expanded: Boolean,
      closeActions: Function,
    },
    data: function () {
      return {
        option: '',
        strings: {
          savePattern: __('Save pattern', 'uipress-lite'),
          settings: __('Settings', 'uipress-lite'),
          style: __('Style', 'uipress-lite'),
          copy: __('Copy', 'uipress-lite'),
          paste: __('Paste', 'uipress-lite'),
          advanced: __('Advanced', 'uipress-lite'),
          duplicate: __('Duplicate', 'uipress-lite'),
          syncPattern: __('Sync pattern', 'uipress-lite'),
          delete: __('Delete', 'uipress-lite'),
        },
      };
    },
    inject: {
      uipData: { from: 'uipData' },
      router: { from: 'router' },
      uipress: { from: 'uipress' },
      uiTemplate: { from: 'uiTemplate' },
      saveTemplate: { from: 'saveTemplate', default: () => ({ name: 'save not ready' }) },
      openModal: { from: 'openModal' },
    },
    watch: {},
    computed: {
      returnDisabled() {
        if (Array.isArray(this.disabled)) {
          return this.disabled;
        } else {
          return [];
        }
      },
    },
    mounted: function () {},
    methods: {
      /**
       * Opens block settings panel
       * @since 3.0.0
       */
      openSettings(uid) {
        let ID = this.$route.params.templateID;
        this.router.push({
          path: '/uibuilder/' + ID + '/settings/blocks/' + uid,
          query: { ...this.$route.query, section: 'settings' },
        });
      },

      /**
       * Opens block settings panel
       * @since 3.0.0
       */
      openStyles(uid) {
        let ID = this.$route.params.templateID;
        this.router.push({
          path: '/uibuilder/' + ID + '/settings/blocks/' + uid,
          query: { ...this.$route.query, section: 'style' },
        });
      },

      /**
       * Opens block advanced panel
       * @since 3.0.0
       */
      openAdvanced(uid) {
        let ID = this.$route.params.templateID;
        this.router.push({
          path: '/uibuilder/' + ID + '/settings/blocks/' + uid,
          query: { ...this.$route.query, section: 'advanced' },
        });
      },

      /**
       * Duplicates selected block into current list
       * @since 3.0.0
       */
      duplicateBlock(block) {
        let currentTem = JSON.parse(JSON.stringify(this.uiTemplate.content));

        //Get block parent
        let self = this;
        let currentContent;
        self.uipress.getParentByUID(self.uiTemplate.content, block.uid).then((response) => {
          if (response) {
            //Block found
            currentContent = response;
            //Duplicate it
            let item = Object.assign({}, block);
            item.uid = this.uipress.createUID();
            item.options = [];
            item.settings = JSON.parse(JSON.stringify(item.settings));

            if (item.content) {
              item.content = this.duplicateChildren(item.content);
            }

            //Get current index
            let currentIndex = currentContent.findIndex((item) => item.uid === block.uid);

            currentContent.splice(currentIndex, 0, item);

            let newTem = JSON.parse(JSON.stringify(this.uiTemplate.content));
            self.uipress.logHistoryChange(block.name + __(' duplicated', 'uipress-lite'), currentTem, newTem);
            self.uipress.notify(block.name + ' ' + __(' duplicated', 'uipress-lite'), '', 'success', true);
          }
        });

        return;
      },
      /**
       * Pastes copied block into current list
       * @since 3.0.94
       */
      pasteBlock() {
        let self = this;
        if (!self.block.content) {
          return;
        }

        if (!self.uiTemplate.copied) {
          return;
        }

        let currentTem = JSON.parse(JSON.stringify(this.uiTemplate.content));

        //Duplicate it
        let item = Object.assign({}, self.uiTemplate.copied);
        item.uid = this.uipress.createUID();
        item.options = [];
        item.settings = JSON.parse(JSON.stringify(item.settings));

        if (item.content) {
          item.content = this.duplicateChildren(item.content);
        }

        //Get current index

        self.block.content.splice(self.block.content.length, 0, item);

        let newTem = JSON.parse(JSON.stringify(this.uiTemplate.content));
        self.uipress.logHistoryChange(self.block.name + __(' pasted', 'uipress-lite'), currentTem, newTem);
        self.uipress.notify(self.block.name + ' ' + __(' pasted', 'uipress-lite'), '', 'success', true);

        self.uiTemplate.copied = false;

        self.closeActions();
      },
      /**
       * Loops through children of block being duplicated and creates new UIDs
       * @since 3.0.0
       */
      duplicateChildren(content) {
        let returnChildren = [];

        for (let block of content) {
          let item = Object.assign({}, block);
          item.uid = this.uipress.createUID();
          item.settings = JSON.parse(JSON.stringify(item.settings));

          if (item.content) {
            item.content = this.duplicateChildren(item.content);
          }

          returnChildren.push(item);
        }

        return returnChildren;
      },
      /**
       * Deletes selected block
       * @since 3.0.0
       */
      removeBlock(block) {
        let self = this;
        self.uipress.deleteByUID(self.uiTemplate.content, block.uid).then((response) => {
          if (response) {
            self.uipress.notify(block.name + ' ' + __('block deleted', 'uipress-lite'), '', 'default', true);
            let newTem = JSON.parse(JSON.stringify(self.uiTemplate.content));
            self.uipress.logHistoryChange(block.name + ' ' + __('block deleted', 'uipress-lite'), newTem, false);
            if (self.$route.params.uid && self.$route.params.uid == block.uid) {
              let ID = self.$route.params.templateID;
              self.router.push('/uibuilder/' + ID + '/');
            }
          }
        });
      },
      /**
       * Confirms block pattern sync. If confirmed starts sync process
       * @since 3.0.0
       */
      confirmSyncPattern(block) {
        let self = this;
        this.uipress
          .confirm(
            __('Sync pattern?', 'uipress-lite'),
            __("This will update the pattern template and will sync this pattern's changes accross all templates using the same pattern", 'uipress-lite'),
            __('Sync patern', 'uipress-lite')
          )
          .then((response) => {
            if (response) {
              //this.router.push('/');

              let cleanTemplate = JSON.parse(JSON.stringify(self.uiTemplate.content));
              self.uipress.cleanTemplate(cleanTemplate).then((response) => {
                self.saveTemplate(cleanTemplate).then((response) => {
                  let notiID = self.uipress.notify(__('Pattern sync in progress', 'uipress-lite'), '', 'default', false, true);
                  //Clean block before saving to DB
                  self.uipress.blockHouseKeeping(block).then((response) => {
                    self.syncUiPatternDB(response, notiID);
                  });
                });
              });
            }
          });
      },

      /**
       * Sends pattern to db and updates all instances of pattern accross templates
       * @since 3.0.0
       */
      syncUiPatternDB(block, notiID) {
        let self = this;
        let formData = new FormData();
        let pattern = JSON.stringify(block, (k, v) => (v === 'true' ? 'uiptrue' : v === true ? 'uiptrue' : v === 'false' ? 'uipfalse' : v === false ? 'uipfalse' : v === '' ? 'uipblank' : v));

        formData.append('action', 'uip_sync_ui_pattern');
        formData.append('security', uip_ajax.security);
        formData.append('pattern', pattern);
        formData.append('patternID', block.patternID);
        formData.append('templateID', self.$route.params.templateID);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, 'uipress-lite', '', 'error', true);
            self.saving = false;
          }
          if (response.success) {
            //Original pattern was deleted so we created a new one and will reassign the patternID on the block
            if (response.newPattern) {
              block.patternID = JSON.parse(JSON.stringify(response.newPattern));
            }
            if (response.newTemplate) {
              self.uiTemplate.content = response.newTemplate;
            }
            self.uiTemplate.patterns = response.patterns;
            self.uipress.notify(__('Pattern succesfully synced', 'uipress-lite'), '', 'success', true);
            self.uipress.destroy_notification(notiID);
          }
        });
      },
      /**
       * Checks if specific action is enabled
       * @since 3.0.0
       */
      ifEnabled(item) {
        if (this.returnDisabled.includes(item)) {
          return false;
        }
        return true;
      },
      canPaste() {
        if (this.block.content && this.uiTemplate.copied) {
          return true;
        }
        return false;
      },
      copyBlock(block) {
        this.uiTemplate.copied = block;
        this.uipress.notify(__('Block copied', 'uipress-lite'), '', 'success', true);
      },
    },
    template: `
	<div v-if="!expanded" class="uip-flex uip-gap-xxs" :class="[{'uip-text-l' : !smallIcons},{'uip-flex-reverse' : reverse}]">
	  <div v-if="ifEnabled('settings')" class="uip-icon uip-link-muted"  @click="openSettings(block.uid)">tune</div>
	  <div v-if="ifEnabled('duplicate')" class="uip-icon uip-link-muted" @click="duplicateBlock(block)">content_copy</div>
    <div v-if="ifEnabled('pattern')" class="uip-icon uip-link-muted" @click="openModal('saveaspattern', strings.savePattern, {blockitem: block})">bookmark_add</div>
	  <div v-if="block.patternID && ifEnabled('sync')" class="uip-icon uip-link-muted" @click="confirmSyncPattern(block)">sync</div>
	  <div class="uip-border-left"></div>
	  <div v-if="ifEnabled('delete')"  class="uip-icon uip-link-danger" @click="removeBlock(block)">delete</div>
	</div>
  
  <div v-else>
  
    <div class="uip-flex uip-flex-column uip-row-gap-xs uip-padding-xs uip-border-bottom">
    
      <div class="uip-flex uip-flex-row uip-flex-center uip-gap-xs">
        <div class="uip-text-bold">{{block.name}}</div>
      </div> 
    
    </div>
    
    <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-padding-xs uip-border-bottom">
  
      <div v-if="ifEnabled('settings')" class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-link-muted" @click="openSettings(block.uid);closeActions()">
        <div class="uip-icon">tune</div>
        <div class="">{{strings.settings}}</div>
      </div> 
      
      <div v-if="ifEnabled('settings')" class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-link-muted" @click="openStyles(block.uid);closeActions()">
        <div class="uip-icon">palette</div>
        <div class="">{{strings.style}}</div>
      </div>  
      
      <div v-if="ifEnabled('settings')" class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-link-muted" @click="openAdvanced(block.uid);closeActions()">
        <div class="uip-icon">code</div>
        <div class="">{{strings.advanced}}</div>
      </div>  
      
    </div>
    
    <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-padding-xs uip-border-bottom"> 
    
      <div v-if="ifEnabled('duplicate')" class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-link-muted" @click="copyBlock(block);">
        <div class="uip-icon">file_copy</div>
        <div class="">{{strings.copy}}</div>
      </div>  
      
      <div :class="canPaste() ? '' : 'uip-link-disabled'" class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-link-muted" @click="pasteBlock();">
        <div class="uip-icon">content_paste</div>
        <div class="">{{strings.paste}}</div>
      </div> 
      
      <div v-if="ifEnabled('duplicate')" class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-link-muted" @click="duplicateBlock(block);closeActions()">
        <div class="uip-icon">content_copy</div>
        <div class="">{{strings.duplicate}}</div>
      </div>  
      
      <div v-if="ifEnabled('pattern')" class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-link-muted" @click="openModal('saveaspattern', strings.savePattern, {blockitem: block});closeActions()">  
        <div class="uip-icon">bookmark_add</div>
        <div class="">{{strings.savePattern}}</div>
      </div>
      
      <div v-if="block.patternID && ifEnabled('sync')" class="uip-flex uip-flex-center uip-flex-row uip-gap-xs uip-link-muted" @click="confirmSyncPattern(block);closeActions()">  
        <div class="uip-icon">sync</div>
        <div class="">{{strings.syncPattern}}</div>
      </div>  
      
    </div>
    
    <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-padding-xs">
    
      <div v-if="ifEnabled('delete')" class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-link-danger" @click="removeBlock(block);closeActions()">
        <div class="uip-icon">delete</div>
        <div class="">{{strings.delete}}</div>
      </div>  
    
    </div>
  
  </div>
  
  `,
  };
}
