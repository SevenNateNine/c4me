import React,{Component} from 'react';
import AdNav from './components/adminnav';
import Popup from './components/popup';
import AdminCheck from './components/adminCheck';
import axios, { post } from 'axios';

import './components/static/css/bootstrap.min.css';
import './components/static/css/admin.css';
import Cookies from 'universal-cookie';
import {default as backend} from '../backend.js';

class adHome extends Component{ 
  constructor(props){
    super(props);
    this.state = { 
      showPopup: false,
      studentFileIn: null,
      appFileIn: null
    };
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.studChange = this.studChange.bind(this)
    this.appChange = this.appChange.bind(this)
    this.fileUpload = this.fileUpload.bind(this)
    }
  
    togglePopup() {
     this.setState({
       showPopup: !this.state.showPopup
     });
   }

   onFormSubmit(e){
    e.preventDefault() // Stop form submit
    this.fileUpload(this.state.file).then((response)=>{
      console.log(response.data);
    })
  }
  fileUpload(e){
    const formData = new FormData();
    formData.append('students', this.state.studentFileIn);
    formData.append('applications', this.state.appFileIn);
    console.log('~start post~');
    backend.post('/importStudentTestData', formData,{
        headers: {
            'content-type': 'multipart/form-data',
            Authorization: (new Cookies()).get('auth')
        },
    }).then((res) => console.log(res));
    console.log('~end post~');
  }

   onDelete(e){
    e.preventDefault();
    /*
    *An axios Request is delete here.
    */
    backend.delete('/deleteAllStudents', {
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    })
    .then(res => console.log(res.data));
    alert("All Students have been deleted.")
    this.setState({
        showPopup: !this.state.showPopup
      });

   }
  onImport() {
    backend.get('/ScrapeScoreCard', {
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    }).then(res => console.log(res.status));
  }

  onImportStud(){
    backend.post('/importStudentTestData', {},
    {
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    }).then(res => console.log(res.status));
  }

  onImportApp(){
    backend.post('/importApplicationData', {},
    {
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    }).then(res => console.log(res.status));
  }
  studChange(event){
    this.setState({studentFileIn: event.target.files[0]});
  }
  appChange(event){
    this.setState({appFileIn: event.target.files[0]});
  }
  onScrapeRank() {
    backend.get('/scrapeCollegeRank', {
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    }).then(res => console.log(res.status));
  }

  onScrapeData() {
    backend.get('/scrapeCollegeData', {
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    }).then(res => console.log(res.status));
  }

  componentDidMount() {
    document.title = 'Admin Home | c4me | Teenage Mutant FullStack Turtles';
  }
    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered.
    */
    render(){
        return(
            <div>
           {/*<AdminCheck/>*/}
            <AdNav/>
            <div class="card" style={{marginTop: '5%', marginLeft: '15%', marginRight: '15%'}}>
                <h5 class="card-header" style={{color: 'black', fontFamily: 'poppin', fontSize: '17pt'}}>What would you like to do today?</h5>
                <div class="card-body">
                <ul style={{color:'black'}}>
                            <li>
                                <form>
                                    <span style={{fontSize: '15pt'}}>Scrape College Ranking</span> 
    
                                    <input type="submit" class = "btn submitButton" onClick={this.onScrapeRank.bind(this)} value="Scrape"/>
                                </form>
                            </li>
                            <li>
                                <form>
                                <span style={{fontSize: '15pt'}}>Scrape CollegeData.com</span> 
                                    
                                    <input type="submit" class = "btn submitButton" onClick={this.onScrapeData.bind(this)} value="Scrape"/>
                                </form>
                            </li>
                            <li>
                            </li>
                                <div>
                                <span style={{fontSize: '15pt'}}>Import College Scorecard<span>&nbsp;</span></span> 
                                    <button className='btn submitButton' onClick={this.onImport.bind(this)}> Import</button>
                                </div>
                                <div>
                                <span style={{fontSize: '15pt'}}>Import Student Data<span>&nbsp;</span></span> 
                                    <button className='btn submitButton' onClick={this.onImportStud.bind(this)}> Import</button>
                                </div>
                                
                           <li>
                                <div>
                                <span style={{fontSize: '15pt'}}>Delete All Student Profiles<span>&nbsp;</span></span> 
                                    <button className='btn delete' onClick={this.togglePopup.bind(this)}> DELETE</button>

                                    {this.state.showPopup ?
                                        <Popup
                                        text='Are you sure you want to do this? This cannot be undone.'
                                        del={this.onDelete.bind(this)}
                                        closePopup={this.togglePopup.bind(this)}
                                        />
                                        : null
                                    }
                                </div>
                            </li>
                            <li>

                                <form action="/review">
                                <span style={{fontSize: '15pt'}}>Review Questionable Acceptance Decisions<span>&nbsp;&nbsp;</span></span> 
                                    <input type="submit" class = "btn submitButtonDelete" value="Review"/>
                                </form>
                            </li>

                        </ul>
                </div>
            </div>

            <div className="buff">
                <div className="panel panel-default">
                    <div className="panel-heading"></div>
   
                    <div className="panel-body">
                        
                    </div>
                </div>
            </div>
            </div>
        );
    }
}

export default adHome;
