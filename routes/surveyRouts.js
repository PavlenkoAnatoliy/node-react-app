const _ = require('lodash');
const Path = require('path-parser');
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');

const Survey = mongoose.model('surveys');
const Mailer = require('../services/mailer');
const surveyTemplates = require('../services/emailTemplates/surveyTemplates');
const keys = require('./../config/keys');

module.exports = (app) => {
  app.get('/api/surveys/', requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id })
      .select({ recipients: false });
    
    res.send(surveys);
  });

  app.get('/api/surveys/:surveyId/:choise', (req, res) => {
    res.send('THanks for woing')
  });

  app.post('/api/surveys/webhooks', (req, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice');
    console.log(req.body);
    _.chain(req.body)
      .map( ({ url, email }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      .compact()
      .uniqBy('email', 'surveyId')
      .each((event) => {
        console.log('EVENT', event)
        Survey.updateOne({
          _id: event.surveyId,
          recipients: {
            $elemMatch: { email: event.email, responded: false }
          }
        }, {
          $inc: { [event.choice]: 1 },
          $set: { 'recipients.$.responded': true },
          lastResponded: new Date()
        }).exec();
      })
      .value();
    
    res.send({});
  });

  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const {
      title,
      subject,
      body,
      recipients,
    } = req.body;

    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({ email: email.trim() })),
      _user: req.user.id,
      dateSent: Date.now(),
    });

    const mailer = new Mailer(survey, surveyTemplates(survey, keys));
    
    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();

      res.send(user);
    } catch (err) {
      res.status(422).send(err);
    }
  });
}
