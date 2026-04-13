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
    password:"",
    empType:"" // ✅ NEW
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
          role: role,
          empType: role === "employee" ? form.empType : "" // ✅ SEND ONLY FOR EMPLOYEE
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

        {/* LEFT */}
        <div className="authLeft">

          <div className="authHeader">

            <div className="authBrand">

              <div className="authLogo">SC</div>

              <div>
                <div className="authBrandName">SmartCollab</div>
                <div className="authBrandSub">
                  A Real-Time Project Coordination Platform
                </div>
              </div>

            </div>

          </div>

          <div className="authIllusWrap">
            <img className="authIllus" src={illus} alt="signup"/>
          </div>

        </div>

        {/* RIGHT */}
        <div className="authRight">

          <div className="authRightInner">

            <h1 className="authTitle">Create Account</h1>

            {error && <div className="authError">{error}</div>}

            <form className="authForm" onSubmit={onSubmit}>

              {/* NAME */}
              <div className="authGrid2">

                <div className="authField">
                  <label className="authLabel">First Name</label>
                  <input
                    className="authInput"
                    name="firstName"
                    placeholder="First Name"
                    onChange={onChange}
                  />
                </div>

                <div className="authField">
                  <label className="authLabel">Last Name</label>
                  <input
                    className="authInput"
                    name="lastName"
                    placeholder="Last Name"
                    onChange={onChange}
                  />
                </div>

              </div>

              {/* EMAIL */}
              <div className="authField">
                <label className="authLabel">Email</label>
                <input
                  className="authInput"
                  name="email"
                  placeholder="Enter email"
                  onChange={onChange}
                />
              </div>

              {/* PASSWORD */}
              <div className="authField">
                <label className="authLabel">Password</label>
                <input
                  className="authInput"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  onChange={onChange}
                />
              </div>

              {/* ROLE */}
              <div className="authField">
                <label className="authLabel">Role</label>

                <select
                  className="authInput"
                  value={role}
                  onChange={(e)=>setRole(e.target.value)}
                >
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="client">Client</option>
                </select>
              </div>

              {/* ✅ NEW CATEGORY (ONLY FOR EMPLOYEE) */}
              {role === "employee" && (
                <div className="authField">
                  <label className="authLabel">Department</label>

                  <select
                    className="authInput"
                    name="empType"
                    value={form.empType}
                    onChange={onChange}
                  >
                    <option value="">Select Department</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="design">Design</option>
                  </select>
                </div>
              )}

              {/* BUTTON */}
              <button type="submit" className="authBtn">
                Signup
              </button>

              {/* LOGIN */}
              <div className="authBottomLine">
                Already have an account?
                <Link to="/login"> Login</Link>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>

  );

}