import React, { Component } from 'react';
import { 
    Image, 
    Text,
    StyleSheet,
    View
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
                <CardItem>
                    <View style={styles.hr} />
                </CardItem>
                <CardItem>
                    <Text style={styles.description}>{this.props.description}</Text>
                </CardItem>
                <CardItem>
                    <View style={styles.hr} />
                </CardItem>
                <CardItem style={styles.eventDetails}>
                    <Text>{`Venue: ${this.props.location}`}</Text>
                    <Text>{`Date: ${this.props.eventDate}`}</Text>
                </CardItem>
            </Card>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        color: "#000", 
        fontWeight: "bold",
        margin: 4,
    },
    eventDetails: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',

    },
    cardBody: {
        padding: 4
    },
    hr: {
        backgroundColor: "#000",
        width: "100%",
        height: 0.55
    },
    description: {
        fontSize: 18, 
        color: "#000", 
    }
})