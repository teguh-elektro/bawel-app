import React, { Component } from 'react';
import { 
    Container, 
    Header, 
    Content, 
    Text,
    View } from 'native-base';
import {FlatList, StyleSheet, TouchableOpacity,Image} from 'react-native'
import {firebase} from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { NavigationEvents } from "react-navigation";
import Ionicons from 'react-native-vector-icons/Ionicons'

export default class ListAvatarExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
          userList: [],
          uid: '',
          id:'',
          email: '',
          displayName: '',
        };
      }
      
      componentDidMount(){
        const {email, displayName, uid} = firebase.auth().currentUser;
        this.setState({email, displayName, uid: uid});
        this.getDataUser(this.state.uid)
      }
    
      async getDataUser(uid) {
        await this.setState({uid: uid, userList: []});
        await database().ref('/user').on('child_added', data => {
          let person = data.val();
          if (person.id !== uid) {
            this.setState(prevData => {
              return {userList: [...prevData.userList, person]};
            });
          }
        });
      }

    render() {
    return (
      <Container>
          <NavigationEvents
            onWillFocus={() => {
                this.getDataUser(this.state.uid)
            }}
          />
        <Header style={{backgroundColor: '#694fad'}} androidStatusBarColor='#694fad'/>
        <Content>
        <FlatList
          style={{flex:1}}
          data={this.state.userList}
          renderItem={({ item }) => 
            <TouchableOpacity 
                onPress={() => this.props.navigation.navigate('chat', {item})}
                onLongPress={() => this.props.navigation.navigate('Review', {item})}
            >      
            <View style={styles.listItem}>
              <TouchableOpacity onPress={this.signOutUser}>
                <Image source={{uri: item.photo}} style={styles.pic} />
              </TouchableOpacity>
             
              <View style={{flex:8, marginLeft:10}}>
                <Text style={{fontWeight:"bold", fontSize:18}}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                
                {item.status == 'Online' ? (
                  <Ionicons name='md-radio-button-on' size={20} color='green' />
                ) : (
                  <Ionicons name='md-radio-button-on' size={20} color='red' />
                )}
                
              </View>
            </View>
            </TouchableOpacity>
            
          }
          keyExtractor={(item, index) => index.toString()}
        />
        </Content>
      </Container>
    );
  }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop:0,
    },
    listItem:{
      padding:10,
      backgroundColor:"#fafafafa",
      width:"100%",
      flex:1,
      borderBottomWidth: 1,
      borderColor: '#DCDCDC',
      alignSelf:"center",
      flexDirection:"row", 
    },
    divider: {
      marginVertical: 5,
      width: "99%",
      borderWidth: 1,
      borderColor: "#E9ECEF"
    },
    fieldRow: {
      width:'100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: '#DCDCDC',
      backgroundColor: 'white',
      borderBottomWidth: 1,
      padding: 10,
    },
    pic: {
      borderRadius: 30,
      width: 60,
      height: 60,
    },
    nameContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 280,
    },
    nameTxt: {
      marginLeft: 15,
      fontWeight: '600',
      color: '#222',
      fontSize: 18,
      width: 170,
    },
    status: {
      fontWeight: '200',
      color: '#ccc',
      fontSize: 13,
    },
    msgContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 15,
    },
    statusol: {
      fontWeight: '400',
      color: '#694fad',
      fontSize: 12,
      marginLeft: 15,
    },
    email: {
      fontWeight: '400',
      color: 'gray',
      fontSize: 12,
    },
  });