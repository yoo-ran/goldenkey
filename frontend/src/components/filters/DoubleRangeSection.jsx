import React from 'react';
import DoubleRangeSlider from './DoubleRangeSlider/DoubleRangeSlider';  // Assuming you have this component

const DoubleRangeSection = ({ 
  title, 
  subTitle1, 
  subTitle2, 
  min1, 
  max1, 
  min2, 
  max2, 
  onChange1, 
  onChange2, 
  handleClear, 
  handleSubmit 
}) => (
  <div className="flexCol items-start gap-y-8 w-full border-t border-primary-yellow pt-8">
    <p className='mobile_3_bold'>{title}</p>
    
    <div className="grid grid-rows-2">
      <p className="mobile_4_bold">{subTitle1}</p>
      <DoubleRangeSlider name={title} min={min1} max={max1} onChange={onChange1} />
    </div>
    
    {subTitle2 && (
      <div className="grid grid-rows-2">
        <p className="mobile_4_bold">{subTitle2}</p>
        <DoubleRangeSlider name={title} min={min2} max={max2} onChange={onChange2} />
      </div>
    )}
    
    <div className='w-full grid grid-cols-2 gap-x-4 mobile_4_bold_b'>
      <button className="btn_clear" name={title} onClick={handleClear}>초기화</button>
      <button className='btn_clear bg-primary-yellow' onClick={handleSubmit}>적용</button>
    </div>
  </div>
);

export default DoubleRangeSection;
