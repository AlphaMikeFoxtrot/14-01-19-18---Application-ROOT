import React, { Component } from 'react';
import {
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    AsyncStorage,
    BackHandler,
    Image,
    TouchableOpacity,
    Modal,
    Dimensions
} from 'react-native'
import {
    SearchBar
} from 'react-native-elements'
import {
    Spinner
} from 'native-base'
import ListCardItemEvent from '../ListCardItem/ListCardItemEvent'
import CONSTANTS from '../../constants/Constants'
import AddEventModal from '../Modals/AddEventModal'

export default class EventScreen extends Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false, 
            error: false, 
            errorMessage: '', 
            data: [],
            isModalVisible: false
        }
        this.arrayholder = []
        console.log(`\n\n------------------------------------------------------------------------EVENT SCREEN------------------------------------------------------------------------`)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
        this.getEvents = this.getEvents.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.searchFilterFunction = this.searchFilterFunction.bind(this)
        this.showModal = this.showModal.bind(this)
    }

    componentDidMount = () => {
        this.getEvents()
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

    showModal = () => {
        this.setState({
            isModalVisible: true
        })
    }

    getEvents = async() => {
        this.setState({
            isLoading: true
        })
        try {
            console.log(`getEvents()----> getting user data from AsyncStorage....`)
            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER);
            data = JSON.parse(data)
            console.log(`getEvents()----> data extracted from AsyncStorage: ${JSON.stringify(data)}`)
            try {
                const options = {
                    method: "GET", 
                    headers: {
                        Authorization: `Bearer ${data.authToken}`
                    }
                }
                console.log(`getEvents()----> getting events from API with URL: ${CONSTANTS.API.EVENTS}/${data.branchId}`)
                let response = await fetch(`${CONSTANTS.API.EVENTS}/${data.branchId}`, options)
                let responseJson = await response.json()
                console.log(`getEvents()----> events received from API : ${JSON.stringify(responseJson.events)}`)
                if(responseJson.events.length < 1) {
                    console.log(`getEvents()----> empty events array received from API`)
                    this.setState({
                        isLoading: false, 
                        error: true, 
                        errorMessage: "there are no current events for your branch."
                    })
                    return;
                }
                this.setState({
                    isLoading: false, 
                    data: responseJson.events, 
                })
                this.arrayholder = responseJson.events
                return;
            } catch(error) {
                console.log(`getEvents()----> error occured when getting data from API: ${error.toString()}`)
                this.setState({
                    isLoading: true, 
                    error: true, 
                    errorMessage: error.toString()
                })
                return;
            }
        } catch(error) {
            console.log(`getEvents()----> error occured when getting data from AsyncStorage: ${error.toString()}`)
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
            <View style={styles.header}>
                <SearchBar
                    containerStyle={styles.searchBar}
                    inputStyle={styles.searchBarInputContainer}
                    round
                    lightTheme
                    searchIcon={{ size: 50 }}
                    placeholder='event name...'
                    onChangeText={text => this.searchFilterFunction(text)}
                />
                <TouchableOpacity style={styles.addContainer} onPress={() => this.showModal()}>
                    <Image source={require('../../assets/icons/add.png')} resizeMode="contain" style={styles.icon} />
                </TouchableOpacity>
            </View>
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
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.isModalVisible}
                    onRequestClose={() => {
                        console.log(`render()-> <Modal />----> modal closed by user`)
                    }}
                >
                    <View style={styles.addEventModal}>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                isModalVisible: false
                            })
                        }}>
                            <Text> cancel </Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                <FlatList 
                    data={this.state.data}
                    renderItem={({ item }) => {
                        return (
                            <ListCardItemEvent location={item.location} eventDate={item.eventDate} title={item.title} description={item.body} />
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
    addEventModal: {
        height: "100%", 
        width: "100%", 
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: "#fff"
    },
    container: {
        flex: 1,
    },
    generalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#fff"
    },
    searchBarInputContainer: {
        height: "75%", 
        width: "80%", 
    },
    header: {
        width: "100%", 
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#e1e8ee"
    },
    searchBar: {
        width: "90%", 
        height: 50, 
        alignItems: "center", 
        justifyContent: 'center',
    },
    addContainer: {
        height: "100%",
        width: "10%",
        marginRight: 6,
        backgroundColor: "#e1e8ee"
    },
    icon: {
        height: "100%",
        width: "100%"
    },
    gif: {
        height: "20%",
        width: "20%"
    }
})