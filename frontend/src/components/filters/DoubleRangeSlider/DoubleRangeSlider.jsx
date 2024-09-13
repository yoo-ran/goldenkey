import "./DoubleRangeSlider.css";
import React, { useCallback, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

const DoubleRangeSlider = ({ min, max, onChange }) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const range = useRef(null);

  // Sync internal state with props (min and max)
  useEffect(() => {
    setMinVal(min);
    setMaxVal(max);
  }, [min, max]);

  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent]);

  useEffect(() => {
    onChange({ min: minVal, max: maxVal });
  }, [minVal, maxVal, onChange]);

  return (
    <div className="container">
      <div className="flexRow relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onInput={(event) => {
            const value = Math.min(Number(event.target.value), maxVal - 1);
            setMinVal(value);
          }}
          className="thumb thumb--left"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onInput={(event) => {
            const value = Math.max(Number(event.target.value), minVal + 1);
            setMaxVal(value);
          }}
          className="thumb thumb--right"
        />

        <div className="slider__track" />
        <div ref={range} className="slider__range" />
      </div>

      <div className="flexRow relative justify-between w-full">
        <div className="slider__left-value">{minVal}</div>
        <div className="slider__right-value">{maxVal}</div>
      </div>
    </div>
  );
};

DoubleRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DoubleRangeSlider;
