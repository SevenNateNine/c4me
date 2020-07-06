import React,{Component} from 'react';
import peng from './static/img/peng.png';
import joey from './static/img/joey.jpg'
import './static/css/user.css';
import './static/css/bootstrap.min.css';
import Example from "./profileDropDown";


const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

class profNav extends Component{
    render(){
        return(
       <div>
          <nav className="navbar fixed-top navbar-expand-lg navbar-light" style={{backgroundColor: '#ffe5e5', height: '7%'}}>
              <a className="navbar-brand" href="home"><img src={peng} className="peng" width="40" height="40" alt="logo"/> <a className="navbar-brand" href="/home">c4me</a></a> 
              <a style={{width: '10%', color: 'black', cursor: 'pointer'}} href="/home">Home</a> <a style={{width: '10%', color: 'black', cursor: 'pointer'}} href="/search">Search</a>  <a style={{width: '20%' , color: 'black', cursor: 'pointer'}} href="/similarHS"> Find Similar High School</a>
              <div className="collapse navbar-collapse" id="navbarNavDropdown">
                  <ul className="navbar-nav w-100">
                      <li className="nav-item dropdown ml-auto" style={{paddingRight: '3%'}}>
                         <span>&nbsp;</span>
                      <span ><Example/></span>   
                      </li>
                  </ul>
              </div>
          </nav>
   </div>
        );
    }
}

export default profNav;