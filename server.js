require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');
const NewsAPI = require('newsapi');
const bodyParser = require('body-parser');

const app = express();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER
});

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

const fetchNews = (searchTerm, pageNum) =>
  newsapi.v2.everything({
    q: searchTerm,
    language: 'en',
    page: pageNum,
    pageSize: 5,
  });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/webhooks', function(req, res, next) {
  req.rawBody = JSON.stringify(req.body);
  next();
});

app.get('/live', (req, res) => {
  const topic = 'bitcoin';
  fetchNews(topic, 1)
    .then(response => {
      res.json(response.articles);
    })
    .catch(error => console.log(error));
});

app.post('/news', (req, res) => {
  let newsUpdate = [req.body];
  pusher.trigger('presence-news', 'update-news', {
    articles: newsUpdate,
  });
  res.send(newsUpdate);
})

app.post('/webhooks', (req, res) => {
  console.log('REQ_HEADERS', req.headers);
  console.log('RAW_REQUEST', req.rawBody);
  const webhook = pusher.webhook(req);
  // console.log("data:", webhook.getData());
  console.log("events:", webhook.getEvents());
  // console.log("time:", webhook.getTime());
  console.log("valid:", webhook.isValid());
  res.send("OK");
})

app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
