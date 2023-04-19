/**
 * Builds the main ui builder shell
 * @since 3.0.0
 */
const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    data: function () {
      return {
        loading: true,
        templateID: this.$route.params.templateID,
        mode: 'light',
        templateAppliestoCurrentUser: false,
        menu: this.uipData.adminMenu.menu,
        ui: {
          sideBar: {
            activeTab: 'settings',
          },
          strings: {
            themeStyles: __('Theme styles', 'uipress'),
            revertStyle: __('Revert style back to default', 'uipress-lite'),
            appliesTo: __('Applies to', 'uipress-lite'),
            excludes: __('Excludes', 'uipress-lite'),
            templateType: __('Template type', 'uipress-lite'),
            uiTemplate: __('UI template', 'uipress-lite'),
            adminPage: __('Admin Page', 'uipress-lite'),
            toolBar: __('Frontend toolbar', 'uipress-lite'),
            loginPage: __('Login page', 'uipress-lite'),
            appliesToSelfTitle: __('Template will now load for you!', 'uipress-lite'),
            appliesToSelf: __('Take care not to revoke access to anything you may need in the admin.', 'uipress-lite'),
            appliesToSelfMeta: __("If you haven't already, we recommend setting up:", 'uipress-lite'),
            safeMode: __('safe mode', 'uipress-lite'),
            theme: __('Theme', 'uipress'),
            add: __('Add', 'uipress'),
            variableLabel: __('Variable label', 'uipress'),
            variableName: __('Variable name', 'uipress'),
            deleteVariable: __('Delete variable', 'uipress'),
            advanced: __('Advanced', 'uipress'),
            customCSS: __('Custom CSS', 'uipress-lite'),
            customJS: __('Custom JS', 'uipress-lite'),
            light: __('Light', 'uipress-lite'),
            dark: __('Dark', 'uipress-lite'),
            templateName: __('Template name', 'uipress-lite'),
            active: __('Active', 'uipress-lite'),
            selectUsersAndRoles: __('Select users and roles', 'uipress-lite'),
            searchUsersAndRoles: __('Search users and roles', 'uipress-lite'),
            custom: __('custom', 'uipress-lite'),
            menuIcon: __('Menu icon', 'uipress-lite'),
            addToSubmenu: __('Add to submenu', 'uipress-lite'),
            noneTopLevel: __('None (top level)', 'uipress-lite'),
            applyToSubsites: __('Apply to subsites', 'uipress-lite'),
            watchOut: __('Is this an admin page?', 'uipress-lite'),
            watchOutDescription: __(
              'This template does not contain a content block. The content block is key to navigating the admin. Setting this live as a uiTemplate can cause a lock out.',
              'uipress-lite'
            ),
            pageLink: __('Page link', 'uipress-lite'),
          },
        },
        switchOptions: {
          light: {
            value: 'light',
            label: __('Light', 'uipress-lite'),
          },
          dark: {
            value: 'dark',
            label: __('Dark', 'uipress-lite'),
          },
        },
        newVariable: {
          label: '',
          var: '',
        },
      };
    },
    inject: ['uipData', 'router', 'uipress', 'uiTemplate'],
    mounted: function () {
      this.loading = false;
    },
    watch: {
      'uiTemplate.globalSettings.rolesAndUsers': {
        handler(newValue, oldValue) {
          this.checkTemplateApplies();
        },
        deep: true,
      },
      'uiTemplate.globalSettings.excludesRolesAndUsers': {
        handler(newValue, oldValue) {
          this.checkTemplateApplies();
        },
        deep: true,
      },
    },
    computed: {
      returnFormatedMenu() {
        self = this;
        let returndata = [];

        for (const item of self.menu) {
          let temp = {};
          temp.name = item.uid;

          if (item.type == 'sep') {
            continue;
          }

          temp.label = item.name.replace(/<[^>]*>?/gm, '');
          temp.url = item.url;
          returndata.push(temp);
        }
        return returndata;
      },
      isTemplateWithoutFrame() {
        let templateType = this.uiTemplate.globalSettings.type;
        if (templateType == 'ui-template') {
          if (this.uiTemplate.content.length > 0) {
            let templateString = JSON.stringify(this.uiTemplate.content);
            if (!templateString.includes('uip-content')) {
              return true;
            }
          }
        }
        return false;
      },
    },
    methods: {
      returnTemplateOption(group, option) {
        let key = option.uniqueKey;
        let options = this.uiTemplate.globalSettings.options;
        if (!(group in options)) {
          options[group] = {};
        }
        if (!(key in options[group])) {
          if (option.accepts === String) {
            options[group][key] = '';
          }
          if (option.accepts === Array) {
            options[group][key] = [];
          }
          if (option.accepts === Object) {
            options[group][key] = {};
          }
        }
        return options[group][key];
      },
      saveTemplateOption(group, key, value) {
        let options = this.uiTemplate.globalSettings.options;
        options[group][key] = value;
      },
      isTemplateForUs() {
        let templateType = this.uiTemplate.globalSettings.type;
        if (templateType == 'ui-template') {
          return this.templateAppliestoCurrentUser;
        } else {
          return false;
        }
      },
      checkTemplateApplies() {
        let formData = new FormData();
        let self = this;

        let forUsers = this.uiTemplate.globalSettings.rolesAndUsers;
        let excludeUsers = this.uiTemplate.globalSettings.excludesRolesAndUsers;

        if (forUsers.length < 1) {
          self.templateAppliestoCurrentUser = false;
          return;
        }

        forUsers = JSON.stringify(forUsers);
        excludeUsers = JSON.stringify(excludeUsers);

        formData.append('action', 'uip_check_template_applies');
        formData.append('security', uip_ajax.security);
        formData.append('usersFor', forUsers);
        formData.append('usersExcluded', excludeUsers);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, 'uipress-lite', '', 'error', true);
            self.saving = false;
          }
          if (response.success) {
            if (response.areWeIn == true) {
              self.templateAppliestoCurrentUser = true;
            } else {
              self.templateAppliestoCurrentUser = false;
            }
          }
        });
      },

      fetchReturnData(data, item) {
        item = data;
      },
      openSettings(panel) {
        let ID = this.$route.params.templateID;
        this.router.push('/uibuilder/' + ID + '/settings/' + panel);
      },
      returnPageLink() {
        this.formatPageName();
        return this.uipData.options.adminURL + 'admin.php?page=' + this.formatPageName() + '-uiptp-' + this.$route.params.templateID;
      },
      formatPageName() {
        let title = this.uiTemplate.globalSettings.name;

        title = title.toLowerCase();
        title = title.replace('~[^pLd]+~u', '-');
        title = title.replace('~[^-w]+~', '');
        title = title.trim();
        title = title.replace('~-+~', '-');
        title = title.replace(' ', '-');
        return title;
      },
    },
    template: `
      <div>
        <div class="uip-flex uip-flex-column uip-row-gap-m uip-margin-bottom-m">
          <div class="">
            <div class="uip-text-bold uip-margin-bottom-xs">
              {{ui.strings.templateName}}
            </div>
            <input class="uip-input uip-w-100p" type="text" v-model="uiTemplate.globalSettings.name" :placeholder="ui.strings.templateName">
          </div>
          <div class="">
            <div class="uip-text-bold uip-margin-bottom-xs">
              {{ui.strings.templateType}}
            </div>
            <select class="uip-input" v-model="uiTemplate.globalSettings.type">
              <option value="ui-template">{{ui.strings.uiTemplate}}</option>
              <option value="ui-admin-page">{{ui.strings.adminPage}}</option>
              <option value="ui-front-template">{{ui.strings.toolBar}}</option>
            </select>
          </div>
          
          <!-- Admin page specific options-->
          <div class="uip-scale-in-top " v-if="uiTemplate.globalSettings.type == 'ui-admin-page'">
            <div class="uip-flex uip-flex-column uip-row-gap-m">
              <div>
                <div class="uip-text-bold uip-margin-bottom-xs">
                  {{ui.strings.menuIcon}}
                </div>
                <icon-select :value="uiTemplate.globalSettings.menuIcon" :returnData="function(e){uiTemplate.globalSettings.menuIcon = e}"></icon-select>
              </div>
              <div>
                <div class="uip-text-bold uip-margin-bottom-xs">
                  {{ui.strings.addToSubmenu}}
                </div>
                <select class="uip-input" v-model="uiTemplate.globalSettings.menuParent">
                    <option value="">{{ui.strings.noneTopLevel}}</option>
                    <template v-for="item in returnFormatedMenu">
                      <option :value="item.url">{{item.label}}</option>
                    </template>
                </select>
              </div>
              
              <div v-if="uiTemplate.globalSettings.status">
                <div class="uip-text-bold uip-margin-bottom-xs">
                  {{ui.strings.pageLink}}
                </div>
                <a :href="returnPageLink()" target="_BLANK" class="uip-link-muted">
                  {{returnPageLink()}}
                </a>
              </div>
            </div>
          </div>
          <!-- End admin page specific options-->
          
          <div class="">
            <div class="uip-text-bold uip-margin-bottom-xs">
              {{ui.strings.active}}
            </div>
            <label class="uip-switch">
              <input type="checkbox" v-model="uiTemplate.globalSettings.status">
              <span class="uip-slider"></span>
            </label>
          </div>
          <div v-if="uipData.options.multisite && uipData.options.networkActivated && uipData.options.primarySite">
            <div class="uip-text-bold uip-margin-bottom-xs">
              {{ui.strings.applyToSubsites}}
            </div>
            <label class="uip-switch">
              <input type="checkbox" v-model="uiTemplate.globalSettings.applyToSubsites">
              <span class="uip-slider"></span>
            </label>
          </div>
          <div v-if="isTemplateWithoutFrame" class=" uip-background-red-wash uip-border-round uip-text-s uip-padding-xs uip-scale-in-top uip-flex uip-flex-column uip-row-gap-xs">
            <div class="uip-text-bold uip-text-l uip-text-emphasis">{{ui.strings.watchOut}}</div>
            <div>{{ui.strings.watchOutDescription}}</div>
          </div>
          <div v-if="isTemplateForUs()" class=" uip-background-orange-wash uip-border-round uip-text-s uip-padding-xs uip-scale-in-top uip-flex uip-flex-column uip-row-gap-xs">
            <div class="uip-text-bold uip-text-l uip-text-emphasis">{{ui.strings.appliesToSelfTitle}}</div>
            <div>{{ui.strings.appliesToSelf}}</div>
            <div class="uip-text-muted uip-text-s">
            <span>{{ui.strings.appliesToSelfMeta}}</span>
            <a href="https://uipress.notion.site/Filters-Hooks-f20b64d7365641c09c61ed0252b90727?p=c6df814584e64af6aaee3f333dfc29d4&pm=s" target="_BLANK" class="uip-link-default">{{ui.strings.safeMode}}</a>
            </div>
          </div>
          <div class="">
            <div class="uip-text-bold uip-margin-bottom-xs">
              {{ui.strings.appliesTo}}
            </div>
            <user-role-select :selected="uiTemplate.globalSettings.rolesAndUsers" 
            :placeHolder="ui.strings.selectUsersAndRoles" 
            :searchPlaceHolder="ui.strings.searchUsersAndRoles" :single="false" 
            :updateSelected="function(data){fetchReturnData(data, uiTemplate.globalSettings.rolesAndUsers)}"></user-role-select>
          </div>
          <div class="">
            <div class="uip-text-bold uip-margin-bottom-xs">
              {{ui.strings.excludes}}
            </div>
            <user-role-select :selected="uiTemplate.globalSettings.excludesRolesAndUsers" 
             :placeHolder="ui.strings.selectUsersAndRoles" 
             :searchPlaceHolder="ui.strings.searchUsersAndRoles" :single="false" 
            :updateSelected="function(data){fetchReturnData(data, uiTemplate.globalSettings.excludesRolesAndUsers)}"></user-role-select>
          </div>
        </div>
        <div class="uip-flex uip-flex-column uip-row-gap-xs">
        
          <!-- Theme styles -->
          <accordion :openOnTick="false">
            <template v-slot:title>
              <div class="uip-flex-grow uip-flex uip-gap-xxs uip-flex-center uip-text-bold">
                <div class="uip-icon">palette</div>
                <div class="">{{ui.strings.themeStyles}}</div>
              </div>
            </template>
            <template v-slot:content>
              <div class="uip-padding-xs">
                <list-variables></list-variables>
              </div>
            </template>
          </accordion>
          
          <!-- Dynamic settings -->
          <template v-for="group in uipData.templateGroupOptions">
            <accordion :openOnTick="false">
              <template v-slot:title>
                <div class="uip-flex-grow uip-flex uip-gap-xxs uip-flex-center uip-text-bold">
                  <div class="uip-icon">{{group.icon}}</div>
                  <div class="">{{group.label}}</div>
                </div>
              </template>
              <template v-slot:content>
                <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-m">
                  <!--Loop through group settings -->
                  <div v-for="option in group.settings">
                    <div class="uip-text-bold uip-margin-bottom-xs">{{option.label}}</div>
                    <div v-if="option.help" class="uip-text-s uip-text-muted uip-margin-bottom-xs">{{option.help}}</div>
                    <component :is="option.component" :value="returnTemplateOption(group.name, option)" :args="option.args"
                    :returnData="function(data){saveTemplateOption(group.name, option.uniqueKey, data)}"></component>
                  </div>
                  <!--End loop through group settings -->
                </div>
              </template>
            </accordion>
          </template>
          <!-- End dynamic settings -->
          
          
        </div>
      </div>`,
  };
  return compData;
}
