import React,{Component} from 'react';
import peng from './static/img/peng.png';
import './static/css/user.css';
import './static/css/bootstrap.min.css';
import AdminCheck from './adminCheck';

class adNav extends Component{
    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered.
    */
    render(){
        return(
        <div className="backnav">
        <AdminCheck/>
          <nav className="navbar fixed-top navbar-expand-lg navbar-light" style={{backgroundColor: '#ffe5e5', height: '7%'}}>
              <a className="navbar-brand" href="/"><img src={peng} className="peng" width="40" height="40" alt="logo"/> <a class="navbar-brand" href="#">c4me</a></a>
              <div className="collapse navbar-collapse" id="navbarNavDropdown">
                  <ul className="navbar-nav w-100">
                      <li className="nav-item dropdown ml-auto" style={{paddingRight: '3%'}}>
                              
                      <span style={{color:'black'}}><a  href="/admin" style={{color: 'black', fontSize: '15pt'}} >Hello Admin Nate    </a></span>  
                        <span style={{color: 'black', fontSize: '15pt'}}>  |  </span>
                      <span><a style={{color: '#7a3535', fontSize: '15pt'}} href = "#"> Logout</a></span> 
                      </li>
                  </ul>
              </div>
          </nav>
          </div>
        );
    }
}

export default adNav;