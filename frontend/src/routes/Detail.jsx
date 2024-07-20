import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsLeftRight, faHouse, faBed, faLocationDot, faSquareParking, faPersonDigging } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';

import MapComponent from '../components/feature/MapComponent';
import AvailableHouse from '../components/feature/AvailableHouse';
import ContactSide from '../components/feature/ContactSide';
import Images from '../components/feature/importImg';

import ListingHeader from '../components/feature/ListingHeader';

const PropertyDetail = () => {
    const location = useLocation();
    const { property } = location.state || {};

    const [availData, setAvailData] = useState({});
    const [propertyData, setPropertyData] = useState({
        pId: '',
        name: '',
        location: '',
        price: 0,
        type: '',
        parking: false,
        bedroom: 0,
        units: 0,
        storages: 0,
        sqft: 0,
        builtDate: '',
        description: '',
    });


    useEffect(() => {
        setPropertyData(availData);
    }, [availData]);

    useEffect(() => {
        setPropertyData(property || availData);
    }, [property]);

    const handleData = (childData) => {
        setAvailData(childData);
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-CA'); // ISO 8601 format
    }

    const imageIndices = [0, 1, 2, 3, 4];
    const imageUrls = imageIndices.map(index => 
        Images[(propertyData.pId % Images.length + index) % Images.length]
    );

    return (
        <main className='gap-y-16'>

            <ListingHeader/>

            {/* Image Display */}
            <section 
                className='grid items-stretch grid-cols-12 grid-rows-2 gap-x-4 gap-y-4 h-96 w-10/12'>
                {imageUrls.map((url, index) => (
                    <img
                        key={index}
                        src={url}
                        alt={`Listing ${propertyData.pId}`}
                        className={`col-span-${index === 0 ? '8 row-span-2' : index === 1 ? '3' : index === 2 ? '2' : index===3 ? "2":"3"} object-center w-full h-full object-cover rounded-xl`}
                    />
                ))}
            </section>

            {/* detail */}
            <section className='grid grid-cols-12 justify-between gap-x-10 w-10/12'>
                <article className='col-span-8 flexCol items-start gap-y-10'>
                    <div className='flexCol items-start gap-y-5'>
                        <p className='capitalize text-sm border px-2 rounded-full'>listing number 602312{propertyData.pId}</p>
                        <h1>{propertyData.name}</h1>
                        <p><FontAwesomeIcon icon={faLocationDot}/> {propertyData.location}</p>
                    </div>
                    <div className='w-full flex justify-end'>
                        <p className='border-t border-black w-3/12 '></p>
                    </div>
                    <div className='w-full'>
                        <div className='flexRow justify-between pb-2'><p>Listing status</p><p>From</p></div>
                        <div className='flexRow justify-between text-yellow'><p>Selling</p><p className='text-xl'>{propertyData.price.toLocaleString()} CAD</p></div>
                    </div>
                    <div className='flexRow flex-wrap gap-y-12 w-full border-y border-yellow py-10'>
                        <p className='w-1/2 flexRow justify-start capitalize'>
                            <FontAwesomeIcon className='text-3xl w-3/12' icon={faHouse}/>{propertyData.type}</p>
                        <p className='w-1/2 flexRow justify-start capitalize'>
                            <FontAwesomeIcon className='text-3xl w-3/12' icon={faSquareParking} />{propertyData.parking ? "parking place" : "none"}</p>
                        <p className='w-1/2 flexRow justify-start capitalize'>
                            <FontAwesomeIcon className='text-3xl w-3/12' icon={faBed}/>{propertyData.bedroom} Bedrooms</p>
                        <p className='w-1/2 flexRow justify-start capitalize'>
                            <FontAwesomeIcon className='text-3xl w-3/12' icon={faBuilding}/>{propertyData.units} units, {propertyData.storages} storages</p>
                        <p className='w-1/2 flexRow justify-start capitalize'>
                            <FontAwesomeIcon className='text-3xl w-3/12' icon={faArrowsLeftRight}/>{propertyData.sqft.toLocaleString()} SqFt</p>
                        <p className='w-1/2 flexRow justify-start capitalize'>
                            <FontAwesomeIcon className='text-3xl w-3/12' icon={faPersonDigging}/>Since  {formatDate(propertyData.builtDate)}</p>
                    </div>
                </article>
                <article className='col-span-4'>
                    <ContactSide/>
                </article>
            </section>

            {/* Overview */}
            <section className='flexRow justify-between items-start gap-x-10 w-10/12'>
                <article className='w-8/12'>
                    <h2>Overview</h2>
                    <p>{propertyData.description}</p>
                </article>
                <article className='w-4/12'>
                    <h2>Location</h2>
                    <div className='h-48 overflow-hidden rounded-xl'>
                        <MapComponent/>
                    </div>
                </article>
            </section>

            {/* Available Homes */}
            <section className='flexCol items-start gap-y-6 w-10/12'>
                <h2>Available Homes</h2>
                <AvailableHouse type={propertyData.type} onSendData={handleData}/>
            </section>
        </main>
    );
};

export default PropertyDetail;
