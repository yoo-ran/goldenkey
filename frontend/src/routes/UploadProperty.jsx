import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation to the login page

import Memo from '../components/feature/Memo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCalendar, faCar, faChevronDown, faCircleCheck, faElevator, faHourglass, faHouse, faKey, faDroplet, faMoneyBill, faMoneyBills, faRulerCombined, faRulerVertical, faTag, faUserPlus, faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';

import SearchHeader from '../components/layout/SearchHeader';
import { faCalendarCheck, faCalendarDays, faImage, faNoteSticky } from '@fortawesome/free-regular-svg-icons';

const PropertyUpload = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
    const navigate = useNavigate(); // Hook for navigation

    const [open, setOpen] = useState("false"); 

    const [originalPropertyData, setOriginalPropertyData] = useState({
        순번:4,
        사용승인일자:"",  등록일자: '', 부동산구분: '', 거래방식: '', 거래완료여부: '',
        거래완료일자: '', 담당자: '',건물명: '', 상세주소:"", 동: '', 호수: '',
        보증금: 0, 월세: 0, 관리비: 0, 전체m2: 0, 전용m2: 0,
        전체평: 0, 전용평: 0, EV유무: false, 화장실개수: 0, 층수:0, 주차가능대수: 0,
        비밀번호: '',
        연락처:[], 
        메모:"", img_path: "",
        address_id:0
    });
    const [propertyData, setPropertyData] = useState(originalPropertyData);

    const [images, setImages] = useState([]); // State for storing uploaded images
    const [selectedFiles, setSelectedFiles] = useState([]); // Store selected files for upload
    const [memo, setMemo] = useState(''); // State for memo content

    // 부동산구분
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('');

    // 거래방식
    const [transactionMethod, setTransactionMethod] = useState([]);

    // 거래완료여부
    const [transactionStatus, setTransactionStatus] = useState([]);

    // 거래완료여부
    const [toiletsNum, setToiletsNum] = useState([]);

    const contactFieldsMap = {
        매매: ['매도인', '매수인', '부동산'],
        월세: ['임대인', '임차인', '부동산'],
        전세: ['전대인', '전차인', '부동산']
    };
    const contactFields = contactFieldsMap[propertyData.거래방식] || [];  // Get the contact fields based on the transaction method    
    const [isConverted, setIsConverted] = useState(false); // Toggle state to track conversion
    
    useEffect(() => {
        console.log('Updated propertyData:', propertyData);
    }, [propertyData]);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // Make a request to the server to verify the user's token (stored in HTTP-only cookie)
                const response = await axios.get('http://localhost:8000/check-auth', { withCredentials: true });
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
                const propertyType = await axios.get(`http://localhost:8000/property-types`);
                setPropertyTypes(propertyType.data);
    
                const transactionMethod = await axios.get(`http://localhost:8000/transaction-methods`);
                setTransactionMethod(transactionMethod.data);
    
                const transactionStatus = await axios.get(`http://localhost:8000/transaction-status`);
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

    
    const convertM2ToPyeong = (m2) => { return Number((m2 / 3.3058).toFixed(2))} ; // Converts m² to 평
    const convertPyeongToM2 = (pyeong) => {return Number((pyeong * 3.3058).toFixed(2))} // Converts 평 to m²
    
    const calculateTotalAmount = (보증금, 월세, isConverted) => {
        return isConverted
            ? ((parseInt(보증금, 10) + parseInt(월세, 10)) / 10000).toLocaleString()
            : parseInt(보증금, 10) + parseInt(월세, 10);
    }
    
     // Handle input changes
     const handleInputChange = (e, contactType = null) => {
        let { name, type, value } = e.target;
        console.log(name, value);
        let formattedValue;

        // Converting input if necessary
        if (name === 'EV유무') {
            formattedValue = Boolean(value);
        }
        else if (name === "전체m2") {
            formattedValue = Number(value);
            propertyData["전체평"] = convertM2ToPyeong(value); // Convert m² to 평
        } else if (name === "전용m2") {
            formattedValue = Number(value);
            propertyData["전용평"] = convertM2ToPyeong(value); // Convert m² to 평
        } else if (name === "전체평") {
            formattedValue = Number(value);
            propertyData["전체m2"] = convertPyeongToM2(value); // Convert 평 to m²
        } else if (name === "전용평") {
            formattedValue = Number(value);
            propertyData["전용m2"] = convertPyeongToM2(value); // Convert 평 to m²
        }
        else if(type === 'number'){
            formattedValue = value === '' ? 0 : Number(value);
        }
        else {
            formattedValue = value;
        }
        
          if (contactType) {
            // Handle contact-specific updates
            setPropertyData(prevState => ({
            ...prevState,
            연락처: {
                ...prevState.연락처,
                [contactType]: {
                ...prevState.연락처[contactType],
                [name]: formattedValue
                }
            }
            }));
        } else {
            // Handle general property data updates
            setPropertyData({
            ...propertyData,
            [name]: formattedValue
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
        const { 등록일자, 거래완료일자, 비밀번호, 연락처, ...fieldsToUpdate } = propertyData;

        // Set default dates to current date if not provided
        const currentDate = formatDateForMySQL(new Date());
        const formattedFieldsToUpdate = {
            ...fieldsToUpdate,
            등록일자: 등록일자 ? formatDateForMySQL(new Date(등록일자)) : currentDate,
            거래완료일자: 거래완료일자 ? formatDateForMySQL(new Date(거래완료일자)) : currentDate,
            비밀번호: 비밀번호 || "미정", // Default to "미정" if 비밀번호 is not provided
            연락처: typeof 연락처 === 'object' ? JSON.stringify(연락처) : 연락처 // Ensure 연락처 is a string
        };
        
        try {

            const savePropertyPromise = axios.post('http://localhost:8000/properties/update', formattedFieldsToUpdate);

            let uploadImagePromise = Promise.resolve(); // No-op if no images to upload
            if (selectedFiles.length > 0) {
                uploadImagePromise = handleImageUpload(); // Upload images if any selected
            }
    
            // Wait for both promises to complete (save property and upload images)
            await Promise.all([savePropertyPromise, uploadImagePromise]);
    

            alert("Data saved successfully!");
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data');
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    };
    
    // Handle image upload
    const handleImageUpload = async () => {
        if (selectedFiles.length === 0) {
            alert("No files selected for upload.");
            return;
        }
    
        const formData = new FormData();
    
        // Append each file to FormData
        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });
    
        try {
            const response = await axios.post('http://localhost:8000/upload-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
    
            // Get image paths from the response
            const uploadedImages = response.data.images || [];
            setImages(prevImages => [...prevImages, ...uploadedImages]); // Accumulate images
            console.log("uploadedImages: ", uploadedImages);
    
            // Update propertyData with image paths
            setPropertyData(prevData => {
                const existingPaths = prevData.img_path ? prevData.img_path.split(',') : []; // Handle empty img_path
                return {
                    ...prevData,
                    img_path: [...existingPaths, ...uploadedImages].join(',') // Append new image paths
                };
            });
    
            // Clear selected files
            setSelectedFiles([]);
    
            alert("Images uploaded and paths saved successfully!");
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error uploading images');
        }
    };

    const handleClear = (e) => {
        console.log(e.target.name);
        if(e.target.name === "priceClear"){
            setPropertyData(prevState => ({
                ...prevState,
               보증금:0,
               월세:0
            }))
        }else{
            setPropertyData(originalPropertyData)
        }
    }
    

    
console.log(propertyData);
    
    return (
        <main className='gap-y-10 w-full'>
            <SearchHeader/>

            <section className='w-11/12 flexCol gap-y-12'>
                <article className='flexCol items-start gap-y-8 w-full'>
                    <div className='w-full'>

                        <div className="grid grid-cols-3 grid-rows-2 gap-2 h-52 overflow-hidden rounded-xl w-full">
                            {
                                 Array.from({ length: 3 }).map((_, index) => (
                                    images && images[index] ? (
                                        <img
                                            key={index}
                                            src={`http://localhost:8000${images[index]}`}
                                            alt={`Property Image ${index + 1}`} 
                                            className={`w-full h-full object-cover before:content-[""] before:bg-primary ${index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}`}
                                        />
                                    ) : (
                                        <p 
                                            key={index}
                                            className={`bg-secondary-light flexCol mobile_1 ${index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}`}
                                        >
                                            <FontAwesomeIcon icon={faImage}/>
                                        </p>
                                    )
                                ))
                            }
                        </div>

                    </div>
                </article>

                
                {/* 매물상태, 거래유형 */}
                <article className='flexCol  gap-y-8 w-full'>
                    <div className='flexRow gap-x-2 w-full'>
                        <p className='border border-primary-yellow px-1 mobile_5'>매물번호 001</p>
                        <p className='bg-primary-yellow px-5 py-0.5 rounded mobile_4_bold'>{propertyData.부동산구분 ? propertyData.부동산구분:"부동산 구분"}</p>
                    </div>
                    <div className='flexCol w-full'>
                        <input
                            type="text"
                            name="건물명"
                            value={propertyData.건물명}
                            onChange={handleInputChange}
                            placeholder='건물명을 입력하세요'
                            className="bg-secondary-yellow w-full"
                        />
                    </div>
                </article>
            </section>

            <p className='w-11/12 border'></p>

            {/* 거래상태, 매물기본정보, 주소 */}
            <section className='w-full flexCol py-6 gap-y-20'>
                    <article className='w-11/12 flexCol gap-y-8'>
                                <div className="w-full flexCol gap-y-4">
                                    <p className='mobile_3_bold w-full flexRow gap-x-4'><FontAwesomeIcon icon={faHourglass}/>매물상태</p>
                                    <ul className="grid grid-cols-2 w-full gap-x-4">
                                        {transactionStatus.map((option, index) => (
                                            <button
                                                key={index}
                                                name='거래완료여부'
                                                value={option}
                                                onClick={handleInputChange}
                                                className={`w-full cursor-pointer flexCol gap-y-2 text-primary text-center py-6 mobile_3 rounded-lg  ${ option === propertyData.거래완료여부 ? " bg-primary-yellow":" bg-secondary-light"}`}
                                            >
                                            {option === propertyData.거래완료여부 && <FontAwesomeIcon icon={faCircleCheck}/>}
                                            {option}
                                            </button>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flexCol w-full gap-y-4">
                                    <p className='mobile_3_bold w-full flexRow gap-x-4'><FontAwesomeIcon icon={faTag}/>매물유형</p>
                                    <ul className="grid grid-cols-3 w-full gap-x-4">
                                        {propertyTypes.map((option, index) => (
                                            <button
                                                key={index}
                                                name='부동산구분'
                                                value={option}
                                                onClick={handleInputChange}
                                                className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg ${ option === propertyData.부동산구분 ? " bg-primary-yellow":" bg-secondary-light"}`}
                                            >
                                                {option === propertyData.부동산구분 && <FontAwesomeIcon icon={faCircleCheck}/>}
                                                {option}
                                            </button>
                                        ))}
                                        </ul>
                                </div>
                                <div id='거래방식' className="w-full flexCol gap-y-4">
                                    <p className='mobile_3_bold w-full flexRow gap-x-4'><FontAwesomeIcon icon={faTag}/>거래유형</p>
                                    <ul className="grid grid-cols-3 w-full gap-x-4">
                                        {transactionMethod.map((option, index) => (
                                            <button
                                                key={index}
                                                name='거래방식'
                                                value={option}
                                                onClick={handleInputChange}
                                                className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg ${ option === propertyData.거래방식 ? " bg-primary-yellow":" bg-secondary-light"}`}
                                            >
                                            {option === propertyData.거래방식 && <FontAwesomeIcon icon={faCircleCheck}/>}{option}
                                            </button>
                                        ))}
                                    </ul>
                                </div>
                        
                    </article>
                </section>

                <section className='w-full flexCol gap-y-12 bg-primary-yellow py-12'>
                    <p className='mobile_3_bold w-11/12 flexRow gap-x-4'><FontAwesomeIcon icon={faMoneyBills}/>거래금액</p>
                    <article className='w-11/12 flexCol'>
                            
                    {
                        (() => {
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
                                                    type="number"
                                                    min={0}
                                                    name={field}
                                                    value={isConverted ? (propertyData[field]/10000).toLocaleString() : propertyData[field]} // Bind value from state
                                                    onChange={handleInputChange}
                                                    className="bg-white text-primary rounded-full w-10/12"
                                                />
                                                <p>{isConverted ? "만원" : "원"}</p>
                                            </div>
                                            {index === 1 && <p className='w-full border-b border-primary mt-8'></p>}
                                        </div>
                                    ))}
                                 <div className='flexCol items-start w-full gap-y-4'>
                                        <p className=''>전체금액</p>
                                        <div className='flexRow w-full justify-between'>
                                            <input
                                                type="number"
                                                min={0}
                                                value={calculateTotalAmount(propertyData.보증금, propertyData.월세, isConverted)} // Bind value from state
                                                className="bg-white text-primary rounded-full w-10/12"
                                                />
                                            <p>{isConverted ? "만원" : "원"}</p>
                                        </div>
                                 </div>

                                </div>
                            );
                            };

                            // Logic to determine the type of transaction and labels
                            if (propertyData.거래방식 === "매매") {
                            return (
                                <div className='w-full grid grid-rows-2'>
                                    <p className='mobile_3_bold'>매매 금액</p>
                                    <div className='flexRow w-full justify-between'>
                                        <input
                                            type="number"
                                            min={0}
                                            name="보증금"
                                            value={isConverted ? (propertyData.보증금/10000).toLocaleString() : propertyData.보증금} 
                                            onChange={handleInputChange}
                                            className="bg-white text-primary rounded-full w-10/12"
                                        />
                                        <p>{isConverted ? "만원" : "원"}</p>
                                    </div>
                                </div>
                            );
                            } else if (propertyData.거래방식 === "월세") {
                            // For 월세
                                const fields = [
                                   "보증금", "월세"
                                ];
                    
                                return renderFields(fields);

                            } else if (propertyData.거래방식 === "전세") {
                            // For 전세
                                const fields = [
                                    "보증금", "전세"
                                ];
                                return renderFields(fields);
                            }
                        })()
                        }

                   
                    </article>
                    <article className='w-10/12'>
                        <button 
                            className='btn_clear w-full bg-secondary-yellow rounded-full'
                            onClick={()=>setIsConverted(!isConverted)}
                        >
                            <FontAwesomeIcon icon={faMoneyBillTransfer} className='mr-2'/>
                            {isConverted ? "원" : "만원"}
                        </button>
                    </article>
                    <article className='grid grid-rows-2 w-6/12 gap-y-4'>
                        <button className="btn_clear" name='priceClear' onClick={handleClear}>
                            초기화
                        </button>
                        <button type="submit" className="btn_save" onClick={handleSave}>
                            적용하기
                        </button>
                    </article>
                </section>

                <section className='w-11/12 flexCol gap-y-4'>
                        <p className='mobile_3_bold w-full'>매물 기본 정보</p>
                        <article className='inputBox'>
                                <div className='w-full grid grid-rows-3 gap-y-2'>
                                    <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faRulerCombined}/> 공급면적</p>
                                    <div className='flexRow justify-between'>
                                        <input
                                            type="number"
                                            name="전체m2"
                                            min={0}
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
                                            type="number"
                                            name="전체평"
                                            min={0}
                                            value={propertyData.전체평}
                                            onChange={handleInputChange}
                                            className='w-10/12'
                                            placeholder='숫자를 입력하세요'
                                        />
                                        <p className='w-1/12'>평</p>
                                    </div>
                                        
                                </div>
                                <div className='w-full grid grid-rows-3 gap-y-2'>
                                    <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faRulerCombined}/>전용면적 </p>
                                    <div className='flexRow justify-between'>
                                        <input
                                            type="number"
                                            name="전용m2"
                                            min={0}
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
                                            type="number"
                                            name="전용평"
                                            min={0}

                                            value={propertyData.전용평}
                                            onChange={handleInputChange}
                                            className='w-10/12'
                                        />
                                        <p className='w-1/12'>평</p>
                                    </div>
                                </div>
                                <div className='w-full grid grid-rows-2'>
                                        <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faElevator}/>엘레베이터</p>
                                        <div className='w-full grid grid-cols-2 gap-x-8'>
                                        {[true, false].map((bool, index) => {
                                            return (
                                                <button
                                                    key={index}
                                                    name="EV유무"
                                                    className={`flexCol gap-y-2 p-2 rounded py-4 ${
                                                        bool === propertyData.EV유무 ? "bg-primary-yellow" : "bg-secondary-light"
                                                    }`}
                                                    value={bool}
                                                    onClick={() => handleInputChange({ target: { name: "EV유무", value: bool } })} // Pass value explicitly
                                                    >
                                                    {bool === propertyData.EV유무 && <FontAwesomeIcon icon={faCircleCheck} />}
                                                    <p>{bool ? "있음" : "없음"}</p>
                                                </button>
                                            );
                                        })}
                                        </div>
                                </div>

                                <div className='w-full flexRow justify-between'>
                                    <p className='mobile_3_bold flexRow gap-x-2 w-3/12'><FontAwesomeIcon icon={faBuilding}/>건물층</p>
                                    <input
                                        type="number"
                                        name="층수"
                                        min="0"
                                        value={propertyData.층수}
                                        onChange={handleInputChange}
                                        className='w-7/12'
                                    />
                                    <p>층</p>
                                </div>

                                <div className='w-full flexRow justify-between'>
                                    <p className='mobile_3_bold flexRow gap-x-2 w-3/12'><FontAwesomeIcon icon={faCar}/>주차</p>
                                    <input
                                        type="number"
                                        name="주차가능대수"
                                        min="0"
                                        value={propertyData.주차가능대수}
                                        onChange={handleInputChange}
                                        className='w-7/12'
                                    />
                                    <p>대</p>
                                </div>

                                <div className='w-full flexRow justify-between'>
                                    <p className='mobile_3_bold flexRow gap-x-2 w-3/12'><FontAwesomeIcon icon={faDroplet} />화장실</p>
                                    <input
                                        type="number"
                                        name="화장실개수"
                                        min="0"
                                        value={propertyData.화장실개수}
                                        onChange={handleInputChange}
                                        className='w-7/12'
                                    />
                                    <p>개</p>
                                </div>
                                
                                <div className='w-full flexRow justify-between'>
                                    <p className='mobile_3_bold flexRow gap-x-2 w-3/12'><FontAwesomeIcon icon={faKey}/>비밀번호</p>
                                    <input
                                        type="text"
                                        name="비밀번호"
                                        value={propertyData.비밀번호}
                                        onChange={handleInputChange}
                                        className='w-7/12'
                                    />
                                    <p>번</p>
                                </div>
                                <div className='w-full flexRow justify-between'>
                                    <p className='mobile_3_bold flexRow gap-x-2 w-3/12'><FontAwesomeIcon icon={faMoneyBill}/>관리비</p>
                                    <input
                                        type="text"
                                        name="관리비"
                                        value={propertyData.관리비}
                                        onChange={handleInputChange}
                                        className='w-7/12'
                                    />
                                    <p>원</p>
                                </div>
                    </article>
                </section>
        
            <p className='w-11/12 border'></p>

                <section className='w-11/12 flexCol py-6 gap-y-8'>
                    <p className='mobile_3_bold w-full'>주소</p>
                    <article className='inputBox'>
                            <div className='grid grid-rows-2 w-full'>
                                <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faHouse}/>신 주소</p>
                                <div className='w-full'>
                              
                                </div>
                            </div>
                            <div className='grid grid-rows-2 w-full'>
                                <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faHouse}/>구 주소</p>
                                <div className='w-full'>
                                
                                </div>
                            </div>
                            <div className='grid grid-rows-2 w-full'>
                                <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faHouse}/>동 / 호수</p>
                                <div className='w-full grid grid-cols-2 justify-between gap-x-8'>
                                    <div className='flexRow gap-x-2'>
                                        <input
                                            type="text"
                                            name="동"
                                            value={propertyData.동}
                                            onChange={handleInputChange}
                                            className='w-11/12'
                                        />동
                                    </div>
                                    <div className='flexRow gap-x-2'>
                                        <input
                                            type="text"
                                            name="호수"
                                            value={propertyData.호수}
                                            onChange={handleInputChange}
                                            className='w-11/12'
                                        />호
                                    </div>
                                </div>
                        </div>
                    </article>
                </section>

                <section className='w-11/12 flexCol py-6 gap-y-8'>
                    <p className='mobile_3_bold w-full'>연락처 정보</p>
                    <article className='inputBox'>
                    { contactFields.length>0 ? (
                    contactFields.map((contactType, index) => (
                            <div key={index} className='flexCol gap-y-6 w-full items-start'>
                                <p className='mobile_3_bold flexRow gap-x-2'>
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    {contactType}
                                </p>
                                <div className="flexCol gap-y-3 w-full">
                                    <input
                                        type="text"
                                        name="이름"
                                        value={propertyData.연락처[contactType]?.이름 || ''}
                                        onChange={(e) => handleInputChange(e, contactType)}
                                        placeholder={`${contactType} 이름을 입력하세요`}
                                        className="w-full"
                                    />
                                    <input
                                        type="text"
                                        name="전화번호"
                                        value={propertyData.연락처[contactType]?.전화번호 || ''}
                                        onChange={(e) => handleInputChange(e, contactType)}
                                        placeholder={`${contactType} 전화번호를 입력하세요`}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        ))) : (
                            <a href="#거래방식" className='bg-primary-yellow p-4 rounded-xl hover:bg-secondary-light'>거래방식을 선택하세요</a>
                        )
                    }


                    </article>
                </section>

            <p className='w-11/12 border'></p>

                <section className='w-11/12 flexCol py-6 gap-y-8'>
                    <p className='mobile_3_bold w-full'>등록 / 기타 정보</p>
                    <article className='inputBox'>
                        <div className='flexRow w-full justify-between'>
                            <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faCalendarCheck}/>거래완료</p>
                            <input
                                type="date"
                                name="거래완료일자"
                                value={propertyData.거래완료일자 ? propertyData.거래완료일자.split('T')[0] : ''}
                                onChange={handleInputChange}
                                className="w-8/12"
                            />
                        </div>
                        <div className='flexRow w-full justify-between'>
                            <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faCalendarDays}/>사용승인</p>
                            <input
                                type="date"
                                name="사용승인일자"
                                value={propertyData.사용승인일자 ? propertyData.사용승인일자.split('T')[0] : ''}
                                onChange={handleInputChange}
                                className="w-8/12"
                            />
                        </div>
                        <div className='flexRow w-full justify-between'>
                            <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faCalendarDays}/>등록일자</p>
                            <input
                                type="date"
                                name="등록일자"
                                value={propertyData.등록일자 ? propertyData.등록일자.split('T')[0] : ''}
                                onChange={handleInputChange}
                                className="w-8/12"
                            />
                        </div>

                        <div className='w-full grid grid-rows-2'>
                            <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faImage}/>매물사진</p>
                            <div className='flexRow justify-between'>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleImageChange}
                                    className="w-9/12"
                                />
                                <button onClick={handleImageUpload} className="bg-primary-yellow text-primary px-4 py-2 h-full rounded mobile_3_bold">
                                    업로드
                                </button>
                            </div>
                        </div>
                        <div className='w-full flexCol items-start'>
                            <p className='mobile_3_bold flexRow gap-x-2 pb-2'><FontAwesomeIcon icon={faNoteSticky}/>메모</p>
                            <textarea
                                type="textarea"
                                rows="5"
                                name='메모'
                                value={propertyData.메모}
                                onChange={handleInputChange}
                                placeholder='메모를 입력하세요'
                                className="w-full"
                            ></textarea>
                        </div>
                    </article>
                </section>


                
                <section className='w-8/12 mb-16'>
                    <article className='grid grid-rows-2 w-full gap-y-4'>
                        <button className="btn_clear" onClick={handleClear}>
                            초기화
                        </button>
                        <button type="submit" className="btn_save" onClick={handleSave}>
                            적용하기
                        </button>
                    </article>
                </section>
        </main>
    );
};

export default PropertyUpload;
