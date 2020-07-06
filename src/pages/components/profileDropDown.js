import React,{Component} from 'react'
import { Dropdown } from 'semantic-ui-react'
import Cookies from 'universal-cookie';
import {default as backend} from '../../backend.js';

class dropDown extends Component{
  constructor(props){
    super(props);
    this.logout=this.logout.bind(this)
  }

logout(){
  backend.put('/logout',{},{
    
    headers:{
      Authorization: (new Cookies()).get('auth')
    },  
  })    
  .then(res => {
    console.log("success");
    this.props.history.push("/");
  })
  .catch(err => console.log(err));
}

render(){
  return(
  <Dropdown text='Hello' style = {{color: 'black'}}>
    <Dropdown.Menu style ={{marginTop: '15%'}}>
      <Dropdown.Item text='View Profile' href = "/myProfile"/>
      <Dropdown.Item text='Logout' onClick={this.logout} />
    </Dropdown.Menu>
  </Dropdown>
);
}
} 
export default dropDown;