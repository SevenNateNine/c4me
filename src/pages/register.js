import React,{Component} from 'react';
import axios from 'axios';
import './components/static/css/register.css';
import './components/static/css/bootstrap.min.css';
import {default as backend} from '../backend.js';
import CookCheck from './components/loginRegRedir';

class Register extends Component{
  constructor(props) {
    super(props);
    this.state = {
      first:'',
      last:'',
      user: '',
      pass:'',
      email: ''
    }
    //Bind Event Listeners
    this.onChangeFirst = this.onChangeFirst.bind(this);
    this.onChangeLast = this.onChangeLast.bind(this);
    this.onChangeUser = this.onChangeUser.bind(this);
    this.onChangePass = this.onChangePass.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    }
    
  //Begin Event Listeners
  onChangeFirst(event) {
    this.setState({ first: event.target.value });
  }
  onChangeLast(event) {
    this.setState({ last: event.target.value });
  }
  onChangeUser(event) {
    this.setState({ user: event.target.value });
  }
  onChangePass(event) {
    this.setState({ pass: event.target.value });
  }
  onChangeEmail(event) {
    this.setState({ email: event.target.value });
  }
  //Submit API Request to Register New Account
  onSubmit(e) {
    e.preventDefault();

    /*
    *An axios Request is posted here.
    *axios.post('http://localhost:9000/register', newUser)
    *.then(res => console.log(res.data));
    */
    backend.post('/user',  {
      name:this.state.user,
      pass:this.state.pass,
      first_name:this.state.first,
      last_name:this.state.last,
      email:this.state.email
    })
        
    .then(res => {
      console.log("success");
      this.props.history.push("/");
    })
    .catch(err => console.log(err));


  };

  /*  This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered, and the charts below it.
  */
    render(){
        return(
            <div className="signup-form">
              <CookCheck/>
            <form action="" method="post" onSubmit={this.onSubmit}>
                <h2 style={{fontFamily: 'poppin', fontSize: '24pt', fontStyle: 'bold'}}>Registration</h2>
                <p className="hint-text">Create your account. It's free and only takes a minute.</p>
                <div class="form-row mb-4" >
                    <div class="col">
                
                      <input type="text" id="defaultRegisterFormFirstName" class="form-control" placeholder="First name" value={this.state.first}
                        onChange={this.onChangeFirst}required="required" style={{fontFamily: 'poppin'}}/>
                    </div>
                    <div class="col">
                     
                      <input type="text" id="defaultRegisterFormLastName" class="form-control" placeholder="Last name" value={this.state.last}
                        onChange={this.onChangeLast}required="required" style={{fontFamily: 'poppin'}}/>
                    </div>
                  </div>
                
                <div className="form-group">
                    <input type="email" className="form-control" name="email" placeholder="Email"value={this.state.email}
                    onChange={this.onChangeEmail} required="required" style={{fontFamily: 'poppin'}}/>
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" name="username" placeholder="Username"value={this.state.user}
                    onChange={this.onChangeUser} required="required" style={{fontFamily: 'poppin'}}/>
                </div>
                <div className="form-group">
                    <input type="password" className="form-control" name="password" placeholder="Password" value={this.state.pass}
                    onChange={this.onChangePass} required="required" style={{fontFamily: 'poppin'}}/>
                </div>
                <div className="form-group">
                    <input type="password" className="form-control" name="confirm_password" placeholder="Confirm Password" required="required" style={{fontFamily: 'poppin'}}/>
                </div>
                <div className="form-group">
                    <label className="checkbox-inline"><input type="checkbox" required="required"/> I accept the <a style= {{color: '#4da6ff'}} href="/terms">Terms of Use</a> &amp; <a href="/privacy" style={{color:'#4da6ff'}}>Privacy Policy</a></label>
                </div>
                <div className="form-group">
                  <button href="/" type="submit" id="submitButton" className="btn btn-lg btn-block" onClick={this.onSubmit} style={{backgroundColor: '#cceeff', borderRadius: '15px', color:'black', fontFamily: 'poppin'}}>Register Now</button>
                </div>
                <div className="text-center">Already have an account? <a href="/" style={{color:'#4da6ff'}}>Sign in</a></div>
            </form>
    </div>

        );
    }
}

export default Register;
