import React,{Component} from 'react';
import './components/static/css/login.css';
import './components/static/css/bootstrap.min.css';
import angry from './components/static/img/403.png';

class fourOhThree extends Component{
    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered.
    */
  render(){
    return(                
        <div className="container-login100">
            <div className="wrap-login100" style={{height: '500px'}}>
                <div className="messagecontain" style={{backgroundImage: "url("+angry+")" }}>
                    <span  style={{fontSize: '70px', color:'black', fontWeight: 'bold'}}>
                        403
                    </span>
                </div>
                <br></br>
                <div className="message">
                    <div style={{fontSize:'30px',fontWeight:'bold',color: 'black'}}>Permission Denied</div>
                    <br></br>
                    Hey! We think you might be in the wrong place. Please go back.
                </div>
            </div>
        </div>
        );
    }
}

export default fourOhThree;