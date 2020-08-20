const router = require('express').Router();
const moment = require('moment');

const auth = require('../middlewares/auth');
const Product = require('../models/Product');

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

router.get('/', auth, async (req, res) => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    let offset = 0;
    const limit = 10;

    if (req.query.page) {
        offset = parseInt(req.query.page) > 1 ? limit * (parseInt(req.query.page) - 1) + 1 : offset;
    }

    let searchterm = {};

    if (req.query.searchterm) {
        searchterm = {
            title: {
                $regex: '.*' + req.query.searchterm + '.*'
            }
        }
    }

    Product.paginate(searchterm, {
        offset: offset,
        limit: limit
    })
    .then(result => {
        const products = [];

        result.docs.forEach(product => {
            products.push({
                _id: product._id,
                title: product.title,
                image_url: product.image_url,
                price: Math.round(product.price),
                created_at: moment(product.created_at).format('DD-MM-YYYY')
            });
        });

        res.render('products/list', {
            activeTab: 'products',
            userName: loggedInUser.name,
            products: products,
            searchterm: req.query.searchterm ? req.query.searchterm : '',
            current: result.page,
            pages: result.totalPages,
            limit: result.limit,
            successMsg: req.flash('success'),
            errorMsg: req.flash('error')
        });
    });
});

module.exports = router;