// computed based on 800/600
var gui_opts = {
    otherstuff_height: 128,
    torrentGrid_width: 800,
    torrentGrid_height: 170,
    detailGrid_width: 800,
    detailGrid_height: 300
}

//document.addEventListener("DOMContentLoaded", onready);
window.onresize = _.debounce(function(evt) {
    onresizewindow()
},100)

function onaddkeydown(evt) {
    console.assert(false) // never being called
    debugger
    if (evt && evt.keyCode == 13) {
        fgapp.add_from_url(url);
    }
}

function onadd(evt) {
    // called when pressing ENTER, or clicking on "Add"
    var url = document.getElementById("url").value;
    if (! url) {
        // open dialog to select file
        fgapp.select_torrent()
    } else {
        fgapp.add_from_url(url)
    }

    document.getElementById("url").value = ''
    if (evt) evt.preventDefault()
}

function onresizewindow() {
    //var fudgeFactor = 8 // um, not sure about why we need this
    var fudgeFactor = 0 // um, not sure about why we need this
    var toph = $('#chrome-top').height()
    var tabh = $('#detail-tabs').height()
    //var titlebarh = $('#top-titlebar').height() + fudgeFactor
    var titlebarh = fudgeFactor
    var totalchrome = toph + tabh
    var width = $(window).width()
    var height = $(window).height() - titlebarh

    var torrentHeight = Math.floor((height - totalchrome) * 0.4)
    var detailHeight = height - torrentHeight - totalchrome
    
    $("#torrentGrid")[0].style.width = width
    $("#detailGrid")[0].style.width = width
    $("#torrentGrid")[0].style.height = torrentHeight
    $("#detailGrid")[0].style.height = detailHeight
    if (app && app.UI && app.UI.detailtable) { app.UI.detailtable.resizeCanvas() }
    if (app && app.UI && app.UI.torrenttable) { app.UI.torrenttable.grid.resizeCanvas() }
}

function onappready() {
/*
    chrome.storage.local.get(null, function(d){console.log('chrome.storage.local.get',d,chrome.runtime.lastError)})
    chrome.storage.local.getBytesInUse( function(e){
        console.log('chrome.storage.local.getBytesInUse',e,chrome.runtime.lastError)
    })
*/

    //window.client = app.client
    if (! chrome.app.window.get('client').contentWindow.WSC) {
        //getel('ui-wrapper').style.display='none'
        getel('wsc-error').style.display=''
        return
    }

    if (window.example_url_2) {
        //document.getElementById("url").value = example_url_3
    }
    onresizewindow()
/*
    document.getElementById("torrentGrid").style.width = gui_opts.torrentGrid_width;
    document.getElementById("torrentGrid").style.height = gui_opts.torrentGrid_height;

    document.getElementById("detailGrid").style.width = gui_opts.detailGrid_width;
    document.getElementById("detailGrid").style.height = gui_opts.detailGrid_height;
*/

    bind_events()

    app.analytics.sendAppView("MainView")

    if (jstorrent.device.platform == 'Android') {
        var url = "http://academictorrents.com/download/af4c6ce643f30da2619fe6cf7dd838b1d4539743"

        $('#url').val( url )
    }

    if (jstorrent.options.add_torrents_on_start) {

        setTimeout( function() {
            client.add_from_url( "http://www.clearbits.net/get/19-lawrence-lessig---free-culture-audiobook.torrent" )
        }, 1000);

        if (jstorrent.options.manual_infohash_on_start) {
            setTimeout( function() {
                client.add_from_url( 'magnet:?xt=urn:btih:' + jstorrent.options.manual_infohash_on_start[0] )
            }, 1000);
        }
    }
}

function onready() {
    // not being called.
    
    function go() {
        window.app = new jstorrent.App;
        app.initialize( onappready )
    }
    if (DEVMODE) {
        console.log('waiting for webkit inspector to be ready')
        setTimeout( go, 1000)
    } else {
        go()
    }
}

function click_detail_torrent(tab, evt) {

    var torrent = app.UI.get_selected_torrent()
    if (torrent) {
        app.UI.set_detail(tab, torrent)
    } else if (tab == 'messages') {
        app.UI.set_detail(tab, torrent)
    } else {
        app.UI.set_detail(tab, null)
        //console.warn('no torrent selected')
    }
}
_events_bound = false
function bind_events() {
    if (_events_bound) {
        console.log('double binding events')
        console.trace()
        return
    }
    _events_bound = true
    function keydown(evt) {
        if (evt.metaKey || evt.ctrlKey) {
            if (evt.keyCode == 82) {
                // ctrl-r
                console.log('received ctrl(meta)-r, reload app')
                if (window.fgapp) {
                    fgapp.reload()
                } else {
                    chrome.runtime.reload()
                }
            }
            // prevent chrome app close window etc shortcuts
            // metakey is osx
            // ctrlkey for win

            //evt.preventDefault() // dont prevent ctrl-w
        }
    }

    document.body.addEventListener('keydown', keydown)

    $('#webstorelink')[0].href = fgapp.getCWSPage()

    document.getElementById("add-form").addEventListener('submit', onadd)
    document.getElementById('url-btn').addEventListener('click',onadd)
    
    var torrenttabs = ['info','files','peers','swarm','trackers','pieces','diskio','messages'] 
    torrenttabs.forEach(function(tab) {
	$('#detail-' + tab).click( click_detail_torrent.bind(this, tab) )
    });

    getel('detailGrid').addEventListener('contextmenu',function(evt) {
        if (fgapp) { fgapp.onContextMenuNoItem() }
    })
    
    window.onfocus = function() {
        $('#top-titlebar').removeClass("blur")
    }
    window.onblur = function() {
        $('#top-titlebar').addClass("blur")
    }

    $('#top-titlebar-close').click( function(evt) {
        fgapp.close()
    })
    $('#top-titlebar-min').click( function(evt) {
        if (app.minimized) {
            fgapp.unminimize()
        } else {
            fgapp.minimize()
        }
    })


    $('.download-remain-click').click( function(evt) {
        //window.open("upsell.html", '_blank')
        fgapp.open_upsell_page()
        //window.open(jstorrent.constants.cws_url + jstorrent.constants.cws_jstorrent,'_blank')
    })
    $('#re-check').click( function(evt) {
        fgapp.toolbar_recheck()
    })
    $('#reset-state').click( function(evt) {
        fgapp.toolbar_resetstate()
    })

    $('#get-share-url').click( function(evt) {
        fgapp.open_share_window()
        evt.preventDefault()
        return false
    })

    $('#button-options').click( function(evt) {
        fgapp.focus_or_open_options();
    })
    $('#button-stop').click( function(evt) {
        fgapp.toolbar_stop()
    })
    $('#button-start').click( function(evt) {
        fgapp.toolbar_start()
    })
    $('#button-remove').click( function(evt) {
        fgapp.toolbar_remove()
    })

    $('#button-help').click( function(evt) {
        fgapp.focus_or_open_help()
    })

    $('#button-sponsor').click( function(evt) {
        fgapp.focus_or_open('sponsor')
    })

    // apparently for drop to work everywhere, you have to prevent default for enter/over/leave
    // but we lose the cool icon hmm -- tried dropEffect "copy" everywhere, seems to work
    // http://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html
    document.body.addEventListener("dragover", dragOver, false);
    document.body.addEventListener("dragleave", dragLeave, false);
    document.body.addEventListener("dragenter", dragEnter, false);
    document.body.addEventListener("drop", drop, false);
}

function dragOver(evt) {
    //console.log(arguments.callee.name)
    evt.dataTransfer.dropEffect = 'copy'
    evt.preventDefault();
    return false;
}
function dragLeave(evt) {
    //console.log(arguments.callee.name)
    evt.dataTransfer.dropEffect = 'copy'
    evt.preventDefault();
    return false;
}
function dragEnter(evt) {
    //console.log(arguments.callee.name)
    evt.dataTransfer.dropEffect = 'copy'
    evt.preventDefault();
    return false;
}
function drop(evt) {
    console.log(arguments.callee.name)
    evt.dataTransfer.dropEffect = 'copy'
    evt.preventDefault();
    fgapp.handleDrop(evt)
    return false;
}

function InfoView(opts) {
    this.torrent = opts.torrent
    console.log('init info detail view of torrent',this.torrent)
}



