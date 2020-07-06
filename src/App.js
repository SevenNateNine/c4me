import React,{Component} from 'react';
import adHome from './pages/adminhome'
import login from './pages/login'
import editProfile from './pages/editprofile'
import school from './pages/school'
import profile from './pages/profile'
import otherProfile from './pages/otherprofile'
import register from './pages/register'
import search from './pages/search'
import fourOhFour from './pages/404'
import fourOhThree from './pages/403'
import review from './pages/review'
import terms from './pages/terms'
import privacy from './pages/privacy'
import similarHS from './pages/similarHS'

import appSearch from './pages/applicationSearch'
import test from './pages/testPage'
import studentHome from './pages/studentHome'
import viewApplication from './pages/viewApplication'


import {BrowserRouter,Route,Switch,Redirect} from 'react-router-dom';
import StudentRoute from './routes/studentRoute'
import axios from 'axios';
import Cookies from 'universal-cookie';


class App extends Component {

/*
isAuthenticated checks the headers to see if a cookie matches one in the database.
privateRoute uses that method and says "if this is an account, return the component".
Else, return login.

*/

    /*Simple Router - We Will Check
    Auth by making subclasses for route
    wherein cookies are checked and if
    cookie is correct, component=props,
    else, component= error (404,403,Login,etc.)
  */
  
  render(){
    return (
      <BrowserRouter>
            <Switch>
              <Route path="/" component={login} exact/>
              <Route path="/home" component={studentHome} exact />
              <Route path="/404" component={fourOhFour} exact/>
              <Route path="/bouncy" component={test} exact/>
              <Route path="/403" component={fourOhThree} exact/>
              <Route path="/login" component={login} exact/>
              <Route path="/admin" component={adHome} exact/>
              <Route path="/editprofile" component={editProfile} exact/>
              <Route path="/myprofile" component={profile} exact/>
              <Route path="/profile/:id" component={otherProfile} exact/>
              <Route path="/register" component={register} exact/>
              <Route path="/school/:id" component={school} exact/>
              <Route path="/search" component={search} exact/>
              <Route path="/review" component={review} exact/>
              <Route path="/terms" component={terms} exact/>
              <Route path="/privacy" component={privacy} exact/>
              <Route path="/similarhs" component={similarHS} exact/>
              <Route path = "/viewApplication" component={viewApplication} exact />
              <Route path="/applicationSearch/:id" component={appSearch} exact />
              <Route component ={fourOhFour} other/>
            </Switch>
        </BrowserRouter>
    );
  }
}

export default App;
