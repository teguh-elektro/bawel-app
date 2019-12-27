import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import {firebase} from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { NavigationEvents } from "react-navigation";
import ImagePicker from 'react-native-image-picker'
import { Button } from 'native-base';


// function uploadImage(uri) {
//     let timestamp = (Date.now() / 1000 | 0).toString();
//     let api_key = '669194393237618'
//     let api_secret = 'J0Q_clWN2ub2i-rDkHoNoERSSz8'
//     let cloud = 'bawel-app'
//     let hash_string = 'timestamp=' + timestamp + api_secret
//     let upload_url = 'https://api.cloudinary.com/v1_1/' + cloud + '/image/upload'
  
//     let xhr = new XMLHttpRequest();
//     xhr.open('POST', upload_url);
//     xhr.onload = () => {
//       console.log(xhr);
//     };
//     let formdata = new FormData();
//     formdata.append('file', {uri: uri, type: 'image/png', name: 'upload.png'});
//     xhr.send(formdata);
// }

export default class Profile extends Component {
    state = {
        email: '',
        displayName: '',
        uid: '',
        photo: null,
    };
    
    handleChoosePhoto = () => {
        const options = {
          noData: true,
        }
        ImagePicker.launchImageLibrary(options, response => {
          if (response.uri) {
            this.setState({ photo: response })
          }
        })
    }

    componentDidMount() {
        this.getprofile();    
    }
    
    getprofile(){
        const {email, displayName, uid} = firebase.auth().currentUser;
        this.setState({email, displayName, uid});
    }
    
    signOutUser = () => {
        database()
            .ref('/user/' + this.state.uid)
            .update({
                status: 'Offline',
            });
        firebase.auth().signOut();
    };

  render() {
    if(this.state.photo !== null){  
    console.log(this.state.photo.uri);
      console.log(this.state.photo.fileName);
      console.log(this.state.photo.type);
    }

      
    return (
      <View style={styles.container}>
          <NavigationEvents
            onWillFocus={() => {
                this.getprofile();
            }}
          />
          <View style={styles.header}></View>
          <Image style={styles.avatar} source={{uri: 'https://bootdey.com/img/Content/avatar/avatar6.png'}}/>
          
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <Text style={styles.name}>{this.state.displayName}</Text>
              <Text style={styles.info}>{this.state.email}</Text>              
              
              <Button
                style={styles.buttonContainer}
                onPress={() => {this.handleChoosePhoto()}}
              >
                <Text style={{color:'white'}}>Edit Photo</Text>  
              </Button>  
              
              <TouchableOpacity 
                style={styles.buttonContainer}
                onPress={() => {this.signOutUser()}}
              >
                <Text style={{color:'white'}}>Log Out</Text>  
              </TouchableOpacity>              
            </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header:{
    backgroundColor: "#694fad",
    height:140,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom:10,
    alignSelf:'center',
    position: 'absolute',
    marginTop:80
  },
  name:{
    fontSize:22,
    color:"#FFFFFF",
    fontWeight:'600',
  },
  body:{
    marginTop:40,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    padding:30,
  },
  name:{
    fontSize:28,
    color: "#3e2465",
    fontWeight: "600"
  },
  info:{
    fontSize:16,
    color: "#694fad",
    marginTop:4
  },
  description:{
    fontSize:16,
    color: "#696969",
    marginTop:10,
    textAlign: 'center'
  },
  buttonContainer: {
    marginTop:10,
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:10,
    width:250,
    borderRadius:30,
    backgroundColor: "#694fad"
  },
});