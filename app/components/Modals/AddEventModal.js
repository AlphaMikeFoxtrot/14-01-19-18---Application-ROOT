import React, { Component } from 'react';
import { 
    View,
    StyleSheet,
    Modal,  
    TextInput, 
    TouchableOpacity, 
    Text, 
    Image,
} from 'react-native'

export default class AddEventModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false, 
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text> Modal </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: "50%", 
        elevation: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#fff"
    }
})