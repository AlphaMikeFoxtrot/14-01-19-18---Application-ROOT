import React, { Component } from 'react';
import { 
    Image, 
    Text,
    StyleSheet,
    TouchableOpacity,
    View,
    CameraRoll,
} from 'react-native';
import {
    Card,
    CardItem,
    Thumbnail,
    Button,
    Icon,
    Left,
    Body,
    Right,
    Spinner
} from 'native-base';
import {
    FileSystem,
} from 'expo'

export default class ListCardItemExam extends Component {
    constructor(props) {
        super(props);
        this.state = {
            downloaded: false,
            isLoading: false
        };
        this.saveImage = this.saveImage.bind(this)
    }

    saveImage = async() => {
        this.setState({
            isLoading: true
        })
        const imgUrl = this.props.imageUrl
        const nameArr = imgUrl.split("/")
        const name = nameArr[nameArr.length - 1]
        const { uri } = await FileSystem.downloadAsync(this.props.imageUrl, FileSystem.documentDirectory + name)
        console.log(`ListCardItemExam->saveImage()----> saved image to fileSystem(${uri})`)
        const { status } = await Expo.Permissions.askAsync(Expo.Permissions.CAMERA_ROLL);
        if(status === "granted") {
            CameraRoll
                .saveToCameraRoll(uri)
                .then(uriGallery => {
                    this.setState({
                        isLoading: false, 
                        downloaded: true
                    })
                    console.log(`ListCardItemExam->saveImage()----> saved image to gallery(${uriGallery})`)
                    return;
                })
                .catch(error => {
                    console.log(`ListCardItemExam->saveImage()----> error occured when saving image to gallery: ${error.toString()}`)
                    this.setState({
                        isLoading: false,
                        downloaded: false
                    })
                    return;
                })
        } else {
            this.setState({
                isLoading: false,
                downloaded: false
            })
            console.log(`ListCardItemExam->saveImage()----> permission denied for using camerRoll--> status: ${status}`)
            return;
        }
    }

    render() {

        if(this.state.isLoading) {
            return(
                <Card>
                    <CardItem>
                        <Left>
                            <Text style={styles.title}>{this.props.title}</Text>
                        </Left>
                        <Right>
                            <Image resizeMode="contain" source={require("../../assets/gif/bubbles.gif")} style={styles.gif} />
                        </Right>
                    </CardItem>
                    <CardItem>
                        <View style={styles.hr} />
                    </CardItem>
                    <CardItem cardBody>
                        <Image source={{uri: this.props.imageUrl}} resizeMode="contain" style={{height: 500, width: null, flex: 1}}/>
                    </CardItem>
                </Card>
            )
        }

        if(this.state.downloaded) {
            return (
                <Card>
                    <CardItem>
                        <Left>
                            <Text style={styles.title}>{this.props.title}</Text>
                        </Left>
                        <Right>
                            <Image source={require('../../assets/icons/done.png')} style={styles.icons} />
                        </Right>
                    </CardItem>
                    <CardItem>
                        <View style={styles.hr} />
                    </CardItem>
                    <CardItem cardBody>
                        <Image source={{uri: this.props.imageUrl}} resizeMode="contain" style={{height: 500, width: null, flex: 1}}/>
                    </CardItem>
                </Card>
            )
        }

        return (
            <Card>
                <CardItem>
                    <Left>
                        <Text style={styles.title}>{this.props.title}</Text>
                    </Left>
                    <Right>
                        <TouchableOpacity onPress={() => this.saveImage()}>
                            <Image resizeMode="contain" source={require('../../assets/icons/download.png')} style={styles.icons} />
                        </TouchableOpacity>
                    </Right>
                </CardItem>
                <CardItem>
                    <View style={styles.hr} />
                </CardItem>
                <CardItem cardBody>
                    <Image source={{uri: this.props.imageUrl}} resizeMode="contain" style={{height: 500, width: null, flex: 1}}/>
                </CardItem>
            </Card>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        color: "#000", 
        fontWeight: "bold",
        margin: 4,
    }, 
    icons: {
        height: 32,
        width: 32
    }, 
    hr: {
        backgroundColor: "#000", 
        width: "100%",
        height: 0.55
    },
    spinnerContainer: {
        height: 24, 
        width: 24
    },
    gif: {
        height: 36, 
        width: 36
    }
})