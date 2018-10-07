import React, { Component } from 'react';
import {
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    AsyncStorage,
    BackHandler,
    Image
} from 'react-native'
import {
    SearchBar
} from 'react-native-elements'
import {
    Spinner
} from 'native-base'
import ListCardItemNotification from '../ListCardItem/ListCardItemNotification'
import CONSTANTS from '../../constants/Constants'

export default class NotificationScreen extends Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false, 
            error: false, 
            errorMessage: '', 
            data: []
        }
        this.arrayholder = []
        console.log(`\n\n------------------------------------------------------------------------NOTIFICATION SCREEN------------------------------------------------------------------------`)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
        this.getNotifications = this.getNotifications.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.searchFilterFunction = this.searchFilterFunction.bind(this)
    }

    componentDidMount = () => {
        this.getNotifications()
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

    getNotifications = async() => {
        this.setState({
            isLoading: true
        })
        try {
            console.log(`getNotifications()----> getting user data from AsyncStorage....`)
            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER);
            data = JSON.parse(data)
            console.log(`getNotifications()----> data extracted from AsyncStorage: ${JSON.stringify(data)}`)
            try {
                const options = {
                    method: "GET", 
                    headers: {
                        Authorization: `Bearer ${data.authToken}`
                    }
                }
                console.log(`getNotifications()----> getting notifications from API with URL: ${CONSTANTS.API.NOTIFICATIONS}`)
                let response = await fetch(`${CONSTANTS.API.NOTIFICATIONS}`, options)
                let responseJson = await response.json()
                console.log(`getNotifications()----> notfications received from API : ${JSON.stringify(responseJson.notifications)}`)
                if(responseJson.notifications.length < 1) {
                    console.log(`getNotifications()----> empty notifications array received from API`)
                    this.setState({
                        isLoading: false, 
                        error: true, 
                        errorMessage: "Notification list seems to be empty."
                    })
                    return;
                }
                this.setState({
                    isLoading: false, 
                    data: responseJson.notifications, 
                })
                this.arrayholder = responseJson.notifications
                return;
            } catch(error) {
                console.log(`getNotifications()----> error occured when getting data from API: ${error.toString()}`)
                this.setState({
                    isLoading: true, 
                    error: true, 
                    errorMessage: error.toString()
                })
                return;
            }
        } catch(error) {
            console.log(`getNotifications()----> error occured when getting data from AsyncStorage: ${error.toString()}`)
            this.setState({
                isLoading: true,
                error: true,
                errorMessage: error.toString()
            })
            return;
        }
    }

    renderHeader = () => {    
        return (      
            <SearchBar
                round
                lightTheme
                searchIcon={{ size: 48 }}
                placeholder='notification title...'
                onChangeText={text => this.searchFilterFunction(text)}
            />
        );  
    };

    searchFilterFunction = text => {
        const newData = this.arrayholder.filter(item => {
            const itemData = item.title.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });

        this.setState({ data: newData });
    };

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
                    <Text>{this.state.errorMessage}</Text>
                </View>
            )
        }

        return (
            <View style={styles.container}>
                <FlatList 
                    data={this.state.data}
                    renderItem={({ item }) => {
                        return (
                            <ListCardItemNotification sentDate={item.date} title={item.title} description={item.body} />
                        )
                    }}
                    keyExtractor={item => item._id}
                    ListHeaderComponent={this.renderHeader()}                                                 
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    generalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#fff"
    },
    gif: {
        height: "20%",
        width: "20%"
    }
})