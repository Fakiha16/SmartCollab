import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";
import illus from "../assets/signup.png";

export default function Signup() {

  const navigate = useNavigate();

  const [error,setError] = useState("");

  const [form,setForm] = useState({

    firstName:"",
    lastName:"",
    email:"",
    password:""

  });

  const [role,setRole] = useState("client");

  const onChange = (e)=>{

    const {name,value} = e.target;

    setForm((p)=>({

      ...p,
      [name]:value

    }));

  };

  const onSubmit = async (e)=>{

    e.preventDefault();

    try{

      await axios.post(
        "http://localhost:5000/api/auth/signup",
        {

          name: form.firstName + " " + form.lastName,
          email: form.email,
          password: form.password,
          role: role

        }
      );

      alert("Account created successfully");

      navigate("/login");

    }
    catch(err){

      if(err.response?.data?.message){
        setError(err.response.data.message);
      }
      else{
        setError("Signup failed");
      }

    }

  };

  return(

    <div className="authPage">

      <div className="authCard">

        <div className="authLeft">

          <img src={illus} alt="signup"/>

        </div>

        <div className="authRight">

          <h1>Create Account</h1>

          {error && <div className="authError">{error}</div>}

          <form onSubmit={onSubmit}>

            <input
              name="firstName"
              placeholder="First Name"
              onChange={onChange}
            />

            <input
              name="lastName"
              placeholder="Last Name"
              onChange={onChange}
            />

            <input
              name="email"
              placeholder="Email"
              onChange={onChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={onChange}
            />

            <select value={role} onChange={(e)=>setRole(e.target.value)}>

              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="client">Client</option>

            </select>

            <button type="submit">Signup</button>

          </form>

          <Link to="/login">Already have account?</Link>

        </div>

      </div>

    </div>

  );

}