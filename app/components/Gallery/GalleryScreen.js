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
    TextInput,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView
} from 'react-native';
import ImagePicker from 'expo'
import {
    SearchBar
} from 'react-native-elements'
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
            isModalVisible: false,
            error: false, 
            errorMessage: '', 
        };
        console.log(`\n\n------------------------------------------------------------------------GALLERY SCREEN------------------------------------------------------------------------`)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
        this.getUserData = this.getUserData.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.pickGalleryImage = this.pickGalleryImage.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
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

    renderHeader = () => {
        return (
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Gallery</Text>
                </View>
                <TouchableOpacity onPress={() => this.toggleModal()} style={styles.headerAddContainer}>
                    <Image source={require("../../assets/icons/add.png")} style={styles.icon} resizeMode="contain" />
                </TouchableOpacity>
            </View>
        )
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

    toggleModal() {
        this.setState({
            isModalVisible: !this.state.isModalVisible
        })
        return;
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

    pickGalleryImage = async () => {
        let result = await Expo.ImagePicker.launchImageLibraryAsync()
        console.log(`pickGalleryImage()----> image picked: ${result.type}/${result.uri.split('/')[result.uri.split('/').length - 1]}`)
        return;
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
                {this.renderHeader()}
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
                                        <Text style={styles.modalTitleText}>Add new Gallery Item</Text>
                                    </View>
                                    <View style={styles.modalHeaderCancelContainer}>
                                        <TouchableOpacity onPress={() => this.toggleModal()}>
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
                                    }} placeholder="Gallery image title" style={styles.modalTextInput} />
                                </View>
                                <View style={styles.modalLarge}>
                                    <TextInput onChangeText={(text) => {
                                        this.setState({
                                            description: text
                                        })
                                    }} placeholder="Gallery image description" multiline={true} style={styles.modalTextInputLarge} />
                                </View>
                                <View style={styles.modalSmall}>
                                    <Image
                                        source={require("../../assets/icons/imagePicker.png")}
                                        style={{
                                            height: "90%",
                                            width: "10%",
                                        }}
                                        resizeMode="contain"
                                    />
                                    <TouchableOpacity
                                        style={{
                                            width: "85%",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 12,
                                            borderColor: "#9e9e9e",
                                            borderWidth: 1,
                                            margin: 8,
                                        }}
                                        onPress={() => {
                                            this.pickGalleryImage()
                                        }}
                                    >
                                        <Text>Upload Gallery Image</Text>
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
    },
    header: {
        width: '100%', 
        height: 50,
        backgroundColor: '#fff', 
        flexDirection: "row", 
        padding: 4, 
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitleContainer: {
        width: "90%", 
        height: '100%', 
        alignItems: "flex-start",
        justifyContent: 'center',
        padding: 4, 
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000', 
        textAlign: 'left', 
    }, 
    headerAddContainer: {
        height: '100%', 
        width: '10%', 
        alignItems: 'flex-start', 
        justifyContent: 'center', 
        paddingLeft: 12, 
        backgroundColor: '#fff',
    }, 
    icon: {
        height: '100%', 
        width: '100%', 
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
    addEventModal: {
        height: "100%", 
        width: "100%", 
        paddingRight: 12, 
        paddingLeft: 12,
        paddingTop: 6,
        backgroundColor: "#fff"
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


