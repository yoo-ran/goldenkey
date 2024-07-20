// MapComponent.jsx
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: "100%"
};

const center = {
  lat: 49.283,
  lng: -123.1150
};

const MapComponent = () => {
  return (
    <LoadScript googleMapsApiKey="AIzaSyA7K9mLTUCPWbba5pgynOsJDW0jpL0nRcY">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
