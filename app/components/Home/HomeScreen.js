import React, { Component } from 'react';
import { 
    View, 
    Text ,
    StyleSheet, 
    BackHandler,
    TouchableOpacity, 
    AsyncStorage,
    Image
} from 'react-native';
import {
    Menu,
    MenuProvider,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import HomeScreenMenu from '../Menu/HomeScreenMenu'
import {
    Spinner
} from 'native-base'
import CONSTANTS from '../../constants/Constants'
import {
    Col, 
    Row, 
    Grid
} from 'react-native-easy-grid'
import {
    Font
} from "expo"

export default class HomeScreen extends Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
        };
        console.log(`\n\n------------------------------------------------------------------------HOME SCREEN------------------------------------------------------------------------`)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
        this.logout = this.logout.bind(this)
        this.gallery = this.gallery.bind(this)
        this.exam = this.exam.bind(this);
        this.event = this.event.bind(this)
        this.notifications = this.notifications.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.onMenuOptionClicked = this.onMenuOptionClicked.bind(this)
    }    

    componentWillMount = async() => {
        await Font.loadAsync({
            "libel-suit": require("../../assets/fonts/libel-suit-rg.ttf")
        })
        this.setState({
            isLoading: false
        })
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        BackHandler.exitApp()
        return true;
    }

    gallery() {
        console.log(`gallery()----> rerouting to Gallery Screen....`)
        this.props.navigation.navigate("GalleryScreen")
    }

    notifications() {
        console.log(`notifications()----> rerouting to Notification Screen....`)
        this.props.navigation.navigate("NotificationScreen")
    }

    exam() {
        console.log(`exam()----> rerouting to Exam Screen`)
        this.props.navigation.navigate("ExamScreen")
    }

    event() {
        console.log(`event()----> rerouting to Event Screen`)
        this.props.navigation.navigate("EventScreen")
    }

    onMenuOptionClicked(item) {
        switch(item) {
            case 1:
                this.logout()
                break;
        }
    }

    renderHeader() {
        return(
            <Menu style={{alignItems: "flex-end", justifyContent: "center"}} onSelect={value => this.onMenuOptionClicked(value)}>
                <MenuTrigger children={<Image resizeMode="contain" source={require("../../assets/icons/menu.png")} style={{height: 32, width: 32, alignSelf: "flex-end"}}/>} />
                <MenuOptions>
                    <MenuOption value={1}>
                        <Text style={{fontSize: 14, color: "#000", margin: 12,}}>Logout</Text>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        )
    }

    logout = async() => {
        console.log(`logout()----> removing data from AsyncStorage....`)
        this.setState({
            isLoading: true
        })
        try {
            await AsyncStorage.removeItem(CONSTANTS.ASYNC_STORAGE.USER)
            this.setState({
                isLoading: false
            })
            console.log(`logout()----> successfully removed data from AsyncStorage. Rerouting to LoginScreen....`)
            this.props.navigation.navigate("LoginScreen")
            return; 
        } catch(error) {
            console.log(`logout()----> error occured when removing data from AsyncStorage: ${error.toString()}`)
            this.setState({
                isLoading: false
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
        return (
            <MenuProvider style={styles.container}>
                {this.renderHeader()}
                <View style={styles.topContainer}>
                    <Image source={require("../../assets/logo/logo.png")} resizeMode="contain" style={styles.logo}/>
                </View>
                <View style={styles.bottomContainer}>
                    <Grid>
                        <Col style={styles.col}>
                            <Row style={styles.row}>
                                <TouchableOpacity style={styles.card} onPress={this.gallery.bind(this)}>
                                    <Image source={require("../../assets/icons/_gallery.png")} style={styles.icons} resizeMode="contain" />
                                    <Text style={styles.iconLabel}>Gallery</Text>
                                </TouchableOpacity>
                            </Row>
                            <Row style={styles.row}>
                                <TouchableOpacity style={styles.card} onPress={() => this.notifications()}>
                                    <Image source={require("../../assets/icons/_notification.png")} style={styles.icons} resizeMode="contain" />
                                    <Text style={styles.iconLabel}>Notifications</Text>
                                </TouchableOpacity>
                            </Row>
                        </Col>
                        <Col style={styles.col}>
                            <Row style={styles.row}>
                                <TouchableOpacity style={styles.card} onPress={() => this.event()}>
                                    <Image source={require("../../assets/icons/_events.png")} style={styles.icons} resizeMode="contain" />
                                    <Text style={styles.iconLabel}>Events</Text>
                                </TouchableOpacity>
                            </Row>
                            <Row style={styles.row}>
                                <TouchableOpacity style={styles.card} onPress={() => this.exam()}>
                                    <Image source={require("../../assets/icons/_exams.png")} style={styles.icons} resizeMode="contain" />
                                    <Text style={styles.iconLabel}>Exams</Text>
                                </TouchableOpacity>
                            </Row>
                        </Col>
                    </Grid>
                </View>
            </MenuProvider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff", 
        padding: 12
    },
    generalContainer: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    header: {
        height: "5%", 
        backgroundColor: "#fff", 
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    topContainer: {
        height: "35%", 
        backgroundColor: "#fff",
        alignItems: "center", 
        justifyContent: 'center',
    }, 
    bottomContainer: {
        height: "58%", 
        backgroundColor: "#fff", 
        alignItems: "center", 
        justifyContent: 'center',
    },
    card: {
        flexDirection: 'column',
        alignItems: "center", 
        justifyContent: 'center',
        backgroundColor: "#fff", 
    },
    row: {
        backgroundColor: "#fff",
        margin: 6,
        width: "100%", 
        borderRadius: 3.5,
        borderWidth: .35,
        borderColor: 0.35,
        alignItems: "center", 
        justifyContent: 'center',
    },
    col: {
        backgroundColor: "#fff",
        margin: 6,
        alignItems: "center", 
        justifyContent: 'center',
    },
    logo: {
        height: "75%",
        width: "75%",
    },
    icons: {
        width: 96, 
        height: 96, 
        margin: 3, 
    },
    iconLabel: {
        fontSize: 18, 
        color: "#000",
        fontFamily: 'libel-suit',
        textAlign: "center", 
        fontWeight: 'bold',
        margin: 4, 
    },
    gif: {
        height: "20%",
        width: "20%"
    }
})