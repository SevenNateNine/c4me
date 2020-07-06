import React,{Component} from 'react';
import Nav from './components/usernav';
import './components/static/css/bootstrap.min.css';
import './components/static/css/dataTable.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { MDBDataTable } from 'mdbreact';
import Select from 'react-select';

import Cookies from 'universal-cookie';
import axios from 'axios';
import {default as backend} from '../backend.js';

class similarHS extends Component{
  constructor(props) {
    super(props);
    this.state = {
      type: 'l',
      testdata:{},
      name:null,
      city:null,
      state:null,
      state_options:['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'],
      result:{
        columns: [
          {
            label: 'Name',
            field: 'name',
            sort: 'asc',
            width: 150
          },
          {
            label: 'Similarity Score',
            field: 'similarityscore',
            sort: 'asc',
            width: 270
          },
          {
            label: 'Highlights',
            field: 'highlights',
            sort: 'asc',
            width: 400
          }
        ],
        rows: []
      }
    }
    //Bind Event Handlers
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeCity = this.onChangeCity.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.search = this.search.bind(this);
    this.clear = this.clear.bind(this);
  };
  
  /*
  Event Handlers
  */
  onChangeName(event){
    this.setState({name: event.target.value})
  }
  onChangeCity(event){
    this.setState({city: event.target.value})
  }
  onChangeState(event){
    this.setState({state: event.target.value})
  }
   /*  Format all the state bound variables
      for a query to backend server, then
      submit it and update the state.
  */  
  search(e) {
    e.preventDefault();
    var final_name = this.state.name;
    var final_city = this.state.city;
    if(final_name !== null){
      final_name = this.state.name.trim().replace(/\s/g, "_");
    }
    if(final_city !== null){
      final_city = this.state.city.trim().replace(/\s/g, "_");
    }
    backend.get('http://localhost:9000/similarHS',  {
      params:{
        name: final_name,
        city: final_city,
        state: this.state.state             
      }, 
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    })
    .then(res=>{
      let hsArr = []
      for(let i = 0; i < res.data.length; i++){
        let current = res.data[i];
        let specific_highlights = [];
          for(let j = 0; j < current.highlights.length; j++){
            let ch = current.highlights[j]
            if(ch === 'sat'){
              specific_highlights.push(' SAT: ' + current.high_school.sat_score);
            }
            else if(ch === 'act'){
              specific_highlights.push(' ACT: ' + current.high_school.act_score);
            }
            else if(ch === 'ap'){
              specific_highlights.push(' AP Enrollment: ' + current.high_school.ap_enroll);
            }
            else if(ch === 'state'){
              specific_highlights.push(' State: ' + current.high_school.state);
            }
            else if(ch === 'school'){
              specific_highlights.push(' Interested Schools: ' + current.high_school.interested_schools.split(',').join(" "));
            }

            else if(ch === 'major'){
              specific_highlights.push(' Interested Major: ' + current.high_school.interested_majors.split(',').join(" "));
            }
            
          }
          hsArr.push({
            name: current.high_school.name, 
            similarity_score: current.similarity_score, 
            highlights: specific_highlights
          })
        }
      var newdata = {
        columns: [
          {
            label: 'Name',
            field: 'name',
            sort: 'asc',
            width: 150
          },
          {
            label: 'Similarity Score',
            field: 'similarity_score',
            sort: 'asc',
            width: 270
          },
          {
            label: 'Highlights',
            field: 'highlights',
            sort: 'asc',
            width: 400
          }
        ],
        rows: hsArr
      };
      // add results later for more hs data
    this.setState({result: newdata});
    });
  }

  clear(event){
    window.location.reload(false);
  }

  /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered.
  */
  render(){
    return(
        <div>
        <Nav/>  
        <div style={{marginTop:'5%'}}>
            <table style={{marginTop: '5%', width: '100%'}}>
                <tr style = {{verticalAlign: 'top'}}> 
                <th style={{width: '17%', textAlign: 'left'}}>
                    <ul style={{textAlign: "left"}}>
                        <li >
                              <a class="nav-link" style={{fontStyle: 'normal', fontWeight: 'lighter', fontSize: '13pt'}} id = "nav-sim-prof" href="/home">Home</a>
                        </li>
                        <li >
                              <a class="nav-link" style={{fontStyle: 'normal', fontWeight: 'lighter', fontSize: '13pt'}} id = "nav-sim-prof" href="/search">Search</a>
                        </li> 
                        <li  >
                              <a class="nav-link active" style= {{fontSize: '13pt'}}>Find Similar High Schools</a>
                        </li>       
                         
                    </ul>
                </th>
                    <th style={{width: '100%', paddingRight: '5%'}}>
                            <table style={{width: '100%'}}>
                                <tr><th style={{verticalAlign: 'top'}}>
                                  {/* <Autocomplete id="auto-box" 
                                    options={tempSchools} 
                                    getOptionLabel={(option) => option.title} 
                                    style={{ width: 300, fontFamily: 'poppin', borderColor: 'black'}} 
                                    onChange={this.onChangeName}
                                    renderInput={(params) => 
                                      <TextField {...params} 
                                        label="Search High Schools" 
                                        variant="outlined" 
                                      />
                                    }
                                  /> */}
                                  <div style={{textAlign:'left'}}><form noValidate autoComplete="off" >
                                    <TextField style ={{width: 300}}id="outlined-basic" label="Search High School" variant="outlined" onChange={this.onChangeName}/>
                                </form></div>
                               <br></br>
                                <div style={{textAlign:'left'}}><form noValidate autoComplete="off" >
                                    <TextField style ={{width: '100%'}}id="outlined-basic" label="Search City" variant="outlined" onChange={this.onChangeCity}/>
                                </form></div>
                                <br></br>
                                  <div>
                                    <select className="browser-default custom-select" data-live-search="true" id="state" value={this.state.state} onChange={this.onChangeState} style={{width: '100%'}}>
                                      <option value = {null}> Select State </option>
                                      {this.state.state_options.map(stateOption =>
                                          <option value={stateOption} key={stateOption}>{stateOption}</option>
                                      )}
                                    </select>
                                    </div>
                                </th>
                                <th style={{verticalAlign:'top', width: '10%'}}> </th>
                             
                                <th style={{width: '100%'}}>
                                    <MDBDataTable style={{backgroundColor: 'white', color: 'black'}}
                                        striped
                                        bordered
                                        data={this.state.result}
                                        searching = {false}
                                    /></th>
                                </tr>
                              
                        </table>
                    </th>
                </tr>
                <footer class="footer fixed-bottom" style={{backgroundColor: '#ffe5e5'}}>
                  <div style={{marginLeft: '2.5%'}}>
                    <button class= "btn submitButton" onClick={this.search} >Search</button>
                    <button class= "btn clearButton" onClick={this.clear} style={{borderColor: 'white', backgroundColor: 'white'}}>Clear</button>
                  </div>
                </footer>
            </table>
            </div>
        </div>

    );
  }
}

export default similarHS;
