import React,{Component} from 'react';
import {Redirect,useHistory} from 'react-router-dom';
import axios from 'axios';
import loginErr from './components/loginErr';
import './components/static/css/login.css';
import './components/static/css/bootstrap.min.css';
import study from './components/static/img/studying.gif';
import Cookies from 'universal-cookie';
import {default as backend} from '../backend.js';
import CookCheck from './components/loginRegRedir';


class Login extends Component{
  constructor(props) {
    super(props);    
    this.state = {
      user: '',
      pass:'',
      error:false
    }
    //Bind Event Listeners
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangePass = this.onChangePass.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  //Begin Event Handlers  
  onChangeName(event) {
    this.setState({ name: event.target.value });
  }
  onChangePass(event) {
    this.setState({ pass: event.target.value });
  }
  onSubmit(e) {
    e.preventDefault();
    const user = {
      name: this.state.name,
      pass: this.state.pass
    }
  //End Event Handlers
  
  /*
   *An axios Request is posted here.
   *axios.post('http://localhost:9000/login', user)
   *.then(res => console.log(res.data));
  */
    backend.put('/login', user).then((res) => {
      const cookies = new Cookies();
      if (res.data.success) {
        //give cookie
        cookies.set('auth', res.data.token, {path: '/'});
        if(res.data.type=="Admin"){
          this.props.history.push("/admin");
          return  <Redirect  to="/admin/"/>
        }
        else{
          this.props.history.push("/home");
          return  <Redirect  to="/home"/>
        }
        //redirect success
      } 
      else {
        console.log('login fail');
        this.setState({ error: true });
      }
    })
    .catch((res)=>{
      this.setState({ error: true });
    });

  }
  onSubmitTest(e){
    return  <Redirect push to="/myprofile/"/>
  }
  componentDidMount() {
    document.title = 'Login | c4me | Teenage Mutant FullStack Turtles';
  }

render(){

    if(this.state.error){
      return(                
        <div className="container-login100" style={{backgroundColor: '#ffe5e5'}}>
        <CookCheck/>
          <div className="wrap-login100">
              <div className="login100-form-title" style={{backgroundImage: "url("+study+")" }}>
                  <span  style={{fontSize: '40px', color:'white', fontWeight: 'bold'}}>
                      c4me
                  </span>
                  <br></br>
                  <div style={{fontSize:'20px',color: 'white'}}>Please Login</div>
              </div>
              <div className='err'>
                        Error: Your Username or Password is incorrect.
                    </div>
              <form className="login100-form validate-form" method="post"  style={{marginBottom:'-9%'}}>
              <div className="wrap-input100 validate-input m-b-26">
                  <span class="label-input100">Username</span>
                  <input type="text" className="input100" name="username" placeholder="Enter username"value={this.state.name}
                  onChange={this.onChangeName} required="required"/>
              </div>
              <div className="wrap-input100 validate-input m-b-18">
                  <span class="label-input100">Password</span>
                  <input type="password" className="input100" name="password" placeholder="Enter password" value={this.state.pass}
                  onChange={this.onChangePass} required="required"/>
              </div>
                  
              <div className="flex-sb-m w-full p-b-30">
              </div>
              <div>
                  <button className="login100-form-btn" onClick= {this.onSubmit} type="submit" id="submitButton" style={{marginTop: '0%', backgroundColor: '#cceeff', borderRadius: '15px', borderColor: '#cceeff', color: 'black'}}>
                      Login
                  </button>
              </div>
            
              <div className="reg" style={{marginTop: '5%'}}> Need an account? Register <a style={{cursor:'pointer', color: '#4da6ff', fontSize:'12pt'}} href="/register">here!</a></div>
              </form>
          </div>
      </div>
        );
    }

    else{
      return(                
        <div className="container-login100" style={{backgroundColor: '#ffe5e5'}}>
          <CookCheck/>
            <div className="wrap-login100">
                <div className="login100-form-title" style={{backgroundImage: "url("+study+")" }}>
                    <span  style={{fontSize: '40px', color:'white', fontWeight: 'bold'}}>
                        c4me
                    </span>
                    <br></br>
                    <div style={{fontSize:'20px',color: 'white'}}>Please Login</div>
                </div>

                <form className="login100-form validate-form" method="post"  style={{marginBottom:'-9%'}}>
                <div className="wrap-input100 validate-input m-b-26">
                    <span class="label-input100">Username</span>
                    <input type="text" className="input100" name="username" placeholder="Enter username"value={this.state.name}
                    onChange={this.onChangeName} required="required"/>
                </div>
                <div className="wrap-input100 validate-input m-b-18">
                    <span class="label-input100">Password</span>
                    <input type="password" className="input100" name="password" placeholder="Enter password" value={this.state.pass}
                    onChange={this.onChangePass} required="required"/>
                </div>
                    
                <div className="flex-sb-m w-full p-b-30">
                </div>
                <div>
                    <button className="login100-form-btn" onClick= {this.onSubmit} type="submit" id="submitButton" style={{marginTop: '0%', backgroundColor: '#cceeff', borderRadius: '15px', borderColor: '#cceeff', color: 'black'}}>
                        Login
                    </button>
                </div>
              
                <div className="reg" style={{marginTop: '5%'}}> Need an account? Register <a style={{cursor:'pointer', color: '#4da6ff', fontSize:'12pt'}} href="/register">here!</a></div>
                </form>
            </div>
        </div>
      );
    }
  }
}

export default Login;
