import React,{Component} from 'react';
import axios from 'axios';
import AdNav from './components/adminnav';
import './components/static/css/admin.css';
import './components/static/css/bootstrap.min.css';
import Cookies from 'universal-cookie';
import {default as backend} from '../backend.js';

class Review extends Component{
  constructor(props) {
  super(props);
  this.state = {
    populate:[]
    }
  }
  /*
    rejectDecision simply sends a request to the backend
    that deletes a student and their questionable decision
    and deletes it entirely from the database. It will not be permitted
    to enter the public website.
  */
  async rejectDecision(student_id,college_id){
    await backend.delete('/application', {
      student_id: student_id,
      college_id: college_id
      },
      {
        headers:{
          Authorization: (new Cookies()).get('auth')
        }
    })
    .then(res => console.log(res.data));
      alert("Decision have been deleted.");
      //Update Table post-deletion
      backend.get('/application/questionablelistAllData',  {
        params:{
        },
        headers:{
          Authorization: (new Cookies()).get('auth')
        }
      })
      .then(res=>{
        this.setState({populate: res.data});
      });
    }
  /*
    acceptDecision is a put request that simply flips the questionable flag
    in the database, allowing the admission decision to be viewed publicly
    by users in the database and be reflected in the graphs and application
    tracker.
  */
  async acceptDecision(student_id,college_id){
    await backend.put('/application/validate', {
        student_id: student_id,
        college_id: college_id
    },
    {
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    })
    .then(res => console.log(res.data));
    alert("Decisions been approved.");
    //update table post deletion
    backend.get('/application/questionablelistAllData',  {
      params:{
      },
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    })
    .then(res=>{
      this.setState({populate: res.data});
    });
  }
  /*
    componentDidMount is a built in react method that says
    when the component is rendered, do this. When the component renders,
    an initial request is made to the backend is made to populate the table.
  */
  componentDidMount(){
    backend.get('/application/questionablelistAllData',  {
      params:{
      },
      headers:{
        Authorization: (new Cookies()).get('auth')
      } 
    })
    .then(res=>{
      this.setState({populate: res.data});
      });
    }
  /*  This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered, and the charts below it.
  */
  render(){
      return(
            <div>
                <AdNav/>
                <div className="review">
                <div className="card" style={{color: 'black', marginLeft: '5%', marginRight: '5%'}}>
                <h5 class="card-header" style={{fontSize: '20pt'}}>Questionable Acceptance Decisions</h5>
                        <div className="card-body">
                            <table id="example" className="table table-striped table-bordered"  style={{width:"100%", textAlign:"center"}}>
                                <thead>
                                <tr >
                                    <th>School Name</th>
                                    <th>Student Name</th>
                                    <th>Decision</th>
                                    <th>School SAT Math</th>
                                    <th>Student SAT Math</th>
                                    <th>School SAT EBRW</th>
                                    <th>Student SAT EBRW</th>
                                    <th>GPA</th>
                                    <th >High School</th>
                                    <th>Accept Decision</th>
                                    <th>Delete Decision</th>

                                </tr>
                                </thead>
                                <tbody id="body">
                                    {this.state.populate.map(decision=>
                                    <tr>
                                        <td>{decision.school_name}</td>
                                        <td>{decision.user_name}</td>
                                        <td>{decision.status}</td>
                                        <td>{decision.school_sat_math}</td>
                                        <td>{decision.student_sat_math}</td>
                                        <td>{decision.school_sat_ebrw}</td>
                                        <td>{decision.student_sat_ebrw}</td>
                                        <td>{decision.student_gpa}</td>
                                        <td>{decision.high_school_name}</td>
                                        <td><button class="btn back" style = {{color: 'white'}}onClick={() =>{this.acceptDecision(decision.student_id,decision.college_id)}}>Accept</button></td>
                                        <td><button class="btn delete" style = {{fontWeight: "bold"}} onClick={() =>{this.rejectDecision(decision.student_id,decision.college_id)}}>Delete</button></td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
  }
}

export default Review;
