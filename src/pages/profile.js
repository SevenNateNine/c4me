import React,{Component} from 'react';
import joey from './components//static/img/joey.jpg';
import './components/static/css/bootstrap.min.css';
import './components/static/css/user.css';
import Cookies from 'universal-cookie';
import ProfNav from './components/profileNav';
import {default as backend} from '../backend.js';

class Profile extends Component{

    constructor(props) {
        super(props);

        this.state = {
            id: null,
            // user attributes
            user_name : null,
            first_name : null,
            last_name : null, 
            email : null,
            // student attributes
            financial_status : null,
            major1 : null,
            major2 : null,
            grad_year : null,
            sat_math : null,
            sat_ebrw : null,
            act_eng : null,
            act_math : null,
            act_reading : null,
            act_science : null,
            act_comp : null,
            sat_lit : null,
            sat_us : null,
            sat_mathI : null,
            sat_mathII : null,
            sat_eco : null,
            sat_mol : null,
            sat_chem : null,
            sat_phy : null,
            numAPs : null,
            
            gpa : null,
            major1 : null,
            major2 : null,

            hs_name : null
        }
    }
      /*
        componentDidMount is a built in react method that says
        when the component is rendered, do this. When the component renders,
        an initial request is made to the backend is made to populate the page.
    */
    componentDidMount(){
        this.setState({id: this.props.match.params.id});
        backend.get('/me',  {
        headers:{
            Authorization: (new Cookies()).get('auth')
        }
        })
        .then(res=>{
            
            this.setState({
                user_name : res.data[0].user_name,
                first_name : res.data[0].first_name,
                last_name : res.data[0].last_name, 
                email : res.data[0].email,
                // student attributes
                financial_status : res.data[0].financial_status,
                major1 : res.data[0].major1,
                major2 : res.data[0].major2,
                grad_year : res.data[0].grad_year,
                sat_math : res.data[0].sat_math,
                sat_ebrw : res.data[0].sat_ebrw,
                act_eng : res.data[0].act_eng,
                act_math : res.data[0].act_math,
                act_reading : res.data[0].act_reading,
                act_science : res.data[0].act_science,
                act_comp : res.data[0].act_comp,
                sat_lit : res.data[0].sat_lit,
                sat_us : res.data[0].sat_us,
                sat_mathI : res.data[0].sat_mathI,
                sat_mathII : res.data[0].sat_mathII,
                sat_eco : res.data[0].sat_eco,
                sat_mol : res.data[0].sat_mol,
                sat_chem : res.data[0].sat_chem,
                sat_phy : res.data[0].sat_phy,
                numAPs : res.data[0].numAPs,
                gpa : res.data[0].gpa,
                hs_name : res.data[0].hs_name,
                major1 : res.data[0].major1,
                major2 : res.data[0].major2
            });
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
    return(
        <div class="colorfix" >
         <ProfNav/>
           <div class="container content">
                    <div class="row profile">
                        <div class="col-md-4" style = {{position:'fixed'}}>
                            <div class="profile-sidebar position-fixed">
                                <div class="profile-userpic">
                                </div>

                                <div class="profile-usertitle">
                                    <div class="profile-usertitle">
                                        {this.state.first_name + ' ' + this.state.last_name}
                                    </div>
                                    <div class="profile-usertitle-name">
                                        @{this.state.user_name}
                                    </div>
                                </div>

                                <div class="profile-usermenu sidebar-sticky">
                                    <ul class="nav flex-column">
                                        <li class="active nav-item">
                                            <a href="#" class="nav-link active">
                                                <i class="fa fa-home"></i>
                                                Overview </a>
                                        </li>
                                        
                                        <li class="nav-item">
                                            <a class="nav-link" href="editprofile">
                                                <i class="fa fa-edit"></i>
                                                Edit Profile </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="viewApplication" class="nav-link">
                                                <i class="fa fa-home"></i>
                                                Applications </a>
                                        </li>
                                       
                                    </ul>
                                </div>

                            </div>
                        </div>
                        <div class="col-md-8" style={{marginLeft: '34%'}}>
                            <div class="profile-content">
                                <div class="col-lg-12 order-lg-4 personal-info" style={{marginTop: '2%'}}>
                                    <div>
                                        <h2 style ={{fontSize: '20pt', fontFamily: 'poppin'}}> Welcome {this.state.first_name} </h2>  
                                        <br/>
                                        <div class="col-lg-8 order-lg-1 personal-info" style={{marginLeft:'2.5%'}}>
                                            <h4 style ={{fontSize: '15pt', fontFamily: 'poppin'}}>Personal Information</h4>
                                            <hr/>
                                            <form role="form" style={{marginLeft: '5%'}}>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">First name</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.first_name}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">Last name</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor: 'transparent', color: 'black'}}>
                                                            {this.state.last_name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">Username</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.user_name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">Email</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                            </form>
                                        </div>

                                        <br/>
                                        <div class="col-lg-8 order-lg-1 personal-info" style={{marginLeft:'2.5%'}}>
                                            <h4 style ={{fontSize: '15pt', fontFamily: 'poppin'}}>Academic Information</h4>
                                            <hr/>
                                            <form role="form" style={{marginLeft:'5%'}}>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">High School</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.hs_name}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">GPA</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.gpa}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">Major(s)</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.major1}
                                                        </div>
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.major2}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">Financial Status</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.financial_status}
                                                        </div>
                                                        
                                                    </div>
                                                </div>
                                            </form>
                                            <h4 style ={{fontSize: '15pt', fontFamily: 'poppin'}}>Test Scores</h4>
                                            <hr/>
                                            <form role="form" style={{marginLeft: '5%'}}>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Math</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_math}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT EBRW</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_ebrw}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">ACT</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.act_comp}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">ACT English</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.act_eng}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">ACT Math</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.act_math}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Literature</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_lit}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT US</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_us}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Math I</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_mathI}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Math II</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_mathII}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Economics</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_eco}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Molecular Biology</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_mol}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Chemistry</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_chem}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-lg-5 col-form-label form-control-label">SAT Physics</label>
                                                    <div class="col-lg-7">
                                                        <div class="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            {this.state.sat_phy}
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        );
  }
}

export default Profile;
