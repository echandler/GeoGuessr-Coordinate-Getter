// ==UserScript==
// @name         GeoGuessr Coordinate Getter
// @namespace    GeoGuessr scripts
// @version      1.0
// @description  Gets marker coordinates.
// @include      https://www.geoguessr.com/*
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

runAsClient(() => {
    // Modify the google global object.
    waitForGoog().then(modifyGoogOverlay);

    function waitForGoog() {
        let counter = 0;
        return new Promise(function (resolve, f) {
            let int = setInterval(function () {
                // Wait for google global variable to be loaded.
                counter++;
                if (!window.google || counter > 300 /*5 min*/) return;
                clearInterval(int);
                resolve();
            }, 1000);
        });
    }

    function modifyGoogOverlay() {
        const google = window.google;

        google.maps.OverlayView.prototype._coordsGetter = { callbacks: [] };

        let oldSetMap = google.maps.OverlayView.prototype.setMap;
        google.maps.OverlayView.prototype.setMap = function (...args) {
            let res = oldSetMap.apply(this, args);

            let oldSetPos = this.setPosition;
            this.setPosition = (...args) => {
                // setPosition is not a method in the OverlayView prototype.
                let res = oldSetPos.apply(this, args);

                if (this.position) {
                    this.div._pos = this.position;
                }
                for (let n = 0; n < this._coordsGetter.callbacks.length; n++) {
                    // Can't use forEach because the dashed line between overlays won't appear for some reason, unless
                    // the forEach call is wrapped in a setTimout or some other hack.
                    this._coordsGetter.callbacks[n].call(this);
                }

                return res;
            };

            return res;
        };

        google.maps.OverlayView.prototype.setMap.prototype = Object.create(oldSetMap.prototype);

        google.maps.OverlayView.prototype._coordsGetter.callbacks.push(function () {
            let that = this.div;

            this.div.addEventListener("mouseover", (e) => {
                let msg = document.getElementById("tempMsg");
                if (!e.shiftKey && !msg) return;

                if (!msg) {
                    msg = document.createElement("div");
                    msg.style.cssText = "z-index: 999999; position: fixed; top: 10px; left: 47%; background: white; padding: 10px;width: 10rem; word-break: break-word;";
                    msg.id = "tempMsg";

                    msg.addEventListener("mousemove", function (e) {
                        setMsgCloseTimer(msg);
                    });

                    document.body.appendChild(msg);

                    var btn = document.createElement("div");
                    btn.innerText = "Copy Coords";
                    btn.className = "coordsGtrBtn";
                    
                    btn.addEventListener("click", function (e) {
                        txt.select();
                        document.execCommand("copy");
                        txt.blur();
                        txt.style.backgroundColor = "#aaaaaa";
                        this.style.backgroundColor = "#aaaaaa";
                        setTimeout(() => {
                            txt.style.backgroundColor = "";
                            this.style.backgroundColor = "";
                        }, 200);
                    });
                    
                    var btn1 = document.createElement("div");
                    btn1.innerText = "Copy Player Coords";
                    btn1.className = "coordsGtrBtn";
                    
                    btn1.addEventListener("click", function (e) {
                        btnClick("guess-marker");
                        this.style.backgroundColor = "#aaaaaa";
                        setTimeout(() => {
                            this.style.backgroundColor = "";
                        }, 200);
                    });

                    var btn2 = document.createElement("div");
                    btn2.innerText = "Copy Correct Coords";
                    btn2.className = "coordsGtrBtn";
                    
                    btn2.addEventListener("click", function (e) {
                        btnClick("correct-location-marker");
                        this.style.backgroundColor = "#aaaaaa";
                        setTimeout(() => {
                            this.style.backgroundColor = "";
                        }, 200);
                    });

                    var txt = document.createElement("textarea");
                    txt.style.cssText = "resize: none; border: 0px;";

                    msg.txt = txt;
                    msg.appendChild(txt);
                    msg.appendChild(btn);
                    msg.appendChild(btn1);
                    msg.appendChild(btn2);
                }

                msg.that = this;
                msg.txt.value = this.position.lat() + ", " + this.position.lng();

                if (msg.pin) msg.pin.style.border = "";

                setMsgCloseTimer(msg);

                msg.pin = msg.that.div.querySelector(".pin");
                msg.pin.style.border = "1px solid red";
            });
        });

        return true;
    }

    function setMsgCloseTimer(obj){
        clearTimeout(obj.setMsgCloseTimer);
        obj.setMsgCloseTimer = setTimeout(
            function () {
                obj.pin.style.border = "";
                obj.parentElement.removeChild(obj);
            },
            2000
        );
    }

    function btnClick(txt) {
        let pins = document.querySelectorAll(".map-pin");
        let regex = new RegExp(txt);
        let coords = "";

        for (let n = 0; n < pins.length; n++) {
            if (!regex.test(pins[n].parentElement.outerHTML)) continue;
            coords += pins[n].parentElement._pos.lat() + "," + pins[n].parentElement._pos.lng() + "\n";
        }

        let offScrnTxt = document.createElement("textarea");
        offScrnTxt.style.cssText = "position: absolute; left: -1000px";
        document.body.appendChild(offScrnTxt);

        offScrnTxt.value = coords;

        offScrnTxt.select();

        document.execCommand("copy");

        offScrnTxt.parentElement.removeChild(offScrnTxt);
    }
});

let style = document.createElement("style");
style.type = "text/css";
var styleText = document.createTextNode(`
    .coordsGtrBtn {
        width: fit-content;
        font-size: 12px;
        cursor: pointer;
        padding:5px;
        border: 1px solid rgb(240, 240, 240);
        margin-top: 5px;";
    }
    .coordsGtrBtn:hover {
        background-color: rgb(200,200,200);
    }
`);
style.appendChild(styleText);
document.body.appendChild(style);
// --------------------------------------------------------------------------------------

function runAsClient(f) {
    // Inject code to be run. This is needed (via toString) because functions
    // created inside GreaseMonkey/TamperMonkey may be sandboxed, which gets
    // awkward.
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.text = "(" + f.toString() + ")()";
    document.body.appendChild(s);
}
