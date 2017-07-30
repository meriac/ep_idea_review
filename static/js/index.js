exports.aceInitialized = function(hook, context){
    if(clientVars.settings_title){
      window.document.title = clientVars.settings_title + " | "  + clientVars.padId.replace(/_+/g, ' ');
    }
};

exports.postToolbarInit = function (hook_name, args) {
    args.toolbar.registerCommand('ep_idea_review_submit', function () {
        window.open(window.location.href + "/export/html", '_self');
    });
};
