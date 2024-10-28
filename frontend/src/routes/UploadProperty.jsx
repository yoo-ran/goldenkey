import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation to the login page

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCalendar,
  faCar,
  faChevronDown,
  faCircleCheck,
  faElevator,
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
} from '@fortawesome/free-solid-svg-icons';

import SearchHeader from '../components/layout/SearchHeader';
import {
  faCalendarCheck,
  faCalendarDays,
  faImage,
  faNoteSticky,
} from '@fortawesome/free-regular-svg-icons';

const PropertyUpload = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
  const navigate = useNavigate(); // Hook for navigation

  const [open, setOpen] = useState('false');

  const [images, setImages] = useState([]); // State for storing uploaded images
  const [selectedFiles, setSelectedFiles] = useState([]); // Store selected files for upload
  const [memo, setMemo] = useState(''); // State for memo content

  // 부동산구분
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  // 거래방식
  const [transactionMethod, setTransactionMethod] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');

  // 거래완료여부
  const [transactionStatus, setTransactionStatus] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');

  // 거래완료여부
  const [toiletsNum, setToiletsNum] = useState([]);
  const [selectedToilet, setSelectedToilet] = useState('');

  // Address
  const [newAddress, setNewAddress] = useState(''); // Local state for new address input
  const [oldAddress, setOldAddress] = useState(''); // Local state for old address input
  const [newAddressSuggestions, setNewAddressSuggestions] = useState([]); // New address suggestions
  const [oldAddressSuggestions, setOldAddressSuggestions] = useState([]); // Old address suggestions

  const [propertyData, setPropertyData] = useState({
    등록일자: '',
    부동산구분: '',
    거래방식: '',
    거래완료여부: '',
    거래완료일자: '',
    담당자: '',
    구: '',
    읍면동: '',
    구상세주소: '',
    도로명: '',
    신상세주소: '',
    건물명: '',
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
    방개수: 0,
    주차가능대수: 0,
    비밀번호: '',
    이름: '',
    휴대폰번호: '',
    메모: '',
    img_path: '',
    정산금액: {
      총수수료: 0,
      소장: 0,
      직원: [
        { name: '직원1', money: 0 },
        { name: '직원2', money: 0 },
      ],
    },
  });

  useEffect(() => {
    console.log('Updated propertyData:', propertyData);
  }, [propertyData]);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Make a request to the server to verify the user's token (stored in HTTP-only cookie)
        const response = await axios.get(`${apiUrl}/check-auth`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          navigate('/login'); // Redirect to login if authentication fails
        }
      } catch (error) {
        console.error('User is not authenticated:', error);
        navigate('/login'); // Redirect to login if authentication fails
      }
    };

    checkAuthentication();
  }, [navigate]); // Dependency on `navigate`

  useEffect(() => {
    const fetchDropdownConst = async () => {
      try {
        const propertyType = await axios.get(`${apiUrl}/property-types`);
        setPropertyTypes(propertyType.data);

        const transactionMethod = await axios.get(
          `${apiUrl}/transaction-methods`
        );
        setTransactionMethod(transactionMethod.data);

        const transactionStatus = await axios.get(
          `${apiUrl}/transaction-status`
        );
        setTransactionStatus(transactionStatus.data);
      } catch (error) {
        console.error('Error fetching dropdown data', error); // Add error handling
      }
    };

    fetchDropdownConst();
  }, []);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const convertM2ToPyeong = (m2) => {
    return Number((m2 / 3.3058).toFixed(2));
  }; // Converts m² to 평
  const convertPyeongToM2 = (pyeong) => {
    return Number((pyeong * 3.3058).toFixed(2));
  }; // Converts 평 to m²

  // Handle input changes
  const handleInputChange = (e) => {
    let { name, type, value, checked } = e.target;
    let formattedValue;
    // Converting input if necessary
    if (name === 'EV유무') {
      formattedValue = value;
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
    } else if (name === '도로명' && value === '') {
      setNewAddressSuggestions([]); // Clear new address suggestions
      setSelectedNewAddress(''); // Clear the selected new address
    } else if (name === '구' && value === '') {
      setOldAddressSuggestions([]); // Clear old address suggestions
      setSelectedOldAddress(''); // Clear the selected old address
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

  const formatDateForMySQL = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Save data to the database
  const handleSave = async () => {
    const { 등록일자, 거래완료일자, 비밀번호, 연락처, ...fieldsToUpdate } =
      propertyData;

    // Set default dates to current date if not provided
    const currentDate = formatDateForMySQL(new Date());
    const formattedFieldsToUpdate = {
      ...fieldsToUpdate,
      등록일자: 등록일자 ? formatDateForMySQL(new Date(등록일자)) : currentDate,
      거래완료일자: 거래완료일자
        ? formatDateForMySQL(new Date(거래완료일자))
        : currentDate,
      비밀번호: 비밀번호 || '미정', // Default to "미정" if 비밀번호 is not provided
      연락처: typeof 연락처 === 'object' ? JSON.stringify(연락처) : 연락처, // Ensure 연락처 is a string
    };

    try {
      const savePropertyPromise = axios.post(
        `${apiUrl}/properties/update`,
        formattedFieldsToUpdate
      );

      let uploadImagePromise = Promise.resolve(); // No-op if no images to upload
      if (selectedFiles.length > 0) {
        uploadImagePromise = handleImageUpload(); // Upload images if any selected
      }

      // Wait for both promises to complete (save property and upload images)
      await Promise.all([savePropertyPromise, uploadImagePromise]);

      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('No files selected for upload.');
      return;
    }

    const formData = new FormData();

    // Append each file to FormData
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(`${apiUrl}/upload-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Get image paths from the response
      const uploadedImages = response.data.images || [];
      setImages((prevImages) => [...prevImages, ...uploadedImages]); // Accumulate images
      console.log('uploadedImages: ', uploadedImages);

      // Update propertyData with image paths
      setPropertyData((prevData) => {
        const existingPaths = prevData.img_path
          ? prevData.img_path.split(',')
          : []; // Handle empty img_path
        return {
          ...prevData,
          img_path: [...existingPaths, ...uploadedImages].join(','), // Append new image paths
        };
      });

      // Clear selected files
      setSelectedFiles([]);

      alert('Images uploaded and paths saved successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    }
  };

  const convertToManwon = () => {
    if (!isConverted) {
      // Store original prices
      setOriginalPrices({
        보증금: propertyData.보증금,
        월세: propertyData.월세,
        '전체 금액': propertyData.보증금 + propertyData.월세,
      });

      // Convert to 만원 (divide by 10,000)
      const convertedData = {
        보증금: Math.floor(propertyData.보증금 / 10000).toString(),
        월세: Math.floor(propertyData.월세 / 10000).toString(),
        '전체 금액': Math.floor(
          (propertyData.보증금 + propertyData.월세) / 10000
        ).toString(),
      };

      setPriceManwon(convertedData);
      setIsConverted(true); // Mark as converted
    } else {
      // Restore original prices
      setPriceManwon(originalPrices);
      setIsConverted(false); // Mark as not converted
    }
  };

  const handleNewAddressSearch = async (e) => {
    const searchText = e.target.value;
    setNewAddress(searchText); // Update local state for new address input

    if (searchText.length > 0) {
      try {
        const response = await axios.get(
          `${apiUrl}/addresses?searchText=${searchText}`
        );
        setNewAddressSuggestions(response.data); // Set suggestions for new address
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching new address suggestions:', error);
      }
    } else {
      setNewAddressSuggestions([]); // Clear suggestions when input is less than 3 characters
    }
  };

  // Handle the selection of a new address
  const handleNewAddressSelect = (selectedAddress) => {
    // Format the new address by combining different parts
    const formattedNewAddress = `${selectedAddress.new_district} ${
      selectedAddress.new_town
    } ${selectedAddress.new_road_name} ${
      selectedAddress.new_building_main_number
    }${
      selectedAddress.new_building_sub_number != 0
        ? '-' + selectedAddress.new_building_sub_number
        : ''
    }`;
    setNewAddress(formattedNewAddress); // Auto-fill the corresponding new address

    // Set the old address in the local state
    const formattedOldAddress = `${selectedAddress.old_district} ${
      selectedAddress.old_town
    } ${selectedAddress.old_village} ${selectedAddress.old_lot_main_number}${
      selectedAddress.old_lot_sub_number != 0
        ? '-' + selectedAddress.old_lot_sub_number
        : ''
    }`;
    setOldAddress(formattedOldAddress); //

    let addressId = selectedAddress.new_address_id;

    // Convert to string representation of the full number
    let addressIdString = addressId.toLocaleString('fullwide', {
      useGrouping: false,
    });
    // Update propertyData with the selected new address_id
    setPropertyData({
      ...propertyData,
      address_id: addressIdString, // Convert address_id to string
    });

    setNewAddressSuggestions([]); // Clear suggestions
  };

  const handleOldAddressSearch = async (e) => {
    const searchText = e.target.value;
    setOldAddress(searchText); // Update local state for old address input

    if (searchText.length > 0) {
      try {
        const response = await axios.get(
          `${apiUrl}/addresses?searchText=${searchText}`
        );
        setOldAddressSuggestions(response.data); // Set suggestions for old address
      } catch (error) {
        console.error('Error fetching old address suggestions:', error);
      }
    } else {
      setOldAddressSuggestions([]); // Clear suggestions when input is less than 3 characters
    }
  };

  // Handle the selection of an old address
  const handleOldAddressSelect = (selectedAddress) => {
    // Format the new address by combining different parts
    const formattedNewAddress = `${selectedAddress.new_district} ${
      selectedAddress.new_town
    } ${selectedAddress.new_road_name} ${
      selectedAddress.new_building_main_number
    }${
      selectedAddress.new_building_sub_number != 0
        ? '-' + selectedAddress.new_building_sub_number
        : ''
    }`;
    setNewAddress(formattedNewAddress); // Auto-fill the corresponding new address

    const formattedOldAddress = `${selectedAddress.old_district} ${
      selectedAddress.old_town
    } ${selectedAddress.old_village} ${selectedAddress.old_lot_main_number}${
      selectedAddress.old_lot_sub_number != 0
        ? '-' + selectedAddress.old_lot_sub_number
        : ''
    }`;
    setOldAddress(formattedOldAddress); // Auto-fill the corresponding old address

    // Update propertyData with the selected old address_id
    setPropertyData({
      ...propertyData,
      address_id: selectedAddress.new_address_id, // Save address_id only
    });

    setOldAddressSuggestions([]); // Clear suggestions
  };

  console.log(newAddressSuggestions);

  return (
    <main className='gap-y-10 w-full'>
      <SearchHeader />

      <section className='w-11/12 flexCol gap-y-12'>
        <article className='flexCol items-start gap-y-8'>
          <div className='w-full'>
            <div className='grid grid-cols-3 grid-rows-2 h-52 overflow-hidden rounded-xl'>
              {images && images.length > 0 ? (
                images.map((imgPath, index) => (
                  <img
                    key={index}
                    src={`${apiUrl}${imgPath}`}
                    alt={`Property Image ${index + 1}`}
                    className={`w-full h-full object-cover ${
                      index === 0
                        ? 'col-span-2 row-span-2'
                        : 'col-span-1 row-span-1'
                    }`}
                  />
                ))
              ) : (
                <p
                  key='no-image'
                  className={`bg-secondary-light flexCol mobile_1 col-span-2 row-span-2`}
                >
                  <FontAwesomeIcon icon={faImage} />
                </p>
              )}
            </div>
          </div>
        </article>

        {/* 매물상태, 거래유형 */}
        <article className='flexCol items-start gap-y-8 w-full'>
          <div className='flexRow gap-x-2 w-full'>
            <p className='bg-primary-yellow px-5 py-0.5 rounded mobile_4_bold'>
              {propertyData.부동산구분
                ? propertyData.부동산구분
                : '부동산 구분'}
            </p>
          </div>
          <div className='flexCol w-full lg:w-1/2 '>
            <input
              type='text'
              name='건물명'
              value={propertyData.건물명}
              onChange={handleInputChange}
              placeholder='건물명을 입력하세요'
              className='bg-secondary-yellow w-full lg:py-6 lg:pl-4'
            />
          </div>
        </article>
      </section>

      <p className='w-11/12 border'></p>

      {/* 거래상태, 매물기본정보, 주소 */}
      <section className='w-full flexCol py-6 gap-y-20'>
        <article className='w-11/12 flexCol gap-y-8'>
          <div className='w-full flexCol gap-y-4'>
            <p className='mobile_3_bold w-full flexRow gap-x-4'>
              <FontAwesomeIcon icon={faTag} />
              매물상태
            </p>
            <ul className='grid grid-cols-2 w-full gap-x-4'>
              {transactionStatus.map((option, index) => (
                <button
                  key={index}
                  name='거래완료여부'
                  value={option}
                  onClick={handleInputChange}
                  className={`w-full lg:min-h-32 cursor-pointer flexCol gap-y-2 text-primary text-center py-6 mobile_3 rounded-lg  ${
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
          <div className='flexCol w-full gap-y-4 lg:gap-y-8'>
            <p className='mobile_3_bold w-full flexRow gap-x-4'>
              <FontAwesomeIcon icon={faTag} />
              매물유형
            </p>
            <ul className='grid grid-cols-3 w-full lg:w-8/12 gap-x-4'>
              {propertyTypes.map((option, index) => (
                <button
                  key={index}
                  name='부동산구분'
                  value={option}
                  onClick={handleInputChange}
                  className={`w-full lg:min-h-32 flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg ${
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
          <div id='거래방식' className='w-full flexCol gap-y-4 lg:gap-y-8'>
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
                  className={`w-full lg:min-h-32 flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg ${
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
                      <p className='mobile_4'>{field}</p>
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
                    <p className='mobile_4'>전체금액</p>
                    <div className='flexRow w-full justify-between'>
                      <input
                        type='number'
                        min={0}
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
                      value={
                        isConverted
                          ? (propertyData.보증금 / 10000).toLocaleString()
                          : propertyData.보증금
                      }
                      onChange={handleInputChange}
                      className='bg-white text-primary rounded-full w-10/12'
                    />
                    <p>{isConverted ? '만원' : '원'}</p>
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
        </article>
        <article className='w-10/12'>
          <button
            className='btn_clear w-full bg-secondary-yellow rounded-full'
            onClick={() => setIsConverted(!isConverted)}
          >
            <FontAwesomeIcon icon={faMoneyBillTransfer} className='mr-2' />
            {isConverted ? '원' : '만원'}
          </button>
        </article>
        <article className='grid grid-rows-2 w-6/12 gap-y-4'>
          <button className='btn_clear' name='priceClear' onClick={handleClear}>
            초기화
          </button>
          <button type='submit' className='btn_save' onClick={handleSave}>
            적용하기
          </button>
        </article>
      </section>

      <section className='w-11/12 flexCol gap-y-4'>
        <p className='mobile_3_bold w-full'>매물 기본 정보</p>
        <article className='boxEdit w-full flexCol gap-y-6 lg:gap-y-12'>
          <div className='w-full grid grid-rows-2 gap-y-2'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faRulerCombined} /> 공급면적
            </p>
            <div className='flexCol lg:flex-row justify-between gap-y-2'>
              <div className='flexRow justify-between w-full lg:w-1/2'>
                <input
                  type='number'
                  name='전체m2'
                  min={0}
                  value={propertyData.전체m2}
                  onChange={handleInputChange}
                  className='w-10/12'
                />
                <p className='w-1/12 mobile_5'>
                  m<sup>2</sup>
                </p>
              </div>
              <div className='flexRow justify-between w-full lg:w-1/2'>
                <input
                  type='number'
                  name='전체평'
                  min={0}
                  value={propertyData.전체평}
                  onChange={handleInputChange}
                  className='w-10/12'
                  placeholder='숫자를 입력하세요'
                />
                <p className='w-1/12 mobile_5'>평</p>
              </div>
            </div>
          </div>
          <div className='w-full grid grid-rows-2 gap-y-2'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faRulerCombined} />
              전용면적{' '}
            </p>
            <div className='flexCol lg:flex-row justify-between gap-y-2'>
              <div className='flexRow justify-between w-full lg:w-1/2'>
                <input
                  type='number'
                  name='전용m2'
                  min={0}
                  value={propertyData.전용m2}
                  onChange={handleInputChange}
                  className='w-10/12'
                />
                <p className='w-1/12 mobile_5'>
                  m<sup>2</sup>
                </p>
              </div>
              <div className='flexRow justify-between w-full lg:w-1/2'>
                <input
                  type='number'
                  name='전용평'
                  min={0}
                  value={propertyData.전용평}
                  onChange={handleInputChange}
                  className='w-10/12'
                />
                <p className='w-1/12 mobile_5'>평</p>
              </div>
            </div>
          </div>

          <div className='flexCol gap-y-6 lg:flex-row lg:justify-between lg:gap-x-14 w-full'>
            <div className='w-full flexCol items-start gap-y-4 lg:flex-row lg:items-center justify-between'>
              <p className='mobile_3_bold flexRow gap-x-2'>
                <FontAwesomeIcon icon={faElevator} />
                엘레베이터
              </p>
              <div className='w-full lg:w-1/2 grid grid-cols-2 gap-x-8'>
                {[true, false].map((bool, index) => {
                  return (
                    <button
                      key={index}
                      name='EV유무'
                      className={`flexCol gap-y-2 px-2 rounded py-4 ${
                        bool === propertyData.EV유무
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
                      {bool === propertyData.EV유무 && (
                        <FontAwesomeIcon icon={faCircleCheck} />
                      )}
                      <p>{bool ? '있음' : '없음'}</p>
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
              <input
                type='number'
                name='층수'
                min='0'
                value={propertyData.층수}
                onChange={handleInputChange}
                className='w-7/12'
              />
              <p className='mobile_5'>층</p>
            </div>
          </div>

          <div className='flexCol gap-y-6 lg:flex-row lg:justify-between lg:gap-x-14 w-full'>
            <div className='w-full flexRow justify-between'>
              <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
                <FontAwesomeIcon icon={faCar} />
                주차
              </p>
              <input
                type='number'
                name='주차가능대수'
                min='0'
                value={propertyData.주차가능대수}
                onChange={handleInputChange}
                className='w-7/12'
              />
              <p className='mobile_5'>대</p>
            </div>

            <div className='w-full flexRow justify-between'>
              <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
                <FontAwesomeIcon icon={faDroplet} />
                화장실
              </p>
              <input
                type='number'
                name='화장실개수'
                min='0'
                value={propertyData.화장실개수}
                onChange={handleInputChange}
                className='w-7/12'
              />
              <p className='mobile_5'>개</p>
            </div>
          </div>

          <div className='flexCol gap-y-6 lg:flex-row lg:justify-between lg:gap-x-14 w-full'>
            <div className='w-full flexRow justify-between'>
              <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
                <FontAwesomeIcon icon={faKey} />
                비밀번호
              </p>
              <input
                type='text'
                name='비밀번호'
                value={propertyData.비밀번호}
                onChange={handleInputChange}
                className='w-7/12'
              />
              <p className='mobile_5'>번</p>
            </div>
            <div className='w-full flexRow justify-between'>
              <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
                <FontAwesomeIcon icon={faMoneyBill} />
                관리비
              </p>
              <input
                type='text'
                name='관리비'
                value={propertyData.관리비}
                onChange={handleInputChange}
                className='w-7/12'
              />
              <p className='mobile_5'>원</p>
            </div>
          </div>
        </article>
      </section>

      <p className='w-11/12 border'></p>

      <section className='w-11/12 flexCol py-6 gap-y-8'>
        <p className='mobile_3_bold w-full'>주소</p>
        <article className='boxEdit'>
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
                <input
                  type='text'
                  name='동'
                  value={propertyData.동}
                  onChange={handleInputChange}
                  className='w-11/12'
                />
                동
              </div>
              <div className='flexRow gap-x-2'>
                <input
                  type='text'
                  name='호수'
                  value={propertyData.호수}
                  onChange={handleInputChange}
                  className='w-11/12'
                />
                호
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className='w-11/12 flexCol py-6 gap-y-8'>
        <p className='mobile_3_bold w-full'>연락처 정보</p>
        <article className='boxEdit w-full flexCol gap-y-6'>
          {contactFields.length > 0 ? (
            contactFields.map((contactType, index) => (
              <div key={index} className='flexCol gap-y-4 w-full items-start'>
                <p className='mobile_3_bold flexRow gap-x-2'>
                  <FontAwesomeIcon icon={faUserPlus} />
                  {contactType}
                </p>
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
                    type='text'
                    name='전화번호'
                    value={propertyData.연락처[contactType]?.전화번호 || ''}
                    onChange={(e) => handleInputChange(e, contactType)}
                    placeholder={`${contactType} 전화번호를 입력하세요`}
                    className='w-full'
                  />
                </div>
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
        <article className='boxEdit w-full flexCol gap-y-4 lg:gap-y-8'>
          <div className='flexRow w-full justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faCalendarCheck} />
              거래완료
            </p>
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
          </div>
          <div className='flexRow w-full justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faCalendarDays} />
              사용승인
            </p>
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
          </div>
          <div className='flexRow w-full justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faCalendarDays} />
              등록일자
            </p>
            <input
              type='date'
              name='등록일자'
              value={
                propertyData.등록일자 ? propertyData.등록일자.split('T')[0] : ''
              }
              onChange={handleInputChange}
              className='w-8/12'
            />
          </div>

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
          <div className='w-full flexCol items-start'>
            <p className='mobile_3_bold flexRow gap-x-2 pb-2'>
              <FontAwesomeIcon icon={faNoteSticky} />
              메모
            </p>
            <textarea
              type='textarea'
              rows='5'
              name='메모'
              value={propertyData.메모}
              onChange={handleInputChange}
              placeholder='메모를 입력하세요'
              className='w-full'
            ></textarea>
          </div>
        </article>
      </section>

      <section className='w-8/12 mb-16'>
        <article className='grid grid-rows-2 lg:grid-cols-2 gap-x-4 w-full gap-y-4'>
          <button className='btn_clear' onClick={handleClear}>
            초기화
          </button>
          <button type='submit' className='btn_save' onClick={handleSave}>
            적용하기
          </button>
        </article>
      </section>
    </main>
  );
};

export default PropertyUpload;
