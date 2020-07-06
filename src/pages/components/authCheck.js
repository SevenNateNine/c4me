import React,{Component} from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {Redirect,useHistory} from 'react-router-dom';
import {default as backend} from '../../backend.js';

class authCheck extends Component{
    constructor(props) {
        super(props);
        this.state={
            redirect: false
        } 
    }
  /*
    This is a bit of a hack.
  */
  componentDidMount(){
    backend.get('/validate', {headers:{
        Authorization: (new Cookies()).get('auth')
        }})
        .then(res=>{
          console.log(res.data);
          if(res.data.type=='Student'){
            console.log("Auth")
          }
          else{
            this.setState({redirect: true});
          }
      })
      .catch(error => {
        this.setState({redirect: true});
      });
  }

  render(){
      if(this.state.redirect==true){
      return(
          <div><Redirect  to="/login"/></div>
     ); 
    }
    else{
        return(
            <div></div>
       ); 
    }   
  }
}

export default authCheck;
