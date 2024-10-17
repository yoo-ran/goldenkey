import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCalendarCheck,
  faCar,
  faCalendarDays,
  faCircleCheck,
  faElevator,
  faNoteSticky,
  faHourglass,
  faHouse,
  faKey,
  faDroplet,
  faMoneyBill,
  faMoneyBills,
  faRulerCombined,
  faRulerVertical,
  faTag,
  faUserPlus,
  faMoneyBillTransfer,
  faImage,
} from '@fortawesome/free-solid-svg-icons';

const PropertyDetail = () => {
  const [originalPropertyData, setOriginalPropertyData] = useState({
    매물ID: '',
    사용승인일자: '',
    등록일자: '',
    부동산구분: '',
    거래방식: '',
    거래완료여부: '',
    거래완료일자: '',
    담당자: '',
    건물명: '',
    상세주소: '',
    동: '',
    호수: '',
    보증금: 0,
    월세: 0,
    관리비: 0,
    전체m2: 0,
    전용m2: 0,
    전체평: 0,
    전용평: 0,
    EV유무: false,
    화장실개수: 0,
    층수: 0,
    주차가능대수: 0,
    비밀번호: '',
    연락처: [],
    메모: '',
    img_path: '',
    address_id: 0,
  });
  const [propertyData, setPropertyData] = useState(originalPropertyData);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for checking authentication
  const navigate = useNavigate();

  const location = useLocation();
  // const { propertyId } = location.state || {};
  const { propertyId } = 4;
  const [isEditing, setIsEditing] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isImgUploaded, setIsImgUploaded] = useState();

  const [isConverted, setIsConverted] = useState(false); // Toggle state to track conversion
  const [propertyTypes, setPropertyTypes] = useState([]);

  const [transactionMethod, setTransactionMethod] = useState([]);

  const [transactionStatus, setTransactionStatus] = useState([]);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get('http://localhost:8000/check-auth', {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('User is not authenticated:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Stop loading once authentication is checked
      }
    };
    checkAuthentication();
  }, []);

  const fetchPropertyData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/detail/101`);
      // const response = await axios.get(`http://localhost:8000/detail/${propertyId}`);
      const fetchedData = response.data;

      if (fetchedData.연락처) {
        try {
          fetchedData.연락처 = JSON.parse(fetchedData.연락처);
        } catch (error) {
          console.error('Error parsing 연락처:', error);
          // Handle the error, for example, set it to an empty object or log it
          fetchedData.연락처 = {}; // Default to empty object if parsing fails
        }
      }

      setPropertyData(fetchedData);

      const propertyType = await axios.get(
        `http://localhost:8000/property-types`
      );
      setPropertyTypes(propertyType.data);

      const transactionMethod = await axios.get(
        `http://localhost:8000/transaction-methods`
      );
      setTransactionMethod(transactionMethod.data);

      const transactionStatus = await axios.get(
        `http://localhost:8000/transaction-status`
      );
      setTransactionStatus(transactionStatus.data);

      const imgRes = await axios.get(
        `http://localhost:8000/properties/4/images`
      );
      if (response.data && Array.isArray(imgRes.data.images)) {
        setImages(imgRes.data.images);
      } else {
        console.error('Unexpected response structure:', imgRes.data);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
    }
  };

  useEffect(() => {
    fetchPropertyData();
  }, [propertyId, isImgUploaded]);

  const convertM2ToPyeong = (m2) => {
    return Number((m2 / 3.3058).toFixed(2));
  }; // Converts m² to 평
  const convertPyeongToM2 = (pyeong) => {
    return Number((pyeong * 3.3058).toFixed(2));
  }; // Converts 평 to m²

  const calculateTotalAmount = (보증금, 월세, isConverted) => {
    return isConverted
      ? ((parseInt(보증금, 10) + parseInt(월세, 10)) / 10000).toLocaleString()
      : parseInt(보증금, 10) + parseInt(월세, 10);
  };

  const handleInputChange = (e, contactType = null) => {
    let { name, type, value } = e.target;
    console.log(name, value);
    let formattedValue;

    // Converting input if necessary
    if (name === 'EV유무') {
      formattedValue = Boolean(value);
    } else if (name === '전체m2') {
      formattedValue = Number(value);
      propertyData['전체평'] = convertM2ToPyeong(value); // Convert m² to 평
    } else if (name === '전용m2') {
      formattedValue = Number(value);
      propertyData['전용평'] = convertM2ToPyeong(value); // Convert m² to 평
    } else if (name === '전체평') {
      formattedValue = Number(value);
      propertyData['전체m2'] = convertPyeongToM2(value); // Convert 평 to m²
    } else if (name === '전용평') {
      formattedValue = Number(value);
      propertyData['전용m2'] = convertPyeongToM2(value); // Convert 평 to m²
    } else if (type === 'number') {
      formattedValue = value === '' ? 0 : Number(value);
    } else {
      formattedValue = value;
    }

    if (contactType) {
      // Handle contact-specific updates
      setPropertyData((prevState) => ({
        ...prevState,
        연락처: {
          ...prevState.연락처,
          [contactType]: {
            ...prevState.연락처[contactType],
            [name]: formattedValue,
          },
        },
      }));
    } else {
      // Handle general property data updates
      setPropertyData({
        ...propertyData,
        [name]: formattedValue,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/delete-property/4`);
      // await axios.delete(`http://localhost:8000/delete-property/${propertyId}`);
      navigate('/search');
      console.log('Property deleted successfully.');
      alert('매물이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error(
        'Error deleting property:',
        error.response ? error.response.data : error.message
      );
      alert('Error deleting property.');
    }
  };

  const handleSave = async () => {
    try {
      const {
        등록일자,
        거래완료일자,
        사용승인일자,
        비밀번호,
        연락처,
        ...fieldsToUpdate
      } = propertyData;
      const formattedFieldsToUpdate = {
        ...fieldsToUpdate,
        등록일자: new Date(등록일자).toISOString().split('T')[0],
        거래완료일자: new Date(거래완료일자).toISOString().split('T')[0],
        사용승인일자: new Date(거래완료일자).toISOString().split('T')[0],
        비밀번호: 비밀번호 || '미정', // Default to "미정" if 비밀번호 is not provided
        연락처: typeof 연락처 === 'object' ? JSON.stringify(연락처) : 연락처, // Ensure 연락처 is a string
      };
      console.log(formattedFieldsToUpdate);
      await axios.put(
        `http://localhost:8000/update-property/4`,
        formattedFieldsToUpdate
      );
      alert('Data saved successfully!');
      fetchPropertyData();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleImageUpload = async () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append(`images`, file);
    });
    try {
      const response = await axios.post(
        `http://localhost:8000/upload-images/4`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      alert('Images uploaded successfully!');
      setImages(response.data.images);
      setIsImgUploaded(images.length);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading while checking authentication
  }

  console.log(propertyData);

  const handleClear = (e) => {
    console.log(e.target.name);
    if (e.target.name === 'priceClear') {
      setPropertyData((prevState) => ({
        ...prevState,
        보증금: 0,
        월세: 0,
      }));
    } else {
      setPropertyData(originalPropertyData);
    }
  };

  return (
    <main className='gap-y-10 w-full'>
      <section className='w-11/12 flexCol gap-y-12'>
        <article className='flexCol items-start gap-y-8 w-full'>
          <div className='w-full'>
            <div className='grid grid-cols-3 grid-rows-2 gap-2 h-52 lg:min-h-80 overflow-hidden rounded-xl w-full'>
              {Array.from({ length: 3 }).map((_, index) =>
                images && images[index] ? (
                  <img
                    key={index}
                    src={`http://localhost:8000${images[index]}`}
                    alt={`Property Image ${index + 1}`}
                    className={`w-full h-full object-cover before:content-[""] before:bg-primary ${
                      index === 0
                        ? 'col-span-2 row-span-2'
                        : 'col-span-1 row-span-1'
                    }`}
                  />
                ) : (
                  <p
                    key={index}
                    className={`bg-secondary-light flexCol mobile_1 ${
                      index === 0
                        ? 'col-span-2 row-span-2'
                        : 'col-span-1 row-span-1'
                    }`}
                  >
                    <FontAwesomeIcon icon={faImage} />
                  </p>
                )
              )}
            </div>
          </div>
        </article>

        {/* 매물상태, 거래유형 */}
        <article className='flexCol items-start gap-y-8 w-full'>
          <div className='flexRow gap-x-2 w-full'>
            <p className='border border-primary-yellow px-1 mobile_5'>
              매물번호 {propertyId}
            </p>
            <p className='bg-primary-yellow px-5 py-0.5 rounded mobile_4_bold'>
              {propertyData.부동산구분
                ? propertyData.부동산구분
                : '부동산 구분'}
            </p>
          </div>
          <div className='flexCol w-full lg:w-1/2 '>
            {isEditing ? (
              <input
                type='text'
                name='건물명'
                value={propertyData.건물명}
                onChange={handleInputChange}
                placeholder='건물명을 입력하세요'
                className='bg-secondary-yellow w-full'
              />
            ) : (
              <p className='pDiplay mobile_1_bold w-full bg-white'>
                {propertyData.건물명}
              </p>
            )}
          </div>
          <div className='w-full flexRow justify-end'>
            <button
              className='btn_save px-3 lg:px-6'
              onClick={() => setIsEditing(true)}
            >
              편집하기
            </button>
          </div>
        </article>
      </section>

      <p className='w-11/12 border'></p>

      {/* 거래상태, 매물기본정보, 주소 */}
      <section className='w-full flexCol py-6 gap-y-20'>
        <article className='w-11/12 flexCol gap-y-8'>
          <div className='w-full flexCol gap-y-4'>
            <p className='mobile_3_bold w-full flexRow gap-x-4'>
              <FontAwesomeIcon icon={faHourglass} />
              매물상태
            </p>
            <ul className='grid grid-cols-2 w-full lg:w-8/12 gap-x-4'>
              {transactionStatus.map((option, index) => (
                <button
                  key={index}
                  name='거래완료여부'
                  value={option}
                  onClick={handleInputChange}
                  disabled={isEditing ? false : true}
                  className={`w-full cursor-pointer flexCol gap-y-2 text-primary text-center py-6 lg:py-10 mobile_3 rounded-lg  ${
                    option === propertyData.거래완료여부
                      ? ' bg-primary-yellow'
                      : ' bg-secondary-light'
                  }`}
                >
                  {option === propertyData.거래완료여부 && (
                    <FontAwesomeIcon icon={faCircleCheck} />
                  )}
                  {option}
                </button>
              ))}
            </ul>
          </div>
          <div className='flexCol w-full gap-y-4'>
            <p className='mobile_3_bold w-full flexRow gap-x-4'>
              <FontAwesomeIcon icon={faTag} />
              매물유형
            </p>
            <ul className='grid grid-cols-3 grid-rows-2 w-full lg:w-8/12 gap-4'>
              {propertyTypes.map((option, index) => (
                <button
                  key={index}
                  name='부동산구분'
                  value={option}
                  onClick={handleInputChange}
                  disabled={isEditing ? false : true}
                  className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 lg:py-10 mobile_3 rounded-lg ${
                    option === propertyData.부동산구분
                      ? ' bg-primary-yellow'
                      : ' bg-secondary-light'
                  }`}
                >
                  {option === propertyData.부동산구분 && (
                    <FontAwesomeIcon icon={faCircleCheck} />
                  )}
                  {option}
                </button>
              ))}
            </ul>
          </div>
          <div id='거래방식' className='w-full flexCol gap-y-4'>
            <p className='mobile_3_bold w-full flexRow gap-x-4'>
              <FontAwesomeIcon icon={faTag} />
              거래유형
            </p>
            <ul className='grid grid-cols-3 w-full lg:w-8/12 gap-x-4'>
              {transactionMethod.map((option, index) => (
                <button
                  key={index}
                  name='거래방식'
                  value={option}
                  onClick={handleInputChange}
                  disabled={isEditing ? false : true}
                  className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 lg:py-10 mobile_3 rounded-lg ${
                    option === propertyData.거래방식
                      ? ' bg-primary-yellow'
                      : ' bg-secondary-light'
                  }`}
                >
                  {option === propertyData.거래방식 && (
                    <FontAwesomeIcon icon={faCircleCheck} />
                  )}
                  {option}
                </button>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className='w-full flexCol gap-y-12 bg-primary-yellow py-12'>
        <p className='mobile_3_bold w-11/12 flexRow gap-x-4'>
          <FontAwesomeIcon icon={faMoneyBills} />
          거래금액
        </p>
        <article className='w-11/12 flexCol'>
          {(() => {
            // Helper function to render input fields
            const renderFields = (fields) => {
              return (
                <div className='w-full flexCol items-start gap-y-4'>
                  <p className='mobile_3_bold'>{fields[1]} 금액</p>
                  {fields.map((field, index) => (
                    <div key={index} className='w-full grid grid-rows-2'>
                      <p className=''>{field}</p>
                      <div className='flexRow w-full justify-between'>
                        <input
                          type='number'
                          min={0}
                          name={field}
                          value={
                            isConverted
                              ? (propertyData[field] / 10000).toLocaleString()
                              : propertyData[field]
                          } // Bind value from state
                          onChange={handleInputChange}
                          disabled={isEditing ? false : true}
                          className='bg-white text-primary rounded-full w-10/12'
                        />
                        <p className='mobile_4'>
                          {isConverted ? '만원' : '원'}
                        </p>
                      </div>
                      {index === 1 && (
                        <p className='w-full border-b border-primary mt-8'></p>
                      )}
                    </div>
                  ))}
                  <div className='flexCol items-start w-full gap-y-4'>
                    <p className=''>전체금액</p>
                    <div className='flexRow w-full justify-between'>
                      <input
                        type='number'
                        min={0}
                        disabled={isEditing ? false : true}
                        value={calculateTotalAmount(
                          propertyData.보증금,
                          propertyData.월세,
                          isConverted
                        )} // Bind value from state
                        className='bg-white text-primary rounded-full w-10/12'
                      />
                      <p className='mobile_4'>{isConverted ? '만원' : '원'}</p>
                    </div>
                  </div>
                </div>
              );
            };

            // Logic to determine the type of transaction and labels
            if (propertyData.거래방식 === '매매') {
              return (
                <div className='w-full grid grid-rows-2'>
                  <p className='mobile_3_bold'>매매 금액</p>
                  <div className='flexRow w-full justify-between'>
                    <input
                      type='number'
                      min={0}
                      name='보증금'
                      disabled={isEditing ? false : true}
                      value={
                        isConverted
                          ? (propertyData.보증금 / 10000).toLocaleString()
                          : propertyData.보증금
                      }
                      onChange={handleInputChange}
                      className='bg-white text-primary rounded-full w-10/12'
                    />
                    <p className='mobile_4'>{isConverted ? '만원' : '원'}</p>
                  </div>
                </div>
              );
            } else if (propertyData.거래방식 === '월세') {
              // For 월세
              const fields = ['보증금', '월세'];

              return renderFields(fields);
            } else if (propertyData.거래방식 === '전세') {
              // For 전세
              const fields = ['보증금', '전세'];
              return renderFields(fields);
            }
          })()}

          <article className='w-full mt-4'>
            <button
              className='btn_clear w-full bg-secondary-yellow rounded-full'
              onClick={() => setIsConverted(!isConverted)}
            >
              <FontAwesomeIcon icon={faMoneyBillTransfer} className='mr-2' />
              {isConverted ? '원' : '만원'}
            </button>
          </article>
        </article>

        {isEditing && (
          <article className='grid grid-rows-2 w-6/12 gap-y-4'>
            <button
              className='btn_clear'
              name='priceClear'
              onClick={handleClear}
            >
              초기화
            </button>
            <button type='submit' className='btn_save' onClick={handleSave}>
              적용하기
            </button>
          </article>
        )}
      </section>

      <section className='w-11/12 flexCol gap-y-4'>
        <p className='mobile_3_bold w-full'>매물 기본 정보</p>
        <article
          className={`w-full flexCol gap-y-6 lg:gap-y-10 ${
            isEditing ? 'boxEdit' : 'boxDiplay'
          }`}
        >
          <div className='w-full grid grid-rows-3 lg:grid-rows-2 gap-y-2'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faRulerCombined} /> 공급면적
            </p>
            <div className='flexCol lg:flex-row justify-between'>
              <div className='flexRow justify-between lg:w-1/2'>
                {isEditing ? (
                  <input
                    type='number'
                    name='전체m2'
                    min={0}
                    value={propertyData.전체m2}
                    onChange={handleInputChange}
                    className='w-11/12'
                  />
                ) : (
                  <p className='pDisplay w-11/12'>{propertyData.전체m2}</p>
                )}

                <p className='w-1/12 mobile_5 text-center'>
                  m<sup>2</sup>
                </p>
              </div>
              <div className='flexRow justify-between lg:w-1/2'>
                {isEditing ? (
                  <input
                    type='number'
                    name='전체평'
                    min={0}
                    value={propertyData.전체평}
                    onChange={handleInputChange}
                    className='w-11/12'
                    placeholder='숫자를 입력하세요'
                  />
                ) : (
                  <p className='pDisplay w-11/12'>{propertyData.전체평}</p>
                )}

                <p className='w-1/12 mobile_5 text-center'>평</p>
              </div>
            </div>
          </div>
          <div className='w-full grid grid-rows-3 lg:grid-rows-2 gap-y-2'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faRulerCombined} />
              전용면적{' '}
            </p>
            <div className='flexCol lg:flex-row justify-between'>
              <div className='flexRow justify-between lg:w-1/2'>
                {isEditing ? (
                  <input
                    type='number'
                    name='전용m2'
                    min={0}
                    value={propertyData.전용m2}
                    onChange={handleInputChange}
                    className='w-11/12'
                  />
                ) : (
                  <p className='pDisplay w-11/12'>{propertyData.전용m2}</p>
                )}

                <p className='w-1/12 text-center'>
                  m<sup>2</sup>
                </p>
              </div>
              <div className='flexRow justify-between lg:w-1/2'>
                {isEditing ? (
                  <input
                    type='number'
                    name='전용평'
                    min={0}
                    value={propertyData.전용평}
                    onChange={handleInputChange}
                    className='w-11/12'
                  />
                ) : (
                  <p className='pDisplay w-11/12'>{propertyData.전용평}</p>
                )}

                <p className='w-1/12 text-center'>평</p>
              </div>
            </div>
          </div>
          <div className='w-full flexCol  '>
            <p className='mobile_3_bold flexRow gap-x-2 w-full'>
              <FontAwesomeIcon icon={faElevator} />
              엘레베이터
            </p>
            <div className='w-full lg:w-8/12 grid grid-cols-2 gap-x-8'>
              {[true, false].map((bool, index) => {
                return (
                  <button
                    key={index}
                    name='EV유무'
                    className={`flexCol gap-y-2 p-2 lg:py-6 rounded py-4 ${
                      bool === Boolean(propertyData.EV유무)
                        ? 'bg-primary-yellow'
                        : 'bg-secondary-light'
                    }`}
                    value={bool}
                    onClick={() =>
                      handleInputChange({
                        target: { name: 'EV유무', value: bool },
                      })
                    } // Pass value explicitly
                  >
                    {bool === Boolean(propertyData.EV유무) && (
                      <FontAwesomeIcon icon={faCircleCheck} />
                    )}
                    <p className='mobile_5'>{bool ? '있음' : '없음'}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className='w-full flexRow justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
              <FontAwesomeIcon icon={faBuilding} />
              건물층
            </p>
            {isEditing ? (
              <input
                type='number'
                name='층수'
                min='0'
                value={propertyData.층수}
                onChange={handleInputChange}
                className='w-7/12'
              />
            ) : (
              <p className='pDisplay lg:w-8/12'>{propertyData.층수}</p>
            )}

            <p className='mobile_5'>층</p>
          </div>

          <div className='w-full flexRow justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
              <FontAwesomeIcon icon={faCar} />
              주차
            </p>
            {isEditing ? (
              <input
                type='number'
                name='주차가능대수'
                min='0'
                value={propertyData.주차가능대수}
                onChange={handleInputChange}
                className='w-7/12'
              />
            ) : (
              <p className='pDisplay lg:w-8/12'>{propertyData.주차가능대수}</p>
            )}
            <p className='mobile_5'>대</p>
          </div>

          <div className='w-full flexRow justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
              <FontAwesomeIcon icon={faDroplet} />
              화장실
            </p>
            {isEditing ? (
              <input
                type='number'
                name='화장실개수'
                min='0'
                value={propertyData.화장실개수}
                onChange={handleInputChange}
                className='w-7/12'
              />
            ) : (
              <p className='pDisplay lg:w-8/12'>{propertyData.화장실개수}</p>
            )}
            <p className='mobile_5'>개</p>
          </div>

          <div className='w-full flexRow justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
              <FontAwesomeIcon icon={faKey} />
              비밀번호
            </p>
            {isEditing ? (
              <input
                type='text'
                name='비밀번호'
                value={propertyData.비밀번호}
                onChange={handleInputChange}
                className='w-7/12'
              />
            ) : (
              <p className='pDisplay lg:w-8/12'>{propertyData.비밀번호}</p>
            )}
            <p className='mobile_5'>번</p>
          </div>
          <div className='w-full flexRow justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
              <FontAwesomeIcon icon={faMoneyBill} />
              관리비
            </p>
            {isEditing ? (
              <input
                type='number'
                min={0}
                name='관리비'
                value={propertyData.관리비}
                onChange={handleInputChange}
                className='w-7/12'
              />
            ) : (
              <p className='pDisplay lg:w-8/12'>{propertyData.관리비}</p>
            )}
            <p className='mobile_5'>원</p>
          </div>
        </article>
      </section>

      <p className='w-11/12 border'></p>

      <section className='w-11/12 flexCol py-6 gap-y-8'>
        <p className='mobile_3_bold w-full'>주소</p>
        <article
          className={`w-full flexCol gap-y-6 ${
            isEditing ? 'boxEdit' : 'boxDiplay'
          }`}
        >
          <div className='grid grid-rows-2 w-full'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faHouse} />신 주소
            </p>
            <div className='w-full'></div>
          </div>
          <div className='grid grid-rows-2 w-full'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faHouse} />구 주소
            </p>
            <div className='w-full'></div>
          </div>
          <div className='grid grid-rows-2 w-full'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faHouse} />동 / 호수
            </p>
            <div className='w-full grid grid-cols-2 justify-between gap-x-8'>
              <div className='flexRow gap-x-2'>
                {isEditing ? (
                  <input
                    type='text'
                    name='동'
                    value={propertyData.동}
                    onChange={handleInputChange}
                    className='w-11/12'
                  />
                ) : (
                  <p className='pDisplay'>{propertyData.동}</p>
                )}
                <p>동</p>
              </div>
              <div className='flexRow gap-x-2'>
                {isEditing ? (
                  <input
                    type='text'
                    name='호수'
                    value={propertyData.호수}
                    onChange={handleInputChange}
                    className='w-11/12'
                  />
                ) : (
                  <p className='pDisplay'>{propertyData.호수}</p>
                )}
                <p>호</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className='w-11/12 flexCol py-6 gap-y-8'>
        <p className='mobile_3_bold w-full'>연락처 정보</p>
        <article
          className={`w-full flexCol gap-y-6 ${
            isEditing ? 'boxEdit' : 'boxDiplay'
          }`}
        >
          {propertyData.연락처 &&
          Object.keys(propertyData.연락처).length > 0 ? (
            Object.keys(propertyData.연락처).map((contactType, index) => (
              <div key={index} className='flexCol gap-y-6 w-full items-start'>
                <p className='mobile_3_bold flexRow gap-x-2'>
                  <FontAwesomeIcon icon={faUserPlus} />
                  {contactType}
                </p>
                {isEditing ? (
                  <div className='flexCol gap-y-3 w-full'>
                    <input
                      type='text'
                      name='이름'
                      value={propertyData.연락처[contactType]?.이름 || ''}
                      onChange={(e) => handleInputChange(e, contactType)}
                      placeholder={`${contactType} 이름을 입력하세요`}
                      className='w-full'
                    />
                    <input
                      type='phone'
                      name='전화번호'
                      value={propertyData.연락처[contactType]?.전화번호 || ''}
                      onChange={(e) => handleInputChange(e, contactType)}
                      placeholder={`${contactType} 전화번호를 입력하세요`}
                      className='w-full'
                    />
                  </div>
                ) : (
                  <div className='flexCol gap-y-3 w-full'>
                    <p className='pDisplay w-full'>
                      {propertyData.연락처[contactType]?.이름 || ''}
                    </p>
                    <p className='pDisplay w-full'>
                      {propertyData.연락처[contactType]?.전화번호 || ''}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <a
              href='#거래방식'
              className='bg-primary-yellow p-4 rounded-xl hover:bg-secondary-light'
            >
              거래방식을 선택하세요
            </a>
          )}
        </article>
      </section>

      <p className='w-11/12 border'></p>

      <section className='w-11/12 flexCol py-6 gap-y-8'>
        <p className='mobile_3_bold w-full'>등록 / 기타 정보</p>
        <article
          className={`w-full flexCol gap-y-6 ${
            isEditing ? 'boxEdit' : 'boxDiplay'
          }`}
        >
          <div className='flexRow w-full justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faCalendarCheck} />
              거래완료
            </p>
            {isEditing ? (
              <input
                type='date'
                name='거래완료일자'
                value={
                  propertyData.거래완료일자
                    ? propertyData.거래완료일자.split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                className='w-8/12'
              />
            ) : (
              <p className='pDisplay'>
                {propertyData.거래완료일자
                  ? propertyData.거래완료일자.split('T')[0]
                  : ''}
              </p>
            )}
          </div>
          <div className='flexRow w-full justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faCalendarDays} />
              사용승인
            </p>
            {isEditing ? (
              <input
                type='date'
                name='사용승인일자'
                value={
                  propertyData.사용승인일자
                    ? propertyData.사용승인일자.split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                className='w-8/12'
              />
            ) : (
              <p className='pDisplay'>
                {propertyData.사용승인일자
                  ? propertyData.사용승인일자.split('T')[0]
                  : ''}
              </p>
            )}
          </div>
          <div className='flexRow w-full justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faCalendarDays} />
              등록일자
            </p>
            {isEditing ? (
              <input
                type='date'
                name='등록일자'
                value={
                  propertyData.등록일자
                    ? propertyData.등록일자.split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                className='w-8/12'
              />
            ) : (
              <p className='pDisplay'>
                {propertyData.등록일자
                  ? propertyData.등록일자.split('T')[0]
                  : ''}
              </p>
            )}
          </div>

          {isEditing && (
            <div className='w-full grid grid-rows-2'>
              <p className='mobile_3_bold flexRow gap-x-2'>
                <FontAwesomeIcon icon={faImage} />
                매물사진
              </p>
              <div className='flexRow justify-between'>
                <input
                  type='file'
                  multiple
                  onChange={handleImageChange}
                  className='w-9/12'
                />
                <button
                  onClick={handleImageUpload}
                  className='bg-primary-yellow text-primary px-4 py-2 h-full rounded mobile_3_bold'
                >
                  업로드
                </button>
              </div>
            </div>
          )}
          <div className='w-full flexCol items-start'>
            <p className='mobile_3_bold flexRow gap-x-2 pb-2'>
              <FontAwesomeIcon icon={faNoteSticky} />
              메모
            </p>
            {isEditing ? (
              <textarea
                type='textarea'
                rows='5'
                name='메모'
                value={propertyData.메모}
                onChange={handleInputChange}
                placeholder='메모를 입력하세요'
                className='w-full'
              />
            ) : (
              <p className='pDisplay w-full'>{propertyData.메모}</p>
            )}
          </div>
        </article>
      </section>

      {isEditing && (
        <section className='w-8/12 mb-16'>
          <article className='grid grid-rows-2 w-full gap-y-4'>
            <button className='btn_clear' onClick={handleClear}>
              초기화
            </button>
            <button type='submit' className='btn_save' onClick={handleSave}>
              적용하기
            </button>
          </article>
        </section>
      )}

      <section className='mb-20 w-11/12 text-right'>
        <button
          className='text-primary-yellow  lg:btn_clear px-4'
          onClick={handleDelete}
        >
          매물 삭제하기
        </button>
      </section>
    </main>
  );
};

export default PropertyDetail;
