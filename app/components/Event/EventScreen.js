import React, { Component } from "react";
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
    TextInput,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView
} from "react-native"
import {
    SearchBar
} from "react-native-elements"
import DatePicker from "react-native-datepicker"
import DateTimePicker from "react-native-modal-datetime-picker";
import {
    Spinner
} from "native-base"
import ListCardItemEvent from "../ListCardItem/ListCardItemEvent"
import CONSTANTS from "../../constants/Constants"
import AddEventModal from "../Modals/AddEventModal"

export default class EventScreen extends Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            isTimePickerVisible: false,
            isDatePickerVisible: false, 
            datePicked: false,
            date: "",
            isLoading: false, 
            error: false, 
            errorMessage: "", 
            data: [],
            isModalVisible: false,
            time: "", 
            timePicked: false,
            title: '', 
            description: '', 
            location: '', 
            eventId: '',
        }
        this.arrayholder = []
        console.log(`\n\n------------------------------------------------------------------------EVENT SCREEN------------------------------------------------------------------------`)
        // console.log(`constructor()---->(dimensions absolute value)----> \n\t\t8%: ${Dimensions.get("window").height * 0.08}\t25%: ${Dimensions.get("window").height * 0.25}\t35%: ${Dimensions.get("window").height * 0.35}`)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
        this.getEvents = this.getEvents.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.searchFilterFunction = this.searchFilterFunction.bind(this)
        this.showModal = this.showModal.bind(this)
        this._showTimePicker = this._showTimePicker.bind(this)
        this._handleTimePicked = this._handleTimePicked.bind(this)
        this._hideTimePicker = this._hideTimePicker.bind(this)
        this._showDatePicker = this._showDatePicker.bind(this)
        this._handleDatePicked = this._handleDatePicked.bind(this)
        this._hideDatePicker = this._hideDatePicker.bind(this)
        this.tConvert = this.tConvert.bind(this)
        this.sumbit = this.sumbit.bind(this)
        this.sendNotification = this.sendNotification.bind(this)
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
                    placeholder="event name..."
                    onChangeText={text => this.searchFilterFunction(text)}
                />
                <TouchableOpacity style={styles.addContainer} onPress={() => this.showModal()}>
                    <Image source={require("../../assets/icons/add.png")} resizeMode="contain" style={styles.icon} />
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

    _showTimePicker = () => this.setState({
        isTimePickerVisible: true
    });

    _hideTimePicker = () => this.setState({
        isTimePickerVisible: false
    });

    _handleTimePicked = (date) => {
        // console.log("A time has been picked: ", `${date.toString().split(" ")[4].split(":")[0]}:${date.toString().split(" ")[4].split(":")[1]}`);
        this.setState({
            timePicked: true,
            time: this.tConvert(`${date.toString().split(" ")[4].split(":")[0]}:${date.toString().split(" ")[4].split(":")[1]}`)
        })
        this._hideTimePicker();
    };

    _showDatePicker = () => this.setState({
        isDatePickerVisible: true
    });

    _hideDatePicker = () => this.setState({
        isDatePickerVisible: false
    });

    _handleDatePicked = (date) => {
        console.log(`_handleDatePicked()----> picked date: ${date.toString()}`)
        this.setState({
            datePicked: true,
            date: `${date.toString().split(" ")[0]} ${date.toString().split(" ")[1]} ${date.toString().split(" ")[2]} ${date.toString().split(" ")[3]}`
        })
        this._hideDatePicker();
    };

    sumbit = async() => {
        console.log(`submit():\n\t${this.state.title}\n\t${this.state.description}\n\t${this.state.location}\n\t${this.state.date} at ${this.state.time}`)
        this.setState({
            isModalVisible: false, 
            isLoading: true
        })
        try {
            console.log(`submit()----> getting user data from AsyncStorage....`)
            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER);
            data = JSON.parse(data);
            console.log(`submit()----> data received from AsyncStorage: ${JSON.stringify(data)}`)
            try {
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${data.authToken}`
                    },
                    body: JSON.stringify({
                        branch_id: `${data.branchId}`,
                        title: this.state.title, 
                        body: this.state.description, 
                        event_date: `${this.state.date} at ${this.state.time}`,
                        location: this.state.location, 
                    })
                }
                console.log(`submit()----> data sent to API: ${JSON.stringify(options)}`)
                let response = await fetch(CONSTANTS.API.EVENTS, options)
                let responseJson = await response.json()
                if(JSON.stringify(responseJson).includes("error")) {
                    console.log(`submit()----> error occured when getting data from API: ${error.toString()}`)
                    this.setState({
                        isLoading: false, 
                        error: true, 
                        errorMessage: JSON.stringify(responseJson)
                    })
                    return ;
                }
                console.log(`submit()----> response received from API: ${JSON.stringify(responseJson)}`)
                this.setState({
                    eventId: responseJson.event._id
                })
                this.sendNotification()
            } catch (error) {
                console.log(`submit()----> error occured when getting data from API: ${error.toString()}`)
                this.setState({
                    isLoading: false,
                    error: true,
                    errorMessage: JSON.stringify(error)
                })
                return;
            }
        } catch (error) {
            console.log(`submit()----> error occured when getting data from AsyncStorage: ${error.toString()}`)
            this.setState({
                isLoading: false,
                error: true,
                errorMessage: JSON.stringify(error)
            })
            return;
        }
    }

    sendNotification = async () => {
        this.setState({
            isLoading: true,
        })
        try {
            console.log(`sendNotification()----> getting data from AsyncStorage...`)

            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER)
            data = JSON.parse(data)

            try {

                console.log(`sendNotification()----> getting user data from API....`)

                const options = {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${data.authToken}`
                    }
                }
                let response = await fetch(CONSTANTS.API.USER, options)
                let responseJson = await response.json()

                console.log(`data received from API: ${JSON.stringify(responseJson)}`)

                responseJson = responseJson.users

                var messages = []

                responseJson.forEach(user => {
                    messages.push({
                        "to": user.notificationToken,
                        "sound": "default",
                        "title": this.state.title,
                        "body": `${this.state.description}\n${this.state.date} at ${this.state.time}`,
                        "priority": "high",
                        "data": {
                            eventId: this.state.event,
                            type: "event",
                            branchId: data.branchId
                        }
                    });
                });

                const expoOptions = {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(messages)
                }
                try {

                    console.log(`sendNotfication()----> sending notification to devices.....`)

                    let notificationResponse = await fetch("https://exp.host/--/api/v2/push/send", expoOptions)
                    let notificationResponseJson = await notificationResponse.json()

                    console.log(`sendNotification()----> notification sent with response: ${JSON.stringify(notificationResponseJson)}`)

                    this.setState({
                        isLoading: false,
                    })

                    this.getEvents()

                    return;

                } catch (error) {

                    console.log(`sendNotification()----> error occured when sending notifications to devices: ${error}`)

                    this.setState({
                        isLoading: false,
                        error: true,
                        errorMessage: error
                    })

                    return;
                }

            } catch (error) {

                conosole.length(`sendNotification()----> error occured when getting users from API: ${error}`)

                this.setState({
                    isLoading: false,
                    error: true,
                    errorMessage: error.toString()
                })

                return;
            }
        } catch (error) {

            console.log(`sendNotification()----> error occured when getting data from AsyncStorage: ${error}`)

            this.setState({
                isLoading: false,
                error: true,
                errorMessage: error
            })

            return;
        }
    }

    tConvert(time) {
        // Check correct time format and split into components
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) { // If time format correct
            time = time.slice(1);  // Remove full string match value
            time[5] = +time[0] < 12 ? " am" : " pm"; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(""); // return adjusted time or original string
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
                }}>
                    <KeyboardAvoidingView style={styles.addEventModal} behavior="padding" style={styles.addEventModal}>
                            <View>
                                <View style={styles.modalSmallTitle}>
                                    <View style={styles.modalHeading}>
                                        <Text style={styles.modalTitleText}>Add new event</Text>
                                    </View>
                                    <View style={styles.modalHeaderCancelContainer}>
                                        <TouchableOpacity onPress={() => this.setState({ isModalVisible: false })}>
                                            <Image source={require("../../assets/icons/cancel.png")} resizeMode="contain" style={styles.modalIcon} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.hr} />
                                <View style={styles.modalSmall}>
                                    <TextInput onChangeText={(text) => {
                                        this.setState({
                                            title: text
                                        })
                                    }} placeholder="Event title...." style={styles.modalTextInput} />
                                </View>
                                <View style={styles.modalLarge}>
                                    <TextInput onChangeText={(text) => {
                                        this.setState({
                                            description: text
                                        })
                                    }} placeholder="Event description...." multiline={true} style={styles.modalTextInputLarge} />
                                </View>
                                <View style={styles.modalSmall}>
                                    <Image
                                        source={require("../../assets/icons/location.png")}
                                        style={{
                                            height: "90%",
                                            width: "10%",
                                        }}
                                        resizeMode="contain"
                                    />
                                    <TextInput
                                        style={{
                                            width: "85%",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 12,
                                            borderColor: "#9e9e9e",
                                            borderWidth: 1,
                                            margin: 8,
                                        }}
                                        placeholder="Event Venue"
                                        onChangeText={(text) => {
                                            this.setState({
                                                location: text
                                            })
                                        }}
                                    />
                                </View>
                                <View style={styles.modalSmall}>
                                    <DateTimePicker
                                        isVisible={this.state.isDatePickerVisible}
                                        onConfirm={this._handleDatePicked}
                                        onCancel={this._hideDatePicker}
                                        mode="date"
                                    />
                                    <Image
                                        source={require("../../assets/icons/date.png")}
                                        style={{
                                            height: "90%",
                                            width: "10%",
                                        }}
                                        resizeMode="contain"
                                    />
                                    <TouchableOpacity
                                        onPress={() => this._showDatePicker()}
                                        style={{
                                            width: "85%",
                                            alignItems: "flex-start",
                                            justifyContent: "center",
                                            padding: 12,
                                            borderColor: "#9e9e9e",
                                            borderWidth: 1,
                                            margin: 8,
                                        }}
                                    >
                                        {this.state.datePicked ? <Text>{this.state.date}</Text> : <Text style={styles.hint}>Event date</Text>}
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.modalSmall}>
                                    <DateTimePicker
                                        isVisible={this.state.isTimePickerVisible}
                                        onConfirm={this._handleTimePicked}
                                        onCancel={this._hideTimePicker}
                                        mode="time"
                                        is24Hour={false}
                                    />
                                    <Image
                                        source={require("../../assets/icons/time.png")}
                                        style={{
                                            height: "90%",
                                            width: "10%",
                                        }}
                                        resizeMode="contain"
                                    />
                                    <TouchableOpacity
                                        onPress={() => this._showTimePicker()}
                                        style={{
                                            width: "85%",
                                            alignItems: "flex-start",
                                            justifyContent: "center",
                                            padding: 12,
                                            borderColor: "#9e9e9e",
                                            borderWidth: 1,
                                            margin: 8,
                                        }}
                                    >
                                        {this.state.timePicked ? <Text>{this.state.time}</Text> : <Text style={styles.hint}>Event time</Text>}
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    flexDirection: "row",
                                    height: 56,
                                    marginTop: 32,
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#fff", 
                                }}>
                                    <TouchableOpacity 
                                        style={{
                                            width: "96%", 
                                            height: "64%",
                                            backgroundColor: "#228B22",
                                            borderRadius: 5,
                                            alignItems: "center", 
                                            justifyContent: "center"
                                        }}
                                        onPress={() => this.sumbit()}
                                    >
                                        <Text style={{
                                            color: "#ffffff",
                                            fontSize: 18,
                                        }}>Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
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
        paddingRight: 12, 
        paddingLeft: 12,
        paddingTop: 6,
        backgroundColor: "#fff"
    },
    container: {
        flex: 1,
    },
    generalContainer: {
        flex: 1,
        padding: 12, 
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff"
    },
    searchBarInputContainer: {
        height: "75%", 
        width: "80%", 
    },
    header: {
        width: "100%", 
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e1e8ee"
    },
    searchBar: {
        width: "90%", 
        height: 50, 
        alignItems: "center", 
        justifyContent: "center",
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
    },
    modalSmall: {
        flexDirection: "row",
        height: 56, 
        width: "100%", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "#fff", 
    },
    modalSmallTitle: {
        height: 56, 
        width: "100%", 
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff", 
    },
    modalLarge: {
        height: 200,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    hr: {
        backgroundColor: "#333333",
        width: "100%",
        alignSelf: "center",
        height: 1.25,
        marginBottom: 16,
    },
    modalTitle: {
        height: 176,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    modalTitleText: {
        color: "#222", 
        textAlign: "center", 
        fontSize: 20,
    },
    modalTextInput: {
        width: "100%",
        padding: 12,
        borderColor: "#9e9e9e",
        borderWidth: 1,
        // borderRadius: 2.5,
        margin: 8,
    },
    modalTextInputButton: {
        width: "90%",
        height: "80%",
        borderColor: "#9e9e9e",
        borderWidth: 1,
        // borderRadius: 2.5,
        margin: 8,
    },
    modalTextInputLarge: {
        width: "100%",
        height: 200,
        textAlignVertical: "top",
        margin: 8,
        padding: 12,
        borderColor: "#9e9e9e",
        borderWidth: 0.8,
        // borderRadius: 2.5,
    },
    modalHeader: {
        height: 48, 
        width: "100%", 
        marginBottom: 14,
        alignItems: "flex-end", 
        justifyContent: "flex-start",
        backgroundColor: "#fff", 
    },
    modalIcon: {
        height: 28, 
        width: 28
    },
    modalTitleIcon: {
        height: "100%",
        width: "15%", 
        margin: 14
    },
    modalHeading: {
        flexDirection: "row",
        width: "85%", 
        alignItems: "center",
        height: "100%"
    },
    modalHeaderCancelContainer: {
        width: "14%",
        alignItems: "flex-end",
        justifyContent: "center",
        height: "100%"
    },
    hint: {
        color: "#bdbdbd", 
    },
    textInputIcon: {
        height: 30, 
        width: "9%"
    }
})