import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoubleRangeSlider from './DoubleRangeSlider/DoubleRangeSlider';

const Oneroom = () => {
    const navigate = useNavigate();
  const [rangeValues, setRangeValues] = useState({
    depositRange: { min: 0, max: 3000 },
    rentRange: { min: 0, max: 150 },
    roomSizeRange: { min: 0, max: 1000 },
  });


  const handleDepositRangeChange = useCallback(({ min, max }) => {
    setRangeValues((prev) => ({
      ...prev,
      depositRange: { min, max },
    }));
  }, []);

  const handleRentRangeChange = useCallback(({ min, max }) => {
    setRangeValues((prev) => ({
      ...prev,
      rentRange: { min, max },
    }));
  }, []);

  const handleRoomSizeRangeChange = useCallback(({ min, max }) => {
    setRangeValues((prev) => ({
      ...prev,
      roomSizeRange: { min, max },
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/search', { state: rangeValues });
  };

  return (
    <main className="w-10/12 flexCol gap-y-20">
      <form className="w-full flexRow items-start justify-between" onSubmit={handleSubmit}>
        <section className="flexCol gap-y-10 items-start">
          <article>
            <div className="flexRow gap-x-4">
              <h2>가격</h2>
              <span className="mobile_5">
                <input type="checkbox" />
                관리비 포함
              </span>
            </div>

            <div className="w-full max-w-md mx-auto mt-10">
              <div>
                <p>보증금(전세금)</p>
              </div>
              <DoubleRangeSlider
                min={rangeValues.depositRange.min}
                max={rangeValues.depositRange.max}
                onChange={handleDepositRangeChange}
              />
            </div>

            <div className="w-full max-w-md mx-auto mt-10">
              <div>
                <p>월세</p>
              </div>
              <DoubleRangeSlider
                min={rangeValues.rentRange.min}
                max={rangeValues.rentRange.max}
                onChange={handleRentRangeChange}
              />
            </div>
          </article>
        </section>

        <section>
          <div className="">
            <div>
              <p>방크기</p>
            </div>
            <DoubleRangeSlider
              min={rangeValues.roomSizeRange.min}
              max={rangeValues.roomSizeRange.max}
              onChange={handleRoomSizeRangeChange}
            />
          </div>
        </section>

        <button type="submit" className="bg-primary-yellow w-1/3 rounded mobile_3_b py-1">
          적용하기
        </button>
      </form>
    </main>
  );
};

export default Oneroom;
