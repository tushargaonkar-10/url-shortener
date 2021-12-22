const express = require("express");
const app = express();
const mongoose = require("mongoose");
const logger = require("./logger");
const morgan = require("morgan");

const shortUrl = require("./models/shortUrl");

//db connection begins
mongoose.connect('mongodb+srv://task:task@clusterurlshortener.nrqrt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true
});
//db connection end

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(morgan('short'));

//route to list all urls
app.get('/', async (req, res) => {

    try {
        const shortUrls = await shortUrl.find().sort({ _id: "desc" });
        res.render('index', { shortUrls: shortUrls });
    } catch (error) {
        console.log('Error in shortUrls' + error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

//route to create short urls
app.post('/shortUrls', async (req, res) => {

    try {
        let request = req.body;
        let url = request.url;

        if (url == null) {
            throw { message: "url cannot be empty" };
        } else {
            console.log('full url ' + url);
            await shortUrl.create({ url: req.body.url });

            res.redirect('/');
        }
    } catch (error) {
        let status, message;
        if (error.message == "url cannot be empty") {
            status = 402;
            message = error.message;
        } else {
            console.log('Error in shortUrls' + error);
            status = 500;
            message = 'Something went wrong';
        }
        res.status(status).json({ message: message });
    }
});

//route to redirect user by short url
app.get('/:shortUrl', async (req, res) => {

    try {

        let url = req.params.shortUrl;

        if (url == null) {
            throw { message: "url cannot be empty" };
        } else {

            const shortUrlData = await shortUrl.findOne({ short: url });

            if (shortUrlData == null) return res.sendStatus(404);

            shortUrlData.clicks++
            shortUrlData.save()

            res.redirect(shortUrlData.url);
        }
    } catch (error) {
        let status, message;
        if (error.message == "url cannot be empty") {
            status = 402;
            message = error.message;
        } else {
            console.log('Error in shortUrls' + error);
            status = 500;
            message = 'Something went wrong';
        }
        res.status(status).json({ message: message });
    }
});

app.listen(process.env.PORT || 8000);