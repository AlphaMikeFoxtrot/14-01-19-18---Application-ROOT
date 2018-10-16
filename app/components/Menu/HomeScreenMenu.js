import React, { Component } from 'react'
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity
} from 'react-native';
import CONSTANTS from '../../constants/Constants'

export default class HomeScreenMenu extends Component {
    render() {
        return(
            <View style={{marginTop: 50, backgroundColor: '#1b5e20'}}>
                <ScrollView>
                    {CONSTANTS.MENU_LIST.map(item => (
                        <TouchableOpacity
                        key={item.index}
                        onPress={() => console.log('entered menu')}
                        >
                            <Text style={{color: 'white', fontSize: 16, paddingLeft: 20, paddingTop: 16}}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )
    }
}