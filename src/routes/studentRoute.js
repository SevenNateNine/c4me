import React,{Component} from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Route,Redirect } from 'react-router-dom';

class studentRoute extends Component {
  constructor(props){
    super(props);
      this.state = {
        auth: false
      }
         axios.get('http://localhost:9000/validate', {headers:{
          Authorization: (new Cookies()).get('auth')
          }})
          .then(res=>{
            console.log(res.data);
            if(res.data.type=='Student'){
              this.setState({ auth: true });
            }
        })
        .catch(error => {
          console.log("Not Logged In")
        });
    }
  render() {
    const { component: Component, ...props } = this.props;
    return (
      <Route 
        {...props} 
        render={props => (
          this.state.auth ?
            <Component {...props} /> :
            <Redirect to='/login' />
        )} 
      />
    );
  }
}

export default studentRoute