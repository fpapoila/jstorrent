document.addEventListener("DOMContentLoaded", onready);
var options = null
var app = null

function bind_events() {
    $('#button-choose-download').prop('disabled', false);
    $('#button-choose-download').click( function(evt) {
        var opts = {'type':'openDirectory'}

        chrome.fileSystem.chooseEntry(opts,
                                      _.bind(options.on_choose_download_directory, options)
                                     )
        evt.preventDefault()
        evt.stopPropagation()
    })

    $('#request-identity').click( function(evt) {
        console.log(chrome.runtime.lastError)
        chrome.permissions.request({permissions:['identity']},
                                   function(result){console.log('grant result',result)
                                                    console.log(chrome.runtime.lastError)
                                                    chrome.identity.getAuthToken({interactive:true}, function(idresult) {
                                                        console.log('id result',idresult)
                                                    })
                                                   })
        console.log(chrome.runtime.lastError)
        
    })
}

function OptionDisplay(opts) {
    this.opts = opts
    this.el = null
}
OptionDisplay.prototype = {
    getDOM: function() {
        var s = 'Unsupported Option Type: ' + this.opts.meta.type + ' - ' + this.opts.key
        if (this.opts.meta.type == 'bool') {
            s = '<div class="checkbox">' +
                '<label>' +
                '<input type="checkbox" ' + (this.opts.val ? 'checked="checked"' : '') + '>' + this.getName() +
                '</label>' + 
                '</div>';
        } else if (this.opts.meta.type == 'int') {
            s = '<div class="input"><label><input type="text" value="'+this.opts.val+'"></input>' + this.getName() + '</label></div>'
        } else {
            debugger
        }
        var el = $(s)
        this.el = el
        $('input', el).change( _.bind(this.inputChanged, this) )
        return el
    },
    getName: function() {
        return this.opts.key
    },
    inputChanged: function(evt) {
        if (this.opts.meta.type == 'bool') {

            if ($('input',this.el).is(':checked')) {
                this.opts.options.set(this.opts.key, true)
            } else {
                this.opts.options.set(this.opts.key, false)
            }
        } else if (this.opts.meta.type == 'int') {
            var val = parseInt( evt.target.value )
            if (! isNaN(val)) {
                this.opts.options.set(this.opts.key, val)
            } else {
                evt.target.value = this.opts.meta['default']
                this.opts.options.set(this.opts.key, this.opts.meta['default'])
            }
        } else {
            console.log('unsupported set option', evt.target.value)
        }

        //evt.preventDefault()
        //evt.stopPropagation()
    }
}

function OptionsView(opts) {
    this.opts = opts
    this.options = opts.options

    var keys = this.options.keys()
    var cur, curdom

    for (var i=0; i<keys.length; i++) {
        console.log('opt',keys[i], this.options.get(keys[i]))
        cur = new OptionDisplay( { key: keys[i],
                                   options: this.options,
                                   meta: this.options.app_options[keys[i]],
                                   val: this.options.get(keys[i]) } )
        var curdom = cur.getDOM()
        if (curdom) {
            this.opts.el.append( curdom )
        }
    }
}

function onready() {
    console.log("This is Options window")

    if (chrome.runtime.id == jstorrent.constants.jstorrent_lite) {
        $("#full_version_upsell").show()
    }



    chrome.runtime.getBackgroundPage( function(bg) {
        window.app = bg.windowManager.mainWindow.contentWindow.app
        window.options = app.options
        window.optionsDisplay = new OptionsView({el: $('#auto_options'),
                                                 options: window.app.options,
                                                 app: window.app})
                                                 
        bind_events()
    })



}
