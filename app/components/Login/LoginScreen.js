import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Dimensions,
    ScrollView,
    AsyncStorage,
    BackHandler,
    KeyboardAvoidingView
} from "react-native"
import {
    Spinner
} from "native-base"
import {
    Permissions,
    Notifications
} from "expo";
import CONSTANTS from '../../constants/Constants'

export default class LoginScreen extends Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            username: "", 
            password: "", 
            errorMessage: "",
            error: false, 
            isLoading: false,
            authFail: false 
        };
        console.log(`\n\n------------------------------------------------------------------------LOGIN SCREEN------------------------------------------------------------------------`)
        this.login = this.login.bind(this)
        this.getNotificationToken = this.getNotificationToken.bind(this);
        this.checkUserLoggedIn = this.checkUserLoggedIn.bind(this)
        this.getAuthToken = this.getAuthToken.bind(this);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount = () => {
        this.checkUserLoggedIn()
    }
    
    componentWillMount = () => {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        BackHandler.exitApp()
        return true;
    }

    getAuthToken = async() => {
        console.log(`getAuthToken()---->getting username and password from async storage ....`)
        try {
            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER);
            data = JSON.parse(data);
            console.log(`getAuthToken()---->data from async storage: ${JSON.stringify(data)}`)
            try {
                console.log(`getAuthToken()---->getting auth token from API with URL: ${CONSTANTS.API.USER}/signin  ....`)
                const options = {
                    method: "POST", 
                    headers: {
                        Accept: "application/json", 
                        "Content-Type": "application/json"
                    }, 
                    body: JSON.stringify({
                        username: data.username, 
                        password: data.password, 
                        notificationToken: data.notificationToken
                    })
                }
                let response = await fetch(`${CONSTANTS.API.USER}/signin`, options);
                let responseJson = await response.json()
                console.log(`getAuthToken()---->response from API: ${JSON.stringify(responseJson)}`)
                data.authToken = responseJson.token;
                console.log(`getAuthKey()---->authToken received from API: ${responseJson.token}`)
                await AsyncStorage.setItem(CONSTANTS.ASYNC_STORAGE.USER, JSON.stringify(data));
                this.setState({
                    isLoading: false, 
                })
                if(data.branchId != null) {
                    console.log(`getAuthKey()----> branch selected by user already exists. Rerouting to HomeSreen....`)
                    this.props.navigation.navigate("HomeScreen")
                    return ;
                }
                this.props.navigation.navigate("BranchScreen")
                return;
            } catch(error) {
                console.log(`\n\ngetAuthToken()->error fetching data from API: ${error}`)
                return;
            }
        } catch(error) {
            console.log(`getAuthToken()---->error getting token from async storage: ${error}`)
            this.setState({
                isLoading: false,
                error: true, 
                errorMessage: error.toString()
            })
            return;
        }
    }

    checkUserLoggedIn = async () => {
        this.setState({
            isLoading: true
        })
        let response = await (AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER));
        if (response != null) {
            // user exists
            console.log(`checkUserSignedIn()---->user already logged in.`)
            this.getAuthToken()
            return;
        }
        console.log(`checkUserSignedIn()---->user not logged in.`)
        this.setState({
            isLoading: false
        })
        this.getNotificationToken()
        return;
    }


    getNotificationToken = async() => {
        console.log(`getNotificationToken()---->getting notification token....`)
        this.setState({
            isLoading: true
        })
        const {
            status: existingStatus
        } = await Permissions.getAsync(
            Permissions.NOTIFICATIONS
        );
        let finalStatus = existingStatus;
        console.log(`getNotificationToken()---->finalStatus: ${finalStatus}`)
        // only ask if permissions have not already been determined, because
        // iOS won"t necessarily prompt the user a second time.
        if (existingStatus !== "granted") {
            // Android remote notification permissions are granted during the app
            // install, so this will only ask on iOS
            const {
                status
            } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }

        // Stop here if the user did not grant permissions
        if (finalStatus !== "granted") {
            this.setState({
                isLoading: false,
                error: true, 
                errorMessage: `Failed to get permission to send and receive notifications.\nRestart the app.`
            })
            console.warn(`\n\ngetNotificationToken()---->could not get permission to send notifications`)
            return;
        }

        // Get the token that uniquely identifies this device
        let token = await Notifications.getExpoPushTokenAsync();
        console.log(`getNotificationToken()----> successfully extracted notification token: ${token}`)
        this.setState({
            notificationToken: token,
            isLoading: false
        })

        // Handle notifications that are received or selected while the app
        // is open. If the app was closed and then opened by tapping the
        // notification (rather than just tapping the app icon to open it),
        // this function will fire on the next tick after the app starts
        // with the notification data.
        this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }

    _handleNotification = (notification) => {
        switch (notification.type) {
            case "event":
                this.props.navigation.navigate("EventScreen")
                break;
        
            default:
                break;
        }
    }

    login = async(username, password) => {
        console.log(`login()---->logging user with credentials->username: ${this.state.usernmae}\tpassword: ${this.state.password} ....`)
        this.setState({
            isLoading: true
        })
        if(username.length < 6 && password.length < 6) {
            console.log(`login()---->username/password length less than 6.`)
            this.setState({
                isLoading: false, 
                authFail: true
            })
            return ;
        }
        try {
            console.log(`login()---->fetching data using credentials with URL: ${CONSTANTS.API.USER}/signin ...`)
            const options = {
                method: "POST", 
                headers: {
                    Accept: "application/json", 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username, 
                    password: password,
                    notificationToken: this.state.notificationToken
                })
            }
            let response = await fetch(`${CONSTANTS.API.USER}/signin`, options)
            let responseJson = await response.json()
            console.log(`login()---->response from API: ${JSON.stringify(responseJson)}`)
            if(JSON.stringify(responseJson).includes("Auth fail") || JSON.stringify(responseJson).includes("fail")) {
                console.log(`login()----> username/password incorrect`)
                this.setState({
                    isLoading: false, 
                    authFail: true
                })
                return ;
            }
            const data = {
                username: username, 
                password: password, 
                authToken: responseJson.token, 
                notificationToken: this.state.notificationToken
            }
            console.log(`login()---->user credentials verified.saving user data to async storage ....`)
            await AsyncStorage.setItem(CONSTANTS.ASYNC_STORAGE.USER, JSON.stringify(data))
            this.setState({
                isLoading: false
            })
            console.log(`login()---->navigating to BranchScreen`)
            this.props.navigation.navigate("BranchScreen")
        } catch(error) {
            console.log(`login()---->error when fetching data from API: ${error}`)
            this.setState({
                isLoading: false, 
                error: true, 
                errorMessage: error.toString()
            })
        }
    }

    render() {
        if(this.state.isLoading) {
            return(
                <View style={styles.generalContainer}>
                    <Image resizeMode="contain" source={require("../../assets/gif/bubbles.gif")} style={styles.gif} />
                </View>
            )
        }

        if(this.state.error) {
            return (
                <View style={styles.generalContainer}>
                    <Text style={styles.textError}>{this.state.errorMessage}</Text>
                </View>
            )
        }

        if(this.state.authFail) {
            return (
                <KeyboardAvoidingView style={styles.container} behavior="padding">
                    <View>
                        <View style={styles.topContainer}>
                            <Image source={require("../../assets/logo/logo.png")} resizeMode="contain" style={styles.logo}/>
                        </View>
                        <View style={styles.centerContainer}>
                            <View style={styles.inputContainerAuthFail}>
                                <Image source={require("../../assets/icons/user_material.png")} resizeMode="contain" style={styles.icons}/>
                                <TextInput 
                                    placeholder="username" 
                                    keyboardType="email-address" 
                                    underlineColorAndroid="transparent" 
                                    style={styles.input}
                                    onChangeText={(text) => {
                                        this.setState({username: text})
                                    }}
                                />
                            </View>
                            <View style={styles.inputContainerAuthFail}>
                                <Image source={require("../../assets/icons/password.png")} resizeMode="contain" style={styles.icons} />
                                <TextInput 
                                    placeholder="password" 
                                    keyboardType="numbers-and-punctuation" 
                                    secureTextEntry={true} 
                                    underlineColorAndroid="transparent" 
                                    style={styles.input}
                                    onChangeText={(text) => {
                                        this.setState({ password: text })
                                    }}
                                />
                            </View>
                            <Text style={styles.textAuthFail}>username and password incorrect!</Text>
                        </View>
                        <View style={styles.bottomContainer}>
                            <TouchableOpacity 
                                style={styles.buttonContainer}
                                onPress={() => {this.login(this.state.username, this.state.password)}}
                            >
                                <Text style={styles.text}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            )
        }

        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <View>
                    <View style={styles.topContainer}>
                        <Image source={require("../../assets/logo/logo.png")} resizeMode="contain" style={styles.logo}/>
                    </View> 
                    <View style={styles.centerContainer}>
                        <View style={styles.inputContainer}>
                            <Image source={require("../../assets/icons/user_material.png")} resizeMode="contain" style={styles.icons}/>
                            <TextInput 
                                placeholder="username" 
                                keyboardType="email-address" 
                                underlineColorAndroid="transparent" 
                                style={styles.input}
                                onChangeText={(text) => {
                                    this.setState({username: text})
                                }}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Image source={require("../../assets/icons/password.png")} resizeMode="contain" style={styles.icons} />
                            <TextInput 
                                placeholder="password" 
                                keyboardType="numbers-and-punctuation" 
                                secureTextEntry={true} 
                                underlineColorAndroid="transparent" 
                                style={styles.input}
                                onChangeText={(text) => {
                                    this.setState({ password: text })
                                }}
                            />
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity 
                            style={styles.buttonContainer}
                            onPress={() => {this.login(this.state.username, this.state.password)}}
                        >
                            <Text style={styles.text}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    generalContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff"
    },
    topContainer: {
        backgroundColor: "#fff",
        height: "50%",
        alignItems: "center",
        justifyContent: "center",
    },
    centerContainer: {
        backgroundColor: "#fff",
        height: 211,
        alignItems: "center",
        justifyContent: "center",
    },
    bottomContainer: {
        backgroundColor: "#fff",
        height: 141,
        alignItems: "center",
        paddingTop: 12,
    },
    inputContainer: {
        width: "75%",
        flexDirection: "row",
        borderRadius: 4,
        paddingLeft: 10,
        paddingRight: 10,
        borderWidth: 0.75,
        borderColor: "#000",
        height: "30%",
        margin: 16,
        backgroundColor: "#fff",
        alignItems: "center"
    },
    inputContainerAuthFail: {
        width: "75%",
        flexDirection: "row",
        borderRadius: 4,
        paddingLeft: 10,
        paddingRight: 10,
        borderWidth: 0.75,
        borderColor: "#ff0000",
        height: "30%",
        margin: 16,
        backgroundColor: "#fff",
        alignItems: "center"
    },
    buttonContainer: {
        width: "75%",
        flexDirection: "row",
        borderRadius: 4,
        paddingLeft: 10,
        paddingRight: 10,
        height: "35%",
        "backgroundColor": "#2E7D32",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        height: "75%",
        width: "75%",
    },
    icons: {
        height: "80%",
        width: "8%",
        marginRight: 4,
    },
    input: {
        width: "88%",
        height: "100%",
        paddingLeft: 12
    },
    text: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",

    },
    textAuthFail: {
        width: "75%",
        textAlign: "right",
        color: "#ff0000",
        fontSize: 16,
    },
    textError: {
        textAlign: "center",
        width: "100%",
        height: "100%",
        fontSize: 22,
        color: "#222",
        alignSelf: "center"
    },
    gif: {
        height: "20%", 
        width: "20%"
    }
})
