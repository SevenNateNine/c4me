import React,{Component} from 'react';
import './static/css/admin.css';

class Popup extends Component {
    /*This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered.
    */
  render() {
    return (
      <div className='popup'>
        <div className='popup_inner'>
          <h3>{this.props.text}</h3>
        <button class ='btn delete' onClick={this.props.del}>Yes, Delete All Profiles.</button>
        <button class='btn back' onClick={this.props.closePopup}>No thanks.</button>
        </div>
      </div>
    );
  }
}

export default Popup;