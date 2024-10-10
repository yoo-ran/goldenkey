import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoubleRangeSlider from './DoubleRangeSlider/DoubleRangeSlider';
import DoubleRangeSection from './DoubleRangeSection';


const defaultFilteringData = {
  transactionMethod: [],
  depositRange: [],  // Array of objects with {transactionMethod, min, max}
  rentRange: [],     // Array of objects with {transactionMethod, min, max}
  roomSizeRange: { min: 10, max: 60 },
  approvalDate: "",
  isParking: "",
  isEV: "",
};

const House = ({ approvalDate, onOpen }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isParking, setIsParking] = useState(false);
  const [isEV, setIsEV] = useState(false);
  const [transactionMethods, setTransactionMethods] = useState([]);
  const [filteringData, setFilteringData] = useState(defaultFilteringData);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onOpen(false)
    navigate('/search', { state: filteringData });
  }, [filteringData, navigate]);

  const handleClear = (e) => {
    e.preventDefault();
    
    const { name } = e.target;  // Get the name of the clicked element (if any)
    
    // If there is a `name`, remove that key from the transactionMethod array
    if (name) {
      setFilteringData(prevState => ({
        ...prevState,
        transactionMethod: prevState.transactionMethod.filter(item => item !== name),
        depositRange: prevState.depositRange.filter(item => !item[name]),
        rentRange: prevState.rentRange.filter(item => !item[name])
      }));
    } else {
      // Reset the whole filteringData if no specific name is provided
      setFilteringData(defaultFilteringData); // Reset to default state
    }
  };
  
  console.log(filteringData);

  const handleDepositRangeChange = useCallback(({ name, min = 0, max = 3000 } = {}) => {
    setFilteringData(prevState => {
      // Check if the transactionMethod (name) already exists in the depositRange
      const existingEntryIndex = prevState.depositRange.findIndex(item => item[name]);
  
      if (existingEntryIndex !== -1) {
        // If transactionMethod exists, update min and max
        const updatedDepositRange = [...prevState.depositRange];
        updatedDepositRange[existingEntryIndex] = { [name]: { min, max } };  // Use computed property for name
  
        return {
          ...prevState,
          depositRange: updatedDepositRange
        };
      } else {
        // If transactionMethod doesn't exist, add it to the array
        return {
          ...prevState,
          depositRange: [...prevState.depositRange, { [name]: { min, max } }]  // Add new entry
        };
      }
    });
  }, []);
  
  const handleRentRangeChange = useCallback(({ name, min = 0, max = 150 } = {}) => {
    console.log(name, min, max);
    setFilteringData(prevState => {
      // Check if the transactionMethod (name) already exists in the rentRange
      const existingEntryIndex = prevState.rentRange.findIndex(item => item[name]);
      console.log(existingEntryIndex);
  
      if (existingEntryIndex !== -1) {
        // If transactionMethod exists, update min and max
        const updatedRentRange = [...prevState.rentRange];
        updatedRentRange[existingEntryIndex] = { [name]: { min, max } };  // Use computed property for name
  
        return {
          ...prevState,
          rentRange: updatedRentRange
        };
      } else {
        // If transactionMethod doesn't exist, add it to the array
        return {
          ...prevState,
          rentRange: [...prevState.rentRange, { [name]: { min, max } }]  // Add new entry
        };
      }
    });
  }, []);
  
  
  

  const handleRoomSizeRangeChange = useCallback(({ min, max }) => {
    setFilteringData(prev => ({ ...prev, roomSizeRange: { min, max } }));
  }, []);

  const handleSelect = useCallback((e) => {
    const { name, value } = e.target;
    e.preventDefault();
  
    if (name === "isParking") {
      setIsParking(prev => !prev);
      setFilteringData(prev => ({ ...prev, isParking: !isParking }));
    } else if (name === "isEV") {
      setIsEV(prev => !prev);
      setFilteringData(prev => ({ ...prev, isEV: !isEV }));
    } else if (name === "transactionMethod") {
      setFilteringData(prevState => {
        if (!prevState.transactionMethod.includes(value)) {
          return {
            ...prevState,
            transactionMethod: [...prevState.transactionMethod, value]
          };
        } else {
          return { 
            ...prevState,
            transactionMethod: prevState.transactionMethod.filter(item => item !== value),
            depositRange: prevState.depositRange.filter(item => !item[value]),
            rentRange: prevState.rentRange.filter(item => !item[value])
          };
        }
      });
    } else {
      setFilteringData(prev => ({ ...prev, [name]: value }));
    }
  }, [isParking, isEV]);
  


  const fetchConstantVariable = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/transaction-methods');
      setTransactionMethods(response.data);
    } catch (error) {
      console.error('Error fetching transaction methods:', error);
    }
  }, []);



  useEffect(() => {
    fetchConstantVariable();
  }, [fetchConstantVariable]);



  return (
    <main className="w-full flexCol gap-y-8">
      <h1 className='border-b w-full pb-4 text-center'>주택/빌라</h1>
      <form className="w-full flexCol gap-y-20" onSubmit={handleSubmit}>

        <section className="flexCol lg:flex-row gap-y-10 lg:gap-x-8 items-start lg:justify-between w-11/12">
          <article className='flexCol gap-y-10 justify-between w-full lg:w-1/2'>
            {/* Transaction Method Section */}
            <div className="flexCol gap-y-4 w-full">
              <div className='flexRow w-full gap-x-3'>
                <p className="mobile_3_bold text-left">거래유형</p>
                <p className='mobile_4'>중복선택가능</p>
              </div>
              <div className="grid grid-cols-3 gap-x-2 mt-2 w-full z-50">
                {transactionMethods.map((method, index) => (
                  <button
                    key={index}
                    name="transactionMethod"
                    value={method}
                    onClick={handleSelect}
                    className={`py-2 text-center rounded mobile_5 ${filteringData.transactionMethod.includes(method)? "bg-secondary-yellow" : "bg-secondary-blue"}`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className='w-full flexCol gap-y-8'>
              {(filteringData.transactionMethod.includes('매매')) && (
                  <DoubleRangeSection
                    title="매매"
                    subTitle1="매매금"
                    min1={0}
                    max1={3000}
                    onChange1={handleDepositRangeChange}
                    handleClear={handleClear}
                    handleSubmit={handleSubmit}
                  />
                )}

                {filteringData.transactionMethod.includes('월세') && (
                  <DoubleRangeSection
                    title="월세"
                    subTitle1="보증금"
                    subTitle2="월세"
                    min1={0}
                    max1={3000}
                    min2={0}
                    max2={1000}
                    onChange1={handleDepositRangeChange}
                    onChange2={handleRentRangeChange}
                    handleClear={handleClear}
                    handleSubmit={handleSubmit}
                  />
                )}

                {filteringData.transactionMethod.includes('전세') && (
                  <DoubleRangeSection
                    title="전세"
                    subTitle1="보증금"
                    subTitle2="전세"
                    min1={0}
                    max1={3000}
                    min2={0}
                    max2={1000}
                    onChange1={handleDepositRangeChange}
                    onChange2={handleRentRangeChange}
                    handleClear={handleClear}
                    handleSubmit={handleSubmit}
                  />
                )}
            </div>
          </article>

          {/* Room Size & Additional Filters */}
          <article className="flexCol gap-y-10 items-start w-full lg:w-1/2  border-t border-primary-yellow pt-8">
            <div>
              <p className="mobile_3_bold">방크기</p>
            </div>
            <div className="">
              <div className="flexRow">
                <span>전용면적(평)</span>
              </div>
              <DoubleRangeSlider min={10} max={60} onChange={handleRoomSizeRangeChange} />
            </div>

          </article>

          <article className="flexCol gap-y-10 items-start w-full lg:w-1/2  border-t border-primary-yellow pt-8">
            <div className='flexCol gap-y-4 w-full'>
              <p className='w-full mobile_4_bold'>사용 승인일</p>
              <div className='w-full flexRow justify-between gap-x-2'>
                {approvalDate.map((date, id) => (
                  <button
                    key={id}
                    name='approvalDate'
                    value={date}
                    onClick={handleSelect}
                    className={`px-3 py-2 text-center rounded mobile_5 ${filteringData.approvalDate === date ? "bg-secondary-yellow" : "bg-secondary-blue"}`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            <div className='flexCol gap-y-4 w-full'>
              <div className='w-full flexRow gap-x-3'>
                <p className='mobile_4_bold'>추가필터</p>
                <p className='mobile_4'>중복선택가능</p>
              </div>
              <div className='w-full grid grid-cols-2 gap-x-2'>
                <button
                  name="isParking"
                  onClick={handleSelect}
                  className={`px-3 py-2 text-center rounded mobile_5 ${filteringData.isParking ? "bg-secondary-yellow" : "bg-secondary-blue"}`}
                >
                  주차가능
                </button>
                <button
                  name="isEV"
                  onClick={handleSelect}
                  className={`px-3 py-2 text-center rounded mobile_5 ${filteringData.isEV ? "bg-secondary-yellow" : "bg-secondary-blue"}`}
                >
                  엘리베이터
                </button>
              </div>
            </div>
          </article>
        </section>

      </form>
        <section className='w-11/12 lg:w-8/12 grid grid-rows-3 gap-y-4 mobile_4_bold_b'>
          <button className='btn_clear' onClick={() => { setOpen(false); onOpen(false); }}>취소</button>
          <button className="btn_clear" onClick={handleClear}>
            전체 초기화
          </button>
          <button onClick={handleSubmit} className="btn_save">전체 적용</button>
        </section>
    </main>
  );
};

export default House;
