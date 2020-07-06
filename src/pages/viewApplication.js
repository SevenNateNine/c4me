import React,{Component} from 'react';
import ProfNav from './components/profileNav';
import joey from './components//static/img/joey.jpg';
import './components/static/css/bootstrap.min.css';
import './components/static/css/user.css';import './components/static/css/application.css';
import Select from 'react-select';
import Cookies from 'universal-cookie';
import Tooltip from '@material-ui/core/Tooltip';
import { Dropdown } from 'semantic-ui-react'
import { MDBDataTable } from 'mdbreact';
import {default as backend} from '../backend.js';

class viewApplication extends Component{

    constructor(props) {
        super(props);

        this.state = {
            // actual attributes
            id : null,
            status_options:[{label:'Accepted'},{label:'Rejected'},{label:'Pending'},{label:'Waitlisted'},{label:'Withdrawn'},{label:'Deferred'}],
            schoolList : [{label: "", value: 1}],

            // for editing applications
            applications: {},

            // for creating applications
            createAppSchoolId : null,
            createAppStatus : null,

            myApplications : {
                columns: [
                  {
                    label: '#',
                    field: 'num',
                    sort: 'asc',
                 
                  },
                  {
                    label: 'School Name',
                    field: 'name',
                    sort: 'asc',
                
                  },
                  {
                    label: 'Status',
                    field: 'status',
                    sort: 'asc',
                   
                  },
        
                  {
                    label: 'Questionable',
                    field: 'questionable',
                    sort: 'asc',
                 
                  }
                  
                ],
                rows: [
                ]
            }
        }
        backend.get('/schoolList', {
            headers:{
              Authorization: (new Cookies()).get('auth')
            }
          }).then(res=>{
            let array = [];
            var i;
            for(i = 0; i < res.data.length; i++){
              array.push({value: res.data[i].id, label: res.data[i].name})
            }
            this.setState({schoolList: array});
          });

          this.onSelectStatus = this.onSelectStatus.bind(this);
          this.onSelectSchool = this.onSelectSchool.bind(this);
          this.onChangeStatus = this.onChangeStatus.bind(this);
          
          this.createApp = this.createApp.bind(this);
    }
    
    onSelectSchool(selectedValue){
        this.setState({createAppSchoolId: selectedValue.value});
    }

    onSelectStatus(selectedValue){
        this.setState({createAppStatus: selectedValue.label});
    }

    onChangeStatus(selectedValue){
      console.log("Hello" + selectedValue)
    }

    createApp(e){
      e.preventDefault();
      console.log("Connection Success")
      backend.post('/application', 
        {
          college_id: this.state.createAppSchoolId,
          status: this.state.createAppStatus
        }, 
        {
          params:{
          
          }, 
        headers:{
          Authorization: (new Cookies()).get('auth')
        }
      }).then(res=>{
        window.location.reload(false);
      })
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
          });
        })
        .catch(error=>{
          this.setState({exists: false});
        });  
      
        backend.get('/myapplications',  {
            params:{
                id: this.props.match.params.id
            }, 
            headers:{
                Authorization: (new Cookies()).get('auth')
            }
        })
        .then(res=>{
          var columns = [
            {label:'#', field:'num', sort:'asc',},
            {label:'School Name', field:'name', sort:'asc',},
            {label:'Status', field:'status', sort:'asc',},
            {label:'Questionable', field:'questionable', sort:'asc',}
          ]
          var rows = []
          var i = 0;
          for(i = 0; i < res.data.length; i++){
            var isQuestionable = 'Yes'
            if(res.data[i].questionable === 0){
              isQuestionable = 'No'
            }
            var app = {
              num : i+1,
              name : res.data[i].school_name,
              status : res.data[i].status,
              questionable: isQuestionable
            }           
            rows.push(app)       
          }
          var myApplications = {columns, rows}
          this.setState({myApplications: myApplications});
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
           <div >
                    <div class="row profile" style = {{marginTop: '5%'}}>
                        <div class="col-md-3" style={{marginLeft: '8%'}}>
                            <div class="profile-sidebar position-fixed">
                               
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
                                        <li class="nav-item">
                                            <a href="myprofile" class="nav-link ">
                                                <i class="fa fa-home"></i>
                                               View Profile</a>
                                        </li>
                                        <li class="active nav-item">
                                            <a href="application" class="nav-link active">
                                                <i class="fa fa-home"></i>
                                                Applications </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-7" style={{marginRight: '5%'}}>
                            <div class="profile-content" >
                                <div class="col-lg-12 order-lg-4 personal-info" style={{marginTop: '2%'}}></div>
                                   
                                    
                                    <MDBDataTable style={{backgroundColor: 'white', color: 'black'}}
                                        striped
                                        bordered
                                        data={this.state.myApplications}
                                        searching = {false}
                                    />
                               
                                        <br></br>
                                        <div style ={{textAlign: 'center'}}>
                                       <table>
                                           <th style = {{width:'60%'}}>
                                           
                                             <Select options={this.state.schoolList} placeholder = "Select School"isSearchable = {true} onChange={this.onSelectSchool}/>
                                           
                                           </th>
                                           <th style = {{width:'40%'}}>
                                           <Select options={this.state.status_options} placeholder = "Select Status" isSearchable = {true} onChange={this.onSelectStatus}/>
                                           </th>
                                           <th>
                                           <button class= "btn submitButton" onClick={this.createApp}>Add/Edit Application</button> {/* onclick shud take value from select and add it to the table*/}
                                           </th>
                                       </table>
                                     
                                        </div>
                                 
                               
                                </div>
                               



                        </div>
                    </div>
                </div>
            </div>
        );
  }
}

export default viewApplication;
