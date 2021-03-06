import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import formFields from './formFields';
import * as actions from './../../actions';

const SurveyFormReview = ({ onCancel, formValues, history, submitSurvey }) => {
  const reviewFields = () => _.map(formFields, ({ label, name }) => {
    return (
      <div key={name}>
        <label>{label}</label>
        <div>{formValues[name]}</div>
      </div>
    );
  });

  return (
    <div>
        <h5>Please confirm your form</h5>
        <div>
          {reviewFields()}
        </div>
        <button
          className="yellow darken-3 btn-flat white-text"
          onClick={onCancel}
        >
          Back
        </button>
        <button
          className="green btn-flat right"
          onClick={() => submitSurvey(formValues, history)}
        >
          Send Survey
          <i className="material-icons right">email</i>
        </button>
    </div>
  );
};

function mapStateToProps({ form: { surveyForm: { values } } }) {
  return { formValues: values };
}

export default connect(mapStateToProps, actions)(withRouter(SurveyFormReview));
