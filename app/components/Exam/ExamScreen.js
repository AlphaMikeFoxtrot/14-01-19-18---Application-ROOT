import React, { Component } from 'react';
import { 
    View, 
    Text,
    StyleSheet, 
    BackHandler, 
    AsyncStorage, 
    FlatList, 
    Image
} from 'react-native';
import {
    SearchBar
} from 'react-native-elements'
import {
    Spinner
} from 'native-base'

import CONSTANTS from '../../constants/Constants'

import ListCardItemExam from '../ListCardItem/ListCardItemExam'

export default class ExamScreen extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {  
            isLoading: false, 
            error: false, 
            errorMessage: '', 
            data: []
        };
        this.arrayholder = []
        console.log(`\n\n------------------------------------------------------------------------EXAM SCREEN------------------------------------------------------------------------`)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
        this.getExamTimeTables = this.getExamTimeTables.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.searchFilterFunction = this.searchFilterFunction.bind(this)
    }

    componentDidMount = () => {
        this.getExamTimeTables()
    }
    

    componentWillMount = () => {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        console.log(`handleBackButtonClick()----> rerouting to HomeScreen...`)
        console.log(`\n\n------------------------------------------------------------------------HOME SCREEN------------------------------------------------------------------------`)
        this.props.navigation.navigate("HomeScreen")
        return true;
    }

    getExamTimeTables = async() => {
        this.setState({
            isLoading: true
        })
        try {
            console.log(`getExamTimeTables()----> getting user data from AsyncStorage....`)
            let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER);
            data = JSON.parse(data)
            console.log(`getExamTimeTables()----> data received from AsyncStorage: ${JSON.stringify(data)}`)
            const authToken = data.authToken;
            const branchId = data.branchId
            const options = {
                method: "GET", 
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
            try {
                console.log(`getExamTimeTables()----> getting exam time tables from API with URL: ${CONSTANTS.API.EXAM} ....`)
                let response = await fetch(`${CONSTANTS.API.EXAM}/${branchId}`, options)
                let responseJson = await response.json()
                console.log(`getExamTimeTables()----> response from API: ${JSON.stringify(responseJson)}`)
                this.setState({
                    isLoading: false, 
                    data: responseJson.examTimeTables
                })
                this.arrayholder = responseJson.examTimeTables
                return;
            } catch(error) {
                console.log(`getExamTimeTables()----> error occured when getting data from API: ${error.toString()}`)
                this.setState({
                    isLoading: false, 
                    error: true, 
                    errorMessage: error.toString()
                })
                return;
            }
        } catch(error) {
            console.log(`getExamTimeTables()----> error occured when getting data from AsyncStorage: ${error.toString()}`)
            this.setState({
                isLoading: false, 
                error: true, 
                errorMessage: error.toString()
            })
        }
    }

    searchFilterFunction = text => {
        const newData = this.arrayholder.filter(item => {
            const itemData = item.caption.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });

        this.setState({ data: newData });
    };

    renderHeader = () => {
        return(
            <SearchBar
                lightTheme
                round
                searchIcon={{size: 24}}
                placeholder="class"
                onChangeText={(text) => this.searchFilterFunction(text)}
            />
        )
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
                    <Text style={styles.errorText}>{this.state.errorMessage}</Text>
                </View>
            )
        }
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.data}
                    renderItem={({item}) => {
                        return (
                            <ListCardItemExam imageUrl={item.imageUrl} title={item.caption}/>
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
        flex: 1 
    }, 
    generalContainer: {
        flex: 1, 
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    gif: {
        height: "20%",
        width: "20%"
    }
});