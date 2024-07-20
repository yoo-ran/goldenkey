import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsLeftRight, faBathtub, faBed, faChevronLeft, faChevronRight, faMobileScreenButton, faPhone } from '@fortawesome/free-solid-svg-icons';

import Images from './importImg';
import PropertyDetail from '../../routes/Detail';

const AvailableHouse = ({type, onSendData}) => {
    const [availableProperty, setAvailableProperty] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState()

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://localhost:8000/listing');
                setAvailableProperty(response.data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchProperties();
    }, []);

    const readmoreEvent = (property) => {
        onSendData(property);
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Optional: smooth scrolling effect
        });
    }
    
    return (
        <article className="relative flexCol items-start gap-y-6  w-full">
            <h3>{type}</h3>
            <div className='border-t-2 border-yellow w-full '>
                {availableProperty.map((item)=>{
                    if(item.type==type){
                        return (
                            <div key={item.pId} className='border-b-2 border-yellow flexRow justify-between py-3'>
                                <img src={Images[item.pId % Images.length]} alt="" 
                                    className='rounded-xl w-2/12 h-20 object-cover object-center'
                                />
                                <div className='flexCol items-start gap-y-4 w-6/12 '>
                                    <div className='flexRow gap-x-2 text-sm'>
                                        <p className='bg-yellow text-white px-2 rounded-full'>{type}</p>
                                        <p className='bg-yellow text-white px-2 rounded-full'>Two+Story</p>
                                    </div>
                                    <div className='flexRow gap-x-6'>
                                        <p><FontAwesomeIcon icon={faBed} className='pr-2'/>{item.bedroom} Bed</p>
                                        <p><FontAwesomeIcon icon={faBathtub} className='pr-2'/>{item.bathroom} Bath</p>
                                        <p><FontAwesomeIcon icon={faArrowsLeftRight} className='pr-2'/>{item.sqft.toLocaleString()} sqFt</p>
                                    </div>
                                </div>
                                <div className='flexRow gap-x-4'>
                                    <button className='rounded-xl bg-navy text-white py-4 px-4'>
                                        <FontAwesomeIcon icon={faMobileScreenButton}/> Contact
                                        </button>
                                    <button 
                                        className='rounded-xl bg-yellow py-4 px-4'
                                        onClick={()=>readmoreEvent(item)}
                                    >
                                        Read More <FontAwesomeIcon icon={faChevronRight}/>
                                    </button>
                                </div>
                            </div>

                        )
                    }
                })}

            </div>
        </article>
    );
};

export default AvailableHouse;
