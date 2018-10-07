import React from 'react';
import {
  createStackNavigator
} from 'react-navigation'

// -------SCREENS-------- //
import LoginScreen from './app/components/Login/LoginScreen'
import HomeScreen from './app/components/Home/HomeScreen'
import BranchScreen from './app/components/Branch/BranchScreen'
import GalleryScreen from './app/components/Gallery/GalleryScreen'
import ExamScreen from './app/components/Exam/ExamScreen'
import EventScreen from './app/components/Event/EventScreen'
import NotificationScreen from './app/components/Notification/NotificationScreen'

const App = createStackNavigator({
  LoginScreen: {
    screen: LoginScreen
  },
  BranchScreen: {
    screen: BranchScreen
  },
  HomeScreen: {
    screen: HomeScreen
  },
  GalleryScreen: {
    screen: GalleryScreen
  },
  ExamScreen: {
    screen: ExamScreen
  },
  EventScreen: {
    screen: EventScreen
  },
  NotificationScreen: {
    screen: NotificationScreen
  }
})

export default App;