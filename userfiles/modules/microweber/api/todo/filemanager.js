
var i18n = {
    "Rename": "Rename",
    "Download": "Download",
    "Copy url": "Copy url",
    "Delete": "Delete",
    "OK": "OK",
};



(function (){

    var lang = function (key) {
        return  i18n[key] || key;
    };

    var rename = function (row) {
      var dialog;
      var ok = mw.element({tag: 'button'}).addClass('mw-ui-btn').html(lang('OK'));

      ok.on('click', function (){
          dialog.remove();
      });

      dialog = mw.dialog({
          footer: ok.get(0),
          title: lang('Rename')
      });

      var name = row.name;
      var input = mw.element({tag: 'input'}).val(name);

      dialog.dialogContainer.appendChild(mw.element({content: input}).addClass('mw-field').width('100%').get(0));
      input.focus();

    };


    var download = function (row) {
        var link = document.createElement("a");
        link.download = name;
        link.href = row.url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    var defaultActions = [
        { label: lang('Rename'), action: rename, visible: function (rowObject) { return !!rowObject; } },
        { label: lang('Download'), action: download, visible: function (rowObject) { return rowObject.type === 'file'; } },
        { label: lang('Copy url'), action: function (rowObject) {}, visible: function (rowObject) { return !!rowObject; } },
        { label: lang('Delete'), action: function (rowObject) {}, visible: function (rowObject) { return !!rowObject; } },
    ];

    mw.require('filemanager.css');
    var FileManager = function (options) {

        var scope = this;
        var rows = [];
        var globalcheck;

        options = options || {};

        if(!options.url) {
            console.warn('API url is not specified');
        }

        var defaultRequest = function (params, callback) {
            var xhr = new XMLHttpRequest();
            scope.dispatch('beforeRequest', {xhr: xhr, params: params});
            xhr.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    callback.call(scope, JSON.parse(this.responseText), xhr);
                }
            };
            xhr.open("GET", scope.settings.url || '', true);
            xhr.send();
        };

        var defaults = {
            selectable: true,
            multiSelect: true,
            folderSelect: false,
            options: true,
            element: null,
            query: {
                order: 'asc',
                orderBy: 'name',
                keyword: '',
                display: 'list'
            },
            requestData: defaultRequest,
            url: null,
            template: 'default',
            height: 'auto',
            contextMenu: defaultActions,
            document: document,
            renderProvider: null,
            viewHeaderRenderProvider: null,
        };

        var _e = {};
        var _viewType = 'list';

        this.on = function (e, f) { _e[e] ? _e[e].push(f) : (_e[e] = [f]) };
        this.dispatch = function (e, f) { _e[e] ? _e[e].forEach(function (c){ c.call(this, f); }) : ''; };

        this.settings = mw.object.extend({}, defaults, options);

        var table, tableHeader, tableBody;


        var _check = function (disabled) {
            disabled = disabled || false;
            var checkbox = mw.element({
                tag: 'input',
                props: {
                    type: 'checkbox',
                    disabled: disabled
                }
            });

            var label = mw.element({
                tag: 'label',
                props: {
                    className: 'mw-ui-check',
                },
                content: [
                    checkbox,
                    mw.element({
                        tag: 'span'
                    })
                ]
            });

            return {label: label, checkbox: checkbox};
        };

        var _size = function (item, dc) {
            var bytes = item.size;
            if (typeof bytes === 'undefined' || bytes === null) return '';
            if (bytes === 0) return '0 Bytes';
            var k = 1000,
                dm = dc === undefined ? 2 : dc,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };



        var _image = function (item) {
            if (item.type === 'folder') {
                return '<span class="mw-file-manager-list-item-thumb mw-file-manager-list-item-thumb-folder"></span>';
            } else if (item.thumbnail) {
                return '<span class="mw-file-manager-list-item-thumb mw-file-manager-list-item-thumb-image" style="background-image: url(' + item.thumbnail + ')"></span>';
            } else {
                var ext = item.name.split('.').pop();
                if(!ext) {
                    ext = item.mimeType;
                }
                return '<span class="mw-file-manager-list-item-thumb mw-file-manager-list-item-thumb-file">' + (ext) + '</span>';
            }
        };

        var createOption = function (item, option) {
            if(!option.visible(item)) {
                return '';
            }
            var el = mw.element({
                content: option.label
            });
            el.on('click', function (e){
                e.stopPropagation();
                option.action(item);
            }).addClass('mw-file-manager-list-item-options-list-option');
            return el;
        };


        var currentMenu;

        var createOptions = function (item) {
            var options = scope.settings.contextMenu;
            var el = mw.element().addClass('mw-file-manager-list-item-options');
            el.append(mw.element({tag: 'span', content: '...'}).addClass('mw-file-manager-list-item-options-button'));

            el.on('click', function (e){
                e.stopPropagation();
                var all = scope.root.get(0).querySelectorAll('.mw-file-manager-list-item-options.active');
                for(var i = 0; i < all.length; i++ ) {
                    if (all[i] !== this) {
                        all[i].classList.remove('active');
                    }
                }

                if(!this._nodeOptions) {
                    var node = this;
                    this._nodeOptions = mw.element().addClass('mw-file-manager-list-item-options-list');
                    options.forEach(function (options){
                        node._nodeOptions.append(createOption(item, options));
                    });
                    this.append(this._nodeOptions.get(0))

                    /*scope.settings.document.body.append(node._nodeOptions.get(0));
                    var off = el.offset();
                    this._nodeOptions.css({
                        top: off.top,
                        left: off.left - this._nodeOptions.offsetWidth
                    });*/
                }

                setTimeout(function (){
                    el.toggleClass('active');
                })

            });

            if(!this.__bodyOptionsClick) {
                this.__bodyOptionsClick = true;
                var bch = function (e) {
                    var curr = e.target;
                    var clicksOption = false;
                  while (curr && curr !== scope.settings.document.body) {
                      if(curr.classList.contains('mw-file-manager-list-item-options')){
                          clicksOption = true;
                          break;
                      }
                      curr = curr.parentNode;
                  }
                  if(!clicksOption) {
                      var all = scope.root.get(0).querySelectorAll('.mw-file-manager-list-item-options.active');
                      for (var i = 0; i < all.length; i++ ) {
                          if (all[i] !== this) {
                              all[i].classList.remove('active');
                          }
                      }
                  }
                };
                scope.settings.document.body.addEventListener('mousedown', bch , false);
            }

            return el;
        };


        var setData = function (data) {
            scope._data = data;
            scope._files = [];
            scope._folders = [];
            var i = 0, l = data.data.length;
            for ( ; i < l; i++) {
                scope['_' + data.data[i].type + 's'].push(data.data[i]);
            }
        };

        this.updateData = function (data) {
            setData(data);
            this.dispatch('dataUpdated', data);
        };

        this.getData = function () {
            return this._data;
        };

        this.requestData = function () {
            var params = {};
            var cb = function (res) {
                scope.updateData(res);
            };

            var err = function (er) {

            };

            this.settings.requestData(
                params, cb, err
            );
        };

        var userDate = function (date) {
            var dt = new Date(date);
            return dt.toLocaleString();
        };


        var defaultRenderProvider = function (item) {
            var row = mw.element({ className: 'mw-fml-object' });
            var cellImage = mw.element({ className: 'mw-fml-object-item mw-fml-object-item-image', content: _image(item)  });
            var cellName = mw.element({ className: 'mw-fml-object-item mw-fml-object-item-name', content: item.name  });
            var cellSize = mw.element({ className: 'mw-fml-object-item mw-fml-object-item-size', content: _size(item) });

            var cellmodified = mw.element({ className: 'mw-fml-object-item mw-fml-object-item-modified', content: userDate(item.modified)  });

            row.on('click', function (){
                scope.selectToggle(item);
            });
            if( scope.settings.multiSelect) {
                if(item.type === 'file' || (item.type === 'folder' && scope.settings.folderSelect)){
                    var check =  _check(true);
                    row.append( mw.element({ className: 'mw-fml-object-item mw-fml-object-item-select', content: check.label }));
                }  else {
                    row.append( mw.element({ className: 'mw-fml-object-item mw-fml-object-item-select'}));
                }
            }
            row
                .append(cellImage)
                .append(cellName)
                .append(cellSize)
                .append(cellmodified);
            if(scope.settings.options) {
                var cellOptions = mw.element({ className: 'mw-fml-object-item', content: createOptions(item) });
                row.append(cellOptions);
            }
            return row;
        };

        this.singleListView = function (item) {
            if(!this.settings.renderProvider) {
                return defaultRenderProvider(item);
            }
            return this.settings.renderProvider(item);
        };

        var listViewBody = function () {
            rows = [];
            tableBody ? tableBody.remove() : '';
            tableBody =  mw.element({
                className: 'mw-fml-tbody'
            });
            scope._data.data.forEach(function (item) {
                var row = scope.singleListView(item);
                rows.push({data: item, row: row});
                tableBody.append(row);
            });
            return tableBody;
        };


        this._selected = [];

        var pushUnique = function (obj) {
            if (scope._selected.indexOf(obj) === -1) {
                scope._selected.push(obj);
            }
        };




        var allSelected = function (){
            console.log( scope._selected.length , scope._files, scope)
            return scope._selected.length === rows.length ||
                (!scope.settings.folderSelect && scope._selected.length === scope._files.length);

        };
        var noneSelected = function (){
            return scope._selected.length === 0;
        };

        this.selectAll = function () {
            this.select(rows.map(function (row){ return row.data}));
        };
        this.selectNone = function () {
            scope._selected = [];
            afterSelect();
        };
        this.selectAllToggle = function () {
            allSelected() ? this.selectNone() : this.selectAll();
        };


        var afterSelect = function (dispatch) {
             var i = 0, l = rows.length;
             for( ; i < l; i++) {
                 var item = rows[i];
                 var input = item.row.find('input');
                  if (scope._selected.indexOf(item.data) !== -1) {
                      input.prop('checked', true);
                      item.row.addClass('selected');
                  } else {
                      input.prop('checked', false);
                      item.row.removeClass('selected');
                  }
             }
             var all = allSelected();
             var none = noneSelected();
             if(all || none) {
                 globalcheck.label.removeClass('mw-ui-check-partial');

             } else {
                 globalcheck.label.addClass('mw-ui-check-partial');
             }

            if (none) {
                globalcheck.checkbox.prop('checked', false);
            } else {
                globalcheck.checkbox.prop('checked', true);
            }
             if (dispatch) {
                 scope.dispatch('selectionChange', scope._selected);
             }
        };
        var selectCore = function (obj) {
            if (obj.type === 'folder' && !scope.settings.folderSelect) {
                return false;
            }
            if (!scope.settings.selectable) {
                return false;
            }
            if (scope.settings.multiSelect) {
                pushUnique(obj);
            } else {
                scope._selected = [obj];
            }
            return true;
        };

        this.isSelected = function (obj) {
            return this._selected.indexOf(obj) !== -1;

        };
        this.selectToggle = function (obj) {
            if (this.isSelected(obj)) {
                this.deselect(obj);
            } else {
                this.select(obj);
            }
        };

        this.deselect = function (obj) {
            var i = this._selected.indexOf(obj);
            if(i > -1) {
                this._selected.splice(i, 1);
                afterSelect(true);
            }
            this._selected.indexOf(obj);
        };

        this.select = function (obj) {
            if(Array.isArray(obj)) {
                var dispatch = false;
                var i = 0;
                for( ; i < obj.length; i++) {
                    if (selectCore(obj[i])) {
                        dispatch = true;
                    }
                }
                afterSelect(dispatch);
            } else if (selectCore(obj)) {
                afterSelect(true);
            }
        };

        var listViewHeaderDefaultRender = function () {
            var thCheck;
            if (scope.settings.multiSelect) {
                globalcheck = _check(true);
                globalcheck.label.on('click', function () {
                    scope.selectAllToggle();
                });
                thCheck = mw.element({ className: 'mw-fml-th mw-fml-object-item-select mw-file-manager-select-all-heading', content: globalcheck.label  });
            }
            var thImage = mw.element({ className: 'mw-fml-th mw-fml-object-item-image', content: ''  });
            var thName = mw.element({ className: 'mw-fml-th mw-fml-object-item-name', content: '<span>Name</span>'  }).addClass('mw-file-manager-sortable-table-header');
            var thSize = mw.element({ className: 'mw-fml-th mw-fml-object-item-size', content: '<span>Size</span>'  }).addClass('mw-file-manager-sortable-table-header');
            var thModified = mw.element({ className: 'mw-fml-th mw-fml-object-item-modified', content: '<span>Last modified</span>'  }).addClass('mw-file-manager-sortable-table-header');
            var thOptions = mw.element({ className: 'mw-fml-th mw-fml-object-item-options', content: ''  });
            var tr = mw.element({
                className: 'mw-fml-object',
                content: [thCheck, thImage, thName, thSize, thModified, thOptions]
            });
            tableHeader =  mw.element({
                className: 'mw-fml-thead',
                content: tr
            });
            return tableHeader;
        };

        var createListViewHeader = function () {
            if(!scope.settings.viewHeaderRenderProvider) {
                return listViewHeaderDefaultRender()
            }
            return scope.settings.viewHeaderRenderProvider()
        };

        var listView = function () {
            table =  mw.element({
                className: 'mw-fml-root'
            });
            table
                .append(createListViewHeader())
                .append(listViewBody());
            return table;
        };

        var gridView = function () {
            var grid =  mw.element('<div />');

            return grid;
        };

        this.view = function (type) {
            if(!type) return _viewType;
            _viewType = type;
            var viewblock;
            if (_viewType === 'list') {
                viewblock = listView();
            } else if (_viewType === 'grid') {
                viewblock = gridView();
            }
            if(viewblock) {
                this.root.empty().append(viewblock);
            }
            this.root.dataset('view', _viewType);
        };

        this.refresh = function () {
            if (_viewType === 'list') {
                listViewBody();
            } else if (_viewType === 'grid') {
                this.listView();
            }
        };

        var createRoot = function (){
            scope.root = mw.element({
                props: {
                    className: 'mw-file-manager-root mw-file-manager-template-' + scope.settings.template
                },
                css: {
                    height: scope.settings.height,
                    minHeight: '260px'
                },
                encapsulate: false
            });

        };

        this.init = function (){
            createRoot();
            this.on('dataUpdated', function (res){
                scope.view(_viewType);
            });
            this.requestData();
            if (this.settings.element) {
                mw.element(this.settings.element).empty().append(this.root);
            }
        };

        this.init();
    };

    mw.FileManager = function (options) {
        return new FileManager(options);
    };
})();