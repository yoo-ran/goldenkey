import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import MapComponent from '../components/feature/MapComponent';
import ContactSide from '../components/feature/ContactSide';
import Images from '../components/feature/importImg';
import ListingHeader from '../components/feature/ListingHeader';
import Memo from '../components/feature/Memo';

const PropertyDetail = () => {
    const location = useLocation();
    const { propertyId } = location.state || {}; // Assuming propertyId is passed in location.state

    // State for raw numbers
    const [propertyData, setPropertyData] = useState({
        순번: '', 등록일자: '', 부동산구분: '', 거래방식: '', 거래완료여부: '',
        거래완료일자: '', 담당자: '', 구: '', 읍면동: '', 구상세주소: '',
        도로명: '', 신상세주소: '', 건물명: '', 동: '', 호수: '',
        보증금: 0, 월세: 0, 관리비: 0, 전체m2: 0, 전용m2: 0,
        전체평: 0, 전용평: 0, EV유무: false, 화장실개수: 0, 주차가능대수: 0,
        비밀번호: '', 이름: '', 휴대폰번호: '', 기타특이사항: '', 총수수료: 0,
        소장: 0, 직원: 0
    });
    const [isEditing, setIsEditing] = useState(false); // State for edit mode

    // Fetch property data from the API
    const fetchPropertyData = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/detail/${propertyId}`);
            setPropertyData(response.data);
        } catch (error) {
            console.error('Error fetching property data:', error);
        }
    };

    useEffect(() => {
        fetchPropertyData(); // Fetch data on component mount
    }, [propertyId]);

    const formatDateForMySQL = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format number with commas
    const formatNumber = (number) => {
        return Number(number).toLocaleString();
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        let formattedValue;

        if (type === 'checkbox') {
            formattedValue = checked ? 1 : 0;
        } else if (type === 'number') {
            formattedValue = parseFloat(value.replace(/,/g, '')) || 0;
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
            // Handle successful deletion, e.g., navigate away or update state
        } catch (error) {
            console.error('Error deleting property:', error.response ? error.response.data : error.message);
            alert('Error deleting property.');
        }
    };

    // Save data to the database
    const handleSave = async () => {
        try {
            // Use propertyId from outer scope
            const { 등록일자, 거래완료일자, ...fieldsToUpdate } = propertyData;
    
            const formattedFieldsToUpdate = {
                ...fieldsToUpdate,
                등록일자: formatDateForMySQL(new Date(등록일자)),
                거래완료일자: formatDateForMySQL(new Date(거래완료일자))
            };
    
            await axios.put(`http://localhost:8000/update-property/${propertyId}`, formattedFieldsToUpdate);
            alert("Data saved successfully!");
    
            fetchPropertyData();
            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    // Toggle edit mode
    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    return (
        <main className='gap-y-16 w-1/2'>
            <ListingHeader/>

            <section className='grid grid-cols-12 justify-between gap-x-10 w-full'>
                <article className='col-span-8 flexCol items-start gap-y-10'>
                    <div className='flexCol items-start gap-y-5'>
                        <p className='text-sm border px-2 rounded-full'>ID Number: {propertyData.순번}</p>
                        
                        <div className='flexRow'>
                            <p>등록일자:</p>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="등록일자"
                                    value={propertyData.등록일자 ? propertyData.등록일자.split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{propertyData.등록일자.split('T')[0]}</p>
                            )}
                        </div>
                        
                        <h1>
                            <label>건물명: </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="건물명"
                                    value={propertyData.건물명}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{propertyData.건물명}</p>
                            )}
                        </h1>
                        
                        <div className='flexRow'>
                            <p>부동산구분:</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="부동산구분"
                                    value={propertyData.부동산구분}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{propertyData.부동산구분}</p>
                            )}
                        </div>
                        
                        <div className='flexRow'>
                            <p>거래 방식:</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="거래방식"
                                    value={propertyData.거래방식}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{propertyData.거래방식}</p>
                            )}
                        </div>
                        
                        <div className='flexRow'>
                            <p>거래 완료 여부:</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="거래완료여부"
                                    value={propertyData.거래완료여부}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
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
                        <div className='flexRow'>
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
                        <div className='flexRow'>
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
                        
                        
                    </div>

                    <div className='w-full'>
                        <h2>금액</h2>
                        <div className='flexRow justify-between text-yellow'>
                            <p>보증금</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="보증금"
                                    value={propertyData.보증금}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{formatNumber(propertyData.보증금)}</p>
                            )}
                        </div>
                        <div className='flexRow justify-between text-yellow'>
                            <p>월세</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="월세"
                                    value={propertyData.월세}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{formatNumber(propertyData.월세)}</p>
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
                                <p>{formatNumber(propertyData.관리비)}</p>
                            )}
                        </div>
                    </div>
                    <div className='flexRow'>
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
                    <div className='flexRow'>
                            <p>EV유무: </p>
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
                    <div className='flexRow'>
                            <p>화장실개수: </p>
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
                            <p>주차가능대수: </p>
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
                    <div className='flexRow'>
                            <p>임차인정보: </p>
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
                                    value={propertyData.총수수료}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{formatNumber(propertyData.총수수료)}</p>
                            )}
                        </div>
                        <div className='flexRow justify-between text-yellow'>
                            <p>소장</p>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="소장"
                                    value={propertyData.소장}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{formatNumber(propertyData.소장)}</p>
                            )}
                        </div>
                        <div className='flexRow justify-between text-yellow'>
                            <p>직원</p>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="직원"
                                    value={propertyData.직원}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <p>{formatNumber(propertyData.직원)}</p>
                            )}
                        </div>
                        
                    </div>
                    <div className='flex justify-end w-10/12'>
                    {isEditing ? (
                            <>
                                <button onClick={handleSave} className="bg-yellow text-white px-4 py-2 rounded">
                                    Save Changes
                                </button>
                                <button onClick={toggleEdit} className="bg-gray-500 text-white px-4 py-2 rounded ml-4">
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={toggleEdit} className="bg-blue-500 text-white px-4 py-2 rounded">
                                    Edit
                                </button>
                                <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded ml-4">
                                    Delete Property
                                </button>
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