import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import MapView, { Marker, AnimatedRegion, MarkerAnimated } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const API_KEY = '65ddc8a6b925e563401390epvf659d7';
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('No permission to get location');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  const handleShow = async (apiKey) => {
    try {
      const response = await fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${API_KEY}`);
      const responseData = await response.text();
      console.log(responseData); // Tulostaa vastauksen konsoliin - Pystyy tarkkailla 
      const data = JSON.parse(responseData);
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCoordinates = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        setCoordinates(newCoordinates);
        if (mapRef.current) {
          //Uusiin koordinaatteihin siirtyminen
          mapRef.current.animateToRegion({
            ...newCoordinates,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }, 1000);
        }
      } else {
        alert('Osoitetta ei löydy.');
      }
      } catch (error) {
        console.error('Virhe haettaessa koordinaatteja:', error);
        alert('Virhe haettaessa koordinaatteja.');
      }
    };
  
  return (
    <View style={{ flex: 1 }}>
      
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={userLocation ? {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : null}
      >
        {userLocation && (
        <Marker
        coordinate={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
        }}
        title="Your Location"
        />
      )}
      
        {coordinates && (
          <MarkerAnimated
            coordinate={coordinates}
            title={address}
          />
        )}
      </MapView>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Enter address"
        style={{ borderWidth: 1, borderColor: 'gray', padding: 10, margin: 10 }}
      />
      <Button title="Show" onPress={handleShow} />
    </View>
  );
}