import React, { Component } from 'react';
import {ToastAndroid, Platform} from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Geolocation from 'react-native-geolocation-service';
import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';

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
    Button
}from 'native-base'

class Regist extends React.Component {
    static navigationOptions = {
        header: null,
      };
    
      constructor(props) {
        super(props)
    
        this.state = {
          isVisible: false,
          name: '',
          email: '',
          password: '',
          uid: '',
          latitude: null,
          longitude: null,
          errorMessage: null,
          loading: false,
          updatesEnabled: false,
        }
        this.handleSignUp = this.handleSignUp.bind(this);
      }
    
      componentDidMount = async () => {
        await this.getLocation();
      };
    
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
              console.log('Position: ', position.coords);
              
              this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              console.warn(position);
            },
            error => {
              this.setState({errorMessage: error, loading: false});
              console.warn(error);
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
    
    
      handleSignUp = () => {
        const {email, name, password} = this.state;
        if (name.length < 1) {
          ToastAndroid.show('Please input your fullname', ToastAndroid.LONG);
        } else if (email.length < 6) {
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
          firebase
          .auth()
          .createUserWithEmailAndPassword(this.state.email, this.state.password)
          .then(userCredentials => {
            console.log('User: ', userCredentials);
            database().ref('/user/' + userCredentials.user.uid)
              .set({
                name: this.state.name,
                status: 'Online',
                email: this.state.email,
                photo: 'https://bootdey.com/img/Content/avatar/avatar6.png',
                latitude: this.state.latitude || null,
                longitude: this.state.longitude || null,
                id: userCredentials.user.uid,
              })
              .catch(error => {
                ToastAndroid.show(error.message, ToastAndroid.LONG);
                this.setState({
                  name: '',
                  email: '',
                  password: '',
                });
              })
    
              if(userCredentials.user){
                userCredentials.user.updateProfile({
                  displayName: this.state.name
                }).then((s)=> {
                  this.props.navigation.navigate('Home');
                })
              }
          })
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
    
              // AsyncStorage.setItem('user', response.user);
              await AsyncStorage.setItem('uid', response.user.uid);
              await AsyncStorage.setItem('user', response.user);
              ToastAndroid.show('Login success', ToastAndroid.LONG);
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
            <Title>SIGN UP</Title>
            </Body>
        <Right />
        </Header>
        <Content>
        <Form>
            <Item floatingLabel style={{margin: 15}}>   
            <Label>Name</Label>
            <Input 
                onChangeText={name => this.setState({ name })}
                value={this.state.name}
            />
            </Item>
            <Item floatingLabel style={{margin: 15}}>
            <Label>Email</Label>
            <Input 
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
            />
            </Item>
            <Item floatingLabel style={{margin: 15}}>
            <Label>Password</Label>
            <Input 
                secureTextEntry={true}
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
            />
            </Item>
            <Button 
            style={{margin: 15, borderRadius: 10, backgroundColor: '#694fad'}} 
            onPress={this.handleSignUp}
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
export default Regist;