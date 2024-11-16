import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Icon from '@expo/vector-icons/AntDesign'
import IconMaterial from '@expo/vector-icons/MaterialIcons'
import {debounce} from 'lodash'
import { weatherImages, apiKey } from './index'
import axios from 'axios'
const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;
const HomeScreen = () => {
    const [showSearch, setshowSearch] = useState(false)
    const [locations, setlocations] = useState([])
    const [weather, setweather] = useState({})
    const [loading, setLoading] = useState(false)

    const handleSearch = async(value) => {
        if(value.length > 2){
            try {
                const response = await axios.get(`http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${value}`);
                setlocations(response.data);
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }
        }
    }

    const handleForecast = async(params) => {
        setLoading(true)
        setlocations([])
        setshowSearch(false)
        try {
            const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params?.name}&days=${7}&aqi=no&alerts=no`)
            setweather(response.data)
            
        } catch (error) {
            console.log("Error",error);   
        }finally{
            setLoading(false)
        }
    }

    const defaultData = async() => {
        const options = {
            name : 'Chennai'
        }
        await handleForecast(options);
    }

    useEffect(()=>{
        defaultData();
    },[])

    const handleSearchDebounce = useCallback(debounce(handleSearch, 1000))
    const { current, location} = weather;
    const currentTime = location?.localtime ? location.localtime.split(' ')[1] : '';
    
  return (
    <View style={[styles.homeScreenPage, { height: deviceHeight, width: deviceWidth }]}>
        <StatusBar barStyle="light" backgroundColor="transparent" translucent />

        <Image blurRadius={70} style={[styles.backgroundImage,{ height: deviceHeight, width: deviceWidth }]} source={require("../assets/images/bg.png")}/>

        {
            loading ? (
                <View style={styles.loadingDiv}>
                    <ActivityIndicator size={90} color="rgba(255, 255, 255, 0.7)"/>
                </View>
            ) : (
            
        <SafeAreaView style={styles.safeview}>
            {/* search */}
            <View style={styles.searchBarDiv}>
                <View style={showSearch ? styles.searchBarDivInner : styles.transparentBackground} >
                    {
                        showSearch ? (
                            <TextInput placeholder='Search City'
                                placeholderTextColor="rgba(255, 255, 255, 1)"
                                style={styles.InputSearchCity}
                                onChangeText={handleSearchDebounce}
                              /> 
                        ) : null
                    }
                    <TouchableOpacity style={styles.searchIcon} onPress={()=> setshowSearch(!showSearch)}>
                        <Icon name='search1' size={20}  color={'white'}/>
                    </TouchableOpacity>
                </View>
            
                {
                    locations.length > 0 && showSearch ? (
                        <View style={styles.searchLocations}>
                            {
                                locations.map((loc,index) => (
                                    <TouchableOpacity key={index} style={styles.locationItem} onPress={()=>handleForecast(loc)}>
                                       <IconMaterial name="location-on" size={20} color="black" style={{marginLeft:10}}/>
                                       <Text style={styles.locationText}>{loc.name}, {loc.country}</Text>
                                    </TouchableOpacity>
                                    
                                ))
                            }
                        </View>
                    ) : null
                }
                </View>
                {/* forecast */}
            <View style={styles.forecastContainer}>
                    <Text style={styles.forecastContainerCityName}>
                        {location?.name},
                        <Text style={styles.forecastContainerCountryName}>
                            {location?.country} 
                        </Text>
                    </Text>

                    {/* whaeterImage */}

                    <View style={styles.forecastContainerImageDiv}>
                        <Image style={styles.forecastContainerImage}
                            source={weatherImages[current?.condition?.text] || {uri: 'https:'+current?.condition?.icon}}
                        // source={{uri: 'https:'+current?.condition?.icon}}
                        //   source={require('../assets/images/partlycloudy.png')}
                        />
                    </View>

                    {/* degrees */}
                    <View style={styles.forecastContainerDegrees}>
                        <Text style={styles.forecastContainerDegreesCel}>
                            {current?.temp_c}&#176;
                        </Text>
                        <Text style={styles.forecastContainerDegreesClimate}>
                            {current?.condition?.text}
                        </Text>
                    </View>

                    {/* others */}
                    <View style={styles.forecastContainerOthersDiv}>
                        <View style={styles.forecastContainerOthers}>
                            <Image style={styles.forecastContainerOthersImage} source={require('../assets/icons/wind.png')} />
                            <Text style={styles.forecastContainerOthersText}>{current?.wind_kph}km</Text>
                        </View>
                        <View style={styles.forecastContainerOthers}>
                            <Image style={styles.forecastContainerOthersImage} source={require('../assets/icons/drop.png')} />
                            <Text style={styles.forecastContainerOthersText}>{current?.humidity}%</Text>
                        </View>
                        <View style={styles.forecastContainerOthers}>
                            <Image style={styles.forecastContainerOthersImage} source={require('../assets/icons/sun.png')} />
                            <Text style={styles.forecastContainerOthersText}>{currentTime}</Text>
                        </View>
                    </View>
                </View>
                <View>
                    <View style={styles.dailyForecastDiv}>
                        <IconMaterial color='rgba(255,255,255,0.8)' name="calendar-month" size={25}/>
                        <Text style={styles.dailyForecastText}>Daily forecast</Text>
                    </View>
                    <ScrollView 
                       horizontal
                       contentContainerStyle={{paddingHorizontal:15}}
                       showsHorizontalScrollIndicator={false}
                     >
                        {
                            weather?.forecast?.forecastday?.map((item, index) => {
                                let date = new Date(item?.date)
                                let options = {weekday : 'long'}
                                let dayName = date.toLocaleDateString('en-US',options)
                               return( 
                                <View style={styles.dailyForecastDiv2} key={index}>
                                    <Image style={styles.dailyForecastDiv2Image} source={weatherImages[item?.day?.condition?.text] || {uri:'https:'+item?.day?.condition?.icon}}/>
                                    <Text style={styles.dailyForecastDiv2Text1}>{dayName}</Text>
                                    <Text style={styles.dailyForecastDiv2Text2}>{item?.day?.avgtemp_c}&#176;</Text>
                                </View>
                            )})
                        }
                    </ScrollView>
                </View>

        </SafeAreaView>
            )
        } 
  </View>
  
  )
}

export default HomeScreen

const styles = StyleSheet.create({
    homeScreenPage:{
        display:'flex',
        justifyContent:'center'
    },
    backgroundImage:{
        opacity:1,
        position:'absolute',
    },
    loadingDiv : {
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        height:'100%',
    },
    loadingDivText:{
        fontSize:30,
        fontWeight:'600',
        color:'rgba(255,255,255,0.7)'
    },  
    safeview:{
        display:'flex',
        height: deviceHeight-70,
    },
    searchBarDiv: {
        height: '7%',
        display:'flex',
        justifyContent:'center',
        // opacity:0.2
        alignItems:'center',
    },
    searchBarDivInner : {
        display: 'flex',
        flexDirection:'row',
        alignItems:'center',
        width:'90%',
        height:'80%',
        borderRadius:20,
        gap:10,
        backgroundColor:'white',
        opacity:0.3
    },
    transparentBackground: {
        width: '90%',
        height: '80%',
        borderRadius: 20,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
    },
    InputSearchCity : {
        marginLeft:15, 
        fontSize:18,
        opacity:1,
        color:'white',
        fontWeight:'500', 
        width:'80%', 
    },
    searchIcon : {
        height:'80%',
        width:'10%',
        borderRadius:50,
        marginRight:20,
        display:'flex',
        position:'absolute',
        right:0,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'white',
        opacity:0.5,
    },
    searchLocations: {
        position:'absolute',
        top:50,
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        zIndex:999,
        marginTop: 10,
        padding: 10,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        margin:1,
        borderRadius:5,
        backgroundColor:'rgba(255, 255, 255, 0.9)'
    },
    locationText: {
        color: 'black',
        marginLeft: 10,
        fontSize: 16,
        fontWeight:'500'
    },
    forecastContainer :{
        display: 'flex',
        alignItems:'center',
        gap:60,
        marginTop:40,
        justifyContent:'center',
    },
    forecastContainerCityName : {
        fontSize:22,
        color:'white',
        fontWeight: '500',
    },
    forecastContainerCountryName : {
        fontSize:16,
        fontWeight:'500',
        color:'rgba(255,255,255,0.6)'
    },
    forecastContainerImageDiv:{
      display:'flex',
      flexDirection:'row',
      justifyContent:'center'
    },
    forecastContainerImage : {
      height:200,
      width:200
    },
    forecastContainerDegrees : {
        alignItems:'center'
    },
    forecastContainerDegreesCel : {
        fontSize:50,
        color:'white',
        fontWeight:'800'
    },
    forecastContainerDegreesClimate : {
        fontSize:20,
        color:'rgba(255,255,255,0.7)',
        fontWeight:'500'
    },
    forecastContainerOthersDiv : {
        display:'flex',
        flexDirection:'row',
        gap:40,
    },
    forecastContainerOthers : {
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        gap:10,
    },
    forecastContainerOthersImage : {
        height:27,
        width:27,
    },
    forecastContainerOthersText : {
        fontWeight:'500',
        fontSize:16,
        color:'white'
    },
    dailyForecastDiv : {
        marginTop: 40,
        marginLeft:10,
        marginBottom:10,
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        gap:7,
    },
    dailyForecastText:{
        fontSize:15,
        fontWeight:'500',
        color:'rgba(255,255,255,0.8)'
    },
    dailyForecastDiv2 : {
        height:120,
        width:100,
        borderRadius:15,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        gap:3,
        margin:2,
        backgroundColor:'rgba(255,255,255,0.25)',
    },
    dailyForecastDiv2Image : {
        height:45,
        width:45,
    },
    dailyForecastDiv2Text1:{
        fontSize:14,
        fontWeight:'500',
        color:'rgba(255,255,255,0.6)'
    },
    dailyForecastDiv2Text2:{
        fontSize:17,
        fontWeight:'700',
        color:'rgba(255,255,255,0.8)'
    }
})