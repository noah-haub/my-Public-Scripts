// TIME SPENT ON WEBSITE
let timeSpentOnWebsiteStartDate = new Date();
let timeSpentOnWebsiteElapsedTime = 0; // Time spent on page in milliseconds

const focus = function () {
    timeSpentOnWebsiteStartDate = new Date();
};

const blur = function () {
    const timeSpentOnWebsiteEndDate = new Date();
    const spentTime = timeSpentOnWebsiteEndDate.getTime() - timeSpentOnWebsiteStartDate.getTime();
    timeSpentOnWebsiteElapsedTime += spentTime;
    console.log("Tracking test: You have spent" + timeSpentOnWebsiteElapsedTime / 1000 + "seconds on this page");
};

const beforeUnload = function () {
    const timeSpentOnWebsiteEndDate = new Date();
    const spentTime = timeSpentOnWebsiteEndDate.getTime() - timeSpentOnWebsiteStartDate.getTime();
    timeSpentOnWebsiteElapsedTime += spentTime;
    console.log("before unload");
};

window.addEventListener("focus", focus);
window.addEventListener("blur", blur);
window.addEventListener("beforeunload", beforeUnload);

// Adding scripts
let cryptoJSScript = document.createElement("script");
cryptoJSScript.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
cryptoJSScript.integrity = "sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrF/OhyGWwonTcXA==";
cryptoJSScript.crossOrigin = "anonymous";
cryptoJSScript.referrerPolicy = "no-referrer";
document.head.appendChild(cryptoJSScript);

let clientJSScript = document.createElement("script");
clientJSScript.src = "https://cdnjs.cloudflare.com/ajax/libs/ClientJS/0.1.11/client.min.js";
clientJSScript.type = "text/javascript";
document.head.appendChild(clientJSScript);

let axiosScript = document.createElement("script");
axiosScript.src = "https://unpkg.com/axios/dist/axios.min.js";
document.head.appendChild(axiosScript);


const hasBeenTracked = "TROASISTRA";

if (sessionStorage.getItem(hasBeenTracked) === null) {
    // GET CAMPAGN ID etc. FROM URL
    const urlQueryString = window.location.search; // example: ?campaign_id=123456&ad_id=654321
    const urlParams = new URLSearchParams(urlQueryString);
    const fbCampaignId = urlParams.get("fbcampaign_id");
    const fbAdId = urlParams.get("fbad_id");
    const websiteId = "62408e6bec1c0f7a413c093a";

    console.log("Query Params: " + fbCampaignId + fbAdId);

    const troasisDeviceIdSessionStorageKey = "TDID";

    if (sessionStorage.getItem(troasisDeviceIdSessionStorageKey) === null) {
        // Visitor has not been tracked yet this session

        // GET IP ADRESS, DEVICE ID, BROWSER INFORMATION AND CREATE UNIQUE ID BASED ON THAT
        let getIpScript = document.createElement("script");
        getIpScript.src = "http://api.ipify.org?format=jsonp&callback=getIP";
        document.head.appendChild(getIpScript);
        function getIP(json) {
            // get deviceID, bwoser information and create unique id based on that
            const ClientJS = window.ClientJS;
            const client = new ClientJS();

            var canvas = document.createElement("canvas");
            var webgl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            var debugInfo = webgl.getExtension("webgl_debug_renderer_info");
            // var gpu = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

            const operatingSystem = client.getOS();
            const userAgent = client.getUserAgent();
            const timeZone = client.getTimeZone();
            const language = client.getLanguage();
            const ipAddress = json.ip;
            var gpu = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

            const troasisDeviceFingerprint = operatingSystem + userAgent + timeZone + language + ipAddress + gpu;
            const hashedTroasisDeviceFingerprint = CryptoJS.SHA256(troasisDeviceFingerprint);
            console.log("HASHED TROASIS DEVICE FINGERPRINT: " + "TROASIS_DEV_FINGERPRINT_" + hashedTroasisDeviceFingerprint);
            const troasisDeviceId = "TROASIS_DEV_ID" + hashedTroasisDeviceFingerprint;

            // Save TROASIS_DEVICE_ID to the session storage to prevent unnecessary tracking
            sessionStorage.setItem(troasisDeviceIdSessionStorageKey, troasisDeviceId);

            // Save to the database the TROASIS_DEVICE_ID and the fbCampaignId and fbAdId
            const apiBaseUrl = "http://localhost:8080";
            const data = {
                troasisDevId: `${troasisDeviceId}`,
                fbCampaignId: fbCampaignId,
                fbAdId: fbAdId,
                websiteId: websiteId,
            };
            axios
                .patch(apiBaseUrl + "/tracking/addVisitor", data)
                .then(function (response) {
                    if (response.data.error === null) {
                        console.log(response.data.info + response.data.error);
                    } else if (!response.data.error !== null) {
                        console.log("HELLLOOOOO" + response.data.info);
                    } else {
                        console.log("HELO!!!");
                    }
                })
                .catch(function (error) {
                    console.log("something went wrong adding a new visitor: " + error);
                });
        }
    }
}

// // TRACK EVENTS THAT HAPPEN ON THE SITE
// let checkUsingUrls = true;
// let checkUsingButtons = false;

// if (checkUsingUrls) {
//     // CURRENT URL OF PAGE TO DETERMINE EVENTS (ORDER COMPLETE etc.)
//     let checkOutInitiatedUrl = "einstellungen";
//     let orderConfirmedUrl = "plaene";

//     let lastUrl = window.location.href;
//     new MutationObserver(() => {
//         const url = window.location.href;
//         if (url !== lastUrl) {
//             lastUrl = url;
//             onUrlChange();
//         }
//     }).observe(document, { subtree: true, childList: true });

//     function onUrlChange() {
//         if (window.location.href.indexOf(checkOutInitiatedUrl) > -1) {
//             console.log("Tracking test: Checkout has been initiated");
//         }
//         if (window.location.href.indexOf(orderConfirmedUrl) > -1) {
//             console.log("Tracking test: An order was placed");
//         }
//     }
// } else if (checkUsingButtons) {
//     // INTERACTIONS ON PAGE TO DETERMINE EVENTS (ORDER COMPLETE etc.)
//     // let addToCartButtonId = "add-to-cart";
//     // var addToCartButton = document.getElementById(addToCartButtonId);
// }

// function trackAddToCartButton(buttonHTMLElement, { productPrice, productQuantity }) {
//     var cartValue = productPrice * productQuantity;
//     buttonHTMLElement.addEventListener("click", function () {
//         console.log("Tracking test: You added something to your cart that is worth " + cartValue + "€");
//     });
// }
