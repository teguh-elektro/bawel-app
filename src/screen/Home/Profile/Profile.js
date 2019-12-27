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

export default class Profile extends Component {
    state = {
        email: '',
        displayName: '',
        uid: '',
    };
    
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
              <TouchableOpacity 
                style={styles.buttonContainer}
                onPress={this.signOutUser}
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
    height:200,
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
    marginTop:130
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
    marginBottom:20,
    width:250,
    borderRadius:30,
    backgroundColor: "#694fad"
  },
});