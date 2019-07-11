/**
 * Repeats all beacons to a second URL.
 *
 * To configure, update BEACON_URL.
 *
 * This code repeats some code from Boomerang. Its been modified to only send
 * image beacons. Code related to using sendBeacon() API or XHR beacons have
 * been removed and cant be brought back in if that needed.
 *
 * Currently, beaconParamToCopy has a list of timing variables that this plugin pulls
 * from Boomerang regular beacons and includes in the repeated beacon that is then sent to
 * the destination specified by BEACON_URL. This set can be expanded, if desired, to include
 * other variables that are present on the boomerang beacon.
 *
 * @class BOOMR.plugins.BeaconRepeater
 */
(function() {
    BOOMR = window.BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    if (BOOMR.plugins.BeaconRepeater) {
        return;
    }

    var BEACON_URL = "https://www.tiaa.org/public/text/pmt.gif";
    var beaconParamToCopy = {"rt.start":1,"rt.tstart":1,"rt.bstart":1,"rt.end":1,"t_resp":1,"t_page":1,"t_done":1,"r":1,"nt_red_cnt":1,"nt_nav_type":1,"nt_nav_st":1,"nt_red_st":1,"nt_red_end":1,"nt_fet_st":1,"nt_dns_st":1,"nt_dns_end":1,"nt_con_st":1,"nt_con_end":1,"nt_req_st":1,"nt_res_st":1,"nt_res_end":1,"nt_domloading":1,"nt_domint":1,"nt_domcontloaded_st":1,"nt_domcontloaded_end":1,"nt_domcomp":1,"nt_load_st":1,"nt_load_end":1,"nt_unload_st":1,"nt_unload_end":1,"nt_spdy":1,"nt_cinf":1,"nt_first_paint":1,"u":1,"v":1,"vis.st":1,"ua.plt":1,"ua.vnd":1};

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

                    // if `name` is first class property and we are tracking it in beaconParamsToCopy, then add it.
                    if (data.hasOwnProperty(name) && beaconParamToCopy.hasOwnProperty(name)) {
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