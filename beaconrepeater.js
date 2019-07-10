// ==UserScript==
// @name         Beacon Repeater
// @namespace    http://avishenoy.com
// @version      1.0
// @description  Repeat beacon data to another endpoint
// @author       Avinash Shenoy
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/* eslint-disable camelcase */

/**
 * Repeats all beacons to a second URL.
 *
 * To configure, update BEACON_URL.
 *
 * This code repeats some code from Boomerang.  If you only need to send
 * XHR beacons, or only image beacons, or not sendBeacon(), it could be trimmed down.
 *
 * @class BOOMR.plugins.BeaconRepeater
 */
(function() {
    BOOMR = window.BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    if (BOOMR.plugins.BeaconRepeater) {
        return;
    }

    //var BEACON_URL = "https://mybeaconurl.com/";
    var BEACON_URL = "https://www.tiaa.org/public/text/pmt.gif";
    var beaconParamToCopy = new Set(["rt.start","rt.tstart","rt.bstart","rt.end","t_resp","t_page","t_done","r","nt_red_cnt","nt_nav_type","nt_nav_st","nt_red_st","nt_red_end","nt_fet_st","nt_dns_st","nt_dns_end","nt_con_st","nt_con_end","nt_req_st","nt_res_st","nt_res_end","nt_domloading","nt_domint","nt_domcontloaded_st","nt_domcontloaded_end","nt_domcomp","nt_load_st","nt_load_end","nt_unload_st","nt_unload_end","nt_spdy","nt_cinf","nt_first_paint","u","v","vis.st","ua.plt","ua.vnd"]);

    //
    // Private implementation
    //
    var impl = {
        initialized: false,

        /**
         * Gets a URI-encoded name/value pair.
         *
         * @param {string} name Name
         * @param {string} value Value
         *
         * @returns {string} URI-encoded string
         *
         * @memberof BOOMR
         */
        getUriEncodedVar: function(name, value) {
            if (value === undefined || value === null) {
                value = "";
            }

            if (typeof value === "object") {
                value = BOOMR.utils.serializeForUrl(value);
            }

            var result = encodeURIComponent(name) +
                "=" + encodeURIComponent(value);

            return result;
        },

        /**
         * Fired after the main Boomerang beacon is sent
         *
         * @param {object} data Beacon Data
         */
        onBeacon: function(data) {
            // send the beacon elsewhere after a short delay
            setTimeout(function() {
                var name, paramsJoined, url = [], useImg = true, w = BOOMR.window || window;

                for (name in data) {
                    // if this var is set, add it to our URL array
                    if (data.hasOwnProperty(name) && beaconParamToCopy.has(name)) {
                        url.push(impl.getUriEncodedVar(name, typeof data[name] === "undefined" ? "" : data[name]));
                    }
                }

                paramsJoined = url.join("&");

                //
                // Image beacon
                //
                var img;

                // just in case Image isn't a valid constructor
                try {
                    img = new Image();
                }
                catch (e) {
                    BOOMR.debug("Image is not a constructor, not sending a beacon");
                    return false;
                }

                var fullUrl = BEACON_URL + "?" + paramsJoined;

                //img.src = url;
                img.src = fullUrl;
            }, 0);
        },

        /**
         * Sends XHR POST beacon data
         *
         * @param {object} data Beacon Data
         */
        sendXhrPostBeacon: function(xhr, paramsJoined) {
            xhr.open("POST", BEACON_URL);

            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            xhr.send(paramsJoined);
        },
    };

    //
    // Exports
    //
    BOOMR.plugins.BeaconRepeater = {
        /**
         * Initializes the plugin.
         *
         * This plugin does not have any configuration.
         *
         * @returns {@link BOOMR.plugins.BeaconRepeater} The BeaconRepeater plugin for chaining
         * @memberof BOOMR.plugins.BeaconRepeater
         */
        init: function() {
            if (!impl.initialized) {
                BOOMR.subscribe("beacon", impl.onBeacon, null, impl);

                impl.initialized = true;
            }

            return this;
        },

        /**
         * Whether or not this plugin is complete
         *
         * @returns {boolean} `true` if the plugin is complete
         * @memberof BOOMR.plugins.BeaconRepeater
         */
        is_complete: function() {
            return true;
        }
    };
}());