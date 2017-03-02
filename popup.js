/**
 * Created by ian on 24/04/2016.
 */

var recording = false;
var simulating = false;

function toggleRecording() {
    chrome.storage.local.set({workflow: null},function(){
        if (simulating) {
            var message_port = chrome.runtime.connect({name: "sim"});
            message_port.postMessage({action: "stop_sim"});
            window.close();
        } else if (recording) {
            chrome.storage.local.set({recording: false});
            chrome.storage.local.get('events', function (result) {
                var events = result.events;
                events.push({
                    evt: 'end_recording',
                    time: Date.now(),
                    evt_data: {}
                });
                chrome.storage.local.set({events: events}, function() {
                    chrome.tabs.query({
                        windowType: "popup"
                    },function(tabs){
                        var opened = false;
                        for (var i=0; i<tabs.length; i++) {
                            if (tabs[i].url.includes(chrome.runtime.id)) {
                                opened = true;
                                chrome.tabs.update(tabs[i].id, {
                                    url: chrome.extension.getURL("workfloweditor.html")
                                }, function() {
                                    chrome.windows.update(tabs[i].windowId,{
                                        focused: true
                                    });
                                });
                                break;
                            }
                        }
                        if (!opened) {
                            if (typeof InstallTrigger === 'undefined') { // NOT Firefox
                                chrome.windows.create({
                                    url: chrome.extension.getURL("workfloweditor.html"),
                                    type: "popup",
                                    width: windowWidth,
                                    height: windowHeight,
                                    left: Math.round(screen.width/2-(windowWidth/2)),
                                    top: Math.round(screen.height/2-(windowHeight/2))
                                });
                            } else {
                                window.open(chrome.extension.getURL("workfloweditor.html"), "wildfire", "left=" + Math.round(screen.width/2-(windowWidth/2)) +
                                    "top=" + Math.round(screen.height/2-(windowHeight/2)) + ",width=" + windowWidth + ",height=" + windowHeight +
                                    ",resizable=no,scrollbars=yes,status=no,menubar=no,toolbar=no,personalbar=no");
                            }
                        }
                        window.close();
                    });
                });
            });
        } else {
            chrome.storage.local.set({recording: true},function(){
                var events = [];
                events.push({
                    evt: 'begin_recording',
                    time: Date.now(),
                    evt_data: {}
                });
                chrome.storage.local.set({events: events});
                window.close();
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('recordButton').addEventListener('click', toggleRecording);

    updatePopupUI();
});

function updatePopupUI() {
    chrome.storage.local.get('simulating', function (simulating_result) {
        chrome.storage.local.get('recording', function (result) {
            recording = result.recording;
            simulating = simulating_result.simulating;

            if (simulating) {
                document.getElementById('recordButton').innerHTML = "Stop Simulating";
                document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-danger btn-block');
            } else if (recording) {
                document.getElementById('recordButton').innerHTML = "Stop Recording";
                document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-danger btn-block');
            } else {
                document.getElementById('recordButton').innerHTML = "Start Recording";
                document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-success btn-block');
            }
        });
    });
};

var triggerLoopClicked = false;
var windowWidth = 1280;
var windowHeight = 800;
if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) { // Opera
    windowWidth*=window.devicePixelRatio;
    windowHeight*=window.devicePixelRatio;
}

window.onload = function() {
    document.getElementById('dashLink').onclick = function () {
        if (typeof InstallTrigger === 'undefined') { // NOT Firefox
            chrome.tabs.query({
                windowType: "popup"
            },function(tabs){
                var opened = false;
                for (var i=0; i<tabs.length; i++) {
                    if (tabs[i].url.includes(chrome.runtime.id)) {
                        opened = true;
                        chrome.tabs.update(tabs[i].id, {
                            url: chrome.extension.getURL("dashboard.html")
                        }, function() {
                            chrome.windows.update(tabs[i].windowId,{
                                focused: true
                            });
                        });
                        break;
                    }
                }
                if (!opened)
                    chrome.windows.create({
                        url: chrome.extension.getURL("dashboard.html"),
                        type: "popup",
                        width: windowWidth,
                        height: windowHeight,
                        left: Math.round(screen.width/2-(windowWidth/2)),
                        top: Math.round(screen.height/2-(windowHeight/2))
                    });
                window.close();
            });
        } else {
            window.open(chrome.extension.getURL("dashboard.html"), "wildfire", "left=" + Math.round(screen.width/2-(windowWidth/2)) +
                "top=" + Math.round(screen.height/2-(windowHeight/2)) + ",width=" + windowWidth + ",height=" + windowHeight +
                ",resizable=no,scrollbars=yes,status=no,menubar=no,toolbar=no,personalbar=no");
            
            window.close();
        }
    };
}