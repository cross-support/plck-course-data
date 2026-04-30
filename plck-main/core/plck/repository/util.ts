
export default {

    getQuerystring: function (key, default_ = "") {

        key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        const regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
        const qs = regex.exec(window.location.href);

        if (qs == null) {
            return default_;
        } else {
            return qs[1];
        }
    },

    getRequestParameter: function (method, obj) {

        if (!method || !obj) {
            return "";
        }
        const ret = [];
        for (const prop in obj) {
            ret.push(prop + "=" + encodeURIComponent(obj[prop]));
        }
        return ret.join("&");
    }



}