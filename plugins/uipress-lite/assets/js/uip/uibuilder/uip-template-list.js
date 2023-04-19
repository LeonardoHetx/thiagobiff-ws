const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    data: function () {
      return {
        templates: [],
        page: 1,
        totalPages: 0,
        totalFound: 0,
        loading: false,
        initialLoading: true,
        selectAll: false,
        search: '',
        strings: {
          status: __('Status', 'uipress-lite'),
          forRoles: __('Roles and users', 'uipress-lite'),
          excludes: __('Excludes', 'uipress-lite'),
          modified: __('Modified', 'uipress-lite'),
          name: __('Name', 'uipress-lite'),
          type: __('Type', 'uipress-lite'),
          active: __('Active', 'uipress-lite'),
          draft: __('Draft', 'uipress-lite'),
          results: __('results', 'uipress-lite'),
          searchTemplates: __('Search templates', 'uipress-lite'),
          templateDuplicated: __('Template duplicated', 'uipress-lite'),
          templateDeleted: __('Template deleted', 'uipress-lite'),
          deleteSelected: __('Delete selected', 'uipress-lite'),
          uiBuilder: __('uiBuilder', 'uipress-lite'),
          newTemplate: __('New template', 'uipress-lite'),
          welcomeTotheUibuilder: __("It's a little quiet!", 'uipress-lite'),
          welcomeMeta: __('Create a new template to get started with uiBuilder or check out the docs', 'uipress-lite'),
          viewDocs: __('View docs', 'uipress-lite'),
          editTemplate: __('Edit template', 'uipress-lite'),
          duplicateTemplate: __('Duplicate template', 'uipress-lite'),
          deleteTemplate: __('Delete template', 'uipress-lite'),
          version: __('version', 'uipress-lite'),
          tools: __('Tools', 'uipress-lite'),
          settings: __('Site settings', 'uipress-lite'),
          phpErrorLog: __('PHP error log', 'uipress-lite'),
          roleEditor: __('Role editor', 'uipress-lite'),
          pro: __('pro', 'uipress-lite'),
          uiTemplate: __('Ui Template', 'uipress-lite'),
          adminPage: __('Admin page', 'uipress-lite'),
          loginPage: __('Login page', 'uipress-lite'),
          frontEndToolbar: __('Frontend toolbar', 'uipress-lite'),
          setupWizard: __('Setup wizard', 'uipress-lite'),
        },
        activeTableTab: 'all',
        tabletabs: [
          {
            name: 'all',
            label: __('All templates', 'uipress-lite'),
          },
          {
            name: 'active',
            label: __('Active', 'uipress-lite'),
          },
          {
            name: 'drafts',
            label: __('Drafts', 'uipress-lite'),
          },
          {
            name: 'templates',
            label: __('UI Templates', 'uipress-lite'),
          },
          {
            name: 'pages',
            label: __('Admin pages', 'uipress-lite'),
          },
          {
            name: 'toolbar',
            label: __('Frontend toolbars', 'uipress-lite'),
          },
        ],
      };
    },
    inject: ['uipData', 'router', 'uipress', 'uipMediaLibrary'],
    mounted: function () {
      let query = this.$route.query;

      if (query) {
        if (query.page) {
          this.page = parseInt(query.page);
        }

        if (query.search) {
          this.search = query.search;
        }
      }

      this.getTemplates();
    },
    watch: {
      search: {
        handler(newValue, oldValue) {
          this.page = 1;
          this.pushQueries();
          this.getTemplates();
        },
        deep: true,
      },
      selectAll: {
        handler(newValue, oldValue) {
          this.selectAllItems(newValue);
        },
        deep: true,
      },
      activeTableTab: {
        handler(newValue, oldValue) {
          this.getTemplates();
        },
      },
    },
    computed: {
      returnTableData() {
        return this.templates;
        //return [];
      },
      toggleSelect() {
        return this.templates;
      },
      returnPage() {
        let self = this;
        return self.page;
      },
      returnSelected() {
        let self = this;
        let count = 0;

        for (const item of self.templates) {
          if (item.selected) {
            count += 1;
          }
        }

        return count;
      },
      returnSelectedIDs() {
        let self = this;
        let ids = [];

        for (const item of self.templates) {
          if (item.selected) {
            ids.push(item.id);
          }
        }

        return JSON.stringify(ids);
      },
    },
    methods: {
      selectAllItems(value) {
        let self = this;

        for (const item of self.templates) {
          item.selected = value;
        }
      },
      pushQueries() {
        this.$router.push({
          query: { search: this.search, page: this.page },
        });
      },
      getTemplates() {
        let self = this;
        if (self.loading == true) {
          return;
        }
        self.loading = true;

        let formData = new FormData();
        formData.append('action', 'uip_get_ui_templates');
        formData.append('security', uip_ajax.security);
        formData.append('page', self.returnPage);
        formData.append('search', self.search);
        formData.append('filter', self.activeTableTab);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          self.templates = response.templates;
          self.totalPages = response.totalPages;
          self.totalFound = response.totalFound;
          self.loading = false;
          self.initialLoading = false;
        });
      },
      duplicateTemplate(id) {
        let self = this;

        let formData = new FormData();
        formData.append('action', 'uip_duplicate_ui_template');
        formData.append('security', uip_ajax.security);
        formData.append('id', id);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, '', 'error', true);
            return;
          }
          self.uipress.notify(self.strings.templateDuplicated, '', 'success', true);
          self.getTemplates();
        });
      },
      /**
       * Deletes templates
       * @since 3.0.0
       */
      deleteTemplate(ids) {
        let self = this;

        let formData = new FormData();
        formData.append('action', 'uip_delete_ui_template');
        formData.append('security', uip_ajax.security);
        formData.append('templateids', ids);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, '', 'error', true);
            return;
          }
          self.uipress.notify(response.message, '', 'warning', true);
          self.getTemplates();
        });
      },
      /**
       * Creates new draft ui template
       * @since 3.0.0
       */
      createNewUI(templateType) {
        let self = this;

        let formData = new FormData();
        formData.append('action', 'uip_create_new_ui_template');
        formData.append('security', uip_ajax.security);
        formData.append('templateType', templateType);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          self.router.push('/uibuilder/' + response.id + '/');
        });
      },
      /**
       * Confirms the deletion of template
       * @since 3.0.0
       */
      confirmDelete(id) {
        let self = this;
        self.uipress
          .confirm(__('Are you sure you want to delete this template?', 'uipress-lite'), __("Deleted templates can't be recovered", 'uipress-lite'), __('Delete', 'uipress-lite'))
          .then((response) => {
            if (response) {
              self.deleteTemplate(id);
            }
          });
      },
      confirmDeleteMultiple(id) {
        let self = this;
        self.uipress
          .confirm(__('Are you sure you want to multiple templates?', 'uipress-lite'), __("Deleted templates can't be recovered", 'uipress-lite'), __('Delete', 'uipress-lite'))
          .then((response) => {
            if (response) {
              self.deleteTemplate(id);
            }
          });
      },
      editLayout(id) {
        let self = this;
        self.router.push('/uibuilder/' + id + '/');
      },
      goBack() {
        if (this.page > 1) {
          this.page = this.page - 1;
          this.pushQueries();
          this.getTemplates();
        }
      },
      goForward() {
        if (this.page < this.totalPages) {
          this.page = this.page + 1;

          this.pushQueries();
          this.getTemplates();
        }
      },
      componentExists(name) {
        if (this.$root._.appContext.components[name]) {
          return true;
        } else {
          return false;
        }
      },
      generateVal(stat) {
        if (stat == 'publish') {
          return true;
        }
        return false;
      },
      updateItemStatus(item) {
        let self = this;

        let formData = new FormData();
        formData.append('action', 'uip_update_ui_template_status');
        formData.append('security', uip_ajax.security);
        formData.append('templateid', item.id);
        formData.append('status', item.status);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, '', 'error', true);
            return;
          }
          self.uipress.notify(response.message, '', 'success', true);
        });
      },
    },
    template: `
    
    
  <div class="uip-padding-m uip-background-default uip-body-font uip-text-normal uip-app-frame uip-border-box uip-overflow-auto" style="min-height: calc(100vh - 32px); max-height: calc(100vh - 32px)">
		<div class="uip-flex uip-flex-between uip-margin-bottom-l uip-flex-center">
      <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center">
        <div class="uip-w-32 uip-ratio-1-1 uip-logo"></div>
			  <div class="uip-flex uip-flex-column uip-row-gap-xxs">
        
          <span class="uip-text-xl uip-text-bold uip-text-emphasis">{{strings.uiBuilder}}</span>
          <span class="uip-text-xs uip-text-muted">{{strings.version}} {{uipData.options.uipVersion}}</span>
        
        </div>
      </div>
      
      <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center">
        
        
        <router-view :key="$route.path"></router-view>
      
        <drop-down dropPos="bottom-right">
          <template v-slot:trigger>
			      <div class="uip-button-default uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
              <span class="uip-icon">build</span>
              <span>{{strings.tools}}</span>
            </div>
          </template>
          <template v-slot:content>
            <div class="uip-flex uip-flex-column uip-padding-xxs uip-min-w-150">
            
              <!-- ERROR LOG --> 
              <uip-offcanvas position="right" style="max-width:90%;width:500px">
                <template v-slot:trigger>
                  <div class="uip-flex uip-gap-xs uip-link-muted uip-flex-center uip-padding-xxs hover:uip-background-muted uip-border-round">
                    <div class="uip-icon">code</div>
                    <div class="">{{strings.phpErrorLog}}</div>
                  </div>
                </template>
                <template v-slot:content>
                  <div class="uip-w-100p">
                    <uip-error-log></uip-error-log>
                  </div>
                </template>
              </uip-offcanvas>
              
              <!-- ROLE EDITOR --> 
              
              <div v-if="!componentExists('uip-role-editor')" class="uip-flex uip-gap-xs uip-link-muted uip-flex-center uip-padding-xxs uip-border-round">
                 <div class="uip-icon">verified</div>
                 <div class="uip-flex-grow">{{strings.roleEditor}}</div>
                 <div class="uip-padding-xxs uip-padding-top-xxxs uip-padding-bottom-xxxs uip-background-green-wash uip-border-round uip-text-s uip-flex uip-gap-xxs uip-flex-center">
                    <span class="uip-icon">redeem</span>
                    <span class="uip-line-height-1">{{strings.pro}}</span>
                 </div>
              </div>
              
              <uip-offcanvas v-else position="right" style="max-width:90%;width:500px">
                <template v-slot:trigger>
                  <div class="uip-flex uip-gap-xs uip-link-muted uip-flex-center uip-padding-xxs hover:uip-background-muted uip-border-round">
                    <div class="uip-icon">verified</div>
                    <div class="">{{strings.roleEditor}}</div>
                  </div>
                </template>
                <template v-slot:content>
                  <div class="uip-w-100p">
                    <uip-role-editor></uip-role-editor>
                  </div>
                </template>
              </uip-offcanvas>
              
              
              <div class="uip-flex uip-gap-xs uip-link-muted uip-flex-center uip-padding-xxs hover:uip-background-muted uip-border-round" @click="router.push('/setupwizard/');">
                <div class="uip-icon">magic_button</div>
                <div class="">{{strings.setupWizard}}</div>
              </div>
              
              
              
              
            </div>
          </template>
        </drop-down>
        
        <uip-offcanvas position="right" style="max-width:90%;width:500px;padding:0;">
          <template v-slot:trigger>
            <div class="uip-button-default uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
              <span class="uip-icon">tune</span>
              <span>{{strings.settings}}</span>
            </div>
          </template>
          <template v-slot:content>
            <uip-global-settings></uip-global-settings>
          </template>
        </uip-offcanvas>  
      
      </div>
		</div>
    
    <!--EMPTY-->
    <div v-if="returnTableData.length == 0 && !loading && search == '' && activeTableTab == 'all'" class="uip-flex uip-flex-center uip-flex-middle uip-padding-top-l">
      <div class="uip-flex uip-flex-column uip-row-gap-s uip-flex-start uip-max-w-100p">
        <div class="uip-icon" style="font-size:120px; margin-left:-15px">
          dashboard_customize
        </div>
        <div class="uip-text-emphasis uip-text-bold uip-text-xxl">{{strings.welcomeTotheUibuilder}}</div>
        <div class="uip-text-l uip-w-400">{{strings.welcomeMeta}}</div>
        <div class="uip-flex uip-flex-row uip-gap-s uip-flex-center uip-margin-top-s">
          <!--Setup wizard-->
          <div class="uip-button-secondary uip-flex uip-flex-row uip-gap-xxs uip-flex-center" @click="router.push('/setupwizard/');">
            <span class="uip-icon">magic_button</span>
            <span>{{strings.setupWizard}}</span>
          </div>
          <div class="uip-button-primary" @click="createNewUI">{{strings.newTemplate}}</div>
          <a href="https://www.notion.so/uipress/UiPress-Documentation-c06fbfd10de2438a9bb1e416028a8d61"
          target="_BLANK" class="uip-link-default uip-no-underline uip-flex uip-gap-xxs uip-flex-center uip-border-bottom-primary uip-padding-bottom-xxs">
            <span class="uip-text-bold">{{strings.viewDocs}}</span>
            <span class="uip-icon">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
    
    <!--LIST-->
    <template v-else>
      
      
      
      <div class="uip-margin-bottom-m uip-flex uip-flex-between uip-flex-center">
      
        <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
        
          <template v-for="(tab, index) in tabletabs">
               <div class="uip-padding-xs uip-cursor-pointer uip-tab-item uip-text-m uip-border-round uip-background-muted uip-line-height-1 uip-no-text-select" @click="activeTableTab = tab.name"
               :class="tab.name == activeTableTab ? 'uip-background-primary uip-text-inverse uip-tab-item-active' : 'hover:uip-background-grey'">{{tab.label}}</div>
          </template>
            
           
           <div v-if="returnSelected > 0" class="uip-margin-left-m">
               <button @click="confirmDeleteMultiple(returnSelectedIDs)" class="uip-button-danger" >{{strings.deleteSelected}} <strong> ({{returnSelected}}) </strong></button>
           </div>
           
        </div>
         
         <div class="uip-flex uip-flex-row uip-gap-s uip-flex-center">
         
           <div class="uip-flex uip-padding-xxs uip-border uip-search-block uip-border-round">
              <span class="uip-icon uip-text-muted uip-margin-right-xs uip-text-l uip-icon-medium">search</span> 
              <input class="uip-blank-input uip-flex-grow uip-text-s" type="search" v-model="search" :placeholder="strings.searchTemplates" autofocus="">
           </div>
           
           <drop-down dropPos="bottom-right">
             <template v-slot:trigger>
               <div class="uip-button-primary uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
                 <span class="uip-icon">add</span>
                 <span>{{strings.newTemplate}}</span>
               </div>
             </template>
             <template v-slot:content>
              <div class="uip-flex uip-flex-column uip-padding-xxs">
                <div class="uip-flex uip-gap-xs uip-padding-xxs uip-border-round hover:uip-background-muted uip-flex-center uip-link-default" @click="createNewUI('ui-template')">
                  <div class="uip-icon">space_dashboard</div>
                  <div>{{strings.uiTemplate}}</div>
                </div>
                <div class="uip-flex uip-gap-xs uip-padding-xxs uip-border-round hover:uip-background-muted uip-flex-center uip-link-default" @click="createNewUI('ui-admin-page')">
                  <div class="uip-icon">post_add</div>
                  <div>{{strings.adminPage}}</div>
                </div>
                <div class="uip-flex uip-gap-xs uip-padding-xxs uip-border-round hover:uip-background-muted uip-flex-center uip-link-default" @click="createNewUI('ui-front-template')">
                  <div class="uip-icon">build</div>
                  <div>{{strings.frontEndToolbar}}</div>
                </div>
              </div>
             </template>
           </drop-down>
           
         </div>
         
      </div>
     
      
      <div class="uip-max-w-100p uip-overflow-auto uip-borde uip-border-round uip-margin-bottom-s">
        
		    <table v-if="returnTableData.length > 0" class="uip-w-100p uip-border-collapse uip-min-w-1000">
		      <thead>
			      <tr class="uip-border-bottom uip-border-tp">
				      <th class="uip-text-left uip-w-28 uip-padding-xs uip-padding-left-s uip-padding-right-s"><input v-model="selectAll" class="uip-checkbox" type="checkbox"></th>
				      <th class="uip-text-left uip-text-weight-normal uip-text-muted uip-padding-xs uip-padding-left-s uip-padding-right">{{strings.name}}</th>
              <th class="uip-text-left uip-text-weight-normal uip-text-muted uip-padding-xs uip-padding-left-s uip-padding-right">{{strings.type}}</th>
				      <th class="uip-text-left uip-text-weight-normal uip-text-muted uip-padding-xs uip-padding-left-s uip-padding-right">{{strings.status}}</th>
				      <th class="uip-text-left uip-text-weight-normal uip-text-muted uip-padding-xs uip-padding-left-s uip-padding-right">{{strings.forRoles}}</th>
              <th class="uip-text-left uip-text-weight-normal uip-text-muted uip-padding-xs uip-padding-left-s uip-padding-right">{{strings.excludes}}</th>
				      <th class="uip-text-left uip-text-weight-normal uip-text-muted uip-padding-xs uip-padding-left-s uip-padding-right">{{strings.modified}}</th>
				      <th class="uip-text-left uip-text-weight-normal uip-text-muted uip-padding-xs uip-padding-left-s uip-padding-right"></th>
            </tr>
            <tr>
              <div class="uip-ajax-loader" v-if="loading && !initialLoading">
                <div class="uip-loader-bar"></div>
              </div>
            </tr>
			    </thead>
          <tbody v-if="!initialLoading">
          
              <template v-for="(item, index) in returnTableData">
                <tr @mouseover="item.hover = true" @mouseleave="item.hover = false" class="uip-cursor-pointer hover:uip-background-muted" :class="{'uip-border-bottom' : index !== returnTableData.length - 1}">
                  <td class="uip-padding-s "><input v-model="item.selected" class="uip-checkbox" type="checkbox"></td>
                  <td class="uip-padding-s  uip-text-bold" @click="editLayout(item.id)">{{item.name}}</td>
                  
                  <td class="uip-padding-s ">
                    <span v-if="item.type" class="uip-text- uip-border-round">
                    {{item.type}}
                    </span>
                  </td>
                  
                  <td class="uip-padding-s ">
                    <switch-select :value="generateVal(item.status)" :returnData="function(d){if(d){item.status='publish';updateItemStatus(item)}else{item.status='draft';updateItemStatus(item)}}"></switch-select>
                  </td>
                  <td class="uip-padding-s ">
                    <div class="uip-flex uip-flex-row uip-gap-xxs uip-row-gap-xxs uip-flex-wrap">
                      <template v-for="user in item.for">
                        <div class="uip-padding-left-xxs uip-padding-right-xxs uip-background-primary-wash uip-border-round">{{user.name}}</div>
                      </template>
                    </div>
                  </td>
                  <td class="uip-padding-s ">
                    <div class="uip-flex uip-flex-row uip-gap-xxs uip-row-gap-xxs uip-flex-wrap">
                      <template v-for="user in item.excludes">
                        <div class="uip-padding-left-xxs uip-padding-right-xxs uip-background-primary-wash uip-border-round">{{user.name}}</div>
                      </template>
                    </div>
                  </td>
                  <td class="uip-padding-s ">{{item.modified}}</td>
                  <td class="uip-padding-s  uip-w-150">
                    <div v-if="item.hover" class="uip-flex uip-gap-xxs uip-flex-center uip-flex-right">
                      <uip-tooltip :message="strings.editTemplate" :delay="200"> <div class="uip-link-muted uip-no-underline uip-icon uip-text-l" @click="editLayout(item.id)">edit_document</div> </uip-tooltip>
                      <uip-tooltip :message="strings.duplicateTemplate" :delay="200"> <div class="uip-link-muted uip-no-underline  uip-icon uip-text-l" @click="duplicateTemplate(item.id)">content_copy</div> </uip-tooltip>
                      <div class="uip-border-right uip-h-12"></div>
                      <uip-tooltip :message="strings.deleteTemplate" :delay="200"> <div class="uip-link-muted uip-no-underline  uip-icon uip-text-danger uip-text-l" @click="confirmDelete(item.id)">delete</div> </uip-tooltip>
                    </div>
                  </td>
                </tr>
              </template>
              
          </tbody>
		    </table>
      </div>
      <div v-if="initialLoading" class="uip-w-100p uip-flex uip-flex-center uip-flex-middle uip-h-600">
        <loading-chart></loading-chart>
      </div>
      <div class="uip-flex uip-flex-row uip-flex-between uip-flex-center">
        <div class="">{{totalFound + ' ' + strings.results}}</div>
        <div class="uip-flex uip-gap-xs uip-padding-xs" v-if="totalPages > 0">
          <button @click="goBack" v-if="totalPages > 1" class="uip-button-default uip-icon uip-search-nav-button">chevron_left</button>
          <button @click="goForward" v-if="page < totalPages" class="uip-button-default uip-icon uip-search-nav-button">chevron_right</button>
        </div>
      </div>
    </template>
	</div>`,
  };
  return compData;
}
