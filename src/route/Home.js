
import React from 'react'
import { createAppContainer } from 'react-navigation';
import { View } from 'native-base'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'

import Chat from '../screen/Home/Chat/List'
import Maps from '../screen/Home/Map/Map'
import Profile from '../screen/Home/Profile/Profile'


const TabNavigator = createMaterialBottomTabNavigator({
    Chat: {
        screen: Chat,
        navigationOptions:{  
            tabBarLabel:'Chat',  
            tabBarIcon: ({ tintColor }) => (  
                <View>  
                    <Ionicons style={[{color: tintColor}]} size={25} name={'md-chatboxes'}/>  
                </View>),  
        }  
    },
    Maps: {
        screen: Maps,
        navigationOptions:{  
            tabBarLabel:'Map',  
            tabBarIcon: ({ tintColor }) => (  
                <View>  
                    <Ionicons style={[{color: tintColor}]} size={25} name={'md-map'}/>  
                </View>),  
        }  
    },
    Profile: {
        screen: Profile,
        navigationOptions:{  
            tabBarLabel:'Profile',  
            tabBarIcon: ({ tintColor }) => (  
                <View>  
                    <Ionicons style={[{color: tintColor}]} size={25} name={'md-contact'}/>  
                </View>),  
        }  
    },
},
{
    initialRouteName: 'Chat',
    activeColor: '#f0edf6',
    inactiveColor: '#3e2465',
    barStyle: { backgroundColor: '#694fad' },
}
);


export default createAppContainer(TabNavigator);