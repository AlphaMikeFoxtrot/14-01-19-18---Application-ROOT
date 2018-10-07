import React, { Component } from 'react';
import { 
    View, 
    Text,
    ScrollView,
    FlatList,
    BackHandler,
    AsyncStorage,
    StyleSheet,
    Image
} from 'react-native';
import {
    Spinner 
} from 'native-base'
import CONSTANTS from '../../constants/Constants'

import ListCardItemGallery from '../ListCardItem/ListCardItemGallery'

export default class GalleryScreen extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            isLoading: false,
            error: false, 
            errorMessage: '', 
        };
        console.log(`\n\n------------------------------------------------------------------------GALLERY SCREEN------------------------------------------------------------------------`)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
        this.getUserData = this.getUserData.bind(this)
    }

    componentDidMount = () => {
        this.getUserData()
    }
    
    componentWillMount = () => {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        console.log(`\n\n------------------------------------------------------------------------HOME SCREEN------------------------------------------------------------------------`)
        this.props.navigation.navigate("HomeScreen")
        return true;
    }

    getUserData = async() => {
        console.log(`getUserData()---->getting user data from Async Storage...`)
        this.setState({
            isLoading: true
        })
        try {
            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER);
            data = JSON.parse(data);
            this.getGalleryItems(data.authToken, data.branchId)
            console.log(`getUserData()----> user data extracted from AsyncStorage-> authToken: ${data.authToken}\tbranchId: ${data.branchId}`)
            return; 
        } catch(error) {
            this.setState({
                isLoading: false, 
                error: true, 
                errorMessage: error.toString()
            })
            console.log(`getUserData()----> error occured when getting user data from Async Storage: ${error}`)
            return;
        }
    }

    getGalleryItems = async(authToken, branchId) => {
        console.log(`getGalleryItems()----> getting gallery items from API with url: ${CONSTANTS.API.GALLERY}/${branchId}`)
        try {
            const options = {
                method: "GET", 
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
            let response = await fetch(`${CONSTANTS.API.GALLERY}/${branchId}`, options)
            let responseJson = await response.json()
            if(responseJson.count === 0 || responseJson.count === "0") {
                this.setState({
                    isLoading: false, 
                    error: true, 
                    errorMessage: `Gallery seems to be empty at the moment!\nPlease try again after some time.`
                })
            }
            console.log(`getGalleryItems()----> data received from API: ${JSON.stringify(responseJson.galleryItems)}`)
            this.setState({
                isLoading: false,
                data: responseJson.galleryItems
            })
            return;
        } catch(error) {
            console.log(`getGalleryItems()----> error occured when getting gallery items from API: ${error.toString()}`)
            this.setState({
                isLoading: false, 
                error: true, 
                errorMessage: error
            })
            return;
        }
    }

    render() {
        if(this.state.isLoading) {
            return (
                <View style={styles.generalContainer}>
                    <Image resizeMode="contain" source={require("../../assets/gif/bubbles.gif")} style={styles.gif} />
                </View>
            )
        }

        if(this.state.error) {
            return (
                <View style={styles.generalContainer}>
                    <Text>{this.state.errorMessage.toString()}</Text>
                </View>
            )
        }

        return (
            <View style={styles.container}>
                <FlatList 
                    data={this.state.data}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => (
                        <ListCardItemGallery imageUrl={item.imageUrl} title={item.caption} description={item.description}/>
                    )}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    generalContainer: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
    },
    gif: {
        height: "20%",
        width: "20%"
    }
})


