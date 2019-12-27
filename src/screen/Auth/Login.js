import React, { Component } from 'react';
import {ToastAndroid, Platform} from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Geolocation from 'react-native-geolocation-service';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-community/google-signin';
import AsyncStorage from '@react-native-community/async-storage';
  

import {
    Text,
    Container,
    Header,
    Left,
    Body,
    Right,
    Title,
    Content,
    Form,
    Item,
    Label,
    Input,
    Button,
}from 'native-base'


class Login extends React.Component {
    static navigationOptions = {
        header: null,
      };
      constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
          email: '',
          password: '',
          latitude: null,
          longitude: null,
          errorMessage: null,
          visible: false,
          Onprosess: false,
        };
      }
    
      componentDidMount() {
        this._isMounted = true;
        this.getLocation();
      };
    
      componentWillUnmount() {
        this._isMounted = false;
        Geolocation.clearWatch();
        Geolocation.stopObserving();
      }
    
      hasLocationPermission = async () => {
        if (
          Platform.OS === 'ios' ||
          (Platform.OS === 'android' && Platform.Version < 23)
        ) {
          return true;
        }
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (hasPermission) {
          return true;
        }
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (status === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }
        if (status === PermissionsAndroid.RESULTS.DENIED) {
          ToastAndroid.show(
            'Location Permission Denied By User.',
            ToastAndroid.LONG,
          );
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          ToastAndroid.show(
            'Location Permission Revoked By User.',
            ToastAndroid.LONG,
          );
        }
        return false;
      };
    
      getLocation = async () => {
        const hasLocationPermission = await this.hasLocationPermission();
    
        if (!hasLocationPermission) {
          return;
        }
    
        this.setState({loading: true}, () => {
          Geolocation.getCurrentPosition(
            position => {
              this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            error => {
              this.setState({errorMessage: error});
            },
            {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 8000,
              distanceFilter: 50,
              forceRequestLocation: true,
            },
          );
        });
      };
    
      hideToast = () => {
        this.setState({
          visible: false,
        });
      };
    
      handleLogin = () => {
        const {email, password} = this.state;
        if (email.length < 6) {
          ToastAndroid.show(
            'Please input a valid email address',
            ToastAndroid.LONG,
          );
        } else if (password.length < 6) {
          ToastAndroid.show(
            'Password must be at least 6 characters',
            ToastAndroid.LONG,
          );
        } else {
          database()
            .ref('user/')
            .orderByChild('/email')
            .equalTo(email)
            .once('value', result => {
              let data = result.val();
              if (data !== null) {
                let user = Object.values(data);
    
                AsyncStorage.setItem('user.email', user[0].email);
                AsyncStorage.setItem('user.name', user[0].name);
                AsyncStorage.setItem('user.photo', user[0].photo);
              }
            });
          firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(async response => {
              console.log('resLoginEmail: ', response);
    
              database()
                .ref('/user/' + response.user.uid)
                .update({
                  status: 'Online',
                  latitude: this.state.latitude || null,
                  longitude: this.state.longitude || null,
                });
             
              await AsyncStorage.setItem('uid', response.user.uid);
              // await AsyncStorage.setItem('user', response.user);
              ToastAndroid.show('Login success', ToastAndroid.LONG);
              this.props.navigation.navigate('Home');
            })
            .catch(error => {
              this.setState({
                errorMessage: error.message,
                email: '',
                password: '',
              });
              ToastAndroid.show(this.state.errorMessage, ToastAndroid.SHORT);
            });
        }
      };
    
      loginGoogle = async () => {
        this.setState({Onprosess: true});
        try {
          const {accessToken, idToken} = await GoogleSignin.signIn();
          const credential = firebase.auth.GoogleAuthProvider.credential(
            idToken,
            accessToken,
          );
    
          await firebase
            .auth()
            .signInWithCredential(credential)
            .then(async response => {
              console.log('resLoginGoogle: ', response);
              database()
                .ref('user/')
                .orderByChild('/email')
                .equalTo(response.user.email)
                .once('value', result => {
                  let data = result.val();
                  if (data !== null) {
                    database()
                      .ref('/user/' + response.user.uid)
                      .update({
                        name: response.user.displayName,
                        status: 'Online',
                        email: response.user.email,
                        photo: response.user.photoURL,
                        latitude: this.state.latitude || null,
                        longitude: this.state.longitude || null,
                        id: response.user.uid,
                      });
                      
                      ToastAndroid.show('Login success', ToastAndroid.SHORT);
                  } else {
                    database()
                      .ref('/user/' + response.user.uid)
                      .set({
                        name: response.user.displayName,
                        status: 'Online',
                        email: response.user.email,
                        photo: response.user.photoURL,
                        latitude: this.state.latitude || null,
                        longitude: this.state.longitude || null,
                        id: response.user.uid,
                      });
                  }
                });
                await AsyncStorage.setItem('uid', response.user.uid);
                // await AsyncStorage.setItem('user', response.user);
    
    
             
            })
            .catch(error => {
              this.setState({
                errorMessage: error.message,
                email: '',
                password: '',
              });
              ToastAndroid.show(this.state.errorMessage, ToastAndroid.SHORT);
            });
          this.setState({Onprosess: false});
        } catch (error) {
          console.warn(error);
    
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            this.setState({Onprosess: false});
            return;
          } else if (error.code === statusCodes.IN_PROGRESS) {
            this.setState(
              {
                errorMessage: 'In Progress..',
                visible: true,
                Onprosess: false,
              },
              () => this.hideToast(),
            );
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            this.setState(
              {
                errorMessage: 'Please Install Google Play Services',
                visible: true,
                Onprosess: false,
              },
              () => this.hideToast(),
            );
          } else {
            this.setState(
              {
                errorMessage: error.code || error.message,
                visible: true,
                Onprosess: false,
              },
              () => this.hideToast(),
            );
          }
        }
      };
      
    render() {
      return (

        <Container>
        <Header style={{backgroundColor: '#694fad'}} androidStatusBarColor='#694fad'>
        <Left/>
            <Body>
            <Title>LOG IN</Title>
            </Body>
        <Right />
        </Header>
        <Content>
        <Form>
            <Item floatingLabel style={{margin: 15}}>
            <Label>Email</Label>
            <Input 
                onChangeText={email => this.setState({email})}
                value={this.state.email}
            />
            </Item>
            <Item floatingLabel style={{margin: 15}}>
            <Label>Password</Label>
            <Input 
                secureTextEntry={true}
                onChangeText={password => this.setState({password})}
                value={this.state.password}
            />
            </Item>
            <Button 
                onPress={this.handleLogin}
                style={{margin: 15, borderRadius: 10, backgroundColor: '#694fad'}} 
            >
            <Left/>
                <Text>
                Login
                </Text>
            <Right />
            </Button> 
            <Button 
            style={{margin: 15, borderRadius: 10, backgroundColor: '#694fad'}} 
            onPress={() => this.props.navigation.navigate('Regist')}
            >
            <Left/>
                <Text>
                Sign Up
                </Text>
            <Right />
            </Button>
        </Form>
        </Content>
        </Container>
      );
    }
}
export default Login;