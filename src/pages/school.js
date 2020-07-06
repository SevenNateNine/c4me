import React,{Component} from 'react';
import axios from 'axios';
import Nav from './components/usernav';
import FourOhFour from './404';
import joey from './components//static/img/joey.jpg';
import './components/static/css/bootstrap.min.css';
import './components/static/css/user.css';
import Cookies from 'universal-cookie';
import {default as backend} from '../backend.js';

class School extends Component{
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
    backend.get('/school',  {
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
  /*  This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Page Content.
  */
  render(){
    if(this.state.exists){
      return(
            <div className="colorfix">
            <Nav/>
            {this.state.result.map(data=>
            <div className="container content">
                        <div className="row profile">
                            <div className="col-md-3">
                                <div className="profile-sidebar position-fixed">

                                    <div className="profile-usertitle">
                                        <div className="profile-usertitle">
                                            {this.state.result[0].name} 
                                        </div>
                                        <div className="profile-usertitle-join">
                                            {this.state.result[0].city},{this.state.result[0].state}
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
                                                <a className="nav-link" href="/search">
                                                    <i className="fa fa-edit"></i>
                                                    Back </a>
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                            <div className="col-md-9" >
                                <div className="profile-content">
                                    <div className="col-lg-12 order-lg-4 personal-info" style={{marginTop: '2%'}}>
                                        <div>
                                            <br/>
                                            <div className="col-lg-8 order-lg-1 personal-info" style={{marginLeft:'2.5%'}}>
                                                <h4>School Information</h4>
                                                <hr/>
                                                <form role="form" style={{marginLeft: '5%'}}>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Admission Rate</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{this.state.result[0].admission_rate}%</div>
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Cost of Attendance</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor: 'transparent', color: 'black'}}>${this.state.result[0].cost}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">College Ranking</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{this.state.result[0].ranking}</div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Student Body</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>{this.state.result[0].size}</div>
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Accepted GPA</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                                Average: {this.state.result[0].avg_accepted_gpa}
                                                                <br/>
                                                                Low End: {this.state.result[0].accepted_gpa_low}
                                                                <br/>
                                                                High End: {this.state.result[0].accepted_gpa_high}
                                                                <br/>

                                                                </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Accepted SAT Math</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            Average: {this.state.result[0].sat_math}
                                                                <br/>
                                                                Low End: {this.state.result[0].sat_math_range_low}
                                                                <br/>
                                                                High End: {this.state.result[0].sat_math_range_high}
                                                                <br/>

                                                                </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Accepted SAT EBRW</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            Average: {this.state.result[0].sat_ebrw}
                                                                <br/>
                                                                Low End: {this.state.result[0].sat_ebrw_range_low}
                                                                <br/>
                                                                High End: {this.state.result[0].sat_ebrw_range_high}
                                                                <br/>

                                                                </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-lg-5 col-form-label form-control-label">Accepted ACT</label>
                                                        <div className="col-lg-7">
                                                            <div className="form-control" style={{borderStyle: 'none', backgroundColor:'transparent',color: 'black'}}>
                                                            Average: {this.state.result[0].act_composite}
                                                                <br/>
                                                                Low End: {this.state.result[0].act_range_low}
                                                                <br/>
                                                                High End: {this.state.result[0].act_range_high}
                                                                <br/>

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

export default School;
