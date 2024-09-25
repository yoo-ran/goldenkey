import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoubleRangeSlider from './DoubleRangeSlider/DoubleRangeSlider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Apartment = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("거래유형을 선택하세요");
  const [open, setOpen] = useState(false);
  const [transactionMethods, setTransactionMethods] = useState([]);
  const [filteringData, setFilteringData] = useState({
    selectedMethod: '',
    depositRange: { min: 0, max: 3000 },
    rentRange: { min: 0, max: 150 },
    roomSizeRange: { min: 0, max: 1000 },
    거래방식: '',
    거래완료여부: '',
  });

  const handleDepositRangeChange = useCallback(({ min, max }) => {
    setFilteringData((prev) => ({
      ...prev,
      depositRange: { min, max },
    }));
  }, []);

  const handleRentRangeChange = useCallback(({ min, max }) => {
    setFilteringData((prev) => ({
      ...prev,
      rentRange: { min, max },
    }));
  }, []);

  const handleRoomSizeRangeChange = useCallback(({ min, max }) => {
    setFilteringData((prev) => ({
      ...prev,
      roomSizeRange: { min, max },
    }));
  }, []);

  const handleSelect = (e, option) => {
    console.log(e.target);
    e.preventDefault();  // Prevent default behavior (like navigation)
    setFilteringData({ ...filteringData, selectedMethod: option });
    setSelectedOption(option);
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/search', { state: filteringData });
  };

  const fetchConstantVariable = async () => {
    try {
      const response = await axios.get('http://localhost:8000/transaction-methods');
      setTransactionMethods(response.data);
    } catch (error) {
      console.error('Error fetching property data:', error);
    }
  };

  useEffect(() => {
    fetchConstantVariable();
  }, []);




  return (
    <main className="w-11/12 flexCol gap-y-20 ">
      아파트
      <form className="w-full flexCol gap-y-20 lg:flexRow items-start justify-between" onSubmit={handleSubmit}>
        {/* 거래유형 */}
        <section className="flexCol gap-y-8 items-start w-full">
          <article>
            <p className="mobile_1_bold">거래유형</p>
          </article>

          <article className="flexCol items-start gap-y-10  w-full">
            <div className="relative w-full">
              <button
                    onClick={(e) => {
                      e.preventDefault();  // Prevent default on button click
                      setOpen(!open);
                    }}
                className="block w-full bg-white border border-gray-300 rounded-full px-4 py-2 text-left drop-shadow focus:outline-none focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow"
              >
                <p className='flexRow justify-between w-full'>{selectedOption} <FontAwesomeIcon icon={faChevronDown}/></p>
              </button>

              {open && (
                <ul className="flexCol gap-y-1 absolute mt-2 w-full bg-white z-50">
                  {transactionMethods.map((option, index) => (
                    <li
                      key={index}
                      onClick={(e) => handleSelect(e, option)}
                      className="w-full cursor-pointer bg-secondary-light rounded-lg text-primary text-center py-1.5"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-rows-2">
              <div>
                <p className="mobile_3">보증금(전세금)</p>
              </div>
              <DoubleRangeSlider
                min={0}
                max={3000}
                onChange={handleDepositRangeChange}
              />
            </div>

            <div className="grid grid-rows-2">
              <div>
                <p className="mobile_3">월세</p>
              </div>
              <DoubleRangeSlider
                min={0}
                max={1000}
                onChange={handleRentRangeChange}
              />
            </div>
          </article>
        </section>

        {/* 방크기 */}
        <section className="flexCol gap-y-8 items-start w-full">
          <div>
            <p className="mobile_1_bold">방크기</p>
          </div>
          <div className="">
            <div className="flexRow">
              <p>방크기</p>
              <span>매물 유형별 기준면적</span>
            </div>
            <DoubleRangeSlider
              min={0}
              max={1000} 
              onChange={handleRoomSizeRangeChange}
            />
          </div>
        </section>
        
        <section className='w-full border border-primary-yellow rounded-full grid grid-cols-2 mobile_3_b'>
          <button type="submit" className="rounded-full py-1 text-primary-yellow">
            초기화
          </button>
          <button type="submit" className="bg-primary-yellow rounded-full py-1">
            적용하기
          </button>
        </section>
      </form>
    </main>
  );
};

export default Apartment;
