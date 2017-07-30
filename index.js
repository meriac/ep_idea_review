var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
var eejs = require("ep_etherpad-lite/node/eejs");

exports.padInitToolbar = function (hook_name, args) {
    var toolbar = args.toolbar;

    var button = toolbar.button({
        command: 'ep_idea_review_submit',
        localizationId: "ep_idea_review.submit.title",
        class: "buttonicon buttonicon-idea_review_submit ep_idea_review_submit"
    });

    toolbar.registerButton('ep_idea_review_submit', button);
};

exports.handleMessage = function(hook, context, cb){
    console.debug("ep_idea_review.handleMessage");

    switch( context.message.type ){
        case "COLLABROOM":
            /* drop user update */
            if( context.message.data.type == "USERINFO_UPDATE" )
                return cb([null]);
            break;

        case "CLIENT_READY":
            if( context.message.token ){
                var headers = context.client.client.request.headers;
                /* if OIDC name present - set user name */
                if( headers["oidc_claim_name"] ){
                    authorManager.getAuthor4Token(context.message.token, function(err, author) {
                        authorManager.setAuthorName(author, headers["oidc_claim_name"]);
                    });
                };
            }
            break;
    }

    return cb([context.message]);
};

exports.clientVars = function(hook, context, callback){
  return callback({ "settings_title": settings.title });
};

exports.eejsBlock_styles = function (hook_name, args, cb) {
    args.content = args.content + eejs.require("ep_idea_review/templates/styles.ejs");
    return cb();
};
