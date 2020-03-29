let express = require('express');
let bodyParser = require('body-parser');
let router = express.Router();
let cors = require('cors');
var session = require('express-session')
let app = express();
const FB = require('./fb')
const env = require('dotenv').config()
var request = require('request');
const authRoutes = require('./routes/auth')
const fbRoutes = require('./routes/fb')
const psuRoutes = require('./routes/psu')
app.use(cors({ origin: ['http://localhost:3000'], methods: ['GET', 'POST', 'PUT','DELETE'], credentials: true }));
app.use(session({
    secret: 'keyboard cat', cookie: { maxAge: 60000 },
    resave: false, saveUninitialized: false
}))
// all of our routes will be prefixed with /api
app.use('/api', bodyParser.json(), router);   //[use json]
app.use('/api', bodyParser.urlencoded({ extended: false }), router);
let bears = [
    { 'id': 0, 'name': 'pooh', 'weight': 211, 'img': 'https://lumiere-a.akamaihd.net/v1/images/c94eed56a5e84479a2939c9172434567c0147d4f.jpeg?region=0,0,600,600' },
    { 'id': 1, 'name': 'vinnie', 'weight': 111, 'img': 'https://cdn2.mhpbooks.com/2018/07/winnie_pooh_PNG37592.png' },
];

router.route('/bears')
    // get all bears
    .get((req, res) => res.json(bears))
    // insert a new bear
    .post((req, res) => {
        var bear = {};
        bear.id = bears.length > 0 ? bears[bears.length - 1].id + 1 : 0;
        bear.name = req.body.name
        bear.weight = req.body.weight
        bear.img = req.body.img
        bears.push(bear);
        res.json({ message: 'Bear created!' })
    })
router.route('/bears/:bear_id')
    .get((req, res) => {
        let id = req.params.bear_id
        let index = bears.findIndex(bear => (bear.id === +id))
        res.json(bears[index])                   // get a bear
    })
    .put((req, res) => {                               // Update a bear
        let id = req.params.bear_id
        let index = bears.findIndex(bear => (bear.id === +id))
        bears[index].name = req.body.name;
        bears[index].weight = req.body.weight;
        bears[index].img = req.body.img;
        res.json({ message: 'Bear updated!' + req.params.bear_id });
    })
    .delete((req, res) => {                   // Delete a bear
        // delete     bears[req.params.bear_id]
        let id = req.params.bear_id
        let index = bears.findIndex(bear => bear.id === +id)
        bears.splice(index, 1)
        res.json({ message: 'Bear deleted: ' + req.params.bear_id });
    })

router.route('/auth')
    .get(authRoutes.index);
router.route('/auth/logout')
    .get(authRoutes.logout);
router.route('/auth/facebook')
    .get(fbRoutes.loginUrl);
router.route('/auth/facebook/login/callback')
    .get(fbRoutes.loginCallback);
router.route('/auth/psu')
    .post(psuRoutes.login);

app.use("*", (req, res) => res.status(404).send('404 Not found'));
//app.listen(process.env.PORT, () => console.log(process.env.PORT));
app.listen(3000, () => console.log("Server is running"));