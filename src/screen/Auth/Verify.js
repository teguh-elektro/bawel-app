import React from 'react';
import {StyleSheet, ActivityIndicator} from 'react-native';
import auth, {firebase} from '@react-native-firebase/auth';
import {
    View, 
    Container,
    Header,
    Content
}from 'native-base'

export default class Loading extends React.Component {
  componentDidMount() {
    auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? 'Home' : 'Login');
    });
  }

  render() {
    return (
        <Container>
            <Header style={{backgroundColor: '#694fad'}} androidStatusBarColor='#694fad'/>
            <Content>
                <View>
                    <ActivityIndicator size='large' style={{flex: 1, backgroundColor: '#f5f5f5', opacity: 0.5}} color='#694fad' />
                </View>
            </Content>
                
        </Container>
    );
  }
}
