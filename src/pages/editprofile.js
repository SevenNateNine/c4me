import React,{Component} from 'react';
import ProfNav from './components/profileNav';
import joey from './components//static/img/joey.jpg';
import './components/static/css/bootstrap.min.css';
import './components/static/css/user.css';
import Cookies from 'universal-cookie';
import {default as backend} from '../backend.js';

class EditProfile extends Component{
    constructor(props) {
        super(props);

        this.state = {
            id: null,
            // user attributes
            user_name : null,
            first_name : null,
            last_name : null, 
            email : null,
            oldpass : null,
            newpass:null,
            newpass2: null,
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
            hs_name : null
        }
        this.onChangeUserName = this.onChangeUserName.bind(this);
        this.onChangeFirstName = this.onChangeFirstName.bind(this);
        this.onChangeLastName = this.onChangeLastName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeOldPassword = this.onChangeOldPassword.bind(this);
        this.onChangeNewPassword = this.onChangeNewPassword.bind(this);
        this.onChangeNewPassword2 = this.onChangeNewPassword2.bind(this);
        this.onChangeFinancial = this.onChangeFinancial.bind(this);
        this.onChangeMajor1 = this.onChangeMajor1.bind(this);
        this.onChangeMajor2 = this.onChangeMajor2.bind(this);
        this.onChangeYear = this.onChangeYear.bind(this);
        this.onChangeSatMath = this.onChangeSatMath.bind(this);
        this.onChangeSatEbrw = this.onChangeSatEbrw.bind(this);
        this.onChangeActEng = this.onChangeActEng.bind(this);
        this.onChangeActMath = this.onChangeActMath.bind(this);
        this.onChangeActReading = this.onChangeActReading.bind(this);
        this.onChangeActScience = this.onChangeActScience.bind(this);
        this.onChangeActComp = this.onChangeActComp.bind(this);
        this.onChangeSatLit = this.onChangeSatLit.bind(this);
        this.onChangeSatUs = this.onChangeSatUs.bind(this);
        this.onChangeSatMathI = this.onChangeSatMathI.bind(this);
        this.onChangeSatMathII = this.onChangeSatMathII.bind(this);
        this.onChangeSatEco = this.onChangeSatEco.bind(this);
        this.onChangeSatMol = this.onChangeSatMol.bind(this);
        this.onChangeSatChem = this.onChangeSatChem.bind(this);
        this.onChangeSatPhy = this.onChangeSatPhy.bind(this);
        this.onChangeNumAps = this.onChangeNumAps.bind(this);
        this.onChangeGpa = this.onChangeGpa.bind(this);
        this.onChangeHsName = this.onChangeHsName.bind(this);
        this.clear = this.clear.bind(this);
        this.finishEdit = this.finishEdit.bind(this);
    }
    onChangeUserName(event) {
      this.setState({ user_name: event.target.value});
    }
    onChangeFirstName(event) {
      this.setState({ first_name: event.target.value});
    }
    onChangeLastName(event) {
      this.setState({ last_name: event.target.value});
    }
    onChangeEmail(event) {
      this.setState({ email: event.target.value});
    }
    onChangeOldPassword(event) {
      this.setState({ oldpass: event.target.value});
    }
    onChangeNewPassword(event){
        this.setState({ newpass: event.target.value});
    }

    onChangeNewPassword2(event){
        this.setState({ newpass2: event.target.value});
    }
    onChangeFinancial(event) {
      this.setState({ financial_status: event.target.value});
    }
    onChangeYear(event) {
      this.setState({ grad_year: event.target.value});
    }
    onChangeMajor1(event) {
      this.setState({ major1: event.target.value});
    }
    onChangeMajor2(event) {
      this.setState({ major2: event.target.value});
    }
    onChangeSatMath(event) {
      this.setState({ sat_math: event.target.value});
    }
    onChangeSatEbrw(event) {
      this.setState({ sat_ebrw: event.target.value});
    }
    onChangeActEng(event) {
      this.setState({ act_eng: event.target.value});
    }
    onChangeActMath(event) {
      this.setState({ act_math: event.target.value});
    }
    onChangeActReading(event) {
      this.setState({ act_reading: event.target.value});
    }
    onChangeActScience(event) {
      this.setState({ act_science: event.target.value});
    }
    onChangeActComp(event) {
      this.setState({ act_comp: event.target.value});
    }
    onChangeSatLit(event) {
      this.setState({ sat_lit: event.target.value});
    }
    onChangeSatUs(event) {
      this.setState({ sat_us: event.target.value});
    }
    onChangeSatMathI(event) {
      this.setState({ sat_mathI: event.target.value});
    }
    onChangeSatMathII(event) {
      this.setState({ sat_mathII: event.target.value});
    }
    onChangeSatEco(event) {
      this.setState({ sat_eco: event.target.value});
    }
    onChangeSatMol(event) {
      this.setState({ sat_mol: event.target.value});
    }
    onChangeSatChem(event) {
      this.setState({ sat_chem: event.target.value});
    }
    onChangeSatPhy(event) {
      this.setState({ sat_phy: event.target.value});
    }
    onChangeNumAps(event) {
      this.setState({ numAPs: event.target.value});
    }
    onChangeGpa(event) {
      this.setState({ gpa: event.target.value});
    }
    onChangeHsName(event) {
      this.setState({ hs_name: event.target.value});
    }

    clear(e){
        window.location.reload(false);
    }
    finishEdit(e){
        if(this.state.newpass!=this.state.newpass2){
            console.log("NewPass and verify are different.")
            return 0;
        }
        if(this.state.newpass!=null){
            if(this.state.oldpass==null){
                console.log("Null Password for Old")
                return 0;
            }
        }
        var final_major1 = this.state.major1;
        var final_major2 = this.state.major2;
        var final_hsName = this.state.hs_name;
        if(final_major1 !== null){
          final_major1 = final_major1.replace(/ /g, "_");
        }
        if(final_major2 !== null){
          final_major2 = final_major2.replace(/ /g, "_");
        }
        if(final_hsName !== null){
          final_hsName = final_hsName.replace(/ /g, "_");
        }
        backend.put('/student', 
            {
                user_name : this.state.user_name,
                first_name : this.state.first_name,
                last_name : this.state.last_name,
                old_pass: this.state.oldpass,
                pass: this.state.newpass,
                email : this.state.email,
                hs_name : final_hsName,

                financial_status: this.state.financial_status,
                major1 : final_major1,
                major2 : final_major2,
                grad_year : this.state.grad_year,
                sat_math : this.state.sat_math,
                sat_ebrw: this.state.sat_ebrw,
                act_eng: this.state.act_eng,
                act_math: this.state.act_math,
                act_reading: this.state.act_reading,
                act_science: this.state.act_science,
                act_comp: this.state.act_comp,
                sat_lit: this.state.sat_lit,
                sat_us: this.state.sat_us,
                sat_mathI: this.state.sat_mathI,
                sat_mathII: this.state.sat_mathII,
                sat_eco: this.state.sat_eco,
                sat_mol: this.state.sat_mol,
                sat_chem: this.state.sat_chem,
                sat_phy: this.state.sat_phy,
                numAPs: this.state.numAPs,
                gpa: this.state.gpa
            },
            {
                params:{
                    id: this.props.match.params.id
                },
                headers:{
                    Authorization: (new Cookies()).get('auth')
                }
            }
        )
        .then((res) => {
            const cookies = new Cookies();
            if (res.data.success) {
              //give cookie
            //   cookies.set('auth', res.data.token, {path: '/'});

                console.log('edit done')
            } 
            else {
              this.setState({ error: true });
            }
          });
    }

    componentDidMount(){
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
    render(){
        return(
        <div className="colorfix">
           <ProfNav/>
                <div className="container content">

                    <div className="row profile">
                        <div className="col-md-4" style = {{position:'fixed'}}>
                            <div className="profile-sidebar position-fixed">

                                <div className="profile-usertitle">
                                    <div className="profile-usertitle">
                                        {this.state.first_name + ' ' + this.state.last_name}
                                    </div>
                                    <div className="profile-usertitle-name">
                                        @{this.state.user_name}
                                    </div>


                                </div>

                                <div className="profile-usermenu sidebar-sticky" >
                                    <ul className="nav flex-column">
                                        <li className="nav-item">
                                            <a href="/myprofile" className="nav-link">
                                                <i className="fa fa-home"></i>
                                                Overview </a>
                                        </li>
                                        <li className="active nav-item">
                                            <a className="nav-link active" >
                                                <i className="fa fa-edit"></i>
                                                Edit Profile </a>
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>
                        <div className="col-md-8" style={{marginLeft: '34%'}} >
                            <div className="profile-content">
                                <div className="col-lg-12 order-lg-4 personal-info" style={{marginTop: '2%'}}>

                                        <div>
                                            <h2 style ={{fontSize: '20pt', fontFamily: 'poppin'}}> Whats changed? </h2>
                                            <br/>
                                            <div className="col-lg-8 order-lg-1 personal-info" style={{marginLeft: '2.5%'}}>
                                                <h4 style ={{fontSize: '15pt', fontFamily: 'poppin'}}>Personal Information</h4>
                                                <hr/>
                                                <form role="form" style={{marginLeft: '5%'}}>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">First name</label>
                                                        <div className="col-lg-7">
                                                            <input className="form-control" value = {this.state.first_name} onChange = {this.onChangeFirstName}/>
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Last name</label>
                                                        <div className="col-lg-7">
                                                            <input className="form-control" value = {this.state.last_name} onChange = {this.onChangeLastName}/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Username</label>
                                                        <div className="col-lg-7">
                                                        <input className="form-control" value = {this.state.user_name} onChange = {this.onChangeUserName}/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Email</label>
                                                        <div className="col-lg-7">
                                                            <input className="form-control" value={this.state.email} onChange = {this.onChangeEmail}/>
                                                        </div>
                                                    </div>                                                                                                               
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">New Password</label>
                                                        <div className="col-lg-7">
                                                        <div className="form-group">
                                                            <input type="password" className="form-control" name="password" placeholder="Old Password"
                                                            onChange={this.onChangeOldPassword}  style={{fontFamily: 'poppin'}}/>
                                                        </div>
                                                        <div className="form-group">
                                                            <input type="password" className="form-control" name="password" placeholder="New Password"
                                                            onChange={this.onChangeNewPassword} style={{fontFamily: 'poppin'}}/>
                                                        </div>
                                                        <div className="form-group">
                                                            <input type="password" className="form-control" name="confirm_password" placeholder="Confirm New Password" 
                                                            onChange={this.onChangeNewPassword2} style={{fontFamily: 'poppin'}}/>
                                                        </div>
                                                        </div>

                                                    </div>

                                                </form>
                                            </div>

                                            <br/>
                                            <div className="col-lg-8 order-lg-1 personal-info" style={{marginLeft: '2.5%'}}>
                                                <h4 style ={{fontSize: '15pt', fontFamily: 'poppin'}}>Academic Information</h4>
                                                <hr/>
                                                <form role="form" style={{marginLeft:'5%'}}>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">High School</label>
                                                        <div className="col-lg-7">
                                                            <input className="form-control" value={this.state.hs_name} onChange = {this.onChangeHsName}/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Grad Year</label>
                                                        <div className="col-lg-7">
                                                            <input className="form-control" value={this.state.grad_year} onChange = {this.onChangeYear}/>
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">GPA</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control"  value={this.state.gpa} onChange = {this.onChangeGpa} min = "0.0" max = "4.0" step = "0.1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Major(s)</label>
                                                        <div className="col-lg-7">
                                                            <input className="form-control" value={this.state.major1} onChange = {this.onChangeMajor1}/> <br></br>
<input className="form-control" value={this.state.major2} onChange = {this.onChangeMajor2}/>

                                                        </div>
                                                    </div>
                                                 
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Financial Status</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.financial_status} onChange = {this.onChangeFinancial}min = "1" max = "3" step = "1"/>
                                                        </div>
                                                    </div>
                                                </form>
                                                <h4 style ={{fontSize: '15pt', fontFamily: 'poppin'}}>Academic Information</h4>
                                                <hr/>
                                                <form role="form" style={{marginLeft:'5%'}}>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Math</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_math} onChange = {this.onChangeSatMath}min ="0" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT EBRW</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_ebrw} onChange = {this.onChangeSatEbrw} min = "0" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">ACT</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.act_comp} onChange = {this.onChangeActComp} min = "0" max = "36" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">ACT English</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.act_eng} onChange = {this.onChangeActEng} min = "1" max = "36" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">ACT Math</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.act_math} onChange = {this.onChangeActMath} min = "1" max = "36" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Literature</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_lit} onChange = {this.onChangeSatLit} min = "200" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT US</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_us} onChange = {this.onChangeSatUs} min = "200" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Math I</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_mathI} onChange = {this.onChangeSatMathI} min = "200" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Math II</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_mathII} onChange = {this.onChangeSatMathII} min = "200" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Economics</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_eco} onChange = {this.onChangeSatEco} min = "200" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Molecular Biology</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_mol} onChange = {this.onChangeSatMol} min = "200" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Molecular Chemistry</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_chem} onChange = {this.onChangeSatChem} min = "200" max = "800" step = "1"/>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">SAT Molecular Physics</label>
                                                        <div className="col-lg-3">
                                                            <input className="form-control" type="number" value={this.state.sat_phy} onChange = {this.onChangeSatPhy} min = "200" max = "800" step = "1"/>
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
                    <footer className="footer fixed-bottom" >
      <div style={{marginLeft: '70%'}}>
      <button className= "btn submitButton" onClick={this.finishEdit} >Submit</button>
        <button className= "btn clearButton" onClick={this.clear} style={{borderColor: 'white', backgroundColor: 'white', boxShadow: '3px 3px grey'}}>Clear</button>
     
      </div>
    </footer>
                </div>
                
        );
    }
}

export default EditProfile;
