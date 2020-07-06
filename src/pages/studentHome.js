import React,{Component} from 'react';
import Nav from './components/usernav';
import './components/static/css/login.css';
import './components/static/css/bootstrap.min.css';
import './components/static/css/homepage.css';
import Cookies from 'universal-cookie';
import joey from './components//static/img/joey.jpg';

class studentHome extends Component{
    render(){
        return(
            <div>
                {/*<AuthCheck/>*/}
              
            <Nav/>                
            <div style={{marginTop:'5%'}}>
                <table>
                    <tr style = {{verticalAlign: 'top'}}> 
                        <th style={{width: '17%'}}>
                            <ul style={{textAlign: "left"}}>
                            <li>
                              <a className="nav-link active" style= {{fontSize: '13pt'}}>Home</a>
                            </li>
                            <li>
                              <a className="nav-link" style={{fontStyle: 'normal', fontWeight: 'lighter', fontSize: '13pt'}} id = "nav-sim-prof" href="/search">Search</a>
                            </li> 
                            <li>
                              <a className="nav-link" style={{fontStyle: 'normal', fontWeight: 'lighter', fontSize: '13pt'}} id = "nav-sim-prof" href="/similarHS">Find Similar High Schools</a>
                            </li>
                           
                        </ul>
                    </th>
                        <th style={{width: '100%', paddingRight: '5%', marginBottom: '5%'}}>
                        <header className="masthead">
  <div className="container h-100">
    <div className="row h-100 align-items-center">
      <div className="col-12 text-center">
        <h1 className="font-weight-light" style={{fontSize: '70pt', fontFamily: 'century gothic', textShadow: '4px 4px white'}}>Connecting Learning </h1> <br></br>
        <p style={{textAlign: "center"}}><div className="lead" style={{fontSize: '50pt', fontStyle:'italic', fontFamily: 'century gothic'}}>to Life</div> <br></br> 
        </p>
        
        
      </div>
    </div>
  </div>
</header>
<section className="py-5" style={{backgroundColor: 'white'}}>
  <div className="container" >
  <h2 className="font-weight-light" style={{color: 'black', fontFamily: 'century gothic'}} >c4me is a comprehensive college, career and life readiness solution that helps districts and schools align student strengths and interests to postsecondary goals, improving student outcomes and connecting learning to life.</h2>
  
  </div>
</section>
<section className="py-5" style={{backgroundColor: '#faf7f7'}}>
  <div className="container" >
  <h2 className="font-weight-light" style={{color: 'black', fontFamily: 'century gothic'}} >true stories from students on the road to college</h2>
  <div className="container">
      <br></br>
  <div className="row">
    <div className="col"><img style = {{borderRadius: '50%', width: "100%"}} src = " https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/s960x960/87152848_2656710781103898_7761342715207352320_o.jpg?_nc_cat=108&_nc_sid=85a577&_nc_oc=AQkyVXzuo_dn7rrBamNr9Mmqq1CS93ZclHuKt8Fowdv2c91rsIwbiD-YLX-zbZVWCDc&_nc_ht=scontent-lga3-1.xx&_nc_tp=7&oh=78d2130c4cedf8143731bbbdd06f709b&oe=5ECE987F"></img>
    </div>
    <div className="col"><img style = {{borderRadius: '50%', width: "100%"}} src = " https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/p960x960/82952014_551624422362304_3690759461531549696_o.jpg?_nc_cat=103&_nc_sid=85a577&_nc_oc=AQnVIkhqE2de34_RfXPDjI30CzJXL9f5R7fa-lFom_mVLDK5ezKujmvjf5ueMZW9SZo&_nc_ht=scontent-lga3-1.xx&_nc_tp=6&oh=ac0edda6e577ef9f8d5a6bc3f02a5836&oe=5ECD0904"></img></div>
    
    <div className="col"><img style = {{borderRadius: '50%', width: "100%"}} src = {joey}></img></div>
  
    <div className="col"><img style = {{borderRadius: '50%', width: "100%"}} src = "https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/18881876_1792814947402619_3973694769458144957_n.jpg?_nc_cat=102&_nc_sid=7aed08&_nc_oc=AQnXwP6lfJU7_ZMjgCxeLop-Y78I5dqkI1qGLOxgWcG1y7hlSy0BY1i84j1dpJotv44&_nc_ht=scontent-lga3-1.xx&oh=af7670955f03ffc59d99d50554fec0dc&oe=5ECD32AD"></img></div>
    
  </div>
  <br></br>
  <div className="row">
    <div className="col" style={{fontSize: '13pt'}}>Nathan Chan</div>
    <div className="col" style={{fontSize: '13pt'}}>James Castro</div>
    <div className="col" style={{fontSize: '13pt'}}>Joseph Spivack</div>
    <div className="col" style={{fontSize: '13pt'}}>Deanna Liu</div>
  </div>
  <div className="row">
    <div className="col" style={{fontSize: '10pt'}}>Stony Brook</div>
    <div className="col" style={{fontSize: '10pt'}}>Stony Brook</div>
    <div className="col" style={{fontSize: '10pt'}}>Stony Brook</div>
    <div className="col" style={{fontSize: '10pt'}}>Stony Brook</div>
  </div>
  <div className="row">
    <div className="col" style={{fontSize: '9pt'}}>Class of 2020</div>
    <div className="col" style={{fontSize: '9pt'}}>Class of 2020</div>
    <div className="col" style={{fontSize: '9pt'}}>Class of 2020</div>
    <div className="col" style={{fontSize: '9pt'}}>Class of 2020</div>
  </div>
  <br></br>
  <div className="row">
    <div className="col" style={{fontSize: '9pt'}}><a href = "fourohfour">Read More >></a></div>
    <div className="col" style={{fontSize: '9pt'}}><a href = "fourohfour">Read More >></a></div>
    <div className="col" style={{fontSize: '9pt'}}><a href = "fourohfour">Read More >></a></div>
    <div className="col" style={{fontSize: '9pt'}}><a href = "fourohfour">Read More >></a></div>
  </div>
  
</div>
  </div>
</section>
<section style = {{ marginBottom: '5%'}}>
    <div id = "lib"> <div id = "textinner">
        <h2>Making your college match </h2>
        <br></br>
How do you find the right colleges for you? With so many choices, it may be unclear how to begin your search. We can help! Learn how to find colleges that are a good fit for you, create a winning college search strategy, and explore colleges with c4me.

</div></div>
</section>
    
                        </th>
                    </tr>
                </table>
            </div>
            </div>
            );
        }
    }
export default studentHome;
