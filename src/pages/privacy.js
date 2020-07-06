import React,{Component} from 'react';
import './components/static/css/bootstrap.min.css';

class Privacy extends Component{
    
  /*  This is the JSX For the actual Frontend
      The HTML contains the Markup for Rendering the Left Sidebar for Search Parameters,
      Followed by the search table being rendered, and the charts below it.
  */
  render(){
      return(
        <div class="container">
            <div >
                <h1 style={{color: 'black', marginTop: '2.5%', textAlign: 'center'}}>Teenage Mutant FullStack Turtles 2020</h1><br></br>
                <div class="" style={{marginBottom: '5%'}}>
                    <div class="card">
                        <div class="card-header">
                            <a aria-controls="termsandconditions" aria-selected="true" style={{color: 'black'}}>Privacy Policy</a>
                        </div>
                        <div class="card-body" style={{color: 'black'}}>
                            <h4 class="card-title"></h4>
                            <h6 class="card-subtitle mb-2"></h6>
        
                            <div class="tab-content mt-3" >
                                <p class="card-text">We do not intentionally collect “Sensitive Personal Information”, such as personal data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, or trade union membership, and the processing of genetic data, biometric data for the purpose of uniquely identifying a natural person, data concerning health or data concerning a natural person’s sex life or sexual orientation. If you choose to store any Sensitive Personal Information on our servers, you are responsible for complying with any regulatory controls regarding that data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }
}

export default Privacy;