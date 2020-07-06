import React,{Component} from 'react';
import './static/css/login.css';

class loginErr extends Component {
    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered.
    */
  render() {
    return (
      <div className='err'>
          Error: Your Username or Password is incorrect.
      </div>
    );
  }
}

export default loginErr;