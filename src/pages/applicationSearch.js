import React,{Component} from 'react';
import Nav from './components/usernav';
import { Multiselect } from 'multiselect-react-dropdown';
import axios from 'axios';
import {ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Label} from 'recharts';
import './components/static/css/user.css';
import './components/static/css/admin.css';
import './components/static/css/bootstrap.min.css';
import FourOhFour from './404';
import Cookies from 'universal-cookie';
import {default as backend} from '../backend.js';

class appSearch extends Component{
  constructor(props) {
    super(props);
    this.state = {
        id: null,
        status_options:[{label:'Accepted'},{label:'Rejected'},{label:'Pending'},{label:'Waitlisted'},{label:'Withdrawn'},{label:'Deferred'}],
        status: [],
        result: [],
        accepted:[],
        rejected:[],
        waitlisted:[],
        pending:[],
        deferred:[],
        withdrawn:[],
        test:'ACT',
        key:'student_act_comp',
        class_high: null,
        class_low: null,
        hsList: [],
        hsSelected: null,
        exists: true
      }
      backend.get('/hsList', {
        headers:{
          Authorization: (new Cookies()).get('auth')
        }
      }).then(res=>{
        let array = [];
        var i;
        for(i = 0; i < res.data.length; i++){
          array.push({id: res.data[i].id, name: res.data[i].name})
        }
        this.setState({hsList: array});
      });

        //Bind All Event Handlers
      this.onChangeClassHigh = this.onChangeClassHigh.bind(this);
      this.onChangeClassLow = this.onChangeClassLow.bind(this);
      this.onSelectHS = this.onSelectHS.bind(this);
      this.onRemoveHS = this.onRemoveHS.bind(this);
      this.onSelectStatus = this.onSelectStatus.bind(this);
      this.onRemoveStatus = this.onRemoveStatus.bind(this);
      this.onChangeTest = this.onChangeTest.bind(this);
      this.clear = this.clear.bind(this);

      this.search = this.search.bind(this);
    }

    //Begin Event Handlers
  onChangeClassHigh(event) {
        this.setState({ class_high: event.target.value===''?null:event.target.value });
  }
  onChangeClassLow(event) {
        this.setState({ class_low: event.target.value===''?null:event.target.value });
  }
  onSelectHS(selectedValues) {
        var i;
        var array = [];
        for(i = 0; i < selectedValues.length; i++){
            array.push(selectedValues[i].id);
        }
        this.setState({hsSelected: array});
        console.log(this.state.hsSelected);
  }
  onRemoveHS(selectedValues) {
        var i;
        var array = [];
        for(i = 0; i < selectedValues.length; i++){
            array.push(selectedValues[i].id);
        }
        this.setState({hsSelected: array});
  }
  onChangeTest(event) {
        this.setState({ test: event.target.value});
        if(event.target.value==='ACT'){
            this.setState({key: 'student_act_comp'});
        }
        if(event.target.value==='SAT'){
            this.setState({key: 'student_sat_comp'});
        }
        if(event.target.value==='Weighted Exams'){
            this.setState({key: 'student_test_composite'});
        }
  }
  onSelectStatus(selectedValues) {
        var i;
        var array = [];
        for(i = 0; i < selectedValues.length; i++){
            array.push(selectedValues[i].label);
        }
        this.setState({ status: array});

  }
  onRemoveStatus(selectedValues) {
        var i;
        var array = [];
        for(i = 0; i < selectedValues.length; i++){
            array.push(selectedValues[i].label);
        }
        this.setState({ status: array});
  }
  clear(event){
        window.location.reload(false);
  }

    //End Event Handlers

    /*
    Search is basically another request to the backend
    on Applications where filters are applied. It is sent via axios
    and the table and graph are updated accordingly.
    */
  search(e) {
    e.preventDefault();
    backend.get('/schoolApplications',  {
      params:{
        college_id: this.state.id,
        hs_id: this.state.hsSelected,
        class_high: this.state.class_high,
        class_low: this.state.class_low,
        statuses: this.state.status,
      }, 
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    })
    .then(res=>{
        this.setState({result: res.data});
        let accept = [];
        let reject = [];
        let pend = [];
        let wait = [];
        let defer= [];
        let withd=[];
        var i;
        for(i = 0; i < res.data.length; i++){
          if(res.data[i].status==="Accepted"){
            accept.push(res.data[i]);
          }
          if(res.data[i].status==="Rejected"){
            reject.push(res.data[i]);
          }
          if(res.data[i].status==="Pending"){
            pend.push(res.data[i]);
          }
          if(res.data[i].status==="Waitlisted"){
            wait.push(res.data[i]);
          }
          if(res.data[i].status==="Deferred"){
            defer.push(res.data[i]);
          }
          if(res.data[i].status==="Withdrawn"){
            withd.push(res.data[i]);
          }
        }
        this.setState({accepted: accept});
        this.setState({rejected: reject});
        this.setState({pending: pend});
        this.setState({waitlisted: wait});
        this.setState({deferred: defer})
        this.setState({withdrawn: withd});
      });
    }
    /*
    componentDidMount is a built in react method that says
    when the component is rendered, do this. When the component renders,
    an initial request is made to the backend is made to populate the graph and table.
    */
    componentDidMount(){
      this.setState({id: this.props.match.params.id});
      backend.get('/schoolApplications',  {
        params:{
          college_id: this.props.match.params.id,
        },
        headers:{
          Authorization: (new Cookies()).get('auth')
        }
      })
      .then(res=>{
        this.setState({result: res.data});
        let accept = [];
        let reject = [];
        let pend = [];
        let wait = [];
        let defer= [];
        let withd=[];
        var i;
        for(i = 0; i < res.data.length; i++){
          if(res.data[i].status==="Accepted"){
            accept.push(res.data[i]);
          }
          if(res.data[i].status==="Rejected"){
            reject.push(res.data[i]);
          }
          if(res.data[i].status==="Pending"){
            pend.push(res.data[i]);
          }
          if(res.data[i].status==="Waitlisted"){
            wait.push(res.data[i]);
          }
          if(res.data[i].status==="Deferred"){
            defer.push(res.data[i]);
          }
          if(res.data[i].status==="Withdrawn"){
            withd.push(res.data[i]);
          }

        }
        this.setState({accepted: accept});
        this.setState({rejected: reject});
        this.setState({pending: pend});
        this.setState({waitlisted: wait});
        this.setState({deferred: defer})
        this.setState({withdrawn: withd});
      })
      .catch(error => {
        this.setState({exists: false});
      });
  
      backend.get('/school',  {
        params:{
          id: this.props.match.params.id
        }, 
        headers:{
          Authorization: (new Cookies()).get('auth')
        }
      })
      .then(res=>{
        this.setState({schoolname: res.data[0].name});
        });
      }

    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered, and the charts below it.
    */
  render(){
    if(this.state.exists){
            return(
            <div>
                <Nav/>
                <div className="search" >
                <h3>{this.state.schoolname} Applications</h3>
                <table>
                    <tr>
                        <th style={{width: '15%', paddingBottom: '3.5%'}}>
                            <div className="cd-filter" >
                                <form>
                                    <div className="card">
                                        <article className="card-group-item">
                                            <header className="card-header">
                                                <h6 className="title">Application Status</h6>
                                            </header>
                                            <div className="filter-content">
                                                <div className="card-body">
                                                    <div className="form-row">
                                                    <Multiselect 
                                                        options={this.state.status_options} 
                                                        placeholder="Status"
                                                        onSelect={this.onSelectStatus}
                                                        onRemove={this.onRemoveStatus}
                                                        displayValue="label"
                                                        />
                                                    </div>
                                                
                                                </div>
                                            </div>
                                        
                                        </article>
                                        <article className="card-group-item">
                                            <header className="card-header">
                                                <h6 className="title">High Schools</h6>
                                            </header>
                                            <div className="filter-content">
                                                <div className="card-body">
                                                    <div className="form-row">
                                                    <Multiselect 
                                                        options={this.state.hsList} // Options to display in the dropdown
                                                        placeholder="Select High School(s)"
                                                        // selectedValues={this.state.hsSelected} // Preselected value to persist in dropdown
                                                        onSelect={this.onSelectHS} // Function will trigger on select event
                                                        onRemove={this.onRemoveHS} // Function will trigger on remove event
                                                        displayValue="name" // Property name to display in the dropdown options
                                                        />
                                                    </div>
                                                
                                                </div>
                                            </div>
                                        </article>
            

            
                                        <article className="card-group-item">
                                            <header className="card-header">
                                                <h6 className="title">Graduating Class</h6>
                                            </header>
                                            <div className="filter-content">
                                                <div className="card-body">
                                                    <div className="form-row">
                                                        <div className="form-group col-md-6">
                                                            <label style={{textAlign: 'left'}}>Min</label>
                                                        
                                                            <input type="number" className="form-control" placeholder="2020" min = "2000" max = "2030"
                                                            value={this.state.class_low} onChange={this.onChangeClassLow}/>
                                                        </div>
                                                        <div className="form-group col-md-6 text-right">
                                                            <label style={{textAlign: 'left'}}>Max</label>
                                                        
                                                            <input type="number" className="form-control" placeholder="2020" min = "2000" max = "2030"
                                                            value={this.state.class_high} onChange={this.onChangeClassHigh}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article >
                                        <article className="card-group-item">
                                            <header className="card-header">
                                                <h6 className="title">Scatterplot Filter</h6>
                                            </header>
                                            <div className="filter-content">
                                                <div className="card-body">
                                            
                                                    <div className="form-row" >
                                                        <select className="browser-default custom-select" data-live-search="true" value={this.state.test} onChange={this.onChangeTest} style={{width: '100%', borderStyle:'bold'}}>
                                                            <option value="ACT">ACT</option>
                                                            <option value="SAT">SAT</option>
                                                            <option value="Weighted Exams">Weighted Exams</option>
                                                        </select>
                                                    </div>
                                                    </div>
                                            </div>
                                        </article>
            
                                    </div>
                                    
                                </form>
                            </div>
                        </th>
                        <th style={{width: '100%',paddingRight:'2.5%',verticalAlign: 'top'}}>
                            <div className="container">
                            <table className="table table-bordered" id="dataTable" width="90%" cellspacing="0"style={{backgroundColor: 'white'}}>
                                <thead>
                                <tr style={{textAlign: 'center'}}>
                                    <th>Name</th>
                                    <th>GPA</th>
                                    <th>SAT EBRW </th>
                                    <th>SAT Math</th>
                                    <th>ACT</th>
                                    <th>High School</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody id="body">
                                {this.state.result.map(ap=>
                                    <tr>
                                        <td><a href={"/profile/"+ap.student_id}>{ap.user_name}</a></td>
                                        <td>{ap.student_gpa}</td>
                                        <td>{ap.student_sat_ebrw}</td>
                                        <td>{ap.student_sat_math}</td>
                                        <td>{ap.student_act_comp}</td>
                                        <td>{ap.high_school_name}</td>
                                        <td>{ap.status}</td>
                                    </tr>)}
                                </tbody>
                            </table>



                            <table style={{marginTop: '5%', float:'center'}}>
                    <tr> 

                <th style={{paddingRight: '5%', borderRadius:'10px', textAlign: 'center'}}>
                <ScatterChart width={600} height={300} margin={{ top: 40, right: 40, bottom: 30, left: 40}} style={{backgroundColor: 'white'}} >
                        <CartesianGrid />
                        <XAxis type="number" dataKey={this.state.key} name="stature" unit="Points"><Label value={this.state.test} offset={0} position="insideBottom" /></XAxis>
                        <YAxis type="number" dataKey="student_gpa" name="weight" unit="GPA" label={{ value: 'GPA', angle: -90, position: 'insideLeft' }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="A school" data={this.state.accepted} fill="#00b300">
                        <LabelList dataKey="x" />
                        </Scatter>
                        <Scatter name="A school" data={this.state.rejected} fill="#ff0000">
                        <LabelList dataKey="x" />
                        </Scatter>
                        <Scatter name="A school" data={this.state.waitlisted} fill="#ffcc00">
                        <LabelList dataKey="x" />
                        </Scatter>
                        <Scatter name="A school" data={this.state.pending} fill="#3399ff">
                        <LabelList dataKey="x" />
                        </Scatter>
                        <Scatter name="A school" data={this.state.withdrawn} fill="#0000b3">
                        <LabelList dataKey="x" />
                        </Scatter>
                        <Scatter name="A school" data={this.state.deferred} fill="#cc0066">
                        <LabelList dataKey="x" />
                        </Scatter>
                        
                        
                        
                    </ScatterChart>

                </th>

            </tr>

        </table>
                            </div>
                        </th>
            
                    </tr>
            
                </table>
                </div>
                <footer class="footer fixed-bottom" style={{backgroundColor: '#ffe5e5'}}>
        <div style={{marginLeft: '2.5%'}}>
            <button class= "btn submitButton" onClick={this.search} >Search</button>
                                    <button class= "btn clearButton" onClick={this.clear} style={{borderColor: 'white', backgroundColor: 'white'}}>Clear</button>
        </div>
        </footer>

            </div>

            
            );
    }
    else{
      return(<FourOhFour/>);
    }
  }
}

export default appSearch;
