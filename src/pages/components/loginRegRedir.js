
import React,{Component} from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {Redirect,useHistory} from 'react-router-dom';
import {default as backend} from '../../backend.js';

class cookCheck extends Component{
    constructor(props) {
        super(props);
        this.state={
            admin: 0,
            student: 0
        } 
    }
    componentDidMount(){
        backend.get('/validate', {headers:{
            Authorization: (new Cookies()).get('auth')
            }})
            .then(res=>{
              console.log(res.data);
              if(res.data.type=='Admin'){
                this.setState({admin: 1});
              }
             if(res.data.type=='Student'){
                this.setState({student: 1});
             }
          })
          .catch(error => {
            console.log("User Must Log in or Register")
          });
    }

    render(){
        if(this.state.admin==1){
            return(<div><Redirect  to="/admin"/></div>);
        }
        if(this.state.student==1){
            return(<div><Redirect  to="/home"/></div>);
        }

        return(<div></div>);
    }
}

export default cookCheck;