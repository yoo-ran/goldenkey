import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation to the login page

import Memo from '../components/feature/Memo';

const PropertyUpload = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
    const navigate = useNavigate(); // Hook for navigation

    const [images, setImages] = useState([]); // State for storing uploaded images
    const [selectedFiles, setSelectedFiles] = useState([]); // Store selected files for upload
    const [memo, setMemo] = useState(''); // State for memo content
    const [propertyData, setPropertyData] = useState({
        등록일자: '', 부동산구분: '', 거래방식: '', 거래완료여부: '',
        거래완료일자: '', 담당자: '', 구: '', 읍면동: '', 구상세주소: '',
        도로명: '', 신상세주소: '', 건물명: '', 동: '', 호수: '',
        보증금: 0, 월세: 0, 관리비: 0, 전체m2: 0, 전용m2: 0,
        전체평: 0, 전용평: 0, EV유무: false, 화장실개수: 0, 주차가능대수: 0,
        비밀번호: '', 이름: '', 휴대폰번호: '', 기타특이사항: '', 총수수료: 0,
        소장: 0, 직원: 0, 메모:"", img_path:""
    });

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

    if (!isAuthenticated) {
        return <div>Loading...</div>; // Optionally show a loading indicator while checking authentication
    }
    
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

    const formatDateForMySQL = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleMemoUpdate = (newMemo) => {
        setMemo(newMemo);
        setPropertyData(prevData => ({
            ...prevData,
            메모: newMemo // Update propertyData with the memo content
        }));
    };


    // Format number with commas
    const formatNumber = (number) => {
        return Number(number).toLocaleString();
    };

    // Save data to the database
    const handleSave = async () => {
        const { 등록일자, 거래완료일자, 비밀번호, ...fieldsToUpdate } = propertyData;

        // Set default dates to current date if not provided
        const currentDate = formatDateForMySQL(new Date());
        const formattedFieldsToUpdate = {
            ...fieldsToUpdate,
            등록일자: 등록일자 ? formatDateForMySQL(new Date(등록일자)) : currentDate,
            거래완료일자: 거래완료일자 ? formatDateForMySQL(new Date(거래완료일자)) : currentDate,
            비밀번호: 비밀번호 || "미정" // Default to "미정" if 비밀번호 is not provided
        };
        try {

            // Save property details to the database
            await axios.post('http://localhost:8000/properties/update', formattedFieldsToUpdate);
            if (selectedFiles.length > 0) {
                await handleImageUpload(); // Upload images and update propertyData
            }

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
        setPropertyData(prevData => ({
            ...prevData,
            img_path: [...(prevData.img_path.split(',') || []), ...uploadedImages].join(',') // Append new image paths
        }));
        console.log("propertyData: ", propertyData);

        // Clear selected files
        setSelectedFiles([]);

        alert("Images uploaded and paths saved successfully!");
    } catch (error) {
        console.error('Error uploading images:', error);
        alert('Error uploading images');
    }
};

    

    return (
        <main className='gap-y-16 w-1/2'>

            <section className='grid grid-cols-12 justify-between gap-x-10 w-full'>
                <article className='col-span-8 flexCol items-start gap-y-10'>
                    <div className='flexCol items-start gap-y-5'>
                        <p className='text-sm border px-2 rounded-full'>ID Number: {propertyData.순번}</p>
                        
                        <div className='w-full'>
                            <h2>Image Upload</h2>
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleImageChange}
                                        className="images border p-2"
                                    />
                                    <button onClick={handleImageUpload} className="bg-yellow text-white px-4 py-2 rounded mt-2">
                                        Upload Images
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <div className="flex flex-wrap">
                                    {
                                        images && images.length > 0 &&
                                        images.map((imgPath, index) => (
                                            <div key={index} className="image-thumbnail mr-4 mb-4">
                                                <img 
                                                    src={`http://localhost:8000/${imgPath}`}
                                                    alt={`Property Image ${index + 1}`} 
                                                    className="w-32 h-32 object-cover"/>
                                            </div>
                                        ))
                                    }
                                    </div>
                                </div>

                        </div>

                        <div className='flexRow'>
                            <p>등록일자:</p>
                                <input
                                    type="date"
                                    name="등록일자"
                                    value={propertyData.등록일자 ? propertyData.등록일자.split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        
                        <h1>
                            <label>건물명: </label>
                                <input
                                    type="text"
                                    name="건물명"
                                    value={propertyData.건물명}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </h1>
                        
                        <div className='flexRow'>
                            <p>부동산구분:</p>
                                <input
                                    type="text"
                                    name="부동산구분"
                                    value={propertyData.부동산구분}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        
                        <div className='flexRow'>
                            <p>거래 방식:</p>
                                <input
                                    type="text"
                                    name="거래방식"
                                    value={propertyData.거래방식}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        
                        <div className='flexRow'>
                            <p>거래 완료 여부:</p>
                                <input
                                    type="text"
                                    name="거래완료여부"
                                    value={propertyData.거래완료여부}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        
                        <div className='flexRow'>
                            <p>거래완료일자:</p>
                                <input
                                    type="date"
                                    name="거래완료일자"
                                    value={propertyData.거래완료일자 ? propertyData.거래완료일자.split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        <div className='flexRow'>
                            <p>구 주소:</p>
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
                        </div>
                        <div className='flexRow'>
                            <p>신 주소:</p>
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
                        </div>
                        <div className='flexRow'>
                            <p>동호수: </p>
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
                        </div>
                        
                        
                    </div>

                    <div className='w-full'>
                        <h2>금액</h2>
                        <div className='flexRow justify-between text-yellow'>
                            <p>보증금</p>
                                <input
                                    type="text"
                                    name="보증금"
                                    value={propertyData.보증금}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        <div className='flexRow justify-between text-yellow'>
                            <p>월세</p>
                                <input
                                    type="text"
                                    name="월세"
                                    value={propertyData.월세}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        <div className='flexRow justify-between text-yellow'>
                            <p>관리비</p>
                                <input
                                    type="text"
                                    name="관리비"
                                    value={propertyData.관리비}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                    </div>
                    <div className='flexRow'>
                            <p>면적(m2): </p>
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
                    </div>
                    <div className='flexRow'>
                            <p>면적(평): </p>
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
                    </div>
                    <div className='flexRow'>
                            <p>EV유무: </p>
                                    <input
                                        type="checkbox"
                                        name="EV유무"
                                        value={propertyData.EV유무}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                    </div>
                    <div className='flexRow'>
                            <p>화장실개수: </p>
                                    <input
                                        type="number"
                                        name="화장실개수"
                                        value={propertyData.화장실개수}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                    </div>
                    <div className='flexRow'>
                            <p>주차가능대수: </p>
                                    <input
                                        type="number"
                                        name="주차가능대수"
                                        value={propertyData.주차가능대수}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                          
                    </div>
                    <div className='flexRow'>
                            <p>비밀번호: </p>
                                    <input
                                        type="text"
                                        name="비밀번호"
                                        value={propertyData.비밀번호}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                          
                    </div>
                    <div className='flexRow'>
                            <p>임차인정보: </p>
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
                    </div>
                    <div className='w-full'>
                        <h2>정산금액</h2>
                        <div className='flexRow justify-between text-yellow'>
                            <p>총수수료</p>
                                <input
                                    type="number"
                                    name="총수수료"
                                    value={propertyData.총수수료}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        <div className='flexRow justify-between text-yellow'>
                            <p>소장</p>
                                <input
                                    type="number"
                                    name="소장"
                                    value={propertyData.소장}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        <div className='flexRow justify-between text-yellow'>
                            <p>직원</p>
                                <input
                                    type="number"
                                    name="직원"
                                    value={propertyData.직원}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                        </div>
                        
                    </div>
                    <div className='flex justify-end w-10/12'>
                            <>
                                <button onClick={handleSave} className="bg-yellow text-white px-4 py-2 rounded">
                                    Save Changes
                                </button>
                            </>
                    </div>
                </article>
            </section>
            <Memo
                propertyId={propertyData.순번}
                onMemoUpdate={handleMemoUpdate}
            />
        </main>
    );
};

export default PropertyUpload;
