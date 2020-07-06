import React,{Component} from 'react';
import axios from 'axios';
import Nav from './components/usernav';
import joey from './components//static/img/joey.jpg';
import FourOhFour from './404';
import './components/static/css/bootstrap.min.css';
import './components/static/css/user.css';
import Cookies from 'universal-cookie';
import {default as backend} from '../backend.js';

class OtherProfile extends Component{
  constructor(props) {
    super(props);
    this.state={
      result:[],
      exists:true
      }
    }
  /*
    componentDidMount is a built in react method that says
    when the component is rendered, do this. When the component renders,
    an initial request is made to the backend is made to populate the page.
  */
  componentDidMount(){
    backend.get('/student',  {
      params:{
        id: this.props.match.params.id
      },
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    })
    .then(res=>{
      this.setState({result: res.data});
    })
    .catch(error=>{
      this.setState({exists: false});
    });
  }
    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered, and the charts below it.
    */
  render(){
    if(this.state.exists){
      return(
            <div className="colorfix">
            <Nav/>
            {this.state.result.map(data=>
            <div className="container content">
                        <div className="row profile">
                            <div className="col-md-4">
                                <div className="profile-sidebar position-fixed">
                                
                                    <div className="profile-userpic">
                                    </div>

                                    <div className="profile-usertitle">
                                        <div className="profile-usertitle">
                                            {data.first_name} {data.last_name} 
                                        </div>
                                        <div className="profile-usertitle-name">
                                            @ {data.user_name}
                                        </div>
                                    </div>

                                    <div className="profile-usermenu sidebar-sticky">
                                        <ul className="nav flex-column">
                                            <li className="active nav-item">
                                                <a href="#" className="nav-link active">
                                                    <i className="fa fa-home"></i>
                                                    Overview </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" href="/">
                                                    <i className="fa fa-edit"></i>
                                                    Back </a>
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                            <div className="col-md-8" >
                                <div className="profile-content">
                                    <div className="col-lg-12 order-lg-4 personal-info" style={{marginTop: '2%'}}>
                                        <div>
                                            <h2> Welcome to {data.first_name}'s profile</h2>  
                                            <br/>
                                            <div className="col-lg-8 order-lg-1 personal-info" style={{marginLeft:'2.5%'}}>
                                                <h4>Personal Information</h4>
                                                <hr/>
                                                <form role="form" style={{marginLeft: '5%'}}>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">First name</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.first_name}</div>
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Last name</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor: 'transparent', color: 'black'}}>{data.last_name}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Email</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">High School</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.hs_name}</div>
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">GPA</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.gpa}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Majors</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.major1}</div>
                                                        </div>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.major2}</div>
                                                        </div>
                                                    </div>
                                                </form>
                                                <h4>Test Scores</h4>
                                                <hr/>
                                                <form role="form" style={{marginLeft: '5%'}}>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Math</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.sat_math}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT EBRW</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.sat_ebrw}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">ACT</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.act_comp}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">ACT English</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.act_eng}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">ACT Math</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{data.act_math}</div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Literature</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {data.sat_lit}
                                                        </div>
                                                    </div>
                                                    </div>
                                                    <div class="form-group row">
                                                        <label class="col-lg-5 col-form-label form-control-label">SAT US</label>
                                                        <div class="col-lg-7">
                                                            <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                                {data.sat_us}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group row">
                                                        <label class="col-lg-5 col-form-label form-control-label">SAT Math I</label>
                                                        <div class="col-lg-7">
                                                            <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                                {data.sat_mathI}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group row">
                                                        <label class="col-lg-5 col-form-label form-control-label">SAT Math II</label>
                                                        <div class="col-lg-7">
                                                            <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                                {data.sat_mathII}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group row">
                                                        <label class="col-lg-5 col-form-label form-control-label">SAT Economics</label>
                                                        <div class="col-lg-7">
                                                            <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                                {data.sat_eco}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group row">
                                                        <label class="col-lg-5 col-form-label form-control-label">SAT Molecular Biology</label>
                                                        <div class="col-lg-7">
                                                            <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                                {data.sat_mol}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group row">
                                                        <label class="col-lg-5 col-form-label form-control-label">SAT Chemistry</label>
                                                        <div class="col-lg-7">
                                                            <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                                {data.sat_chem}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group row">
                                                        <label class="col-lg-5 col-form-label form-control-label">SAT Physics</label>
                                                        <div class="col-lg-7">
                                                            <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                                {data.sat_phy}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            <br/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
      );
    }
    else{
      return(<FourOhFour/>);
    }
  }
}

export default OtherProfile;
