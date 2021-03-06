'use strict';

const config = require('./config');
const request = require('request');

const FBRequest = request.defaults({
    uri: 'https://graph.facebook.com/me/messages',
    method: 'POST',
    json: true,
    qs: {access_token: config.FB_PAGE_TOKEN},
    headers: {'Content-Type': 'application/json'},
});

const TEMPLATE_GENERIC = "generic";
const TEMPLATE_BUTTON = "button";

const BUTTON_MORE = "BUTTON_MORE";

module.exports = {


    handlePostback(recipientId, context, payload) {
        console.log("Payload for", recipientId, payload, context);

        switch (payload) {
            case MORE:
                break;
        }
    },

    /******* GENERIC FB FUNCTION *******/

    /**
     * Send a plain Text Message to Facebook
     *
     * @param recipientId   ID          Recipient ID
     * @param msg           String      The Message itself
     * @param cb            Function    Callback
     */
    sendText(recipientId, msg, cb){

        if (msg.length > 320) msg = msg.substr(0, 320);

        const opts = {
            form: {
                recipient: {
                    id: recipientId,
                },
                message: {
                    text: msg,
                },
            },
        };

        FBRequest(opts, (err, resp, data) => {
            if (cb) {
                cb(err || data.error && data.error.message, data);
            }
        });
    },

    /**
     * Send a Structured Message to a FB Conversation
     *
     * @param recipientId   ID
     * @param payload       Payload Element
     * @param cb            Callback
     */
    sendStructuredMessage(recipientId, payload, cb) {

        const opts = {
            form: {
                recipient: {
                    id: recipientId,
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: payload
                    }
                }
            },
        };

        FBRequest(opts, (err, resp, data) => {
            if (cb) {
                cb(err || data.error && data.error.message, data);
            }
        });
    },

    /**
     * Generic Structured Message Function
     *
     * @param recipientId
     * @param elements
     * @param cb
     *
     * @uses sendStructuredMessage
     *
     * Limits:
     * Title: 80 characters
     * Subtitle: 80 characters
     * Call-to-action title: 20 characters
     * Call-to-action items: 3 buttons
     * Bubbles per message (horizontal scroll): 10 elements

     * Image Dimensions
     * Image ratio is 1.91:1
     */
    sendGenericStrMsg(recipientId, elements, cb) {

        if (elements.length > 10) throw new Error("FB does not allow more then 10 payload elements");

        const payload = {
            "template_type": TEMPLATE_GENERIC,
            "elements": elements
        };
        this.sendStructuredMessage(recipientId, payload, cb);
    },

    /**
     * Generate a payload element
     *
     * @see https://developers.facebook.com/docs/messenger-platform/send-api-reference#generic_template
     *
     * @param title
     * @param click_url
     * @param image_url
     * @param sub_title
     * @param buttons
     * @returns {{title: *, subtitle: *, item_url: *, image_url: *, buttons: *}}
     */
    generatePayloadElement(title, click_url, image_url, sub_title, buttons) {
        return {
            title: title,
            subtitle: sub_title,
            item_url: click_url,
            image_url: image_url,
            buttons: buttons,
        };
    },

    /**
     * Generates a Button with a link to an external URL
     * @param title
     * @param url
     * @returns {{type: string, url: *, title: *}}
     */
    generateWebLinkButton(title, url) {
        return {
            type: "web_url",
            url: url,
            title: title,
        }
    },

    /**
     * Generates a Button for Webhook actions
     * @param title
     * @param payload
     * @returns {{type: string, title: *, payload: *}}
     */
    generateActionButton(title, payload) {
        return {
            "type": "postback",
            "title": title,
            "payload": payload
        };
    },
};