import React,{Component} from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {Redirect,useHistory} from 'react-router-dom';
import {default as backend} from '../../backend.js';

class adminCheck extends Component{
    constructor(props) {
        super(props);
        this.state={
            code: 1
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
          if(res.data.type=='Admin'){
            console.log("approved")
          }
          else{
            this.setState({code:3});
          }
      })
      .catch(error => {
        this.setState({code:2});
      });
  }

  render(){
      if(this.state.code==1){
      return(
          <div></div>
     ); 
    }
    else if(this.state.code==2){
        return(
            <div><Redirect  to="/login"/></div>
       ); 
    }
       else{
        return(
            <div><Redirect  to="/403"/></div>
       );
    }   
  }
}

export default adminCheck;