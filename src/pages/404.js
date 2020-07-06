import React,{Component} from 'react';
import './components/static/css/login.css';
import './components/static/css/bootstrap.min.css';
import confused from './components/static/img/404.gif';

class fourOhFour extends Component{
    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered.
    */
    render(){
        return(                
        <div className="container-login100">
            <div className="wrap-login100" style={{height: '500px'}}>
                <div className="messagecontain" style={{backgroundImage: "url("+confused+")" }}>
                    <span  style={{fontSize: '70px', color:'white', fontWeight: 'bold'}}>
                        404
                    </span>
                </div>
                <br></br>
                <div className="message">
                    <div style={{fontSize:'30px',fontWeight: 'bold',color: 'black'}}>Page Not Found!</div>
                    <br></br>
                    Hey! We think you might be in the wrong place. Please go back
                </div>
            </div>
        </div>
        );
    }
}

export default fourOhFour;