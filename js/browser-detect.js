var BrowserDetect = function() {

    var el = document.getElementsByTagName('body')[0];
    var wn = window.navigator;
    var platform = wn.platform.toString().toLowerCase();
    var userAgent = wn.userAgent.toLowerCase();
    var versionRegex;
    var storedNameMatch;
    var storedName = "";
    var combinedClasses;
    var browserOsVersion;
    var browserName;
    var version;
    var vendor;
    var os;


   

    // firefox
    if(userAgent.indexOf('firefox', 0) !== -1) {
        versionRegex = /firefox\/\d{1,3}\.\d/;
        browserName = 'firefox';
        storedNameMatch = userAgent.toLowerCase().match(versionRegex);
        if(storedNameMatch !== null) {
            storedName = storedNameMatch.toString().replace(/\./g, '');
        }
        version = storedName.replace(/firefox\//, '');

        if((version.indexOf('1') === 0) && (version.length > 3)) { // checking if the version is 1\d.something
            version = version.substring(0, 3);
        } else {
            version = version.substring(0, 2);
        }

        browserOsVersion = browserName + version;
    }

    // ie
    if(userAgent.indexOf('msie', 0) !== -1) {
        browserName = 'ie';
        os = 'win';
        
        storedNameMatch = userAgent.match(/msie[ ]\d{1}/);
        if(storedNameMatch !== null) {
            storedName = storedNameMatch.toString();
        }
        version = storedName.replace(/msie[ ]/, '');

        browserOsVersion = browserName + version;
    }

    if(userAgent.indexOf('trident', 0) !== -1) {
        browserName = 'ie';
        os = 'win';
    }

    // safari and chrome
    if(userAgent.indexOf('webkit', 0) !== -1) {
        browserName = 'webkit';
        vendor = wn.vendor.toLowerCase(); // not a standard property

        if(vendor.search('apple') >= 0) {
            browserName = 'safari';
            // versionRegex = /version\/\d[.]\d/;
            // storedName = userAgent.match(versionRegex).toString();
            // version = storedName.replace(/version\//,'').replace('.','');
        } else if(vendor.search('google') >= 0) {
            browserName = 'chrome';
            // versionRegex = /chrome\/\d\d?\.\d?/;
            // storedName = userAgent.match(versionRegex).toString().replace('.','');
            // version = storedName.replace(/chrome\//,'').substring(0,3);
        }

        browserOsVersion = browserName + version;
    }
     // Microsoft edge
     if(userAgent.indexOf('edg', 0) !== -1) {
        browserName = 'microsoft edge';
        browserOsVersion = browserName;
    }

    // os
    if(!os) {
        if(platform.search('win') >= 0) {
            os = 'win';
        }
        if(platform.search('mac') >= 0) {
            os = 'mac';
        }
        if(userAgent.search('iphone') >= 0) {
            os = 'idevice';
        }
        if(platform.search('linux') >= 0) {
            if(wn.appVersion.indexOf("Android") > -1) {
                os = "android";
            }
            else {
                os = 'linux';
            }
        }
    }

    combinedClasses = os + ' ' + browserName + ' ' + browserOsVersion;

    if(el.className) {
        combinedClasses += ' ' + el.className;
    }

    el.setAttribute('class', combinedClasses);

    browserData.os = os;
    browserData.browser = browserName;
    browserData.browserVersion = browserOsVersion;
};
var browserData = {
    browser: null,
    browserVersion: null,
    os: null
};
$(function() {
    BrowserDetect();
    $("body").addClass(browserData.os + " " + browserData.browser + " " + browserData.browserVersion);
});