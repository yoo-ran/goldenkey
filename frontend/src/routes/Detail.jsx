import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsLeftRight, faHouse, faBed, faLocationDot, faSquareParking, faPersonDigging } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';

import MapComponent from '../components/feature/MapComponent';
import ContactSide from '../components/feature/ContactSide';
import Images from '../components/feature/importImg';
import ListingHeader from '../components/feature/ListingHeader';
import Delete from '../components/Delete';

const PropertyDetail = () => {
    const location = useLocation();
    const { propertyId } = location.state || {}; // Assuming propertyId is passed in location.state

    const [propertyData, setPropertyData] = useState({
        순번: '', 등록일자: '', 부동산구분: '', 거래방식: '', 거래완료여부: '',
        거래완료일자: '', 담당자: '', 구: '', 읍면동: '', 구상세주소: '',
        도로명: '', 신상세주소: '', 건물명: '', 동: '', 호수: '',
        보증금: 0, 월세: 0, 관리비: 0, 전체m2: 0, 전용m2: 0,
        전체평: 0, 전용평: 0, EV유무: false, 화장실개수: 0, 주차가능대수: 0,
        비밀번호: '', 이름: '', 휴대폰번호: '', 기타특이사항: '', 총수수료: 0,
        소장: '', 직원: ''
    });

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

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        let formattedValue;

        if (type === 'checkbox') {
            // Convert checkbox value to 0 or 1
            formattedValue = checked ? 1 : 0;
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
            const response = await axios.delete(`http://localhost:8000/delete-property/${propertyId}`);
            console.log(response.data);
            // Handle successful deletion, e.g., navigate away or update state
        } catch (error) {
            console.error('Error deleting property:', error.response ? error.response.data : error.message);
            alert('Error deleting property.');
        }
    };
    

    // Save data to the database
    const handleSave = async () => {
        try {
            // Assuming propertyData contains the propertyId
            const { propertyId, ...fieldsToUpdate } = propertyData;
    
            // Format dates if they are part of the fields to be updated
            const formattedFieldsToUpdate = {
                ...fieldsToUpdate,
                등록일자: formatDateForMySQL(new Date(fieldsToUpdate.등록일자)),
                거래완료일자: formatDateForMySQL(new Date(fieldsToUpdate.거래완료일자))
            };
    
            console.log(formattedFieldsToUpdate);
    
            // Make the PUT request with propertyId in the URL
            await axios.put(`http://localhost:8000/update-property/${propertyId}`, formattedFieldsToUpdate);
            alert("Data saved successfully!");
    
            // Fetch updated data after saving
            fetchPropertyData();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };
    

    return (
        <main className='gap-y-16'>
            <ListingHeader/>

            <section className='grid grid-cols-12 grid-rows-2 gap-x-4 gap-y-4 h-96 w-10/12'>
                {/* Add image display if needed */}
            </section>

            <section className='grid grid-cols-12 justify-between gap-x-10 w-10/12'>
                <article className='col-span-8 flexCol items-start gap-y-10'>
                    <div className='flexCol items-start gap-y-5'>
                        <p className='capitalize text-sm border px-2 rounded-full'>Listing number: {propertyData.순번}</p>
                        <h1>
                            <input
                                type="text"
                                name="건물명"
                                value={propertyData.건물명}
                                onChange={handleInputChange}
                                className="border p-1"
                            />
                        </h1>
                        <p>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <input
                                type="text"
                                name="구상세주소"
                                value={propertyData.구상세주소}
                                onChange={handleInputChange}
                                className="border p-1"
                            />
                        </p>
                    </div>

                    <div className='w-full flex justify-end'>
                        <p className='border-t border-black w-3/12 '></p>
                    </div>

                    <div className='w-full'>
                        <div className='flexRow justify-between pb-2'>
                            <p>Listing status</p>
                            <p>From</p>
                        </div>
                        <div className='flexRow justify-between text-yellow'>
                            <p>Selling</p>
                            <input
                                type="number"
                                name="보증금"
                                value={propertyData.보증금}
                                onChange={handleInputChange}
                                className="border p-1"
                            /> CAD
                        </div>
                    </div>

                    {/* Repeat similar input fields for other editable properties */}
                    
                    <div className='flexRow justify-between w-full py-10'>
                        <p className='w-1/2 flexRow justify-start capitalize'>
                            <FontAwesomeIcon className='text-3xl w-3/12' icon={faHouse} />
                            <input
                                type="text"
                                name="부동산구분"
                                value={propertyData.부동산구분}
                                onChange={handleInputChange}
                                className="border p-1"
                            />
                        </p>
                        <p className='w-1/2 flexRow justify-start capitalize'>
                            <FontAwesomeIcon className='text-3xl w-3/12' icon={faSquareParking} />
                            <input
                                type="checkbox"
                                name="EV유무"
                                checked={propertyData.EV유무}
                                onChange={handleInputChange}
                                className="border p-1"
                            />
                        </p>
                    </div>
                </article>

                <article className='col-span-4'>
                    <ContactSide />
                </article>
            </section>

            <section className='flexRow justify-between items-start gap-x-10 w-10/12'>
                <article className='w-8/12'>
                    <h2>Overview</h2>
                    <textarea
                        name="기타특이사항"
                        value={propertyData.기타특이사항}
                        onChange={handleInputChange}
                        className="border p-1 w-full"
                    />
                </article>
                <article className='w-4/12'>
                    <h2>Location</h2>
                    <div className='h-48 overflow-hidden rounded-xl'>
                        <MapComponent />
                    </div>
                </article>
            </section>

            <section className='flexCol items-start gap-y-6 w-10/12'>
                <h2>Available Homes</h2>
                {/* <AvailableHouse type={propertyData.type}/> */}
            </section>

            <div className="flex justify-end w-10/12">
                <button onClick={handleSave} className="bg-yellow text-white px-4 py-2 rounded">
                    Save Changes
                </button>
                <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded ml-4">
                    Delete Property
                </button>
            </div>
            
        </main>
    );
};

export default PropertyDetail;
