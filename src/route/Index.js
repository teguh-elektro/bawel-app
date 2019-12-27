import React from 'react';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Home from './Home'
import Login from '../screen/Auth/Login'
import Regist from '../screen/Auth/Regist'
import Verify from '../screen/Auth/Verify'
import Review from '../screen/Home/Chat/Review'
import chat from '../screen/Chat/Chat'

const AppNavigator = createStackNavigator(
    {
      Home: Home,
      Login: Login,
      Regist: Regist,
      Verify: Verify,
      Review: Review,
      chat: chat,
    },
    {
        headerMode: 'none',
        initialRouteName: 'Verify',
    }
  );

export default createAppContainer(AppNavigator);