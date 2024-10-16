import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation to the login page

import Memo from '../components/feature/Memo';
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
  faMoneyBill,
  faMoneyBills,
  faRulerCombined,
  faRulerVertical,
  faTag,
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
        const propertyType = await axios.get(
          `${apiUrl}/property-types`
        );
        setPropertyTypes(propertyType.data);

        const transactionMethod = await axios.get(
          `${apiUrl}/transaction-methods`
        );
        setTransactionMethod(transactionMethod.data);

        const transactionStatus = await axios.get(
          `${apiUrl}/transaction-status`
        );
        setTransactionStatus(transactionStatus.data);

        const toiletsNum = await axios.get(`${apiUrl}/toilets-num`);
        setToiletsNum(toiletsNum.data);


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

    // Handling 정산금액
    if (name.startsWith('정산금액.')) {
      const fieldPath = name.split('.'); // ['정산금액', '소장'] or ['정산금액', '직원', '0', 'money']

      setPropertyData((prevState) => {
        let updated정산금액 = { ...prevState.정산금액 };

        if (fieldPath[1] === '소장') {
          // Update 소장 value
          updated정산금액.소장 = formattedValue;
        } else if (fieldPath[1] === '직원') {
          // Update 직원 value
          const index = fieldPath[2]; // 직원 index
          updated정산금액.직원[index].money = formattedValue;
        }

        // Calculate 총수수료 (sum of 소장 and all 직원 money)
        const totalEmployeeMoney = updated정산금액.직원.reduce(
          (acc, curr) => acc + parseFloat(curr.money),
          0
        );
        updated정산금액.총수수료 =
          parseFloat(updated정산금액.소장) + totalEmployeeMoney;

        return {
          ...prevState,
          정산금액: updated정산금액,
        };
      });
    } else {
      // For other fields
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

  const handleMemoUpdate = (newMemo) => {
    setMemo(newMemo);
    setPropertyData((prevData) => ({
      ...prevData,
      메모: newMemo, // Update propertyData with the memo content
    }));
  };

  // Format number with commas
  const formatNumber = (number) => {
    return Number(number).toLocaleString();
  };

  // Save data to the database
  const handleSave = async () => {
    const {
      등록일자,
      거래완료일자,
      비밀번호,
      부동산구분,
      거래방식,
      거래완료여부,
      ...fieldsToUpdate
    } = propertyData;

    // Set default dates to current date if not provided
    const currentDate = formatDateForMySQL(new Date());
    const formattedFieldsToUpdate = {
      ...fieldsToUpdate,
      등록일자: 등록일자 ? formatDateForMySQL(new Date(등록일자)) : currentDate,
      거래완료일자: 거래완료일자
        ? formatDateForMySQL(new Date(거래완료일자))
        : currentDate,
      비밀번호: 비밀번호 || '미정', // Default to "미정" if 비밀번호 is not provided
      부동산구분: selectedType,
      거래방식: selectedMethod,
      거래완료여부: selectedStatus,
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
      const response = await axios.post(
        `${apiUrl}/upload-images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      // Get image paths from the response
      const uploadedImages = response.data.images || [];
      setImages((prevImages) => [...prevImages, ...uploadedImages]); // Accumulate images
      console.log('uploadedImages: ', uploadedImages);

      // Update propertyData with image paths
      setPropertyData((prevData) => ({
        ...prevData,
        img_path: [
          ...(prevData.img_path.split(',') || []),
          ...uploadedImages,
        ].join(','), // Append new image paths
      }));
      console.log('propertyData: ', propertyData);

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
        '전체 금액': Math.floor((propertyData.보증금 + propertyData.월세) / 10000).toString(),
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
            <div className='grid grid-cols-3 grid-rows-2 ga h-52 overflow-hidden rounded-xl'>
              {images &&
                images.length > 0 &&
                images.map((imgPath, index) => (
                  <img
                    key={index}
                    src={`${apiUrl}${imgPath}`}
                    alt={`Property Image ${index + 1}`}
                    className={`w-full h-full object-cover before:content-["] before:bg-primary ${
                      index === 0
                        ? 'col-span-2 row-span-2'
                        : 'col-span-1 row-span-1'
                    }`}
                  />
                ))}
            </div>
          </div>
        </article>

        {/* 매물상태, 거래유형 */}
        <article className='w-full grid grid-cols-2 h-24'>
          <div className='flexCol justify-end items-start'>
            <h1 className=''>
              <label>건물명</label>
              <input
                type='text'
                name='건물명'
                value={propertyData.건물명}
                onChange={handleInputChange}
                className=''
              />
            </h1>
            <div className='flexRow mobile_3'>
              <p>월세</p>
              <p>1000/</p>
              <p>80</p>
            </div>
          </div>
          <div className='flexCol items-end justify-between'>
            <p className='border border-primary-yellow px-1 mobile_5'>
              매물번호 001
            </p>
            <p className='bg-primary-yellow px-5 py-0.5 rounded mobile_4_bold'>
              아파트
            </p>
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
                  className={`w-full cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg  ${
                    option === selectedStatus
                      ? ' bg-primary-yellow'
                      : ' bg-secondary-light'
                  }`}
                >
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
            <ul className='grid grid-cols-3 w-full gap-x-4'>
              {propertyTypes.map((option, index) => (
                <button
                  key={index}
                  name='부동산구분'
                  value={option}
                  onClick={handleInputChange}
                  className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg ${
                    option === selectedType
                      ? ' bg-primary-yellow'
                      : ' bg-secondary-light'
                  }`}
                >
                  {option === selectedType && (
                    <FontAwesomeIcon icon={faCircleCheck} />
                  )}
                  {option}
                </button>
              ))}
            </ul>
          </div>
          <div className='w-full flexCol gap-y-4'>
            <p className='mobile_3_bold w-full flexRow gap-x-4'>
              <FontAwesomeIcon icon={faHourglass} />
              거래유형
            </p>
            <ul className='grid grid-cols-3 w-full gap-x-4'>
              {transactionMethod.map((option, index) => (
                <button
                  key={index}
                  name='거래방식'
                  value={option}
                  onClick={handleInputChange}
                  className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg ${
                    option === selectedMethod
                      ? ' bg-primary-yellow'
                      : ' bg-secondary-light'
                  }`}
                >
                  {option === selectedMethod && (
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
                  <p className='mobile_3_bold'>{fields[1].name} 금액</p>
                  {fields.map((field, index) => (
                    <div key={index} className='w-full grid grid-rows-2'>
                      <p className=''>{field.label}</p>
                      <div className='flexRow w-full justify-between'>
                        <input
                          type='number'
                          name={field.name}
                          onChange={handleInputChange}
                          className='bg-white text-primary rounded-full w-10/12'
                        />
                        <p>원</p>
                      </div>
                    </div>
                  ))}
                  <p className='w-full border border-primary'></p>
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
                      name='보증금'
                      onChange={handleInputChange}
                      className='bg-white text-primary rounded-full w-10/12'
                    />
                    <p>원</p>
                  </div>
                </div>
              );
            } else if (propertyData.거래방식 === '월세') {
              // For 월세
              const fields = [
                { label: '보증금', name: '보증금' },
                { label: '월세', name: '월세' },
                { label: '전체금액', name: '전체금액' },
              ];
              return renderFields(fields);
            } else if (propertyData.거래방식 === '전세') {
              // For 전세
              const fields = [
                { label: '보증금', name: '보증금' },
                { label: '전세', name: '전세' },
                { label: '전체금액', name: '전체금액' },
              ];
              return renderFields(fields);
            }
          })()}
        </article>
        <article className='grid grid-rows-2 w-6/12 gap-y-4'>
          <button type='submit' className='btn_clear'>
            초기화
          </button>
          <button type='submit' className='btn_save' onClick={handleSave}>
            적용하기
          </button>
        </article>
      </section>

      <section className='w-full flexCol'>
        <article className='w-11/12 flexCol gap-y-8 items-start'>
          <p className='mobile_3_bold w-full'>매물 기본 정보</p>
          <div className='w-full grid grid-rows-3 gap-y-2'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faRulerCombined} /> 공급면적
            </p>
            <div className='flexRow justify-between'>
              <input
                type='number'
                name='전체m2'
                value={propertyData.전체m2}
                onChange={handleInputChange}
                className='w-10/12'
              />
              <p className='w-1/12'>
                m<sup>2</sup>
              </p>
            </div>
            <div className='flexRow justify-between'>
              <input
                type='number'
                name='전체평'
                value={propertyData.전체평}
                onChange={handleInputChange}
                className='w-10/12'
              />
              <p className='w-1/12'>평</p>
            </div>
          </div>
          <div className='w-full grid grid-rows-3 gap-y-2'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faRulerCombined} />
              전용면적{' '}
            </p>
            <div className='flexRow justify-between'>
              <input
                type='number'
                name='전용m2'
                value={propertyData.전용m2}
                onChange={handleInputChange}
                className='w-10/12'
              />
              <p className='w-1/12'>
                m<sup>2</sup>
              </p>
            </div>
            <div className='flexRow justify-between'>
              <input
                type='number'
                name='전용평'
                value={propertyData.전용평}
                onChange={handleInputChange}
                className='w-10/12'
              />
              <p className='w-1/12'>평</p>
            </div>
          </div>
          <div className='w-full grid grid-rows-2'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faElevator} />
              엘레베이터
            </p>
            <div className='w-full grid grid-cols-2 gap-x-8'>
              <button
                name='EV유무'
                className={`flexRow justify-center gap-x-2 p-2 rounded py-4 ${
                  propertyData.EV유무 === 'true'
                    ? ' bg-primary-yellow'
                    : ' bg-secondary-light'
                }`}
                value={true}
                onClick={(e) => handleInputChange(e)}
              >
                {propertyData.EV유무 === 'true' && (
                  <FontAwesomeIcon icon={faCircleCheck} />
                )}
                <p>있음</p>
              </button>
              <button
                name='EV유무'
                className={`flexRow justify-center gap-x-2 p-2 rounded py-4 ${
                  propertyData.EV유무 === 'false'
                    ? ' bg-primary-yellow'
                    : ' bg-secondary-light'
                }`}
                value={false}
                onClick={(e) => handleInputChange(e)}
              >
                {propertyData.EV유무 === 'false' && (
                  <FontAwesomeIcon icon={faCircleCheck} />
                )}
                <p>없음</p>
              </button>
            </div>
          </div>

          <div className='w-full flexRow justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
              <FontAwesomeIcon icon={faBuilding} />
              건물층
            </p>
            <input
              type='number'
              name='건물층'
              value={propertyData.건물층}
              onChange={handleInputChange}
              className='w-7/12'
            />
            <p>층</p>
          </div>

          <div className='w-full flexRow justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2 w-3/12'>
              <FontAwesomeIcon icon={faCar} />
              주차
            </p>
            <input
              type='number'
              name='주차가능대수'
              value={propertyData.주차가능대수}
              onChange={handleInputChange}
              className='w-7/12'
            />
            <p>대</p>
          </div>
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
            <p>번</p>
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
            <p>원</p>
          </div>
        </article>
      </section>

      <p className='w-11/12 border'></p>

      <section className='w-full flexCol py-6 gap-y-8'>
        <p className='mobile_1 w-11/12'>주소</p>
        <article className='w-11/12 flexCol gap-y-4'>
          <div className='grid grid-rows-2 w-full'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faHouse} />신 주소
            </p>
            <div className='w-full relative'>
              <input
                type='text'
                name='newAddress'
                value={newAddress || ''} // Ensure value is never undefined
                onChange={handleNewAddressSearch}
                className='w-full'
                placeholder='Search for a new address'
              />
              {newAddressSuggestions.length > 0 && (
                <ul className='absolute w-full  bg-white divide-y-2 border max-h-48 overflow-y-auto'>
                  {newAddressSuggestions.map((address, index) => (
                    <li
                      key={index}
                      onClick={() => handleNewAddressSelect(address)} // Select and store address_id
                      className='py-1 pl-1 hover:bg-secondary-light'
                    >
                      {address.new_district} {address.new_town}{' '}
                      {address.new_road_name} {address.new_building_main_number}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='grid grid-rows-2 w-full'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faHouse} />구 주소
            </p>
            <div className='w-full relative'>
              <input
                type='text'
                name='oldAddress'
                value={oldAddress || ''} // Ensure value is never undefined
                onChange={handleOldAddressSearch}
                className='w-full'
                placeholder='Search for an old address'
              />
              {oldAddressSuggestions.length > 0 && (
                <ul className='absolute w-full  bg-white divide-y-2 border max-h-48 overflow-y-auto'>
                  {oldAddressSuggestions.map((address, index) => (
                    <li
                      key={index}
                      onClick={() => handleOldAddressSelect(address)} // Select and store address_id
                      className='py-1 pl-1 hover:bg-secondary-light'
                    >
                      {address.old_district} {address.old_town}{' '}
                      {address.old_village} {address.old_lot_main_number}{' '}
                      {address.old_building_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='grid grid-rows-2 w-full'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faHouse} />
              상세주소
            </p>
            <div className='w-full'>
              <input
                type='text'
                name='신상세주소'
                value={propertyData.신상세주소}
                onChange={handleInputChange}
                className=' w-1/2'
              />
            </div>
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

      <p className='w-11/12 border'></p>

      <section className='w-11/12 flexCol py-6 gap-y-8'>
        <p className='mobile_1 w-full'>등록 / 기타 정보</p>
        <article className='flexCol w-full  gap-y-6'>
          <div className='flexRow w-full justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faCalendarCheck} />
              등록일자
            </p>
            <input
              type='date'
              name='등록일자'
              value={
                propertyData.등록일자 ? propertyData.등록일자.split('T')[0] : ''
              }
              onChange={handleInputChange}
              className='w-9/12'
            />
          </div>
          <div className='flexRow w-full justify-between'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faCalendarDays} />
              사용승인
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
              className='w-9/12'
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
              placeholder='메모를 입력하세요'
              onChange={handleImageChange}
              className='w-full'
            ></textarea>
          </div>
        </article>
      </section>

      <section className='w-8/12'>
        <article className='grid grid-rows-2 w-full gap-y-4'>
          <button type='submit' className='btn_clear'>
            초기화
          </button>
          <button type='submit' className='btn_save'>
            적용하기
          </button>
        </article>
      </section>

      <section className='w-11/12'>
        <article>
          <div className='flexRow'>
            <div className='flexRow'>
              <p>화장실개수: </p>
              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevent default on button click
                  setOpen('status');
                }}
                className='block w-full bg-white border border-gray-300 rounded-full px-4 py-2 text-left drop-shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow'
              >
                <p className='flexRow justify-between w-full'>
                  {selectedToilet !== ''
                    ? selectedToilet
                    : '욕실개수를 선택하세요'}
                  <FontAwesomeIcon icon={faChevronDown} />
                </p>
              </button>

              {open === 'status' && (
                <ul className='flexCol rounded-3xl overflow-hidden w-full bg-white z-50'>
                  {toiletsNum.map((option, index) => (
                    <li
                      key={index}
                      onClick={(e) => handleDropdown(e, option, 'toiletsNum')}
                      className={`w-full cursor-pointer text-primary text-center py-1.5 ${
                        option === selectedToilet
                          ? ' bg-primary-yellow'
                          : ' bg-secondary-light'
                      }`}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className='flexRow'>
            <p>임차인정보: </p>
            <>
              이름
              <input
                type='text'
                name='이름'
                value={propertyData.이름}
                onChange={handleInputChange}
                className=''
              />
              휴대폰번호
              <input
                type='phone'
                name='휴대폰번호'
                value={propertyData.휴대폰번호}
                onChange={handleInputChange}
                className=''
              />
            </>
          </div>
          <div className='w-full'>
            <h2>정산금액</h2>
            <div className='flexRow justify-between text-yellow'>
              <p>총수수료: {propertyData.정산금액.총수수료}</p>
            </div>
            <div className='flexRow justify-between text-yellow'>
              <p>소장</p>
              <input
                type='number'
                name='정산금액.소장'
                value={propertyData.정산금액.소장}
                onChange={handleInputChange}
              />
            </div>
            {propertyData.정산금액.직원.map((employee, index) => (
              <div key={index}>
                <label>{employee.name}</label>
                <input
                  type='number'
                  name={`정산금액.직원.${index}.money`}
                  value={employee.money}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};

export default PropertyUpload;
