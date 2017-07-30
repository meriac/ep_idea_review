# ep_idea_review: Authenticating Etherpad-Lite pads using OpenID Connect for Idea Submission

A sample etherpad-lite plugin for authenticating Etherpad-Lite pads
using OpenID Connect as implemented by the Apache module [mod_auth_openidc](https://github.com/pingidentity/mod_auth_openidc).

Using this plugin etherpad lite can [authenticate against Office 365](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oidc)
and other OIDC compatible cloud services.

## Installation
In your etherpad-lite installation:
```bash
npm install https://github.com/meriac/ep_idea_review
```

### Extend your Apache server virtual host config
```ApacheConf
<IfModule mod_ssl.c>
<VirtualHost *:443>
    # Enable Keep-Alive
    KeepAlive On
    KeepAliveTimeout 5
    MaxKeepAliveRequests 1000

    #
    # Don't forget your normal server config (SSL etc)
    #

    # Enable URL rewriting
    RewriteEngine on

    # Preserve original host
    ProxyPreserveHost On

    # Enable Proxying
    <Location "/pad/">
        RewriteCond %{QUERY_STRING} transport=websocket [NC]
        RewriteRule /socket.io/(.*) ws://localhost:9001/socket.io/$1 [P,L]

        ProxyPass "http://localhost:9001/" retry=0 timeout=30
        ProxyPassReverse http://localhost:9001/
    </Location>

    OIDCRedirectURI https://www.YOUR_ETHERPAD_SITE.com/login
    OIDCProviderMetadataURL https://login.microsoftonline.com/YOUR_O365_DOMAIN.com/v2.0/.well-known/openid-configuration

    OIDCScope "openid email profile"
    OIDCRemoteUserClaim preferred_username
    OIDCCookieHTTPOnly On
    OIDCResponseType id_token
    OIDCResponseMode form_post

    OIDCClientID client-id-as-defined-in-azure
    OIDCClientSecret client-secret-as-defined-in-azure
    OIDCCryptoPassphrase LONG_RANDOM_STRING

    # ensure to unset OIDC_CLAIM_* headers to prevent attacks
    RequestHeader unset OIDC_*

    # enabled security headers for protecting against cross site scripting
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set Strict-Transport-Security "max-age=31536000; preload"
</VirtualHost>
</IfModule>
```

### Set up Apache modules
```bash
# become root
sudo -i -u root bash
# disable general-purpose proxying
cd /etc/apache2
echo "ProxyRequests Off" > conf-enabled/proxy-security.conf
# enable various apache modules
cd mods-enabled
ln -s ../mods-available/auth_openidc.load
ln -s ../mods-available/auth_openidc.conf
ln -s ../mods-available/proxy.conf
ln -s ../mods-available/proxy_http.load
ln -s ../mods-available/proxy_wstunnel.load
ln -s ../mods-available/proxy.load
ln -s ../mods-available/rewrite.load
ln -s ../mods-available/socache_shmcb.load
# install & restart apache
systemctl enable apache2.service
systemctl restart apache2.service
# return from root to default user account
exit
```
