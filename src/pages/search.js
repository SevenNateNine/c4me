import React,{Component} from 'react';
import Nav from './components/usernav';
import { Multiselect } from 'multiselect-react-dropdown';
import axios from 'axios';
import Cookies from 'universal-cookie';
import './components/static/css/user.css';
import './components/static/css/admin.css';
import './components/static/css/bootstrap.min.css';
import {default as backend} from '../backend.js';

class search extends Component{  
  //Constructor for Search Class - Inherits from Component.
  constructor(props) {
    super(props);
      this.state = {
        type: 'l',
        testdata:{},
        admission_low:null,
        admission_high:null,
        cost_low:null,
        cost_high:null,
        states:null,
        state_options:[{label:'AL'},{label:'AK'},{label:'AZ'},{label:'AR'},{label:'CA'},{label:'CO'},{label:'CT'},{label:'DE'},{label:'DC'},{label:'FL'},{label:'GA'},{label:'HI'},{label:'ID'},{label:'IL'},{label:'IN'},{label:'IA'},{label:'KS'},{label:'KY'},{label:'LA'},{label:'ME'},{label:'MD'},{label:'MA'},{label:'MI'},{label:'MN'},{label:'MS'},{label:'MO'},{label:'MT'},{label:'NE'},{label:'NV'},{label:'NH'},{label:'NJ'},{label:'NM'},{label:'NY'},{label:'NC'},{label:'ND'},{label:'OH'},{label:'OK'},{label:'OR'},{label:'PA'},{label:'RI'},{label:'SC'},{label:'SD'},{label:'TN'},{label:'TX'},{label:'UT'},{label:'VT'},{label:'VA'},{label:'WA'},{label:'WV'},{label:'WI'},{label:'WY'}],
        region:null,
        majors:[],
        major1:null,
        major2:null,
        rank_low:null,
        rank_high:null,
        size_low:null,
        size_high:null,
        sat_math_low:null,
        sat_math_high:null,
        sat_ebrw_low:null,
        sat_ebrw_high:null,
        act_comp_low:null,	
        act_comp_high:null,
        name: null,
        result:[],
        sort:false,
        strict:true,
      }
      //Populate list of Majors with What is in the database.
      backend.get('/majorsList', {headers:{
        Authorization: (new Cookies()).get('auth')
      }}).then(res=>{
        let array = [];
        var i;
        for(i = 0; i < res.data.length; i++){
          array.push(res.data[i].major)
        }
        this.setState({majors: array});
      });
        
      //Bind Event Handlers
      this.onChangeName = this.onChangeName.bind(this);
      this.onChangeALow = this.onChangeALow.bind(this);
      this.onChangeAHigh = this.onChangeAHigh.bind(this);
      this.onChangeCLow = this.onChangeCLow.bind(this);
      this.onChangeCHigh = this.onChangeCHigh.bind(this);
      this.onSelectState = this.onSelectState.bind(this);
      this.onRemoveState = this.onRemoveState.bind(this);
      this.onChangeRegion = this.onChangeRegion.bind(this);
      this.onChangeMajor1 = this.onChangeMajor1.bind(this);
      this.onChangeMajor2 = this.onChangeMajor2.bind(this);
      this.onChangeRLow = this.onChangeRLow.bind(this);
      this.onChangeRHigh = this.onChangeRHigh.bind(this);
      this.onChangeSLow = this.onChangeSLow.bind(this);
      this.onChangeSHigh = this.onChangeSHigh.bind(this);
      this.onChangeMLow = this.onChangeMLow.bind(this);
      this.onChangeMHigh = this.onChangeMHigh.bind(this);
      this.onChangeELow = this.onChangeELow.bind(this);
      this.onChangeEHigh = this.onChangeEHigh.bind(this);
      this.onChangeACTLow = this.onChangeACTLow.bind(this);
      this.onChangeACTHigh = this.onChangeACTHigh.bind(this);
      this.clear = this.clear.bind(this);
        
      this.search = this.search.bind(this);
      this.rank = this.rank.bind(this);
    }
    
  //BEGIN EVENT HANDLERS
  onChangeName(event) {
    this.setState({ name: event.target.value });
  }
  onChangeALow(event) {
    this.setState({ admission_low: event.target.value===''?null:event.target.value });
  }
  onChangeAHigh(event) {
    this.setState({ admission_high: event.target.value===''?null:event.target.value });
  }
  onChangeCLow(event) {
    this.setState({ cost_low: event.target.value===''?null:event.target.value });
  }
  onChangeCHigh(event) {
        this.setState({ cost_high: event.target.value===''?null:event.target.value });
  }
  onSelectState(selectedValues) {
    var i;
    var array = []
    for(i = 0; i < selectedValues.length; i++){
      array.push(selectedValues[i].label);
    }
    this.setState({ states: array});
    console.log(this.state.state)
  }
  onRemoveState(selectedValues) {
    var i;
    var array = []
    for(i = 0; i < selectedValues.length; i++){
      array.push(selectedValues[i].label);
    }
    this.setState({ states: array});
  }
  onChangeRegion(event) {
    this.setState({ region: event.target.value==='Region'?null:event.target.value});
  }
  onChangeMajor1(event) {
    this.setState({ major1: event.target.value==='Select Major'?null:event.target.value});
  }
  onChangeMajor2(event) {
    this.setState({ major2: event.target.value==='Select Major'?null:event.target.value});
  }
  onChangeRLow(event) {
    this.setState({ rank_low: event.target.value===''?null:event.target.value });
  }
  onChangeRHigh(event) {
    this.setState({ rank_high: event.target.value===''?null:event.target.value });
  }
  onChangeSLow(event) {
    this.setState({ size_low: event.target.value===''?null:event.target.value });
  }
  onChangeSHigh(event) {
    this.setState({ size_high:event.target.value===''?null:event.target.value });
  }
  onChangeMLow(event) {
    this.setState({ sat_math_low: event.target.value===''?null:event.target.value });
  }
  onChangeMHigh(event) {
    this.setState({ sat_math_high: event.target.value===''?null:event.target.value});
  }
  onChangeELow(event) {
        this.setState({ sat_ebrw_low: event.target.value===''?null:event.target.value });
  }
  onChangeEHigh(event) {
    this.setState({ sat_ebrw_high: event.target.value===''?null:event.target.value });
  }
  onChangeACTLow(event) {
    this.setState({ act_comp_low: event.target.value===''?null:event.target.value });
  }
  onChangeACTHigh(event) {
        this.setState({ act_comp_high: event.target.value===''?null:event.target.value });
  }
  clear(event){
        window.location.reload(false);
  }
  //END EVENT HANDLERS

  /*  Format all the state bound variables
      for a query to backend server, then
      submit it and update the state.
  */
  search(e) {
    e.preventDefault();
    var final_name = this.state.name;
    var final_major1 = this.state.major1;
    var final_major2 = this.state.major2;
    if(final_name !== null){
      final_name = this.state.name.trim().replace(/ /g, "_");
    }
    if(final_major1 !== null){
      final_major1 = this.state.major1.trim().replace(/ /g, "_");
    }
    if(final_major2 !== null){
      final_major2 = this.state.major2.trim().replace(/ /g, "_");
    }
    //Submits a Search Request to Backend Server + Checks Auth
    backend.get('/search',  {
      params:{
        type: this.state.type,
        name: final_name,
        admission_low: this.state.admission_low,
        admission_high: this.state.admission_high,
        cost_high: this.state.cost_high,
        cost_low: this.state.cost_low,
        states: this.state.states,
        region: this.state.region,
        major1: final_major1,
        major2: final_major2,
        rank_low: this.state.rank_low,
        rank_high: this.state.rank_high,
        size_low: this.state.size_low,
        size_high: this.state.size_high,
        sat_math_low: this.state.sat_math_low,
        sat_math_high: this.state.sat_math_high,
        sat_ebrw_low: this.state.sat_ebrw_low,
        sat_ebrw_high: this.state.sat_ebrw_high,
        act_comp_low: this.state.act_comp_low,
        act_comp_high: this.state.act_comp_high,
      },
      headers:{
        Authorization: (new Cookies()).get('auth')
      }
    }).then(res=>{
      this.setState({result: res.data});
    });
  }

  rank(e){
      e.preventDefault();
      // process to get all school IDs in Results
      let result = this.state.result;
      let school_idList = [];
      var i;
      if(result){
        for(i = 0; i < result.length; i++){
            school_idList.push(result[i].id)
        }
      }
      backend.get('/search/rank',{
        params:{
          search: school_idList   // search is how it be in /backend/school.js 
        },
        headers:{
          Authorization: (new Cookies()).get('auth')
        }
      }).then(res=>{
        var j;
        let newRes = []
        for(i = 0; i < result.length; i++){
            for(j = 0; j < res.data.length; j++){
                if(result[i].id === res.data[j].id){
                    newRes.push(Object.assign(result[i], res.data[j]));
                }
            }
        }
        this.setState({result: newRes});    // new result + rank result goes here {result: res}

        // sort too, borrow from James' sort?
      });
  }

    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered.
    */
  render(){
    return(
        <div>
            
            <Nav/>
            
        
            <table style={{marginTop: "5%"}}>
                <tr style = {{verticalAlign: 'top'}}>
                    <th style={{width: '17%', textAlign: 'left', position: 'fixed'}}>
                <ul >
                    <li >
                        <a class="nav-link" style={{fontStyle: 'normal', fontWeight: 'lighter', fontSize: '13pt'}} id = "nav-sim-prof" href="/home">Home</a>
                    </li>
                    <li >
                    <a class="nav-link active" style= {{fontSize: '13pt'}}>Search</a>
                    </li> 
                    <li  >
                    <a class="nav-link" style={{fontStyle: 'normal', fontWeight: 'lighter', fontSize: '13pt'}} id = "nav-sim-prof" href="/similarHS">Find Similar High Schools</a>
                    </li>       
                  
                </ul>
            </th>
                    <th style={{width: '32%', paddingBottom: '3.5%', paddingLeft: '17%'}}>
                        <div className="cd-filter" >
                            <form>
                                <div className="card">
                                <article className="card-group-item">
                                        <header className="card-header" style = {{textAlign:'left'}} >
                                            Name
                                        </header>
                                        
                                            <div className="card-body">
                                                <div className="form-row">
                                                    
                                                        <input type="text" className="form-control" id="name" 
                                                        value={this.state.name} onChange={this.onChangeName}  />
                                                    
                                                </div>
                                            </div>
                                        
                                    </article>
                                    <article className="card-group-item">
                                    <header className="card-header" style = {{textAlign:'left'}} >
                                            Admission Rate
                                        </header>
                                     
                                            <div className="card-body">
                                                <div className="form-row" >
                                                    <div className="col-md-6" >
                                                        <label style={{textAlign: 'left'}}>Min</label>
                                                        <input type="number" className="form-control" id="minad" placeholder="0%" min = "0" max = "100"
                                                        value={this.state.admission_low} onChange={this.onChangeALow}/>
                                                    </div>
                                                    <div className="col-md-6 text-right">
                                                        <label style={{textAlign: 'left'}}>Max</label>
                                                        <input type="number" className="form-control" id="maxad" placeholder="100%" max = "100" min = "1"
                                                        value={this.state.admission_high} onChange={this.onChangeAHigh}/>
                                                    </div>
                                                </div>
                                            </div>
                                       
                                    </article>
                                    <article className="card-group-item">
                                    <header className="card-header" style = {{textAlign:'left'}} >
                                            Tuition
                                        </header>
                                     
                                       
                                            <div className="card-body">
                                                <div className="form-row">
                                                    <div className=" col-md-6">
                                                        <label style={{textAlign: 'left'}}>Min</label>
                                                        <input type="number" className="form-control" placeholder="0" min = "0" max = "99999"
                                                        value={this.state.cost_low} onChange={this.onChangeCLow}/>
                                                    </div>
                                                    <div className=" col-md-6 text-right">
                                                        <label style={{textAlign: 'left'}}>Max</label>
                                                        <input type="number" className="form-control" placeholder="99999" min = "1" max = "99999"
                                                        value={this.state.cost_high} onChange={this.onChangeCHigh}/>
                                                    </div>
                                                </div>
                                            </div>
                                        
                                    </article>
        
                                    <article className="card-group-item">
                                    <header className="card-header" style = {{textAlign:'left'}} >
                                            Location
                                        </header>
                                     
                                      
                                            <div className="card-body">
                                               
                                                <Multiselect 
                                                    options={this.state.state_options} // Options to display in the dropdown
                                                    placeholder="State"
                                                    selectedValues={this.state.state} // Preselected value to persist in dropdown
                                                    onSelect={this.onSelectState} // Function will trigger on select event
                                                    onRemove={this.onRemoveState} // Function will trigger on remove event
                                                    displayValue="label" // Property name to display in the dropdown options
                                                    />
                                                
                                                <br></br>
                                              
                                                    <select className="browser-default custom-select" data-live-search="true" value={this.state.region} onChange={this.onChangeRegion} style={{width: '100%', borderStyle:'bold'}}>
                                                        <option value={null}>Region</option>
                                                        <option value="northeast">Northeast</option>
                                                        <option value="west">West</option>
                                                        <option value="midwest">Midwest</option>
                                                        <option value="south">South</option>
                                                    </select>
                                               
                                            </div>
                                            
                                       
                                       
                                    </article>
                                    <article className="card-group-item">
                                        <header className="card-header">
                                            <h6 className="title">Major</h6>
                                        </header>
                                    
                                            <div className="card-body"> 
                                              
                                                        <select className="browser-default custom-select" data-live-search="true" id="major1" value={this.state.major1} onChange={this.onChangeMajor1} style={{width: '100%'}}>
                                                            <option value = {null}> Select Major </option>
                                                            {this.state.majors.map(majorOption =>
                                                                <option value={majorOption} key={majorOption}>{majorOption}</option>
                                                            )}
                                                        </select>
                                                
                                             
                                                        <br></br>
                                                        <select className="browser-default custom-select" data-live-search="true" id="major2" 
                                                        value={this.state.major2} onChange={this.onChangeMajor2} style={{width: '190%'}}>
                                                            <option value = {null}> Select Major </option>
                                                            {this.state.majors.map(majorOption =>
                                                                <option value={majorOption} key={majorOption}>{majorOption}</option>
                                                            )}
                                                        </select>                                        
                                               
                                            </div>
                                       
                                    </article>
                                    <article className="card-group-item">
                                        <header className="card-header">
                                            <h6 className="title">Size</h6>
                                        </header>
                                        <div className="filter-content">
                                            <div className="card-body">
                                                <div className="form-row">
                                                    <div className="form-group col-md-6">
                                                        <label style={{textAlign: 'left'}}>Min</label>
                                                        <input type="number" className="form-control" placeholder="0" min = "0" max = "99999"
                                                        value={this.state.size_low} onChange={this.onChangeSLow}/>
                                                    </div>
                                                    <div className="form-group col-md-6 text-right">
                                                        <label style={{textAlign: 'left'}}>Max</label>
                                                        <input type="number" className="form-control" placeholder="99999" min = "1" max = "99999"
                                                        value={this.state.size_high} onChange={this.onChangeSHigh}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                    <article className="card-group-item">
                                        <header className="card-header">
                                            <h6 className="title">Ranking </h6>
                                        </header>
                                        <div className="filter-content">
                                            <div className="card-body">
                                                <div className="form-row">
                                                    <div className="form-group col-md-6">
                                                        <label style={{textAlign: 'left'}}>Min</label>
                                                       
                                                        <input type="number" className="form-control" placeholder="Lower Bound" min = "0"
                                                         value={this.state.rank_low} onChange={this.onChangeRLow}/>
                                                    </div>
                                                    <div className="form-group col-md-6 text-right">
                                                        <label style={{textAlign: 'left'}}>Max</label>
                                               
                                                        <input type="number" className="form-control" placeholder="Upper Bound" min = "1"
                                                         value={this.state.rank_high} onChange={this.onChangeRHigh}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                    <article className="card-group-item">
                                        <header className="card-header">
                                            <h6 className="title">SAT Math</h6>
                                        </header>
                                        <div className="filter-content">
                                            <div className="card-body">
                                                <div className="form-row">
                                                    <div className="form-group col-md-6">
                                                    <label style={{textAlign: 'left'}}>Min</label>
                                                     
                                                        <input type="number" className="form-control" placeholder="200" min = "200" max = "800"
                                                         value={this.state.sat_math_low} onChange={this.onChangeMLow}/>
                                                    </div>
                                                    <div className="form-group col-md-6 text-right">
                                                        <label style={{textAlign: 'left'}}>Max</label>
                                                        
                                                        <input type="number" className="form-control" placeholder="800" min = "200" max = "800"
                                                         value={this.state.sat_math_high} onChange={this.onChangeMHigh}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
        
                                    <article className="card-group-item">
                                        <header className="card-header">
                                            <h6 className="title">SAT EBRW</h6>
                                        </header>
                                        <div className="filter-content">
                                            <div className="card-body">
                                                <div className="form-row">
                                                    <div className="form-group col-md-6">
                                                        <label style={{textAlign: 'left'}}>Min</label>
                                                       
                                                        <input type="number" className="form-control" placeholder="200" min = "200" max = "800"
                                                         value={this.state.sat_ebrw_low} onChange={this.onChangeELow}/>
                                                    </div>
                                                    <div className="form-group col-md-6 text-right">
                                                        <label style={{textAlign: 'left'}}>Max</label>
                                                      
                                                        <input type="number" className="form-control" placeholder="800" min = "200" max = "800"
                                                         value={this.state.sat_ebrw_high} onChange={this.onChangeEHigh}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
        
                                    <article className="card-group-item">
                                        <header className="card-header">
                                            <h6 className="title">ACT</h6>
                                        </header>
                                        <div className="filter-content">
                                            <div className="card-body">
                                                <div className="form-row">
                                                    <div className="form-group col-md-6">
                                                        <label style={{textAlign: 'left'}}>Min</label>
                                                      
                                                        <input type="number" className="form-control" placeholder="1" min = "1" max = "36"
                                                         value={this.state.act_comp_low} onChange={this.onChangeACTLow}/>
                                                    </div>
                                                    <div className="form-group col-md-6 text-right">
                                                        <label style={{textAlign: 'left'}}>Max</label>
                                                       
                                                        <input type="number" className="form-control" placeholder="36" min = "1" max = "36"
                                                         value={this.state.act_comp_high} onChange={this.onChangeACTHigh}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article >
                                    
                                    <article className="card-group-item">
                                        <header className="card-header">
                                            <h6 className="title" style={{fontSize: '12pt'}}><label className="checkbox-inline"><input  type="checkbox" 
                                        onClick={()=>{
                                            this.setState({strict: !this.state.strict})
                                            if(this.state.strict){
                                                this.setState({type: 's'})
                                                console.log("strict")
                                            }
                                            else{
                                                this.setState({type: 'l'})
                                                console.log("Lax")
                                            }
                                        }}/> Strict Search? </label></h6>
                                        </header>
                                    
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
                            <th>
                                    <button style={{color: 'white', fontFamily: 'poppin', fontWeight: 'bold'}} onClick={()=>{
                                        if(this.state.sort){
                                            this.setState({ result: this.state.result.sort( (a,b) => a.name < b.name ? 1 : -1)})
                                        }
                                        else{
                                            this.setState({ result: this.state.result.sort( (a,b) => a.name > b.name ? 1 : -1)})
                                        }
                                        this.setState({sort: !this.state.sort})
                                        }
                                    }>
                                        Name
                                    </button>
                                </th>
                                <th>
                                    <button style={{color: 'white', fontFamily: 'poppin', fontWeight: 'bold'}} onClick={()=>{
                                        if(this.state.sort){
                                            this.setState({ result: this.state.result.sort( (a,b) => a.state < b.state ? 1 : -1)})
                                        }
                                        else{
                                            this.setState({ result: this.state.result.sort( (a,b) => a.state > b.state ? 1 : -1)})
                                        }
                                        this.setState({sort: !this.state.sort})
                                        }
                                    }>
                                        State
                                    </button>
                                </th>
                                <th>
                                    <button style={{color: 'white', fontFamily: 'poppin', fontWeight: 'bold'}} onClick={()=>{
                                        if(this.state.sort){
                                            this.setState({ result: this.state.result.sort( (a,b) => a.admission_rate < b.admission_rate ? 1 : -1)})
                                        }
                                        else{
                                            this.setState({ result: this.state.result.sort( (a,b) => a.admission_rate > b.admission_rate ? 1 : -1)})
                                        }
                                        this.setState({sort: !this.state.sort})
                                        }
                                    }>
                                        Admission Rate
                                    </button>
                                </th>
                                <th>
                                    <button style={{color: 'white', fontFamily: 'poppin', fontWeight: 'bold'}} onClick={()=>{
                                        if(this.state.sort){
                                            this.setState({ result: this.state.result.sort( (a,b) => a.cost < b.cost ? 1 : -1)})
                                        }
                                        else{
                                            this.setState({ result: this.state.result.sort( (a,b) => a.cost > b.cost ? 1 : -1)})
                                        }
                                        this.setState({sort: !this.state.sort})
                                        }
                                    }>
                                        Cost
                                    </button>
                                </th>
                                <th>
                                    <button style={{color: 'white', fontFamily: 'poppin', fontWeight: 'bold'}} onClick={()=>{
                                        if(this.state.sort){
                                            this.setState({ result: this.state.result.sort( (a,b) => a.ranking < b.ranking ? 1 : -1)})
                                        }
                                        else{
                                            this.setState({ result: this.state.result.sort( (a,b) => a.ranking > b.ranking ? 1 : -1)})
                                        }
                                        this.setState({sort: !this.state.sort})
                                        }
                                    }>
                                        Rank
                                    </button>
                                </th>
                                <th>
                                    <button style={{color: 'white', fontFamily: 'poppin', fontWeight: 'bold'}} onClick={()=>{
                                        if(this.state.sort){
                                            this.setState({ result: this.state.result.sort( (a,b) => a.size < b.size ? 1 : -1)})
                                        }
                                        else{
                                            this.setState({ result: this.state.result.sort( (a,b) => a.size > b.size ? 1 : -1)})
                                        }
                                        this.setState({sort: !this.state.sort})
                                        }
                                    }>
                                        Size
                                    </button>
                                </th>
                                <th>Score</th>
                                <th>Plot</th>
                            </tr>
                            </thead>
                            <tbody id="body">
                            {this.state.result.map(collegeData=>
                                 <tr>
                                    <td><a href={"/school/"+collegeData.id}>{collegeData.name}</a></td>
                                    <td>{collegeData.state}</td>
                                    <td>{collegeData.admission_rate}</td>
                                    <td>{collegeData.cost}</td>
                                    <td>{collegeData.ranking}</td>
                                    <td>{collegeData.size}</td>
                                    <td>{collegeData.result}</td>
                                    <td><a href={"/applicationSearch/"+collegeData.id}>Plot</a></td>
                                 </tr>)}
                            </tbody>
                        </table>
                        </div>
                    </th>
        
                </tr>
        
            </table>
          
            <footer class="footer fixed-bottom" style={{backgroundColor: '#ffe5e5'}}>
      <div style={{marginLeft: '15%'}}>
        <button class= "btn submitButton" onClick={this.search} >Search</button>
        <button class= "btn clearButton" onClick={this.clear} style={{borderColor: 'white', backgroundColor: 'white'}}>Clear</button>
        <button class= "btn rankButton" onClick={this.rank} style={{borderColor: 'white', backgroundColor: 'white'}}>Calculate</button>
      </div>
    </footer>

        </div>    
        );
  }
}

export default search;
