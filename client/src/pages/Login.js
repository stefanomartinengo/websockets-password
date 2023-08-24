import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";


function Login(props) {
    console.log('propsusername login: ', props)
    const [username, setUsername] = useState('');

    // useEffect( ()=> {}, [username]);
    const navigate = useNavigate();

    const logInUser = () => {
        props.setUsername([username]);
        navigate("/game");
    }
    
  return (
   <div style={{width: '50%', margin: 'auto'}}>
    <p style={{paddingTop: '15px'}}> What will your user name be? </p>
        <input name="username" onInput={(e) => setUsername(e.target.value)} className="form-control" />
            <button
              type="button"
              onClick={() => logInUser()}
              className="btn btn-primary account__btn">Join</button>
   </div>
  );
}

export default Login;