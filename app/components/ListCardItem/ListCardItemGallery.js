import React, { Component } from 'react';
import { 
    Image, 
    Text,
    StyleSheet
} from 'react-native';
import {
    Card,
    CardItem,
    Thumbnail,
    Button,
    Icon,
    Left,
    Body,
    Right
} from 'native-base';

export default class ListCardItemGallery extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <Card>
                <CardItem>
                    <Left>
                        <Text style={styles.title}>{this.props.title}</Text>
                    </Left>
                </CardItem>
                <CardItem cardBody>
                    <Image source={{uri: this.props.imageUrl}} style={{height: 200, width: null, flex: 1}}/>
                </CardItem>
                <CardItem>
                    <Text>{this.props.description}</Text>
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
    }
})