var FB = require('../fb');
// let express = require('express')
// let app = express()
// let bodyParser = require('body-parser');
// let router = express.Router();
// let cors = require('cors');
// app.use(cors());
// app.use('/api', bodyParser.json(), router);   //[use json]
// app.use('/api', bodyParser.urlencoded({ extended: false }), router);
var request = require('request');

FB.options({
    appId: process.env.APP_ID,
    appSecret: process.env.APP_SECRET,
    scope: 'user_friends, email, user_birthday, user_posts, user_status, user_photos, user_gender, user_likes, user_link',
    redirect_uri: 'http://localhost:4000/api/auth/facebook/login/callback'
});

function getFacebookLoginUrl() {
    return 'https://www.facebook.com/dialog/oauth' +
        '?client_id=' + FB.options('appId') +
        '&redirect_uri=' + encodeURIComponent(FB.options('redirect_uri')) +
        '&scope=' + encodeURIComponent(FB.options('scope'));
}
exports.loginUrl = function (req, res) {
    res.send(getFacebookLoginUrl());
}
exports.loginCallback = function (req, res, next) {
    var code = req.query.code,
        accessToken = '',
        expires = 0;
    if (req.query.error) {
        // user disallowed the app
        return res.send('Error occurred');
    } else if (!code) {
        return res.redirect('http://localhost:3000');
    }

    // exchange code for access token
    FB.api('oauth/access_token', {
        client_id: FB.options('appId'),
        client_secret: FB.options('appSecret'),
        redirect_uri: FB.options('redirect_uri'),
        code: code
    }, function (result) {
        if (!result || result.error) {
            console.log(!res ? 'error occurred' : res.error);
            return next(result); // todo: handle error
        }

        accessToken = result.access_token;
        expires = result.expires ? result.expires : 0;

        // todo: extend access token
        req.session.access_token = accessToken;
        req.session.expires = expires;
        res.redirect('http://localhost:3000');
    });
};

exports.logout = function (req, res) {
    // req.session = null; 
    req.session.destroy() // clear session
    console.log('clear session: ', req.session)
    res.redirect('/');
};

exports.feed = function (req, res) {
    var parameters = req.query;
    parameters.access_token = req.session.access_token;
    FB.api('/me/feed', req.query, function (result) {
        console.log('query: ', req.query)
        if (!result || result.error) {
            return res.send(500, 'error' + result);
        }
        res.send(result);
    });
}

exports.friends = function (req, res) {
    FB.api('me/friends', {
        fields: 'name,picture',
        limit: 250,
        access_token: req.session.access_token
    }, function (result) {
        if (!result || result.error) {
            return res.send(500, 'error');
        }
        res.send(result);
    });
}

exports.me = function (req, res) {
    FB.api('me', {
        fields: 'id,name',
        access_token: req.session.access_token
    }, function (result) {
        if (!result || result.error) {
            return res.send(500, 'error');
        }
        res.send(result);
    });
}