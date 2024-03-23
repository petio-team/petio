/* eslint-disable react/no-unknown-property */
import React from "react";
import { useState, useMemo } from "react";

export function Stepper(props) {
  const { steps, navigate = "both", onClickPrevious, onClickNext } = props;

  const [index, setIndex] = useState(0);

  const stepsTitles = useMemo(
    () =>
      steps.map((step, i) => (
        <div
          key={String(i)}
          className="step"
          past-step={String(index > i)}
          current-step={String(index === i)}
          incoming-step={String(index < i)}
        >
          <div className="step-index" incoming-step={String(index < i)}>
            {i + 1}
          </div>
          <div className="step-title">
            <h3>{step.title}</h3>
            {step.subtitle ? <h4>{step.subtitle}</h4> : null}
          </div>
        </div>
      )),
    [steps, index]
  );

  const stepsComponents = useMemo(
    () =>
      steps.map((step, i) => (
        <div key={String(i)} className="step-component-overflow">
          <div className="step-component">{step.content}</div>
        </div>
      )),
    [steps]
  );

  return (
    <div className="stepper">
      <div className="stepper-nav">{stepsTitles}</div>
      <div className="stepper-content">
        <div className="stepper-components">
          <div
            className="stepper-component-nav"
            style={{ left: `-${index * 100}%` }}
          >
            {stepsComponents}
          </div>
        </div>
        <div className="stepper-navigation">
          {steps[index]?.prevButton ? (
            steps[index]?.prevButton({ index, setIndex })
          ) : (navigate === "both" || navigate === "prev") && index !== 0 ? (
            <button
              className="btn btn__square"
              disabled={index === 0}
              onClick={async () => {
                try {
                  await onClickPrevious?.();
                  setIndex(index - 1);
                } catch (error) {
                  // Do nothing
                }
              }}
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {steps[index]?.nextButton ? (
            steps[index]?.nextButton({ index, setIndex })
          ) : (navigate === "both" || navigate === "next") &&
            index !== steps.length - 1 ? (
            <button
              className="btn btn__square"
              onClick={async () => {
                try {
                  await onClickNext?.();
                  setIndex(index + 1);
                } catch (error) {
                  // Do nothing
                }
              }}
            >
              Continue
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
