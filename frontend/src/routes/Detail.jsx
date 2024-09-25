import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// import MapComponent from '../components/feature/MapComponent';
// import ListingHeader from '../components/feature/ListingHeader';
import Memo from '../components/feature/Memo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsLeftRightToLine, faElevator, faHouse, faParking, faToilet } from '@fortawesome/free-solid-svg-icons';

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

    const [propertyData, setPropertyData] = useState({
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
    });

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
            setTransactionMethod(transactionStatus.data);

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


    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const formattedValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
        setPropertyData({ ...propertyData, [name]: formattedValue });

        if (name === '부동산구분') {
            setSelectedType(value);  // Handle the dropdown selection
        }

        if (name === '거래방식') {
            setTransactionMethod(value);  // Handle the dropdown selection
        }

        if (name === '거래완료여부') {
            setTransactionStatus(value);  // Handle the dropdown selection
        }
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

    return (
        <main className='w-full gap-y-8 '>
            {/* <ListingHeader/> */}

            <section className='flexCol gap-y-10 w-11/12'>

                <article className='flexCol items-start gap-y-10 w-full'>
                    {/* Image */}
                    <div className='w-full'>
                            {isEditing && (
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleImageChange}
                                        className="images border p-2"
                                    />
                                    <button onClick={handleImageUpload} className="bg-primary-yellow text-white px-4 py-2 rounded mt-2">
                                        Upload Images
                                    </button>
                                </div>
                            )}
                            <div className="grid grid-cols-3 grid-rows-2 gap-1 h-52 lg:h-96 overflow-hidden rounded-xl">
                                {
                                    images && images.length > 0 &&
                                    images.map((imgPath, index) => (
                                    <img 
                                        key={index}
                                        src={`http://localhost:8000${imgPath}`}
                                        alt={`Property Image ${index + 1}`} 
                                        className={`w-full h-full object-cover ${index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}`}
                                        />
                                    ))
                                }
                            </div>
                        </div>

                        {/* 거래유형, 부동산구분, 금액, 등록일자  */}
                        <div className=' w-full flexRow justify-between'>
                            <div className='flexCol items-start gap-y-4 w-2/3'>
                                        <span className='text-sm  border px-2 border-2 border-primary-yellow font-bold'>매물번호 00{propertyData.순번}</span>
                                <div className=''>
                                    {isEditing ? (
                                        <div className='flexRow gap-x-2'>
                                            <select name="거래방식" value={selectedMethod} onChange={handleInputChange}>
                                                <option value="">거래방식</option>
                                                {transactionMethod.map((method) => (
                                                    <option key={method} value={method}>{method}</option>
                                                ))}
                                            </select>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="보증금"
                                                    value={propertyData.보증금}
                                                    onChange={handleInputChange}
                                                    className="w-1/3"
                                                /> / 
                                                <input
                                                    type="text"
                                                    name="월세"
                                                    value={propertyData.월세}
                                                    onChange={handleInputChange}
                                                    className="w-1/3"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flexRow gap-x-2 mobile_1_bold'>
                                            <p>{propertyData.거래방식}</p>
                                            <p>{formatPrice(propertyData.보증금)} / {formatPrice(propertyData.월세)}</p>
                                        </div>
                                    )}
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="건물명"
                                            value={propertyData.건물명}
                                            onChange={handleInputChange}
                                            className=""
                                        />
                                    ) : (
                                        <h1>{propertyData.건물명}</h1>
                                    )}
                                </div>

                                <div className='flexRow'>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="등록일자"
                                            value={propertyData.등록일자 ? propertyData.등록일자.split('T')[0] : ''}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                    ) : (
                                        <p className='mobile_3 text-secondary'>{propertyData.등록일자.split('T')[0]}</p>
                                    )}
                                </div>
                            </div>
                            <div className='flexCol w-1/3 '>
                                {isEditing ? (
                                     <select id="propertyType" name='부동산구분' value={selectedType} onChange={handleInputChange}>
                                        <option value="">부동산구분</option>
                                        {propertyTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                    
                                ) : (
                                    <p className='bg-primary-yellow rounded-xl px-6 py-5 mobile_3_bold'>{propertyData.부동산구분}</p>
                                )}
                            </div>
                        </div>
                    </article>

                    <p className='w-full border'></p>

                    <article className='w-full flexCol items-start gap-y-2'>
                        {/* 주소 */}
                        <div>
                            <FontAwesomeIcon icon={faHouse}/>
                            <div className='flexRow gap-x-1'>
                                <p>구 주소:</p>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            name="구"
                                            value={propertyData.구}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                        <input
                                            type="text"
                                            name="읍면동"
                                            value={propertyData.읍면동}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                        <input
                                            type="text"
                                            name="구상세주소"
                                            value={propertyData.구상세주소}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <p>{propertyData.구} {propertyData.읍면동} {propertyData.구상세주소}</p>
                                    </>
                                )}
                            </div>
                            <div className='flexRow gap-x-1'>
                                <p>신 주소:</p>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            name="도로명"
                                            value={propertyData.도로명}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                        <input
                                            type="text"
                                            name="신상세주소"
                                            value={propertyData.신상세주소}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <p>{propertyData.도로명} {propertyData.신상세주소}</p>
                                    </>
                                )}
                            </div>
                        </div> 

                        {/* 화장실, 주차장 */}
                        <div className='flexRow justify-between w-full'>
                            <div className='flexRow'>
                                <FontAwesomeIcon icon={faToilet}/>
                                {isEditing ? (
                                        <input
                                            type="number"
                                            name="화장실개수"
                                            value={propertyData.화장실개수}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                ) : (
                                    <p>{propertyData.화장실개수}</p>
                                )}
                            </div>
                            <div className='flexRow'>
                                    <FontAwesomeIcon icon={faParking}/>
                                    {isEditing ? (
                                            <input
                                                type="number"
                                                name="주차가능대수"
                                                value={propertyData.주차가능대수}
                                                onChange={handleInputChange}
                                                className="border p-1"
                                            />
                                    ) : (
                                        <p>{propertyData.주차가능대수}</p>
                                    )}
                            </div>
                        </div>

                        {/* 면적 */}
                        <div className='flexRow'>
                            <div className='flexRow'>
                                <FontAwesomeIcon icon={faArrowsLeftRightToLine}/>
                                <p>면적(m2): </p>
                                {isEditing ? (
                                    <>
                                        전체<input
                                            type="text"
                                            name="전체m2"
                                            value={propertyData.전체m2}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />m2
                                        전용<input
                                            type="text"
                                            name="전용m2"
                                            value={propertyData.전용m2}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />m2
                                    </>
                                ) : (
                                    <>
                                        <p>{propertyData.전체m2}m2 {propertyData.전용m2}m2</p>
                                    </>
                                )}
                            </div>
                            <div className='flexRow'>
                                <p>면적(평): </p>
                                    {isEditing ? (
                                        <>
                                            전체<input
                                                type="text"
                                                name="전체평"
                                                value={propertyData.전체평}
                                                onChange={handleInputChange}
                                                className="border p-1"
                                            />평
                                            전용<input
                                                type="text"
                                                name="전용평"
                                                value={propertyData.전용평}
                                                onChange={handleInputChange}
                                                className="border p-1"
                                            />평
                                        </>
                                    ) : (
                                        <>
                                            <p>{propertyData.전체평}평 {propertyData.전용평}평</p>
                                        </>
                                    )}
                            </div>
                        </div>

                        {/* 거래완료, 거래일자 */}
                        <div className='w-full flexRow justify-between'>
                            <div className='flexRow'>
                                <p>거래 완료 여부:</p>
                                {isEditing ? (
                                    <select name='거래완료여부'  value={selectedStatus} onChange={handleInputChange}>
                                        <option value="">거래 상태</option>
                                        {transactionStatus.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                     </select>
                                ) : (
                                    <p>{propertyData.거래완료여부}</p>
                                )}
                            </div>
                            <div className='flexRow'>
                                <p>거래완료일자:</p>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="거래완료일자"
                                        value={propertyData.거래완료일자 ? propertyData.거래완료일자.split('T')[0] : ''}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                                ) : (
                                    <p>{propertyData.거래완료일자.split('T')[0]}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* 관리비, EV유무 */}
                        <div className='w-full flexRow justify-between'>
                            <div className='flexRow'>
                                <FontAwesomeIcon icon={faElevator}/>
                                {isEditing ? (
                                        <input
                                            type="checkbox"
                                            name="유무"
                                            value={propertyData.EV유무}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                ) : (
                                    <p>{propertyData.EV유무 ? "있음" : '없음'}</p>
                                )}
                            </div>
                            <div className='flexRow justify-between text-yellow'>
                                <p>관리비</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="관리비"
                                        value={propertyData.관리비}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                                ) : (
                                    <p>{propertyData.관리비}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* 동 호수 */}
                        <div className='flexRow'>
                                <p>동호수: </p>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            name="동"
                                            value={propertyData.동}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />동
                                        <input
                                            type="text"
                                            name="호수"
                                            value={propertyData.호수}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />호수
                                    </>
                                ) : (
                                    <>
                                        <p>{propertyData.동}동 {propertyData.호수}호수</p>
                                    </>
                                )}
                        </div>
                   
                        <div className='flexRow'>
                                <p>비밀번호: </p>
                                {isEditing ? (
                                        <input
                                            type="number"
                                            name="비밀번호"
                                            value={propertyData.비밀번호}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                ) : (
                                    <p>숨김</p>
                                )}
                        </div>
                        <div className='flexRow'>
                                {isEditing ? (
                                    <>
                                        이름<input
                                            type="text"
                                            name="이름"
                                            value={propertyData.이름}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                        휴대폰번호<input
                                            type="text"
                                            name="휴대폰번호"
                                            value={propertyData.휴대폰번호}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                    </>
                                ) : (
                                    <p>이름 : {propertyData.이름} 휴대폰번호: {propertyData.휴대폰번호}</p>
                                )}
                        </div>
                        <div className='w-full'>
                            <h2>정산금액</h2>
                                <div className='flexRow justify-between text-yellow'>
                                    <p>총수수료</p>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="총수수료"
                                            value={propertyData.정산금액.총수수료}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                    ) : (
                                        <p>{propertyData.정산금액.총수수료}</p>
                                    )}
                                </div>

                                <div className='flexRow justify-between text-yellow'>
                                    <p>소장</p>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="소장"
                                            value={propertyData.정산금액.소장}
                                            onChange={handleInputChange}
                                            className="border p-1"
                                        />
                                    ) : (
                                        <p>{propertyData.정산금액.소장}</p>
                                    )}
                                </div>

                            {/* Render 직원 array dynamically */}
                            <div className='flexRow justify-between text-yellow'>
                                <p>직원</p>
                                {propertyData.정산금액.직원.map((employee, index) => (
                                    <div key={index} className='flexRow'>
                                        <p>{employee.name}</p> {/* Display employee name */}
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name={`직원-${index}`}
                                                value={employee.money}
                                                onChange={(e) => handleEmployeeInputChange(e, index)}  // Handle input change for 직원 array
                                                className="border p-1"
                                            />
                                        ) : (
                                            <p>{employee.money}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                        </div>
                    </article>

                    <p className='w-full border'></p>

                    {/* buttons */}
                    <article className='w-10/12'>
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
            </section>
            <Memo propertyId={propertyId} />
        </main>
    );
};

export default PropertyDetail;