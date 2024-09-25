import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// import MapComponent from '../components/feature/MapComponent';
// import ListingHeader from '../components/feature/ListingHeader';
import Memo from '../components/feature/Memo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag,faHourglass,faMoneyBills,faRulerCombined,faBuilding, faCar, faKey, faMoneyBill, faCalendarCheck, faCalendarDays,faImage, faNoteSticky, faCircleCheck, faElevator, faHouse, faParking, faToilet } from '@fortawesome/free-solid-svg-icons';

const PropertyDetail = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state for checking authentication
    const location = useLocation();
    const { propertyId } = location.state || {};
    const [isEditing, setIsEditing] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isImgUploaded, setIsImgUploaded] = useState();

    const [propertyTypes, setPropertyTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('');

    const [transactionMethod, setTransactionMethod] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');

    const [transactionStatus, setTransactionStatus] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const initialPropertyData = {
        등록일자: '', 부동산구분: '', 거래방식: '', 거래완료여부: '',
        거래완료일자: '', 담당자: '', 구: '', 읍면동: '', 구상세주소: '',
        도로명: '', 신상세주소: '', 건물명: '', 동: '', 호수: '',
        보증금: 0, 월세: 0, 관리비: 0, 전체m2: 0, 전용m2: 0,
        전체평: 0, 전용평: 0, EV유무: false, 화장실개수: 0, 주차가능대수: 0,
        비밀번호: '', 이름: '', 휴대폰번호: '', 기타특이사항: '', img_path: "",
        정산금액: {
            총수수료: 0,
            소장: 0,
            직원: [
                { name: "직원1", money: 0 },
                { name: "직원2", money: 0 }
            ]
        }
    };
    const [propertyData, setPropertyData] = useState(initialPropertyData)


    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axios.get('http://localhost:8000/check-auth', { withCredentials: true });
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
            const response = await axios.get(`http://localhost:8000/detail/${propertyId}`);
            const fetchedData = response.data;

            // Parse 정산금액 if it's a JSON string
            if (typeof fetchedData.정산금액 === 'string') {
                fetchedData.정산금액 = JSON.parse(fetchedData.정산금액);
            }

            setPropertyData(fetchedData);
            
            const propertyType = await axios.get(`http://localhost:8000/property-types`);
            setPropertyTypes(propertyType.data);

            const transactionMethod = await axios.get(`http://localhost:8000/transaction-methods`);
            setTransactionMethod(transactionMethod.data);

            const transactionStatus = await axios.get(`http://localhost:8000/transaction-status`);
            setTransactionStatus(transactionStatus.data);

            const imgRes = await axios.get(`http://localhost:8000/properties/${propertyId}/images`);
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

    const convertM2ToPyeong = (m2) => { return Number((m2 / 3.3058).toFixed(2))} ; // Converts m² to 평
    const convertPyeongToM2 = (pyeong) => {return Number((pyeong * 3.3058).toFixed(2))} // Converts 평 to m²
    
    const handleInputChange = (e) => {
        let { name, type, value, checked } = e.target;
        
        // Ensure numeric values are handled correctly
        if (type === 'number') {
            value = value !== '' ? Number(value) : ''; // Convert to number if the value is not an empty string
        }
    
        console.log(name, typeof value); // Log for debugging the type
    
        let formattedValue;
    
        if (name === "전체m2") {
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
        } else {
            formattedValue = value;
        }

        setPropertyData({
            ...propertyData,
            [name]: formattedValue
        });
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/delete-property/${propertyId}`);
            console.log("Property deleted successfully.");
        } catch (error) {
            console.error('Error deleting property:', error.response ? error.response.data : error.message);
            alert('Error deleting property.');
        }
    };

    const handleSave = async () => {
        try {
            const { 등록일자, 거래완료일자, 정산금액, ...fieldsToUpdate } = propertyData;
            const formattedFieldsToUpdate = {
                ...fieldsToUpdate,
                등록일자: new Date(등록일자).toISOString().split('T')[0],
                거래완료일자: new Date(거래완료일자).toISOString().split('T')[0],
                정산금액 : JSON.stringify(정산금액)
            };
            console.log(formattedFieldsToUpdate);
            await axios.put(`http://localhost:8000/update-property/${propertyId}`, formattedFieldsToUpdate);
            alert("Data saved successfully!");
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
            const response = await axios.post(`http://localhost:8000/upload-images/${propertyId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Images uploaded successfully!");
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

    const formatPrice = (price) => {
        return (price / 10000); // Divide by 10,000 and add commas
      };

    console.log(propertyData);

    const handleClearAll = (which) => {
        if(which === "ClearPrice"){
            setPropertyData((prevData) => ({
                ...prevData,             
                보증금: initialPropertyData.보증금,   // Reset to initial value
                월세: initialPropertyData.월세,       // Reset to initial value
                관리비: initialPropertyData.관리비,   // Reset to initial value
            }));
        }else{
            setPropertyData(initialPropertyData)
        }
    };


    return (
        <main className='w-full gap-y-8 '>
            {/* <ListingHeader/> */}

            <section className='w-11/12 flexCol gap-y-12'>
                <article className='flexCol items-start gap-y-8'>
                    <div className='w-full'>

                        <div className="grid grid-cols-3 grid-rows-2 h-52 overflow-hidden rounded-xl">
                            {
                                  images && images.length > 0 ? (
                                    images.map((imgPath, index) => (
                                        <img 
                                            key={index}
                                            src={`http://localhost:8000${imgPath}`}
                                            alt={`Property Image ${index + 1}`} 
                                            className={`w-full h-full object-cover before:content-[""] before:bg-primary ${index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}`}
                                        />
                                    ))
                                ) : (
                                    <p className="w-full h-full flex justify-center items-center text-secondary">
                                        No images available
                                    </p>
                                )
                            }
                        </div>

                    </div>
                </article>

                
                {/* 매물상태, 거래유형 */}
                <article className='w-full grid grid-rows-2 h-24'>
                <div className='flexRow gap-x-2'>
                        <p className='border border-primary-yellow px-1 mobile_5'>매물번호 00{propertyData.순번}</p>
                        <p className='bg-primary-yellow px-5 py-0.5 rounded mobile_4_bold'>{propertyData.부동산구분}</p>
                    </div>
                    <div className='flexCol justify-end items-start'>
                        <h1 className=''>
                            <input
                                type="text"
                                name="건물명"
                                value={propertyData.건물명}
                                onChange={handleInputChange}
                                className=""
                            />
                        </h1>
                    </div>
                </article>
            </section>

            <p className='w-11/12 border'></p>

            {/* 거래상태, 매물기본정보, 주소 */}
            <section className='w-full flexCol py-6 gap-y-20'>
                    <article className='w-11/12 flexCol gap-y-8'>
                                <div className="w-full flexCol gap-y-4">
                                    <p className='mobile_3_bold w-full flexRow gap-x-4'><FontAwesomeIcon icon={faTag}/>매물상태</p>
                                    <ul className="grid grid-cols-2 w-full gap-x-4">
                                        {transactionStatus.map((option, index) => (
                                            <button
                                                key={index}
                                                name='거래완료여부'
                                                value={option}
                                                onClick={handleInputChange}
                                                className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg  ${ option === propertyData.거래완료여부 ? " bg-primary-yellow":" bg-secondary-light"}`}
                                            >
                                            {option === propertyData.거래완료여부 && <FontAwesomeIcon icon={faCircleCheck} className='bg-white rounded-full'/>}{option}
                                            </button>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flexCol w-full gap-y-4">
                                    <p className='mobile_3_bold w-full flexRow gap-x-4'><FontAwesomeIcon icon={faTag}/>매물유형</p>
                                    <ul className="grid grid-cols-3 w-full gap-4">
                                        {propertyTypes.map((option, index) => (
                                            <button
                                                key={index}
                                                name='부동산구분'
                                                value={option}
                                                onClick={handleInputChange}
                                                className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg ${ option === propertyData.부동산구분 ? " bg-primary-yellow":" bg-secondary-light"}`}
                                            >
                                                {option === propertyData.부동산구분 && <FontAwesomeIcon icon={faCircleCheck} className='bg-white rounded-full'/>}{option}
                                            </button>
                                        ))}
                                        </ul>
                                </div>
                                <div className="w-full flexCol gap-y-4">
                                    <p className='mobile_3_bold w-full flexRow gap-x-4'><FontAwesomeIcon icon={faHourglass}/>거래유형</p>
                                    <ul className="grid grid-cols-3 w-full gap-x-4">
                                        {transactionMethod.map((option, index) => (
                                            <button
                                                key={index}
                                                name='거래방식'
                                                value={option}
                                                onClick={handleInputChange}
                                                className={`w-full flexCol gap-y-2 cursor-pointer text-primary text-center py-6 mobile_3 rounded-lg ${ option === propertyData.거래방식 ? " bg-primary-yellow":" bg-secondary-light"}`}
                                            >
                                            {option === propertyData.거래방식 && <FontAwesomeIcon icon={faCircleCheck} className='bg-white rounded-full'/>}{option}
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
                                    <p className='mobile_3_bold'>{fields[1].name} 금액</p>
                                {fields.map((field, index) => (
                                    <div key={index} className='w-full grid grid-rows-2'>
                                        <p className=''>{field.label}</p>
                                        <div className='flexRow w-full justify-between'>
                                            <input
                                            type="number"
                                            name={field.name}
                                            value={propertyData[field.label]}
                                            onChange={handleInputChange}
                                            className="bg-white text-primary rounded-full w-10/12"
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
                            if (propertyData.거래방식 === "매매" || propertyData.거래방식 ==="") {
                            return (
                                <div className='w-full grid grid-rows-2'>
                                <p className='mobile_3_bold'>매매 금액</p>
                                <div className='flexRow w-full justify-between'>
                                    <input
                                        type="number"
                                        name="보증금"
                                        value={propertyData.보증금}
                                        onChange={handleInputChange}
                                        className="bg-white text-primary rounded-full w-10/12"
                                    />
                                    <p>원</p>
                                </div>
                                </div>
                            );
                            } else if (propertyData.거래방식 === "월세") {
                            // For 월세
                                const fields = [
                                    { label: "보증금", name: "보증금" },
                                    { label: "월세", name: "월세" },
                                    { label: "전체금액", name: "전체금액" },
                                ];
                                return renderFields(fields);

                            } else if (propertyData.거래방식 === "전세") {
                            // For 전세
                                const fields = [
                                    { label: "보증금", name: "보증금" },
                                    { label: "전세", name: "전세" },
                                    { label: "전체금액", name: "전체금액" },
                                ];
                                return renderFields(fields);
                            }
                        })()
                        }

                   
                    </article>
                    <article className='grid grid-rows-2 w-6/12 gap-y-4'>
                        <button type="submit" className="btn_clear" onClick={()=>handleClearAll("ClearPrice")}>
                            초기화
                        </button>
                        <button type="submit" className="btn_save" onClick={handleSave}>
                            적용하기
                        </button>
                    </article>
                </section>

                <section className='w-full flexCol'>
                    <article className='w-11/12 flexCol gap-y-8 items-start'>
                            <p className='mobile_3_bold w-full'>매물 기본 정보</p>
                                <div className='w-full grid grid-rows-3 gap-y-2'>
                                    <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faRulerCombined}/> 공급면적</p>
                                    <div className='flexRow justify-between'>
                                        <input
                                            type="number"
                                            name="전체m2"
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
                                            value={propertyData.전체평}
                                            onChange={handleInputChange}
                                            className='w-10/12'
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
                                            <button
                                                name="EV유무"
                                                className={`flexCol gap-y-1 p-2 rounded py-4 ${propertyData.EV유무 ==="true" ? " bg-primary-yellow":" bg-secondary-light"}`}
                                                value={true}
                                                onClick={(e)=>handleInputChange(e)}
                                            >
                                                {propertyData.EV유무 === "true" && <FontAwesomeIcon icon={faCircleCheck} className='bg-white rounded-full'/>}
                                                <p>있음</p>
                                            </button>
                                            <button
                                                name="EV유무"
                                                className={`flexCol gap-y-1 p-2 rounded py-4 ${propertyData.EV유무 ==="false" ? " bg-primary-yellow":" bg-secondary-light"}`}
                                                value={false}
                                                onClick={(e)=>handleInputChange(e)}
                                            >
                                                {propertyData.EV유무 === "false" && <FontAwesomeIcon icon={faCircleCheck} className='bg-white rounded-full'/>}
                                                <p>없음</p>
                                            </button>
                                        </div>
                                </div>

                                <div className='w-full flexRow justify-between'>
                                    <p className='mobile_3_bold flexRow gap-x-2 w-3/12'><FontAwesomeIcon icon={faBuilding}/>건물층</p>
                                    <input
                                        type="number"
                                        name="건물층"
                                        value={propertyData.주차가능대수}
                                        // placeholder='숫자를 입력하세요'
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
                                        value={propertyData.주차가능대수}
                                        min="0"
                                        onChange={handleInputChange}
                                        className='w-7/12'
                                    />
                                    <p>대</p>
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
                                    <p className='opacity-0'>번</p>
                                </div>
                                <div className='w-full flexRow justify-between'>
                                    <p className='mobile_3_bold flexRow gap-x-2 w-3/12'><FontAwesomeIcon icon={faMoneyBill}/>관리비</p>
                                    <input
                                        type="number"
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

                <section className='w-full flexCol py-6 gap-y-8'>
                    <p className='mobile_1 w-11/12'>주소</p>
                    <article className='w-11/12 flexCol gap-y-4'>
                            <div className='grid grid-rows-2 w-full'>
                                <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faHouse}/>신 주소</p>
                                <div className='w-full'>
                                    <input
                                        type="text"
                                        name="도로명"
                                        value={propertyData.도로명}
                                        onChange={handleInputChange}
                                        className=" w-1/2"
                                    />
                                    <input
                                        type="text"
                                        name="신상세주소"
                                        value={propertyData.신상세주소}
                                        onChange={handleInputChange}
                                        className=" w-1/2"
                                    />
                                </div>
                            </div>
                            <div className='grid grid-rows-2 w-full'>
                                <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faHouse}/>구 주소</p>
                                <div className='w-full'>
                                    <input
                                        type="text"
                                        name="구"
                                        value={propertyData.구}
                                        onChange={handleInputChange}
                                        className="w-1/3"
                                    />
                                    <input
                                        type="text"
                                        name="읍면동"
                                        value={propertyData.읍면동}
                                        onChange={handleInputChange}
                                        className="w-1/3"
                                    />
                                    <input
                                        type="text"
                                        name="구상세주소"
                                        value={propertyData.구상세주소}
                                        onChange={handleInputChange}
                                        className="w-1/3"
                                    />
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

            <p className='w-11/12 border'></p>

                <section className='w-11/12 flexCol py-6 gap-y-8'>
                    <p className='mobile_1 w-full'>등록 / 기타 정보</p>
                    <article className='flexCol w-full  gap-y-6'>
                        <div className='flexRow w-full justify-between'>
                            <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faCalendarCheck}/>등록일자</p>
                            <input
                                type="date"
                                name="등록일자"
                                value={propertyData.등록일자 ? propertyData.등록일자.split('T')[0] : ''}
                                onChange={handleInputChange}
                                className="w-9/12"
                            />
                        </div>
                        <div className='flexRow w-full justify-between'>
                            <p className='mobile_3_bold flexRow gap-x-2'><FontAwesomeIcon icon={faCalendarDays}/>사용승인</p>
                            <input
                                type="date"
                                name="거래완료일자"
                                value={propertyData.거래완료일자 ? propertyData.거래완료일자.split('T')[0] : ''}
                                onChange={handleInputChange}
                                className="w-9/12"
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
                                value={propertyData.메모}
                                onChange={handleImageChange}
                                className="w-full"
                            ></textarea>
                        </div>
                    </article>
                </section>
                
                     
                <section className='w-8/12'>
                    <article className='grid grid-rows-2 w-full gap-y-4'>
                        <button type="submit" className="btn_clear" onClick={()=>handleClearAll("ClearAll")}>
                            초기화
                        </button>
                        <button type="submit" className="btn_save">
                            적용하기
                        </button>
                        <button onClick={handleDelete} className="text-primary-yellow">
                            매물 삭제하기
                        </button>
                    </article>
                </section>


{/* <section> */}

    {/* Buttons */}
    {/* <article className='w-10/12'>
        <div className='grid grid-cols-2'>
            {isAuthenticated && (
                <>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="bg-primary-yellow text-primary font-bold px-4 py-2 rounded-full">
                                적용하기
                            </button>
                            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded ml-4">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="bg-secondary-light text-primary font-bold px-4 py-2 rounded-full">
                                Edit
                            </button>
                            <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded ml-4">
                                Delete Property
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    </article>
</section> */}

            <Memo propertyId={propertyId} />
        </main>
    );
};

export default PropertyDetail;