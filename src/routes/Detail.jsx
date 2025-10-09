import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  faTag,
  faUserPlus,
  faMoneyBillTransfer,
  faImage,
} from '@fortawesome/free-solid-svg-icons';

const PropertyDetail = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const initialPropertyData = {
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
  };

  const [propertyData, setPropertyData] = useState(initialPropertyData);

  const navigate = useNavigate();
  const { propertyId } = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isImgUploaded, setIsImgUploaded] = useState();

  // Address
  const [newAddress, setNewAddress] = useState(''); // Local state for new address input
  const [oldAddress, setOldAddress] = useState(''); // Local state for old address input
  const [newAddressSuggestions, setNewAddressSuggestions] = useState([]); // New address suggestions
  const [oldAddressSuggestions, setOldAddressSuggestions] = useState([]); // Old address suggestions

  const [isConverted, setIsConverted] = useState(false); // Toggle state to track conversion
  const [originalPrices, setOriginalPrices] = useState({
    보증금: 0,
    월세: 0,
    '전체 금액': 0,
  });
  const [displayValues, setDisplayValues] = useState({
    보증금: 0,
    월세: 0,
  });

  // Contact
  const contactFieldsMap = {
    매매: ['매도인', '매수인', '부동산'],
    월세: ['임대인', '임차인', '부동산'],
    전세: ['전대인', '전차인', '부동산'],
  };

  const contactFields = contactFieldsMap[propertyData.거래방식] || []; // Get the contact fields based on the transaction method

  const [dropdownData, setDropdownData] = useState({
    propertyTypes: [],
    transactionMethod: [],
    transactionStatus: [],
  });

  const fetchPropertyData = async () => {
    try {
      const propertyRes = await axios.get(`${apiUrl}/detail/${propertyId}`, {
        withCredentials: true,
      });
      const { data: fetchedData } = propertyRes;
      if (typeof fetchedData.연락처 === 'string') {
        try {
          fetchedData.연락처 = JSON.parse(fetchedData.연락처);
        } catch (error) {
          console.error('Error parsing 연락처:', error);
          fetchedData.연락처 = {}; // Set to an empty object if parsing fails
        }
      }

      setPropertyData(fetchedData);
      setDisplayValues({
        보증금: fetchedData.보증금,
        월세: fetchedData.월세,
      });
      setOriginalPrices({
        보증금: fetchedData.보증금 || 0,
        월세: fetchedData.월세 || 0,
        '전체 금액': (fetchedData.보증금 || 0) + (fetchedData.월세 || 0),
      });

      console.log(fetchedData.address_id);
      const addressRes = await axios.get(
        `${apiUrl}/get-address/${fetchedData.address_id}`,
        { withCredentials: true }
      );
      setNewAddress(addressRes.data.newAddress);
      setOldAddress(addressRes.data.oldAddress);

      const [typesRes, methodsRes, statusRes] = await Promise.all([
        axios.get(`${apiUrl}/property-types`),
        axios.get(`${apiUrl}/transaction-methods`),
        axios.get(`${apiUrl}/transaction-status`),
      ]);

      setDropdownData({
        propertyTypes: typesRes.data,
        transactionMethod: methodsRes.data,
        transactionStatus: statusRes.data,
      });

      const imgRes = await axios.get(
        `${apiUrl}/properties/${propertyId}/images`
      );
      setImages(imgRes.data.images || []);
    } catch (error) {
      console.error('Error fetching property data:', error);
    }
  };
  console.log(images);

  useEffect(() => {
    fetchPropertyData();
  }, [propertyId, isImgUploaded]);

  // Focus handler to clear leading zero only if type is number
  const handleFocus = (e) => {
    const { name, value, type } = e.target;

    if (type === 'number' && value === '0') {
      setPropertyData((prevState) => ({
        ...prevState,
        [name]: '', // Clear the input value if it is just '0'
      }));
    }
  };

  // Blur handler to add zero only if type is number and input is empty
  const handleBlur = (e) => {
    const { name, value, type } = e.target;

    if (type === 'number' && value === '') {
      setPropertyData((prevState) => ({
        ...prevState,
        [name]: '0', // Set the input value to '0' if left empty
      }));
    }
  };

  const convertM2ToPyeong = (m2) => {
    return Number((m2 / 3.3058).toFixed(2));
  }; // Converts m² to 평
  const convertPyeongToM2 = (pyeong) => {
    return Number((pyeong * 3.3058).toFixed(2));
  }; // Converts 평 to m²

  const calculateTotalAmount = (보증금, 월세, isConverted) => {
    const totalAmount = parseInt(보증금, 10) + parseInt(월세, 10);
    // Divide by 10,000 and format with two decimal places if converted, otherwise return the raw total
    return isConverted ? totalAmount / 10000 : totalAmount;
  };

  const updateDisplayValues = (name, value) => {
    const adjustedValue = isConverted ? value / 10000 : value;
    setDisplayValues((prev) => ({ ...prev, [name]: adjustedValue }));
  };

  const handleInputChange = (e, contactType = null) => {
    let { name, type, value } = e.target;
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

    if (name === '보증금' || name === '월세') {
      console.log(Number(formattedValue));
      console.log(isConverted);
      formattedValue = Number(formattedValue);
      // When it's convertd to manwon
      if (isConverted) {
        // Update display in manwon
        setDisplayValues((prev) => ({
          ...prev,
          [name]: formattedValue,
        }));

        // Update originalPrices and propertyData by converting back to won
        const newOriginalValue = formattedValue * 10000;
        console.log(newOriginalValue);
        setOriginalPrices((prev) => ({
          ...prev,
          [name]: newOriginalValue,
        }));
        setPropertyData((prev) => ({
          ...prev,
          [name]: newOriginalValue,
        }));
      } else {
        // If not converted, update both display and original values in won
        setDisplayValues((prev) => ({
          ...prev,
          [name]: formattedValue,
        }));
        setOriginalPrices((prev) => ({
          ...prev,
          [name]: formattedValue,
        }));
        setPropertyData((prev) => ({
          ...prev,
          [name]: formattedValue,
        }));
      }
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
    }

    setPropertyData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    console.log('propertyData', propertyData);
  };

  const convertToManwon = () => {
    setDisplayValues({
      보증금: isConverted
        ? originalPrices.보증금
        : originalPrices.보증금 / 10000,
      월세: isConverted ? originalPrices.월세 : originalPrices.월세 / 10000,
    });
    setIsConverted(!isConverted);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/delete-property/${propertyId}`);
      navigate('/search');
      console.log('Property deleted successfully.');
      alert('매물이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error(
        'Error deleting property:',
        error.response ? error.response.data : error.message
      );
      alert('매물 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
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

      console.log(propertyData);
      const formattedFieldsToUpdate = {
        ...fieldsToUpdate,
        등록일자: new Date(등록일자).toISOString().split('T')[0],
        거래완료일자: new Date(거래완료일자).toISOString().split('T')[0],
        사용승인일자: new Date(거래완료일자).toISOString().split('T')[0],
        비밀번호: 비밀번호 || '미정', // Default to "미정" if 비밀번호 is not provided
        연락처: typeof 연락처 === 'object' ? JSON.stringify(연락처) : 연락처, // Ensure 연락처 is a string
      };
      console.log('formattedFieldsToUpdate', formattedFieldsToUpdate);

      await axios.put(
        `${apiUrl}/update-property/${propertyId}`,
        formattedFieldsToUpdate
      );
      alert('매물이 성공적으로 저장되었습니다!');
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
        `${apiUrl}/upload-images/${propertyId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      alert('이미지가 성공적으로 업로드되었습니다!');
      setImages(response.data.images);
      setIsImgUploaded(images.length);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('이미지 업로드중 오류가 발생하였습니다.');
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      // Trim '/uploads/' from the beginning of imageId
      const trimmedImageId = imageId.replace(/^\/uploads\//, '');

      // Make the delete request to the server with the trimmed image ID
      await axios.delete(
        `${apiUrl}/properties/${propertyId}/images/${trimmedImageId}`,
        { withCredentials: true }
      );

      // Update the images state by removing the deleted image
      setImages(
        (prevImages) => prevImages.filter((image) => image !== imageId) // Assuming imageId includes `/uploads/`
      );
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

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

  console.log(propertyData);
  return (
    <main className='gap-y-10 w-full'>
      <section className='w-11/12 flexCol gap-y-12'>
        <article className='flexCol items-start gap-y-8 w-full'>
          <div className='w-full'>
            <div className='grid grid-cols-3 grid-rows-2 gap-2 h-52 lg:min-h-80 overflow-hidden rounded-xl w-full'>
              {Array.from({ length: 3 }).map((_, index) => {
                const image = Object.values(images)[index]; // Get the image at the current index or undefined if it doesn't exist

                return image ? (
                  <img
                    key={index}
                    src={`${apiUrl}${image}`}
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
                );
              })}
            </div>
          </div>
        </article>

        {/* 매물상태, 거래유형 */}
        <article className='flexCol items-start gap-y-8 w-full'>
          <div className='flexRow gap-x-2 w-full'>
            <p className='border border-primary-yellow px-1 mobile_5'>
              매물번호 {propertyData.매물ID}
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
              className={`btn_save px-3 lg:px-6 ${
                isEditing ? 'bg-secondary-yellow text-primary' : ''
              }`}
              onClick={() => setIsEditing(!isEditing)}
            >
              편집하기
            </button>
          </div>
        </article>
      </section>

      <p className='w-11/12 border'></p>

      {/* 거래상태, 매물기본정보, 주소 */}
      <section className='w-full flexCol py-6 gap-y-20'>
        <article className='w-11/12 md:w-10/12 flexCol gap-y-8'>
          <div className='w-full flexCol gap-y-4'>
            <p className='mobile_3_bold w-full flexRow gap-x-4'>
              <FontAwesomeIcon icon={faHourglass} />
              매물상태
            </p>
            <ul className='grid grid-cols-2 w-full lg:w-8/12 gap-x-4'>
              {dropdownData.transactionStatus.map((option, index) => (
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
              {dropdownData.propertyTypes.map((option, index) => (
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
          <div id='거래방식' className='w-full  flexCol gap-y-4'>
            <p className='mobile_3_bold w-full flexRow gap-x-4'>
              <FontAwesomeIcon icon={faTag} />
              거래유형
            </p>
            <ul className='grid grid-cols-3 w-full lg:w-8/12 gap-x-4'>
              {dropdownData.transactionMethod.map((option, index) => (
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
        <p className='mobile_3_bold w-11/12 md:w-10/12 flexRow gap-x-4'>
          <FontAwesomeIcon icon={faMoneyBills} />
          거래금액
        </p>
        <article className='w-11/12 md:w-8/12 flexCol'>
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
                          value={displayValues[field] || ''}
                          onChange={handleInputChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
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
                        value={calculateTotalAmount(
                          propertyData.보증금,
                          propertyData.월세,
                          isConverted
                        )}
                        readOnly
                        className='bg-white text-primary rounded-full w-10/12'
                      />
                      <p>{isConverted ? '만원' : '원'}</p>
                    </div>
                  </div>
                </div>
              );
            };

            // Logic to determine the type of transaction and labels
            if (
              propertyData.거래방식 === '매매' ||
              propertyData.거래방식 === '전세'
            ) {
              // Grouped logic for "매매" and "전세"
              return (
                <div className='w-full grid grid-rows-2'>
                  <p className='mobile_3_bold'>거래 금액</p>
                  <div className='flexRow w-full justify-between'>
                    <input
                      type='number'
                      min={0}
                      name='보증금'
                      value={
                        isConverted
                          ? propertyData.보증금 / 10000
                          : propertyData.보증금
                      }
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      disabled={isEditing ? false : true}
                      className='bg-white text-primary rounded-full w-10/12'
                    />
                    <p>{isConverted ? '만원' : '원'}</p>
                  </div>
                </div>
              );
            } else if (propertyData.거래방식 === '월세') {
              // Separate logic for "월세"
              const fields = ['보증금', '월세'];
              return renderFields(fields);
            }
          })()}

          <article className='w-full mt-4'>
            <button
              className='btn_clear w-full bg-secondary-yellow rounded-full'
              onClick={convertToManwon}
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

      <section className='w-11/12 md:w-10/12 flexCol gap-y-4'>
        <p className='mobile_3_bold w-full'>매물 기본 정보</p>
        <article
          className={`w-full flexCol gap-y-8 lg:gap-y-10 ${
            isEditing ? 'boxEdit' : 'boxDiplay'
          }`}
        >
          <div className='w-full  grid grid-rows-2  gap-y-2'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faRulerCombined} /> 공급면적
            </p>
            <div className='flexCol lg:flex-row justify-between gap-y-2'>
              <div className='flexRow justify-between w-full lg:w-1/2'>
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

                <p className='w-1/12 mobile_4 text-center'>
                  m<sup>2</sup>
                </p>
              </div>
              <div className='flexRow justify-between w-full md:w-1/2'>
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

                <p className='w-1/12 mobile_4 text-center'>평</p>
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
                  <p className='pDisplay w-11/12 '>{propertyData.전용m2}</p>
                )}

                <p className='w-1/12 text-center mobile_4'>
                  m<sup>2</sup>
                </p>
              </div>
              <div className='flexRow justify-between w-full lg:w-1/2'>
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

                <p className='w-1/12 text-center mobile_4'>평</p>
              </div>
            </div>
          </div>
          <div className='w-full flexCol gap-y-2'>
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
                    <p className='mobile_4'>{bool ? '있음' : '없음'}</p>
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
              <p className='pDisplay w-7/12 lg:w-8/12'>{propertyData.층수}</p>
            )}

            <p className='mobile_4'>층</p>
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
              <p className='pDisplay w-7/12 lg:w-8/12'>
                {propertyData.주차가능대수}
              </p>
            )}
            <p className='mobile_4'>대</p>
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
              <p className='pDisplay w-7/12 lg:w-8/12'>
                {propertyData.화장실개수}
              </p>
            )}
            <p className='mobile_4'>개</p>
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
              <p className='pDisplay w-7/12 lg:w-8/12'>
                {propertyData.비밀번호}
              </p>
            )}
            <p className='mobile_4'>번</p>
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
              <p className='pDisplay w-7/12 lg:w-8/12'>{propertyData.관리비}</p>
            )}
            <p className='mobile_4'>원</p>
          </div>
        </article>
      </section>

      <p className='w-11/12 border'></p>

      <section className='w-11/12  md:w-10/12 flexCol py-6 gap-y-8'>
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
            <div className='w-full'>
              {isEditing ? (
                <div className='w-full relative'>
                  <input
                    type='text'
                    name='newAddress'
                    value={typeof newAddress === 'object' ? '' : newAddress} // Ensure value is never undefined
                    onChange={handleNewAddressSearch}
                    className='w-full'
                    placeholder='Search for a new address'
                  />
                  {newAddressSuggestions.length > 0 && (
                    <ul className='absolute z-40 w-full  bg-white divide-y-2 border max-h-48 overflow-y-auto'>
                      {newAddressSuggestions.map((address, index) => (
                        <li
                          key={index}
                          onClick={() => handleNewAddressSelect(address)} // Select and store address_id
                          className='py-1 pl-1 hover:bg-secondary-light'
                        >
                          {address.new_district} {address.new_town}{' '}
                          {address.new_road_name}{' '}
                          {address.new_building_main_number}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                newAddress && (
                  <p className='pDisplay w-full'>
                    {newAddress.시군구} {newAddress.읍면 && newAddress.읍면}{' '}
                    {newAddress.도로명} {newAddress.건물번호본번}
                    {newAddress.건물번호부번 !== 0 &&
                      `-${newAddress.건물번호부번}`}
                  </p>
                )
              )}
            </div>
          </div>
          <div className='grid grid-rows-2 w-full'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faHouse} />구 주소
            </p>
            <div className='w-full'>
              {isEditing ? (
                <div className='w-full relative'>
                  <input
                    type='text'
                    name='oldAddress'
                    value={typeof oldAddress === 'object' ? '' : oldAddress} // Ensure value is never undefined
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
              ) : (
                oldAddress && (
                  <p className='pDisplay w-full'>
                    {oldAddress.시군구} {oldAddress.읍면동}{' '}
                    {oldAddress.리명 && oldAddress.리명}
                    {oldAddress.지번본번}
                    {oldAddress.지번부번 && oldAddress.지번부번 !== '0'
                      ? `-${oldAddress.지번부번}`
                      : ''}{' '}
                    {oldAddress.시군구용건물명 && oldAddress.시군구용건물명}
                  </p>
                )
              )}
            </div>
          </div>
          <div className='grid grid-rows-2 w-full'>
            <p className='mobile_3_bold flexRow gap-x-2'>
              <FontAwesomeIcon icon={faHouse} />
              상세주소
            </p>
            <div className='flexRow gap-x-2'>
              {isEditing ? (
                <input
                  type='text'
                  name='상세주소'
                  value={propertyData.상세주소}
                  onChange={handleInputChange}
                  className='w-full'
                  placeholder='상세주소를 입력하세요'
                />
              ) : (
                <p className='pDisplay  w-full'>{propertyData.상세주소}</p>
              )}
            </div>
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

      <section className='w-11/12 md:w-10/12 flexCol py-6 gap-y-8'>
        <p className='mobile_3_bold w-full'>연락처 정보</p>
        <article
          className={`w-full flexCol gap-y-6 ${
            isEditing ? 'boxEdit' : 'boxDiplay'
          }`}
        >
          {contactFields.length > 0 ? (
            contactFields.map((contactType, index) => {
              return (
                <div key={index} className='flexCol gap-y-6 w-full items-start'>
                  <p className='mobile_3_bold flexRow gap-x-2'>
                    <FontAwesomeIcon icon={faUserPlus} />
                    {contactType}
                  </p>
                  <div className='flexCol gap-y-3 w-full'>
                    {isEditing ? (
                      <>
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
                          value={
                            propertyData.연락처[contactType]?.전화번호 || ''
                          }
                          onChange={(e) => handleInputChange(e, contactType)}
                          placeholder={`${contactType} 전화번호를 입력하세요`}
                          className='w-full'
                        />
                      </>
                    ) : (
                      <>
                        <p className='pDisplay w-full'>
                          {propertyData.연락처[contactType]?.이름 || ''}
                        </p>
                        <p className='pDisplay w-full'>
                          {propertyData.연락처[contactType]?.전화번호 || ''}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })
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

      <section className='w-11/12 md:w-10/12 flexCol py-6 gap-y-8'>
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
            <div className='w-full flexCol items-start gap-y-4'>
              <p className='mobile_3_bold flexRow gap-x-2'>
                <FontAwesomeIcon icon={faImage} />
                매물사진
              </p>
              <div className='flexRow justify-between'>
                <input
                  type='file'
                  multiple
                  onChange={handleImageChange}
                  disabled={isEditing ? false : true}
                  className='w-9/12'
                />
                <button
                  onClick={handleImageUpload}
                  className='bg-primary-yellow text-primary px-4 py-2 h-full rounded mobile_3_bold'
                >
                  업로드
                </button>
              </div>
              <div className='flexCol gap-y-4'>
                {Array.from(images).map((imagePath, index) => (
                  <div key={index} className='flexRow justify-between w-full'>
                    <img
                      src={`${apiUrl}${imagePath}`}
                      // alt={`${apiUrl}${imagePath}`}
                      alt={`Property Image ${index + 1}`}
                      className='w-1/2 object-cover'
                    />
                    <button
                      onClick={() => handleDeleteImage(imagePath)}
                      className='bg-red-500 text-white rounded-lg px-4 py-1'
                    >
                      X
                    </button>
                  </div>
                ))}
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
