import React, { Component } from 'react';
import { 
    View, 
    Text,
    StyleSheet, 
    Image,
    TouchableOpacity,
    AsyncStorage,
    BackHandler,
    FlatList, 
} from 'react-native';
import {
    Spinner,
    Icon,
    Picker,
    Item
} from 'native-base'
import CONSTANTS from '../../constants/Constants'
import {
    Font
} from 'expo'

export default class BranchScreen extends Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            pickerSelectedItem: "none",
            pickerSelectedItemID: '', 
            error: false, 
            errorMessage: "",
            branchesResponseJson: []
        };
        console.log(`\n\n------------------------------------------------------------------------BRANCH SCREEN------------------------------------------------------------------------`)
        this.onPickerValueChange = this.onPickerValueChange.bind(this)
        this.getBranches = this.getBranches.bind(this)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
        this.mapPickerItem = this.mapPickerItem.bind(this)
        this.submit = this.submit.bind(this)
    }

    componentWillMount = () => {
        this.getBranches()
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        BackHandler.exitApp()
        return true;
    }

    getBranches = async() => {
        console.log(`getBranches()---->getting auth token to access API from Async Storage....`)
        this.setState({
            isLoading: true
        })
        let authToken;
        try {
            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER);
            data = JSON.parse(data);
            authToken = data.authToken;
            console.log(`getBranches()---->authToken retrieved from Async Storage: ${authToken}`)
        } catch(error) {
            console.log(`getBrances()---->error occured when getting authToken from Async Storage: ${error}`)
            this.setState({
                isLoading: false, 
                error: true, 
                errorMessage: error
            })
            return ;
        }
        console.log(`getBranches()---->getting brances from API with URL: ${CONSTANTS.API.BRANCH} ....`)
        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-type": "application/json",
                Authorization: `Bearer ${authToken}`
            }
        }
        try {
            const response = await fetch(CONSTANTS.API.BRANCH, options);
            const responseJson = await response.json();

            console.log(`getBranches()---->response from API: ${JSON.stringify(responseJson)}`)

            if (JSON.stringify(responseJson).includes("auth fail") || JSON.stringify(responseJson).includes("fail")) {
                console.log(`getBranches()---->authentication failed. authToken invalid`)
                this.setState({
                    isLoading: false,
                    error: true,
                    errorMessage: "Auth Fail"
                })
                return;
            }

            this.setState({
                isLoading: false,
                error: false,
                branchesResponseJson: responseJson,
                pickerSelectedItem: responseJson.branches[0].name, 
                pickerSelectedItemID: responseJson.branches[0]._id
            })
            return;
        }catch(error) {
            console.log(`getBranches()---->error occured when fetching branches from API: ${error}`)
            this.setState({
                isLoading: false, 
                error: true, 
                errorMessage: error.toString()
            })
            return;
        }
    }

    onPickerValueChange(value, position) {
        this.setState({
            pickerSelectedItem: value,
            pickerSelectedItemID: this.state.branchesResponseJson.branches[position]._id
        });
    }

    mapPickerItem() {
        console.log(`mapPickerItem()---->mapping items to Picker....`)
        return this.state.branchesResponseJson.branches.map((branch, index) => {
            return <Picker.Item key={index} value={branch.name} label={branch.name} />
        });
    }

    submit = async() => {
        this.setState({
            isLoading: true
        })
        console.log(`submit()---->pickerValue: ${this.state.pickerSelectedItem}\tpickerItemID: ${this.state.pickerSelectedItemID}`)
        try {
            console.log(`submit()----> writing changes(branchId) to AsyncStorage....`)
            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER)
            data = JSON.parse(data);
            data.branchId = this.state.pickerSelectedItemID
            await AsyncStorage.setItem(CONSTANTS.ASYNC_STORAGE.USER, JSON.stringify(data))
            this.setState({
                isLoading: false
            })
            console.log(`submit()----> write to AsyncStorage successfull`)
            this.props.navigation.navigate("HomeScreen")
            return;
        } catch(error) {
            console.log(`submit()----> error occured when writing data to AsyncStorage: ${error.toString()}`)
            this.setState({
                isLoading: false
            })
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
                    <Text style={styles.textAlignError}>{this.state.errorMessage}</Text>
                </View>
            )
        }

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <Image source={require("../../assets/logo/logo.png")} resizeMode="contain" style={styles.logo}/>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.instructionText}>Select Branch</Text>
                    <Item>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="ios-arrow-down-outline" />}
                            placeholder="none"
                            placeholderStyle={{ color: "#bfc6ea" }}
                            placeholderIconColor="#007aff"
                            selectedValue={this.state.pickerSelectedItem}
                            onValueChange={this.onPickerValueChange}
                        >
                            {this.mapPickerItem()}
                        </Picker>
                    </Item>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.iconContainer} onPress={() => this.submit()}>
                        <Image source={require("../../assets/icons/next.png")} resizeMode="contain" style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>
        );
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
        height: "60%",
        alignItems: "center",
        justifyContent: "center",
    },
    centerContainer: {
        backgroundColor: "#fff",
        height: "30%",
        alignItems: "center",
        paddingTop: 12,
        paddingRight: 24,
        paddingLeft: 24,
    },
    bottomContainer: {
        height: "10%", 
        backgroundColor: "#fff",
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 24,
    },
    iconContainer: {
        width: '100%',
        alignItems: "flex-end", 
        justifyContent: 'center',
    },
    textError: {
        fontSize: 22, 
        color: '#000', 
        textAlign: 'center',
    },
    icon: {
        height: "100%", 
        width: "25%", 
    },
    logo: {
        height: "75%",
        width: "75%",
    },
    textError: {
        textAlign: "center",
        width: "100%",
        height: "100%",
        fontSize: 22,
        color: "#222",
        alignSelf: "center"
    },
    instructionText: {
        fontSize: 20, 
        color: '#000',
        marginBottom: 12
    },
    gif: {
        height: "20%",
        width: "20%"
    }
})
